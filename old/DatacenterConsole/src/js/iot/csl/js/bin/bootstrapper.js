/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * The Bootstrapper application is used to complete the provisioning for a
 * an unprovisioned client. With the trusted assets store name and the
 * trusted assets store password, the Bootstrapper
 * checks to see if the asset store is already provisioned or not. In the
 * case it is already provisioned, the Bootstrapper goes ahead and starts
 * the sample application identified in the first argument. It passes all
 * subsequent arguments on to the sample application during invocation.
 *
 * In the case the client is not already provisioned, the Bootstrapper
 * joins the UDP multicast group at the predefined address
 * {@link #MULTICAST_ADDRESS} and port {@link UDP_PORT} to wait for a message
 * from the Network Provisioner for discovery or provisioning. If the message
 * received is for discovery {@link iotcs.Bootstrapper.MessageType.DISCOVER_REQUEST}, the Bootstrapper sends
 * back the client information. By default, the information is the client's MAC
 * address. This information will be displayed by the Network Provisioner to the
 * operator to select the target client. The information is sent as a key value
 * pair, where key="MAC" and value is the MAC address. If different information
 * is desired from the client, the {@link #getDeviceInfo()} method should be
 * modified to return the desired data.
 *
 * If the message received is for provisioning {@link iotcs.Bootstrapper.MessageType.PROVISION_REQUEST}, the
 * Bootstrapper saves and verifies the provisioning data.
 * The result of the provisioning is sent back to the Network
 * Provisioner. If the provisioning was successful, the Bootstrapper continues
 * to start the sample application as described previously. If the provisioning
 * was unsuccessful, the Bootstrapper waits until another provisioning attempt
 * is made.
 *
 * The provisioning file should be in the unified provisioner format so that
 * the provisioning data is sent in encrypted form.
 */

var forge = require('node-forge');
var dgram = require('dgram');
var fs = require('fs');
var os = require('os');
var dcl = require('device-library.node.js');
dcl = dcl({debug:true});

/**
 * The port to listen on for messages from the Network Provisioner.
 */
var UDP_PORT = 4456;

/**
 * The address to which the Network Provisioner sends multicast messages.
 */
var MULTICAST_ADDRESS = '238.163.7.96';

// default network interface for getting Mac address
var networkInterface = "en3";

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

var verbose = false;

var taStore = null;
var taStorePassword = null;
var appClaseName = null;
var appArgs = null;

function showUsage() {
    console.log( "Usage:" );
    console.log( " bootstrapper.sh/bat <provisioned file> <password> <app class name> [<app arg 0>...<app arg 8>]" );
    console.log( "<provisioned file> is the trusted assets store" );
    console.log( "<password> is a passphrase used to protect the integrity of the trusted assets store" );
    console.log( "<app class name> is the name of the application to start" );
    console.log( "<app arg 0>...<app arg 8> are any optional arguments to be passed onto the application when started" );
    console.log( "environment variables:" );
    console.log( " NODE_PATH  - points to where all needed node modules are installed" );
    process.exit(0);
}

function parseParams() {
    var argsBootstrapper = process.argv.slice(2);
    if (argsBootstrapper.length < 3) {
        console.log('Incorrect number of arguments.');
        showUsage();
        process.exit(1);
    }
    taStore = argsBootstrapper[0];
    taStorePassword = argsBootstrapper[1];
    appClaseName = argsBootstrapper[2];
    appArgs = argsBootstrapper.slice(3);
}

/**
 * Check trusted asset store to determine if asset is already provisioned
 *
 * @param {string} taStore - trusted asset store file name
 * @param {string} taStorePassword - trusted asset store password
 *
 * @return {boolean} true if it is already provisioned false otherwise
 */
function isProvisioned(taStore, taStorePassword) {
    if (!dcl.$port.file.exists(taStore)) {
        return false;
    }
    var tam = new dcl.device.TrustedAssetsManager(taStore, taStorePassword);
    if (tam && tam.getClientId() && tam.getServerHost()) {
        return true;
    }
    return false;
}

/**
 * Completes provisioning.
 *
 * @param {string} taStore - trusted asset store file name
 * @param {Buffer} buff - data to store. First two bytes have to contains length of data to store.
 * @param {number} offset - offset into buff to start
 */
function updateStore(taStore, buff, offset) {
    try {
        var expectedLength = buff.readUInt16BE(offset);
        var fd = fs.openSync(taStore, 'w+');
        // add 2 bytes of length
        offset += 2;
        var written = fs.writeSync(fd, buff, offset, expectedLength);
        if (written > 0) {
            console.log('It\'s saved!');
        } else {
            console.log("Error writing trusted assets store file. ");
        }
        fs.closeSync(fd);
    } catch (err) {
        throw err;
    }
}

/**
 * Lists the information in the trusted assets store.
 *
 * @param {string} taStore - trusted asset store file name
 * @param {string} taStorePassword - trusted asset store password
 */
function listTrustContents(taStore, taStorePassword) {
    if (!dcl.$port.file.exists(taStore)) {
        return;
    }
    try {
        var endpointId = null;
        var publicKey = null;
        var tam = new dcl.device.TrustedAssetsManager(taStore, taStorePassword);
        console.log('Trusted assets store: ' + taStore);
        console.log('Server host: ' + tam.getServerHost());
        console.log('Server port: ' + tam.getServerPort());
        console.log('Activation ID: ' + tam.getClientId());
        try {
            endpointId = tam.getEndpointId();
        } catch (e) {}
        try {
            publicKey = tam.getPublicKey();
        } catch (e) {}
        if (endpointId) {
            console.log('Endpoint ID: ' + endpointId);
        } else {
            console.log('Endpoint ID is not set.');
        }
        if (publicKey) {
            console.log('Public key is set.');
        } else {
            console.log('Public key is not set.');
        }
        if (tam.getTrustAnchorCertificates() && (tam.getTrustAnchorCertificates().length > 0)) {
            console.log('Trust anchor certificates are set.');
            if (verbose) {
                tam.getTrustAnchorCertificates().forEach(function (cert) {
                    try {
                        console.log(JSON.stringify(forge.pki.certificateFromPem(cert), function (key, value) {
                            var nonPrintable = false;
                            if (typeof value === 'string') {
                                for (var i = 0; i < value.length; i++) {
                                    if (value.charCodeAt(i) < 0x20 || value.charCodeAt(i) > 0x7E) {
                                        nonPrintable = true;
                                        break;
                                    }
                                }
                            }
                            if (nonPrintable) {
                                return forge.util.bytesToHex(value);
                            }
                            return value;
                        }, 4));
                    } catch (e) {
                        console.log(cert);
                    }
                });
            }
        } else {
            console.log('Trust anchor certificates are not set.');
        }
    } catch (e) {
        console.log('There was an error listing file contents');
        process.exit(1);
    }
}

/**
 * Starts the sample application.
 *
 * @param {string} name - full name of the sample application to start
 * @param {Array} args - arguments to pass on to the sample application
 */
function startApp(name, args) {
    var options = {
        env: process.env,
        detached: true
    };
    const spawn = require('child_process').spawn;
    var _args = [name, taStore, taStorePassword].concat(args);
    const app = spawn("node", _args, options);

    app.stdout.on('data', function (data) {
        console.log(data.toString());
    });
    app.stderr.on('data', function (data) {
        console.log(data.toString());
    });
    app.on('close', function (code) {
        console.log(name + " application process exited with code " + code);
    });
    app.on('error', function (err) {
        console.log("Failed to start the sample application " + name + ".");
        console.log("Failed with " + err);
        process.exit(1);
    });
    console.log();
    console.log("Starting application " + name + "...");
    var runCommand = '';
    Object.keys(app.spawnargs).forEach(function(key) {
        runCommand += app.spawnargs[key] + " ";
    });
    console.log(runCommand);
    console.log();
    app.unref();
}

/**
 * Sends the discovery response message.
 * 
 * @param {Socket} socket - The socket on which to send the message
 * @param {Buffer} outBuffer - output buffer
 * @param {string} address - The address to send to
 * @param {number} port - The port to send to
 */
function handleDiscoverRequest(socket, outBuffer, address, port) {
    var net = os.networkInterfaces();
    var info = {"MAC": "00:00:00:00:00:00"};
    if (net[networkInterface] && net[networkInterface].length > 0
        && net[networkInterface][0].mac && (net[networkInterface][0].mac !== info.MAC)) {
        info.MAC = net[networkInterface][0].mac;
    } else {
        for (var netKey in net) {
            if (!netKey.match(/^lo\d?$/) && (netKey.indexOf('Loopback') < 0) && (net[netKey].length > 0)
                && net[netKey][0].mac && (net[netKey][0].mac !== info.MAC)) {
                info.MAC = net[netKey][0].mac;
                break;
            }
        }
    }
    outBuffer[0] = MessageType.DISCOVER_RESPONSE;
    var offset = 1;
    for (var infoKey in info) {
        offset += encodeLengthValue(infoKey, outBuffer, offset);
        offset += encodeLengthValue(info[infoKey], outBuffer, offset);
    }
    var outBufferLength = offset;
    socket.send(outBuffer, 0, outBufferLength, port, address, function (err) {
        if (err) {
            console.log('socket error: ' + err.stack);
            closeSocket();
        }
    });
}

/**
 * Encode a string into a length value pair (LV).
 *
 * @param {string} value - input string
 * @param {Buffer} buffer - output buffer
 * @param {number} offset - where the LV should start in the buffer
 *
 * @return {number} nend of value in the buffer
 */
function encodeLengthValue(value, buffer, offset) {
    var bytes = new Buffer(value, 'utf8');

    if (bytes.length > 255) {
        return -1;
    }

    buffer[offset++] = bytes.length;

    bytes.copy(buffer, offset, 0, bytes.length);

    return bytes.length + 1;
}

/**
 * Sends the result status response message.
 *
 * @param {Socket} socket - The socket on which to send the message
 * @param {Status} status - The response status to send
 * @param {string} address - The address to send to
 * @param {number} port - The port to send to
 */
function sendProvisionResponse(socket, status, address, port) {
    var response = new Buffer(2);
    response[0] = MessageType.PROVISION_RESPONSE;
    response[1] = status;
    socket.send(response, 0, response.length, port, address, function (err, status) {
        if (err) {
            console.log('socket error: ' + err.stack);
        }
        if (status == Status.SUCCESS) {
            closeSocket();
        }
    });
}

/**
 * Sends the provision response message.
 *
 * @param {Socket} socket - The socket on which to send the message
 * @param {Buffer} request - provision request
 * @param {number} offset - offset into the request buffer where the request starts
 * @param {number} length - length of the provision request
 * @param {string} address - The address to send to
 * @param {number} port - The port to send to
 *
 * @return {boolean} true if successful, false otherwise
 */
function handleProvisionRequest(socket, request, offset, length, address, port) {
    //Check for minimum possible valid length
    if (length < 5){
        console.log("Provisioning was unsuccessful, format was not correct.");
        sendProvisionResponse(socket, Status.FAILURE, address, port);
        return false;
    }
    console.log("Provisioning...");
    updateStore(taStore, request, offset);
    if (isProvisioned(taStore, taStorePassword)) {
        console.log("Successfully provisioned.");
        sendProvisionResponse(socket, Status.SUCCESS, address, port);
        return true;
    }
    console.log("Provisioning was unsuccessful.");
    sendProvisionResponse(socket, Status.FAILURE, address, port);
    return false;
}

function closeSocket() {
    try {
        socket.dropMembership(MULTICAST_ADDRESS);
    } catch (e) {
        console.log(e);
        process.exit(1);
    } finally {
        socket.close();
    }
}

// main part
parseParams();

// is device already provisioned?
if (!isProvisioned(taStore, taStorePassword)) {
    listTrustContents(taStore, taStorePassword);

    //Multicast to see devices waiting, select the desired one.
    var socket = dgram.createSocket('udp4');
    var isSuccessProvisioned = false;

    socket.on('error', function (err) {
        console.log('socket error: ' + err.stack);
        closeSocket();
    });

    socket.on('message', function (message, rinfo) {
        //console.log('Message from: ' + rinfo.address + ':' + rinfo.port + ' type = ' + message[0]);
        if (message[0] == MessageType.DISCOVER_REQUEST) {
            var outBuffer = new Buffer(30);
            handleDiscoverRequest(socket, outBuffer, rinfo.address, rinfo.port);
        } else if (message[0] == MessageType.PROVISION_REQUEST) {
            if (handleProvisionRequest(socket, message, 1, message.length, rinfo.address, rinfo.port)) {
                // success provision
                isSuccessProvisioned = true;
            } else {
                console.log("Waiting for provisioning info.");
            }
        }
        if (isSuccessProvisioned) {
            // socket will be closed in sendProvisionResponse (if status equals Success)
            console.log();
            listTrustContents(taStore, taStorePassword);
            //Start the device app
            startApp(appClaseName, appArgs);
        }
    });

    socket.bind(UDP_PORT, function () {
        try {
            socket.addMembership(MULTICAST_ADDRESS);
        } catch (e) {
            console.log(e);
            closeSocket();
            process.exit(1);
        }
    });
} else {
    listTrustContents(taStore, taStorePassword);
    //Start the device app
    startApp(appClaseName, appArgs);
}
