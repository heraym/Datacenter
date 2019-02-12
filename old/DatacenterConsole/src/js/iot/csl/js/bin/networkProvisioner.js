/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * The Network Provisioner application is used to discover the available clients
 * that are waiting to be provisioned and send the provisioning information to
 * the target client to enable it to complete provisioning. These requirements
 * drive the need for two modes of operation: discovery and provisioning. When
 * the Network Provisioner is started with no arguments, it runs in the
 * discovery mode of operation. To discover the available clients, it send out a
 * message to the predefined {@link #MULTICAST_ADDRESS} and {@link #UDP_PORT}
 * where prospective clients join the multicast group and wait for incoming
 * messages. The Network Provisioner then waits for any responses from clients,
 * and displays the identification information received from each unique client.
 * Until the user exits, the Network Provisioner continues running and
 * discovering new clients.
 *
 * When the Network Provisioner application runs in provisioning mode, it takes
 * in the target client and provisioning information as arguments. It sends this
 * information to the target client and waits for a response acknowledging
 * successful or unsuccessful provisioning. If no response is received, the
 * Network Provisioner retries several times before exiting.
 *
 * The provisioning information is in the unified provisioner format. This
 * ensures that the provisioning data is sent to the Bootstrapper in encrypted
 * form.
 */

var forge = require('node-forge');
var dgram = require('dgram');
var fs = require('fs');

/**
 * The port to listen on for messages from the Network Provisioner.
 */
var UDP_PORT = 4456;

/**
 * The address to which the Network Provisioner sends multicast messages.
 */
var MULTICAST_ADDRESS = "238.163.7.96";

var MessageType = {
    // Network Provisioner to Bootstrapper- request for client identification information.
    DISCOVER_REQUEST: 0x01,
    // Bootstrapper to Network Provisioner- client identification information.
    DISCOVER_RESPONSE: 0x02,
    // Network Provisioner to Bootstrapper- provisioning information
    PROVISION_REQUEST: 0x03,
    // Bootstrapper to Network Provisioner- response provisioning status.
    PROVISION_RESPONSE: 0x04
};

var Status = {
    // Successful result
    SUCCESS: 0x00,
    // Failed result
    FAILURE: 0x01,
    // Unknown result
    UNKNOWN: 0x02
};

var args = null;
var clientHost = null;
var provisionFile =  null;
var isProvisionMode = false;

function showUsage() {
    console.log( "Usage:" );
    console.log( " networkProvisioner.sh/bat [<client host> <provisioning file>]" );
    console.log( "When no arguments are provided the Network Provisioner discovers available clients." );
    console.log( "When all arguments are provided the Network Provisioner provisions the selected client." );
    console.log( "<client host> is the IP address of the Bootstrapper, displayed in discovery." );
    console.log( "<provisioning file> is the name of the file containing the provisioning information in the unified provisioner format." );
    console.log( "environment variables:" );
    console.log( " NODE_PATH  - points to where all needed node modules are installed" );
    process.exit(0);
}

// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) {
    for (var i = 0; i < this.length; i++) {
        if (comparer(this[i])) return true;
    }
    return false;
};

// adds an element to the array if it does not already exist using a comparer function
Array.prototype.pushIfNotExist = function(element, comparer) {
    if (!this.inArray(comparer)) {
        this.push(element);
        return true;
    }
    return false;
};

function discover() {
    //Multicast to see devices waiting, select the desired one.
    var socket = dgram.createSocket('udp4');
    var clientsArray = [];

    console.log("Waiting for connections...");
    console.log("\tPress Enter to exit.");
    console.log();

    // Start reading from stdin so we don't exit.
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));

    socket.on('error', function (err) {
        console.log('socket error: ' + err.stack);
        socket.close();
    });

    socket.on('message', function (message, rinfo) {
        if (message.length < 3 || message[0] != MessageType.DISCOVER_RESPONSE) {
            return;
        }
        var dr = handleDiscoverResponse(message);
        if (clientsArray.pushIfNotExist(dr, function (element) {
                return (dr.key === element.key) && (dr.value === element.value);
            })) {
            console.log(dr.key + " = " + dr.value + " IpAddress = " + rinfo.address);
        }
    });

    setInterval(sendMulticastDiscover, 4000, socket);
}

function sendMulticastDiscover(socket) {
    var request = new Buffer(1);
    request[0] = MessageType.DISCOVER_REQUEST;
    socket.send(request, 0, request.length, UDP_PORT, MULTICAST_ADDRESS);
}

function provision(args) {
    //Multicast to see devices waiting, select the desired one.
    var socket = dgram.createSocket('udp4');
    console.log("Sending provisioning info.");
    var tries = 6;

    socket.on('error', function (err) {
        console.log('socket error: ' + err.stack);
        socket.close();
    });

    socket.on('message', function (message, rinfo) {
        if (message.length < 2 || message[0] != MessageType.PROVISION_RESPONSE) {
            console.log("Client did not respond correctly.");
        } else {
            var status = message[1];
            if (status == Status.SUCCESS) {
                console.log("Client was successfully provisioned.");
            } else if (status == Status.FAILURE) {
                console.log("Client was not successfully provisioned.");
            } else {
                console.log("Client did not respond correctly.");
            }
        }
        socket.close();
        process.exit(0);
    });

    setInterval(function () {
        if (tries == 0) {
            console.log("Provisioning timed out.");
            socket.close();
            process.exit(0);
        }
        sendProvisionRequest(socket, provisionFile, clientHost, UDP_PORT);
        tries--;
    }, 5000, tries);
}

/**
 * Sends the provisioning information message.
 *
 * @param {Socket} socket - The socket on which to send the message
 * @param {string} taStore - file with provisioned trusted assets store
 * @param {string} address - The address to send to
 * @param {number} port - The port to send to
 */
function sendProvisionRequest(socket, taStore, address, port) {
    try {
        var fd = fs.openSync(taStore, 'r');
        var fileSize = fs.statSync(taStore).size;
        var buffer = new Buffer(fileSize);
        var readBytes = fs.readSync(fd, buffer, 0, fileSize);
        var offset = 1;
        // tag in 1 byte + length contains 2 bytes
        var request = new Buffer(readBytes + 3);
        request[0] = MessageType.PROVISION_REQUEST;
        offset = request.writeUInt16BE(readBytes, offset);
        buffer.copy(request, offset, 0, readBytes);
        fs.closeSync(fd);
        socket.send(request, 0, request.length, port, address, function (err) {
            if (err) {
                console.log('socket error: ' + err.stack);
                socket.close();
            }
        });
    } catch (err) {
        throw err;
    }
}

/**
 * Creates a discover response from datagram.
 *
 * @param response - datagram from a client
 *
 * @return {{key: {string}, value: {string}}} discovery response
 */
function handleDiscoverResponse(response) {
    var offset = 1;
    var keyLV = decodeLengthValue(response, offset);
    offset += keyLV.length;
    var valueLV = decodeLengthValue(response, offset);
    return {key: keyLV.value, value: valueLV.value};
}

/**
 * Decode a length value pair (LV) into a string.
 *
 * @param {Buffer} buffer - input buffer
 * @param {number} offset - where the LV starts in the buffer
 *
 * @return {{length: {number}, value: {string}}} decoded byte length and string value
 */
function decodeLengthValue(buffer, offset) {
    var _data = {};
    _data.length = buffer[offset++] & 0x000000FF;
    _data.value = new Buffer(_data.length);
    buffer.copy(_data.value, 0, offset, offset + _data.length);

    _data.value = _data.value.toString();
    // get value of length + byte that contains this value
    _data.length++;
    return _data;
}

function parseParams() {
    args = process.argv.slice(2);
    if (args.length == 0) {
        isProvisionMode = false;
    } else if (args.length != 2) {
        console.log('Incorrect number of arguments.');
        showUsage();
        process.exit(1);
    } else {
        clientHost = args[0];
        provisionFile = args[1];
        isProvisionMode = true;
    }
}

// main part
parseParams();
if (!isProvisionMode) {
    discover();
} else {
    provision(args);
}
