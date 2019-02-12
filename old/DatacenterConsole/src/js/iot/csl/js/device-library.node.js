/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

(function () {
var name = 'iotcs';
function init(lib) {
'use strict';
//START///////////////////////////////////////////////////////////////////////

    /**
     * @global
     * @alias iotcs
     * @namespace
     */
    lib = lib || {};
    
    /**
     * @property {string} iotcs.name - the short name of this library
     */
    try {
        lib.name = lib.name || "iotcs";
    } catch(e) {}
    
    /**
     * @property {string} iotcs.description - the longer description
     */
    lib.description = "Oracle IoT Cloud Device Client Library";

    /**
     * @property {string} iotcs.version - the version of this library
     */
    lib.version = "1.1";

    /**
     * Log an info message
     * @function 
     */
    lib.log = function (msg) {
        if (lib.debug) {
            _log('info', msg);
        }
    };

    /**
     * Throw and log an error message
     * @function 
     */
    lib.error = function (msg) {
        if (lib.debug && console.trace) {
            console.trace(msg);
        }
        _log('error', msg);
        throw '[iotcs:error] ' + msg;
    };

    /**
     * Log and return an error message
     * @function
     */
    lib.createError = function (msg, error) {
        if (lib.debug && console.trace) {
            console.trace(msg);
        }
        _log('error', msg);
        if (!error) {
            return new Error('[iotcs:error] ' + msg);
        }
        return error;
    };

    /** @ignore */
    function _log(level, msg) {
        var msgstr = '[iotcs:'+level+'] ' + msg;
        console.log(msgstr);
    }
    
//////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////
// file: library/device/@overview.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 *
 * @overview
 *
 * The device and enterprise client libraries simplify working with the Oracle IoT Cloud Service.
 * These client libraries are a low–level abstraction over top of messages and REST APIs.
 * Device clients are primarily concerned with sending data and alert messages to the cloud service,
 * and acting upon requests from the cloud service. Enterprise clients are primarily concerned
 * with monitor and control of device endpoints.
 *
 * <h2>Configuration</h2>
 *
 * The client must have a configuration in order to communicate with the cloud service.
 * This configuration includes the IoT Cloud Service host, the identifier of the device
 * or enterprise integration the client represents, and the shared secret of the device
 * or enterprise integration.
 * <p>
 * The configuration is created by using the provisioner tool: provisioner.js. This tool
 * creates a file that is used when running the client application. Usage is available
 * by running the tool with the -h argument.
 *
 * <h2>Device and Enterprise Clients</h2>
 *
 * Prerequisites:<br>
 * - Register your device and/or enterprise application with the Cloud Service.<br>
 * - Provision the device with the credentials obtained from above.<br>
 * - Optionally provision the device model.<br>
 *
 * @example <caption>Device Client Quick Start</caption>
 *
 * //The following steps must be taken to run a device-client application.
 * //The example shows a GatewayDevice. A DirectlyConnectedDevice is identical,
 * //except for registering indirectly-connected devices.
 *
 * // 1. Initialize device client
 *
 *      var gateway = new iotcs.device.GatewayDeviceUtil(configurationFilePath, password);
 *
 * // 2. Activate the device
 *
 *      if (!gateway.isActivated()) {
 *          gateway.activate([], function (device, error) {
 *              if (!device || error) {
 *                  //handle activation error
 *              }
 *          });
 *
 * // 3. Register indirectly-connected devices
 *
 *      gateway.registerDevice(hardwareId,
 *          {serialNumber: 'someNumber',
 *          manufacturer: 'someManufacturer',
 *          modelNumber: 'someModel'}, ['urn:myModel'],
 *          function (response, error) {
 *              if (!response || error) {
 *                  //handle enroll error
 *              }
 *              indirectDeviceId = response;
 *          });
 *
 * // 4. Register handler for attributes and actions
 *
 *      var messageDispatcher = new iotcs.device.util.MessageDispatcher(gateway);
 *      messageDispatcher.getRequestDispatcher().registerRequestHandler(id,
 *          'deviceModels/urn:com:oracle:iot:device:humidity_sensor/attributes/maxThreshold',
 *          function (requestMessage) {
 *              //handle attribute update and validation
 *              return iotcs.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', '');
 *          });
 *
 * // 5. Send data from the indirectly-connected device
 *
 *      var message = new iotcs.message.Message();
 *      message
 *          .type(iotcs.message.Message.Type.DATA)
 *          .source(indirectDeviceId)
 *          .format('urn:com:oracle:iot:device:humidity_sensor' + ":attributes");
 *      message.dataItem('humidity', sensor.humidity);
 *      message.dataItem('maxThreshold', sensor.maxThreshold);
 *      messageDispatcher.queue(message);
 *
 * // 6. Dispose the device client
 *
 *      gateway.close();
 *
 * @example <caption>Enterprise Client Quick Start</caption>
 *
 * //The following steps must be taken to run an enterprise-client application.
 *
 * // 1. Initialize enterprise client
 *
 *      iotcs.enterprise.EnterpriseClient.newClient(applicationName, function (client, error) {
 *          if (!client || error) {
 *              //handle client creation error
 *          }
 *          ec = client;
 *      });
 *
 * // 2. Select a device
 *
 *      ec.getActiveDevices('urn:myModelUrn').page('first').then(function(response, error){
 *          if (!response || error) {
 *              //handle get device model error
 *          }
 *          if(response.items){
 *              response.items.forEach(function(item){
 *                  //handle select of an item as a device
 *                  device = item;
 *              });
 *          }
 *      });
 *
 * // 3. Monitor a device
 *
 *      messageEnumerator = new iotcs.enterprise.MessageEnumerator(ec);
 *      messageEnumerator.setListener(device.id, 'ALERT', function (items) {
 *          items.forEach(function(item) {
 *              //handle each item as a message received from the device
 *          });
 *      });
 *
 * // 4. List the resources of a device
 *
 *      resourceEnumerator = new iotcs.enterprise.ResourceEnumerator(ec, device.id);
 *      resourceEnumerator.getResources().page('first').then(function (response){
 *              response.items.forEach(function(item){
 *                  //handle each item as a resource
 *              });
 *      }, function (error) {
 *          //handle error on enumeration
 *      });
 *
 * // 5. Dispose the enterprise client
 *
 *      ec.close();
 *
 * @example <caption>Storage Cloud Quick Start</caption>
 *
 * // This shows how to use the messaging API to upload content to,
 * // or download content from, the Oracle Storage Cloud Service.
 * // To upload or download content, there must be an attribute, field,
 * // or action in the device model with type URI.
 * // When creating a DataItem for an attribute, field, or action of type URI,
 * // the value is set to the URI of the content in cloud storage.
 *
 * //
 * // Uploading/downloading content without Storage Dispatcher
 * //
 *
 *     var storageObjectUpload = gateway.createStorageObject("uploadFileName", "image/jpg");
 *     storageObjectUpload.setInputStream(fs.createReadStream("upload.jpg"));
 *     storageObjectUpload.sync(uploadCallback);
 *
 *
 *     var messageDispatcher = new iotcs.device.util.MessageDispatcher(gateway);
 *     messageDispatcher.getRequestDispatcher().registerRequestHandler(id,
 *         'deviceModels/urn:com:oracle:iot:device:motion_activated_camera/attributes/image',
 *         function (requestMessage) {
 *             //handle URI attribute validation, get URI from request message
 *             gateway.createStorageObject(URI, function(storageObjectDownload, error) {
 *                  if (error) {
 *                      // error handling
 *                  }
 *                  // only download if image is less than 4M
 *                  if (storageObjectDownload.getLength() <  4 * 1024 * 1024) {
 *                      storageObjectDownload.setOutputStream(fs.createWriteStream("download.jpg"));
 *                      // downloadCallback have to send response massage
 *                      // using messageDispatcher.queue method
 *                      storageObjectDownload.sync(downloadCallback);
 *                  }
 *             });
 *             return iotcs.message.Message.buildResponseWaitMessage();
 *         });
 *
 * //
 * // Uploading/downloading content with Storage Dispatcher
 * //
 *
 *     var storageDispatcher = new iotcs.device.util.StorageDispatcher(gateway);
 *     storageDispatcher.onProgress = function (progress, error) {
 *          if (error) {
 *              // error handling
 *          }
 *          var storageObject = progress.getStorageObject();
 *          if (progress.getState() === iotcs.StorageDispatcher.Progress.State.COMPLETED) {
 *              // image was uploaded
 *              // Send message with the storage object name
 *              var message = new iotcs.message.Message();
 *              message
 *                   .type(iotcs.message.Message.Type.DATA)
 *                   .source(id)
 *                   .format('CONTENT_MODEL_URN' + ":attributes");
 *              message.dataItem('CONTENT_ATTRIBUTE', storageObject.getURI());
 *
 *          } else if (progress.getState() === iotcs.StorageDispatcher.Progress.State.IN_PROGRESS) {
 *              // if taking too long time, cancel
 *              storageDispatcher.cancel(storageObject);
 *          }
 *     };
 *
 *     var storageObjectUpload = gateway.createStorageObject("uploadFileName", "image/jpg");
 *     storageObjectUpload.setInputStream(fs.createReadStream("upload.jpg"));
 *     storageDispatcher.queue(storageObjectUpload);
 *
 */


//////////////////////////////////////////////////////////////////////////////
// file: library/device/@globals.js

/**
 * Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * @namespace
 * @alias iotcs.device
 * @memberOf iotcs
 */
lib.device = {};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
lib.oracle = lib.oracle || {};

/** @ignore */
lib.oracle.iot = lib.oracle.iot || {};

/** @ignore */
lib.oracle.iot.client = lib.oracle.iot.client || {};

/** @ignore */
lib.oracle.iot.client.httpConnectionTimeout = lib.oracle.iot.client.httpConnectionTimeout || 15000;

/** @ignore */
lib.oracle.iot.client.monitor = lib.oracle.iot.client.monitor || {};

/** @ignore */
lib.oracle.iot.client.monitor.pollingInterval = lib.oracle.iot.client.monitor.pollingInterval || 1000;

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
lib.oracle.iot.client.device = lib.oracle.iot.client.device || {};

/**
 * If this is set long polling feature is disabled and global
 * monitor is used for receiving messages by the device client
 * library.
 *
 * @name iotcs․oracle․iot․client․device․disableLongPolling
 * @global
 * @type {boolean}
 * @default false
 */
lib.oracle.iot.client.device.disableLongPolling = lib.oracle.iot.client.device.disableLongPolling || false;

/**
 * Offset time (in milliseconds) added by the framework when
 * using the device client receive method with timeout parameter
 * set.
 *
 * @name iotcs․oracle․iot․client․device․longPollingTimeoutOffset
 * @global
 * @type {number}
 * @default 100
 */
lib.oracle.iot.client.device.longPollingTimeoutOffset = lib.oracle.iot.client.device.longPollingTimeoutOffset || 100;

/**
 * If this is set the device client library is allowed to
 * use draft device models when retrieving the models and
 * when activating clients. If this is not set and getDeviceModel
 * method returns a draft devices models an error will be thrown.
 *
 * @name iotcs․oracle․iot․client․device․allowDraftDeviceModels
 * @global
 * @type {boolean}
 * @default false
 */
lib.oracle.iot.client.device.allowDraftDeviceModels = lib.oracle.iot.client.device.allowDraftDeviceModels || false;

/**
 * The size of the buffer (in bytes) used to store received
 * messages by each device client.
 *
 * @name iotcs․oracle․iot․client․device․requestBufferSize
 * @global
 * @type {number}
 * @default 4192
 */
lib.oracle.iot.client.device.requestBufferSize = lib.oracle.iot.client.device.requestBufferSize || 4192;

/**
 * The MessageDispatcher queue size (in number of messages),
 * for store and forward functionality.
 *
 * @name iotcs․oracle․iot․client․device․maximumMessagesToQueue
 * @global
 * @type {number}
 * @default 1000
 */
lib.oracle.iot.client.device.maximumMessagesToQueue = lib.oracle.iot.client.device.maximumMessagesToQueue || 1000;

/**
 * The StorageDispatcher queue size (in number of storage objects),
 * for store and forward functionality.
 *
 * @name iotcs․oracle․iot․client․maximumStorageObjectsToQueue
 * @global
 * @type {number}
 * @default 50
 */
lib.oracle.iot.client.maximumStorageObjectsToQueue = lib.oracle.iot.client.maximumStorageObjectsToQueue || 50;

/**
 * The Storage Cloud server token validity period in minutes
 *
 * @name iotcs․oracle․iot․client․storageTokenPeriod
 * @global
 * @type {number}
 * @default 30
 */
lib.oracle.iot.client.storageTokenPeriod = lib.oracle.iot.client.storageTokenPeriod || 30;

/**
 * The Storage Cloud server hostname
 *
 * @name iotcs․oracle․iot․client․storageCloudHost
 * @global
 * @type {String}
 * @default "storage.oraclecloud.com"
 */
lib.oracle.iot.client.storageCloudHost = lib.oracle.iot.client.storageCloudHost || "storage.oraclecloud.com";

/**
 * The Storage Cloud server port
 *
 * @name iotcs․oracle․iot․client․storageCloudPort
 * @global
 * @type {number}
 * @default 443
 */
lib.oracle.iot.client.storageCloudPort = lib.oracle.iot.client.storageCloudPort || 443;

/**
 * The maximum number of messages sent by the MessagesDispatcher
 * in one request.
 *
 * @name iotcs․oracle․iot․client․device․maximumMessagesPerConnection
 * @global
 * @type {number}
 * @default 100
 */
lib.oracle.iot.client.device.maximumMessagesPerConnection = lib.oracle.iot.client.device.maximumMessagesPerConnection || 100;

/**
 * The actual polling interval (in milliseconds) used by the
 * MessageDispatcher for sending/receiving messages. If this is
 * lower than iotcs․oracle․iot․client․monitor․pollingInterval than
 * then that variable will be used as polling interval.
 * <br>
 * This is not used for receiving messages when
 * iotcs․oracle․iot․client․device․disableLongPolling is
 * set to false.
 *
 * @name iotcs․oracle․iot․client․device․defaultMessagePoolingInterval
 * @global
 * @type {number}
 * @default 3000
 */
lib.oracle.iot.client.device.defaultMessagePoolingInterval = lib.oracle.iot.client.device.defaultMessagePoolingInterval || 3000;

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
lib.oracle.iot.tam = lib.oracle.iot.tam || {};

/** @ignore */
lib.oracle.iot.tam.store = lib.oracle.iot.tam.store || './trustedAssetsStore.json';

/** @ignore */
lib.oracle.iot.tam.storePassword = lib.oracle.iot.tam.storePassword || null;

//////////////////////////////////////////////////////////////////////////////
// file: library/shared/$port-node.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

// Implement porting interface


/** @ignore */
var $port = lib.$port || {};

if (lib.debug) {
    lib.$port = $port;
}

var _b2h = (function () {
    var r = [];
    for (var i=0; i<256; i++) {
        r[i] = (i + 0x100).toString(16).substr(1);
    }
    return r;
})();

// pre-requisites (internal to lib)
var forge = require('node-forge');

// pre-requisites (internal to $port);
var os = require('os');
var https = require('https');
var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var url = require('url');
//let sqlite3 = require('sqlite3');

//////////////////////////////////////////////
// Debug output options.
var debug = require ('debug')('debug');
//////////////////////////////////////////////

var spawn = require('child_process').spawnSync;
/**
 * This method is used for retrieving disk space information. It uses OS specific
 * utility commands, so it is very OS specific implementation. Also because handling
 * of external processes executed with spawn is not good, the timeout and try/catch
 * is used and if any error occurs -1 value is returned for each info.
 *
 * @ignore
 */
var _getDiskSpace = function() {
    var diskSpace = {
        freeDiskSpace: -1,
        totalDiskSpace: -1
    };
    try {
        if (os.platform() === 'win32') {
            var prc1 = spawn('wmic', ['LogicalDisk', 'Where', 'DriveType="3"', 'Get', 'DeviceID,Size,FreeSpace'], {timeout: 1000});
            var str1 = prc1.stdout.toString();
            var lines1 = str1.split(/(\r?\n)/g);
            lines1.forEach(function (line) {
                if (line.indexOf(__dirname.substring(0, 2)) > -1) {
                    var infos = line.match(/\d+/g);
                    if (Array.isArray(infos)) {
                        diskSpace.totalDiskSpace = infos[1];
                        diskSpace.freeDiskSpace = infos[0];
                    }
                }
            });
        } else if (os.platform() === 'linux' || os.platform() === "darwin") {
            var prc2 = spawn('df', [__dirname], {timeout: 1000});
            var str2 = prc2.stdout.toString();
            str2 = str2.replace(/\s/g,'  ');
            var infos = str2.match(/\s\d+\s/g);
            if (Array.isArray(infos)) {
                diskSpace.freeDiskSpace = parseInt(infos[2]);
                diskSpace.totalDiskSpace = (parseInt(infos[1]) + parseInt(infos[2]));
            }
        }
    } catch (e) {
        //just ignore
    }
    return diskSpace;
};

var tls = require('tls');
tls.checkServerIdentity = function (host, cert) {
    if (cert && cert.subject && cert.subject.CN) {
        var cn = cert.subject.CN;
        if ((typeof cn === 'string') && cn.startsWith('*.')) {
            var i = host.indexOf('.');
            if (i > 0) {
                host = host.substring(i);
            }
            cn = cn.substring(1);
        }
        if (cn === host) {
            return;
        }
    }
    lib.error('SSL host name verification failed');
};

// implement porting interface

$port.userAuthNeeded = function () {
    return false;
};

$port.os = {};

$port.os.type = function () {
    return os.type();
};

$port.os.release = function () {
    return os.release();
};

$port.https = {};

$port.https.req = function (options, payload, callback) {

    if (options.tam
        && (typeof options.tam.getTrustAnchorCertificates === 'function')
        && Array.isArray(options.tam.getTrustAnchorCertificates())
        && (options.tam.getTrustAnchorCertificates().length > 0)) {
        options.ca = options.tam.getTrustAnchorCertificates();
    }

    options.rejectUnauthorized = true;
    options.protocol = options.protocol + ':';
    options.agent = false;

    if ((options.method !== 'GET') && ((options.path.indexOf('attributes') > -1) || (options.path.indexOf('actions') > -1))) {
        if (options.headers['Transfer-Encoding'] !== "chunked") {
            options.headers['Content-Length'] = payload.length;
        }
    }

    var urlObj = url.parse(options.path, true);
    if (urlObj.query) {
        if (typeof urlObj.query === 'object') {
            urlObj.query = querystring.stringify(urlObj.query);
        }
        urlObj.query = querystring.escape(urlObj.query);
    }
    options.path = url.format(urlObj);

    debug();
    debug("Request: " + new Date().getTime());
    debug(options.path);
    // var clone = Object.assign({}, options);
    // delete clone.tam;
    // delete clone.ca;
    // debug(clone);
    debug(payload);

    var req = https.request(options, function (response) {

        debug();
        debug("Response: " + response.statusCode + ' ' + response.statusMessage);
        debug(response.headers);

        // Continuously update stream with data
        var body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            // Data reception is done, do whatever with it!
            debug(body);
            if ((response.statusCode === 200) || (response.statusCode === 201) || (response.statusCode === 202)) {
                if (response.headers && (typeof response.headers['x-min-acceptbytes'] !== 'undefined')
                    && (response.headers['x-min-acceptbytes'] !== '') && (response.headers['x-min-acceptbytes'] !== 0)){
                    callback(JSON.stringify({'x-min-acceptbytes': response.headers['x-min-acceptbytes']}));
                } else {
                    callback(body);
                }
            } else {
                var error = new Error(JSON.stringify({statusCode: response.statusCode, statusMessage: (response.statusMessage ? response.statusMessage : null), body: body}));
                callback(body, error);
            }
        });
    });
    if (options.path.indexOf('iot.sync') < 0) {
        req.setTimeout(lib.oracle.iot.client.httpConnectionTimeout);
    } else if (options.path.indexOf('iot.timeout=') > -1) {
        var timeout = parseInt(options.path.substring(options.path.indexOf('iot.timeout=') + 12));
        req.setTimeout(timeout * 1000 + lib.oracle.iot.client.device.longPollingTimeoutOffset);
    }
    req.on('timeout', function () {
        callback(null, new Error('connection timeout'));
    });
    req.on('error', function(error) {
        callback(null, error);
    });
    req.write(payload);
    req.end();
};

$port.https.storageReq = function (options, storage, deliveryCallback, errorCallback, processCallback) {
    options.protocol = options.protocol + ':';
    options.rejectUnauthorized = true;
    options.agent = false;

    var isUpload = false;
    if (options.method !== 'GET') {
        isUpload = true;
        if (options.headers['Transfer-Encoding'] !== "chunked") {
            // FIXME: if Transfer-Encoding isn't chunked
            options.headers['Content-Length'] = storage.getLength();
        } else {
            delete options.headers['Content-Length'];
        }
    }

    var urlObj = url.parse(options.path, true);
    if (urlObj.query) {
        if (typeof urlObj.query === 'object') {
            urlObj.query = querystring.stringify(urlObj.query);
        }
        urlObj.query = querystring.escape(urlObj.query);
    }
    options.path = url.format(urlObj);

    debug();
    debug("Request: " + new Date().getTime());
    debug(options.path);
    debug(options);

    if (isUpload) {
        _uploadStorageReq(options, storage, deliveryCallback, errorCallback, processCallback);
    } else {
        _downloadStorageReq(options, storage, deliveryCallback, errorCallback, processCallback);
    }
};

var _uploadStorageReq = function(options, storage, deliveryCallback, errorCallback, processCallback) {
    var encoding = storage.getEncoding();
    var uploadBytes = 0;
    var protocol = options.protocol.indexOf("https") !== -1 ? https : http;
    var req = protocol.request(options, function (response) {
        debug();
        debug("Response: " + response.statusCode + ' ' + response.statusMessage);
        debug(response.headers);

        // Continuously update stream with data
        var body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            if (!req.aborted) {
                if (response.statusCode === 201) {
                    var lastModified = new Date(Date.parse(response.headers["last-modified"]));
                    storage._.setMetadata(lastModified, uploadBytes);
                    deliveryCallback(storage, null, uploadBytes);
                } else {
                    var error = new Error(JSON.stringify({
                        statusCode: response.statusCode,
                        statusMessage: (response.statusMessage ? response.statusMessage : null),
                        body: body
                    }));
                    errorCallback(error);
                }
            }
        });
    });
    req.on('timeout', function () {
        errorCallback(new Error('connection timeout'));
    });
    req.on('error', function(error) {
        errorCallback(error);
    });
    req.on('abort', function() {
        if (processCallback) {
            processCallback(storage, lib.StorageDispatcher.Progress.State.CANCELLED, uploadBytes);
        }
    });

    var readableStream = storage.getInputStream();
    if (readableStream) {
        readableStream.on('data', function(chunk) {
            if (storage._.isCancelled()) {
                req.abort();
                return;
            }
            req.write(chunk, encoding);
            uploadBytes += chunk.length;
            if (processCallback) {
                processCallback(storage, lib.StorageDispatcher.Progress.State.IN_PROGRESS, uploadBytes);
            }
        }).on('end', function() {
            if (storage._.isCancelled()) {
                req.abort();
                return;
            }
            req.end();
        }).on('error', function (error) {
            errorCallback(error);
        });
    } else {
        errorCallback(new Error("Readable stream is not set for storage object. Use setInputStream."));
    }
};

var _downloadStorageReq = function(options, storage, deliveryCallback, errorCallback, processCallback) {
    var writableStream = storage.getOutputStream();
    if (writableStream) {
        var encoding = storage.getEncoding();
        var downloadBytes = 0;
        var protocol = options.protocol.indexOf("https") !== -1 ? https : http;
        var req = protocol.request(options, function (response) {
            debug();
            debug("Response: " + response.statusCode + ' ' + response.statusMessage);
            debug(response.headers);

            // Continuously update stream with data
            var body = '';
            if (encoding) {
                writableStream.setDefaultEncoding(encoding);
            }
            writableStream.on('error', function (err) {
                errorCallback(err);
            });

            response.on('data', function (d) {
                if (storage._.isCancelled()) {
                    req.abort();
                    return;
                }
                body += d;
                downloadBytes += d.length;
                writableStream.write(d);
                if (processCallback) {
                    processCallback(storage, lib.StorageDispatcher.Progress.State.IN_PROGRESS, downloadBytes);
                }
            });
            response.on('end', function () {
                if (!req.aborted) {
                    if ((response.statusCode === 200) || (response.statusCode === 206)) {
                        writableStream.end();
                        var lastModified = new Date(Date.parse(response.headers["last-modified"]));
                        storage._.setMetadata(lastModified, downloadBytes);
                        deliveryCallback(storage, null, downloadBytes);
                    } else {
                        var error = new Error(JSON.stringify({
                            statusCode: response.statusCode,
                            statusMessage: (response.statusMessage ? response.statusMessage : null),
                            body: body
                        }));
                        errorCallback(error);
                    }
                }
            });
        });
        req.on('timeout', function () {
            errorCallback(new Error('connection timeout'));
        });
        req.on('error', function (error) {
            errorCallback(error);
        });
        req.on('abort', function() {
            if (processCallback) {
                processCallback(storage, lib.StorageDispatcher.Progress.State.CANCELLED, downloadBytes);
            }
        });
        if (storage._.isCancelled()) {
            req.abort();
            return;
        }
        req.end();
    } else {
        errorCallback(new Error("Writable stream is not set for storage object. Use setOutputStream."));
    }
};

$port.file = {};

$port.file.store = function (path, data) {
    try {
        fs.writeFileSync(path, data, {encoding:'binary'});
    } catch (e) {
        lib.error('could not store file "'+path+'"');
    }
};

$port.file.exists = function (path) {
    try {
        return fs.statSync(path).isFile();
    } catch (e) {
        return false;
    }
};

$port.file.size = function (path) {
    try {
        return fs.statSync(path).size;
    } catch (e) {
        return -1;
    }
};

$port.file.load = function (path) {
    var data = null;
    try {
        var tmp = fs.readFileSync(path, {encoding:'binary'});
        var len = tmp.length;
        data = '';
        for (var i=0; i<len; i++) {
            data += tmp[i];
        }
    } catch (e) {
        lib.error('could not load file "'+path+'"');
        return;
    }
    return data;
};

$port.file.append = function (path, data) {
    try {
        fs.appendFileSync(path, data);
    } catch (e) {
        lib.error('could not append to file "'+path+'"');
    }
};

$port.file.remove = function (path) {
    try {
        fs.unlinkSync(path);
    } catch (e) {
        lib.error('could not remove file "'+path+'"');
    }
};

$port.util = {};

$port.util.rng = function (count) {
    var b = forge.random.getBytesSync(count);
    var a = new Array(count);
    for (var i=0; i<count; i++) {
        a[i] = b[i].charCodeAt(0);
    }
    return a;
};

/*@TODO: this implementation is erroneous: leading '0's are sometime missing. => please use exact same implementation as $port-browser.js (it is anyway based on $port.util.rng()) + import _b2h @DONE
*/
$port.util.uuidv4 = function () {
    var r16 = $port.util.rng(16);
    r16[6]  &= 0x0f;  // clear version
    r16[6]  |= 0x40;  // set to version 4
    r16[8]  &= 0x3f;  // clear variant
    r16[8]  |= 0x80;  // set to IETF variant
    var i = 0;
    return _b2h[r16[i++]] + _b2h[r16[i++]] + _b2h[r16[i++]] + _b2h[r16[i++]] + '-' +
        _b2h[r16[i++]] + _b2h[r16[i++]] + '-' +
        _b2h[r16[i++]] + _b2h[r16[i++]] + '-' +
        _b2h[r16[i++]] + _b2h[r16[i++]] + '-' +
        _b2h[r16[i++]] + _b2h[r16[i++]] + _b2h[r16[i++]] +
        _b2h[r16[i++]] + _b2h[r16[i++]] + _b2h[r16[i]];
};

$port.util.btoa = function (str) {
    return new Buffer(str).toString('base64');
};

$port.util.atob = function (str) {
    return new Buffer(str, 'base64').toString();
};

$port.util.diagnostics = function () {
    var obj = {};
    obj.version = (process.env['oracle.iot.client.version'] || 'Unknown');
    var net = os.networkInterfaces();
    var space = _getDiskSpace();
    obj.freeDiskSpace = space.freeDiskSpace;
    obj.totalDiskSpace = space.totalDiskSpace;
    obj.ipAddress = 'Unknown';
    obj.macAddress = 'Unknown';
    var netInt = null;
    for (var key in net) {
        if (!key.match(/^lo\d?$/) && (key.indexOf('Loopback') < 0) && (net[key].length > 0)) {
            netInt = net[key][0];
            break;
        }
    }
    if (netInt && netInt.address) {
        obj.ipAddress = netInt.address;
    }
    if (netInt && netInt.mac) {
        obj.macAddress = netInt.mac;
    }
    return obj;
};

$port.util.query = {};

$port.util.query.escape = function (str) {
    return querystring.escape(str);
};

$port.util.query.unescape = function (str) {
    return querystring.unescape(str);
};

$port.util.query.parse = function (str, sep, eq, options) {
    return querystring.parse(str, sep, eq, options);
};

$port.util.query.stringify = function (obj, sep, eq, options) {
    return querystring.stringify(obj, sep, eq, options);
};

/*@TODO: check that Promise are actually supported! either try/catch or if (!Promise) else lib.error ...
*/
$port.util.promise = function(executor){
    return new Promise(executor);
};


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/$port-mqtt.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */
$port.mqtt = {};

$port.mqtt.initAndReconnect = function (tam, callback, disconnectCallback, messageHandler) {

    var connectOptions = {};

    var id = (tam.isActivated() ? tam.getEndpointId() : tam.getClientId());

    connectOptions.host = tam.getServerHost();
    connectOptions.port = tam.getServerPort();
    connectOptions.protocol = 'mqtts';
    connectOptions.rejectUnauthorized = true;

    if ((typeof tam.getTrustAnchorCertificates === 'function')
        && Array.isArray(tam.getTrustAnchorCertificates())
        && (tam.getTrustAnchorCertificates().length > 0)) {
        connectOptions.ca = tam.getTrustAnchorCertificates();
    }

    connectOptions.clientId = id;
    connectOptions.username = id;
    connectOptions.password = tam.buildClientAssertion();

    if (!connectOptions.password) {
        callback(null, lib.createError('error on generating oauth signature'));
        return;
    }

    connectOptions.clean = true;
    connectOptions.connectTimeout = 30 * 1000;
    connectOptions.reconnectPeriod = 60 * 1000;

    var client = require('mqtt').connect(connectOptions);

    client.on('error', function (error) {
        callback(null, error);
    });

    client.on('connect', function (connack) {
        callback(client);
    });

    client.on('close', function () {
        disconnectCallback();
    });

    client.on('message', function (topic, message, packet) {
        messageHandler(topic, message);
    });

};

$port.mqtt.subscribe = function (client, topics, callback) {
    client.subscribe(topics, function (err, granted) {
        if (err && (err instanceof Error)) {
            callback(lib.createError('error on topic subscription: ' + topics.toString(), err));
            return;
        }
        callback();
    });
};

$port.mqtt.unsubscribe = function (client, topics) {
    client.unsubscribe(topics);
};

$port.mqtt.publish = function (client, topic, message, waitForResponse, callback) {
    var qos = (waitForResponse ? 1 : 0);
    client.publish(topic, message, {qos: qos, retain: false}, function (err) {
        if (err && (err instanceof Error)) {
            callback(err);
            return;
        }
        callback();
    });
};

$port.mqtt.close = function (client, callback) {
    client.end(true, callback);
};


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/$impl.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/** @ignore */
var $impl = {};

if (lib.debug) {
    lib.$impl = $impl;
}

/** @ignore */
$impl.https = $impl.https || {};

function QueueNode (data) {
    this.data = data;
    if (data.getJSONObject !== undefined) {
        this.priority = ['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST'].indexOf(data.getJSONObject().priority);
    } else {
        this.priority = 'LOW';
    }
}

// takes an array of objects with {data, priority}
$impl.PriorityQueue = function (maxQueue) {
    this.heap = [null];
    this.maxQueue = maxQueue;
};

$impl.PriorityQueue.prototype = {
    /**
     * Pushes an item onto the queue if adding this item to the queue doesn't go over the max queue
     * size.
     *
     * @param data the item to add to the queue.
     */
    push: function(data) {
        debug('$impl.PriorityQueue.push, pushing: ' + data);

        if (this.heap.length === (this.maxQueue + 1)) {
            lib.error('Maximum queue number reached.');
            return;
        }

        var node = new QueueNode(data);
        this.bubble(this.heap.push(node) -1);
    },

    remove: function(data) {
        debug('$impl.PriorityQueue.push, removing: ' + data);

        if (this.heap.length === 1) {
            return null;
        }
        var index = this.heap.findIndex(function(element, index) {
            if (element && (element.data.name === data.name) && (element.data.type === data.type)) {
                if (element.data._.internal.inputStream && element.data._.internal.inputStream.path &&
                    element.data._.internal.inputStream.path === data._.internal.inputStream.path ) {
                    return index;
                } else if (element.data._.internal.outputStream && element.data._.internal.outputStream.path &&
                    element.data._.internal.outputStream.path === data._.internal.outputStream.path ) {
                    return index;
                }
            }
        }, data);
        return this.heap.splice(index, 1);
    },

    // removes and returns the data of highest priority
    pop: function() {
        if (this.heap.length === 1) {
            return null;
        }
        if (this.heap.length === 2) {
            var ret = this.heap.pop();
            return ((ret && ret.data) ? ret.data : null);
        }
        var topVal = ((this.heap[1] && this.heap[1].data) ? this.heap[1].data : null);
        this.heap[1] = this.heap.pop();
        this.sink(1);
        debug('$impl.PriorityQueue.pop, returning: ' + util.inspect(topVal));
        return topVal;
    },

    // bubbles node i up the binary tree based on
    // priority until heap conditions are restored
    bubble: function(i) {
        while (i > 1) {
            var parentIndex = i >> 1; // <=> floor(i/2)

            // if equal, no bubble (maintains insertion order)
            if (!this.isHigherPriority(i, parentIndex)) break;

            this.swap(i, parentIndex);
            i = parentIndex;
        }   },

    // does the opposite of the bubble() function
    sink: function(i) {
        while (i*2 < this.heap.length - 1) {
            // if equal, left bubbles (maintains insertion order)
            var leftHigher = !this.isHigherPriority(i*2 +1, i*2);
            var childIndex = leftHigher ? i*2 : i*2 +1;

            // if equal, sink happens (maintains insertion order)
            if (this.isHigherPriority(i,childIndex)) break;

            this.swap(i, childIndex);
            i = childIndex;
        }   },

    // swaps the addresses of 2 nodes
    swap: function(i,j) {
        var temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    },

    // returns true if node i is higher priority than j
    isHigherPriority: function(i,j) {
        var prioI = ((this.heap[i] && this.heap[i].priority) ? this.heap[i].priority : 0);
        var prioJ = ((this.heap[j] && this.heap[j].priority) ? this.heap[j].priority : 0);
        return prioI < prioJ;
    }
};

//@TODO: Default TAM Integration
/** @ignore */
$impl.https.req = $impl.https.req || function (options, payload, callback) {
    if (!$impl.tam && !(options.tam)) {
        _initTAM(function () {
            _httpsTAMReq(options, payload, callback);
        });
    } else {
        _httpsTAMReq(options, payload, callback);
    }
};

function _initTAM (callback) {
    if ((typeof window !== 'undefined') && lib.oracle.iot.client.serverUrl
        && (typeof lib.oracle.iot.client.serverUrl === 'string')
        && (typeof forge.util.parseUrl(lib.oracle.iot.client.serverUrl) === 'object')) {
        var parsed = forge.util.parseUrl(lib.oracle.iot.client.serverUrl);
        $impl.tam = {
            getServerHost: function () {
                return parsed.host;
            },
            getServerPort: function () {
                return parsed.port;
            }
        };
        callback();
    } else if (lib.oracle.iot.tam.store && (typeof window !== 'undefined') && location.hostname && location.protocol) {
        var i = location.protocol.indexOf(':');
        var protocol = (i<0) ? location.protocol : location.protocol.substring(0, i);
        $port.https.req({
            method: 'GET',
            path: lib.oracle.iot.tam.store,
            protocol: protocol,
            hostname: location.hostname,
            port: location.port
        }, '', function(response) {
            $port.file.store(lib.oracle.iot.tam.store, response);
            $impl.tam = new lib.enterprise.TrustedAssetsManager();
            callback();
        }, false);
    } else {
        $impl.tam = (lib.enterprise ? new lib.enterprise.TrustedAssetsManager() : new lib.device.TrustedAssetsManager());
        callback();
    }
}

/** @ignore */
function _httpsTAMReq (options, payload, callback) {

    var basePath = null;
    var testPath = null;

    if (options.path.indexOf($impl.reqroot) > -1) {
        basePath = $impl.reqroot;
        testPath = (lib.oracle.iot.client.test ? lib.oracle.iot.client.test.reqroot : null);
    } else if (lib.oracle.iot.client.test && (options.path.indexOf(lib.oracle.iot.client.test.reqroot) > -1)) {
        basePath = lib.oracle.iot.client.test.reqroot;
    }

    // @TODO: Better way of handling links
    if(options.path && ((options.path.indexOf('http:') === 0) || (options.path.indexOf('https:') === 0))){
        options.path = options.path.substring(options.path.indexOf(basePath));
    }

    var _opt = {};
    var oracleIoT = true;
    if (!(options.tam)) {
        options.tam = $impl.tam;
    }
    if (options.tam) {
        _opt.protocol = 'https';
        _opt.hostname = options.tam.getServerHost();
        _opt.port = options.tam.getServerPort();
    } else if (typeof location !== 'undefined') {
        if (location.protocol) {
            var i = location.protocol.indexOf(':');
            _opt.protocol = (i<0) ? location.protocol : location.protocol.substring(0, i);
        }
        if (location.hostname) {
            _opt.hostname = location.hostname;
        }
        if (location.port) {
            _opt.port = location.port;
        }
        oracleIoT = false;
    }

    _opt.headers = {};
    _opt.headers.Accept = 'application/json';
    _opt.headers['Content-Type'] = 'application/json';

    //@TODO: Remove basic auth; only for tests and test server
    //@TODO: (jy) use lib.debug if this configuration is really/always needed for tests ...
    if (lib.oracle.iot.client.test && lib.oracle.iot.client.test.auth.activated) {
        _opt.protocol = lib.oracle.iot.client.test.auth.protocol;
        _opt.headers.Authorization = 'Basic ' + $port.util.btoa(lib.oracle.iot.client.test.auth.user + ':' + lib.oracle.iot.client.test.auth.password);
        if (testPath) {
            options.path = options.path.replace(basePath, testPath);
        }
    }

    for (var key in options) {
        if (key === 'headers') {
            for (var header in options.headers) {
                if (options.headers[header] === null) {
                    delete _opt.headers[header];
                } else {
                    _opt.headers[header] = options.headers[header];
                }
            }
        } else {
            _opt[key] = options[key];
        }
    }

    $port.https.req(_opt, payload, function(response_body, error) {
        if (!response_body || error) {
            callback(null, error);
            return;
        }
        var response_json = null;
        try {
            response_json = JSON.parse(response_body);
        } catch (e) {

        }
        if (!response_json || (typeof response_json !== 'object')) {
            callback(null, lib.createError('response not JSON'));
            return;
        }
        callback(response_json);
    }, oracleIoT);
}


//////////////////////////////////////////////////////////////////////////////

/** @ignore */
function _mandatoryArg(arg, types) {
    if (!arg) {
        lib.error('missing argument');
        return;
    }
    __checkType(arg, types);
}

/** @ignore */
function _optionalArg(arg, types) {
    if (!arg) {
        return;
    }
    __checkType(arg, types);
}

/** @ignore */
//@TODO: [v2] (?) increase check on 'number' with parseInt()!==NaN ?? 
//@TODO: [v2] add support for {'array':'type'}
function __isArgOfType(arg, type) {
    switch(typeof(type)) {
        case 'function':
        case 'object':
            return (arg instanceof type);
        case 'string':
            return (type==='array')
                ? Array.isArray(arg)
                : (typeof(arg) === type);
        default:
    }
    return false;
}

/** @ignore */
function __checkType(arg, types) {
    var argType = typeof(arg);
    if (Array.isArray(types)) {
        var nomatch = types.every(function(type) { return !__isArgOfType(arg, type); });
        if (nomatch) {
            lib.log('type mismatch: got '+argType+' but expecting any of '+types.toString()+')');
            lib.error('illegal argument type');
            return;
        }
        return;
    }
    if (!__isArgOfType(arg, types)) {
        lib.log('type mismatch: got '+argType+' but expecting '+types+')');
        lib.error('illegal argument type');
        return;
    }
}

/** @ignore */
function _isEmpty(obj) {
    if (obj === null || (typeof obj === 'undefined')) return true;
    return (Object.getOwnPropertyNames(obj).length === 0);
}

/** @ignore */
function _isStorageCloudURI(url) {
    var urlObj = require('url').parse(url, true);
    return (urlObj.host.indexOf(lib.oracle.iot.client.storageCloudHost) > -1);
}


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/MqttController.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

$impl.mqtt = $impl.mqtt || {};

function _addArrayCallback(array, callback) {
    if (Array.isArray(array)
        && (typeof callback === 'function')) {
        array.push(callback);
    }
}

function _callArrayCallback(array, messages, error) {
    if (Array.isArray(array)
        && (array.length > 0)
        && (typeof array[0] === 'function')) {
        array.splice(0, 1)[0](messages, error);
    }
}

$impl.mqtt.MqttController = function (tam, topicsGenerator) {

    this.callbacks = [];
    this.apiHandlers = {};
    this.errorHandlers = {};
    this.staticApiHandlers = {};
    this.topicsGenerator = topicsGenerator;
    this.tam = tam;
    this.connected = false;

    var self = this;

    this.disconnectHandler = function () {
        self.client = null;
        self.connected = false;
    };

    this.messageHandler = function (topic, message) {
        var response_json = null;
        try {
            response_json = JSON.parse(message);
        } catch (e) {

        }
        if (!response_json || (typeof response_json !== 'object')) {
            if (self.staticApiHandlers[topic]) {
                self.staticApiHandlers[topic](null, new Error(message));
            }
            if (self.apiHandlers[topic]) {
                _callArrayCallback(self.apiHandlers[topic], null, new Error(message));
            }
            else if (self.errorHandlers[topic] && self.apiHandlers[self.errorHandlers[topic]]) {
                _callArrayCallback(self.apiHandlers[self.errorHandlers[topic]], null, new Error(message));
            }
            return;
        }
        if (self.staticApiHandlers[topic]) {
            self.staticApiHandlers[topic](response_json);
        }
        if (self.apiHandlers[topic]) {
            _callArrayCallback(self.apiHandlers[topic], response_json);
        }
        else if (self.errorHandlers[topic] && self.apiHandlers[self.errorHandlers[topic]]) {
            _callArrayCallback(self.apiHandlers[self.errorHandlers[topic]], null, new Error(message));
        }
    };

    this.connectHandler = function (client, error) {
        if (!client || error) {
            for (var topic in self.apiHandlers) {
                _callArrayCallback(self.apiHandlers[topic], null, error);
            }
            _callArrayCallback(self.callbacks, null, error);
            return;
        }

        var topicObjects = self.topicsGenerator();

        if (Array.isArray(topicObjects) && (topicObjects.length > 0)) {

            var topics = [];
            topicObjects.forEach(function (topicObject) {
                if (topicObject.responseHandler) {
                    topics.push(topicObject.responseHandler);
                }
                if (topicObject.errorHandler) {
                    self.errorHandlers[topicObject.errorHandler] = topicObject.responseHandler;
                    topics.push(topicObject.errorHandler);
                }
            });

            $port.mqtt.subscribe(client, topics, function (error) {
                if (error) {
                    var err = lib.createError('unable to subscribe', error);
                    for (var topic in self.apiHandlers) {
                        _callArrayCallback(self.apiHandlers[topic], null, err);
                    }
                    for (var topic1 in self.staticApiHandlers) {
                        self.staticApiHandlers[topic1](null, err);
                    }
                    _callArrayCallback(self.callbacks, null, err);
                    return;
                }
                self.client = client;
                self.connected = true;
                _callArrayCallback(self.callbacks, self);
            });
        } else {
            self.client = client;
            self.connected = true;
            _callArrayCallback(self.callbacks, self);
        }
    };

};

$impl.mqtt.MqttController.prototype.connect = function(callback) {
    if (callback) {
        _addArrayCallback(this.callbacks, callback);
    }
    $port.mqtt.initAndReconnect(this.tam, this.connectHandler, this.disconnectHandler, this.messageHandler);
};

$impl.mqtt.MqttController.prototype.disconnect = function(callback) {
    $port.mqtt.close(this.client, callback);
};

$impl.mqtt.MqttController.prototype.isConnected = function() {
    if (!this.client) {
        return false;
    }
    return this.connected;
};

$impl.mqtt.MqttController.prototype.register = function (topic, callback){
    if (callback) {
        this.staticApiHandlers[topic] = callback;
    }
};

$impl.mqtt.MqttController.prototype.req = function (topic, payload, expect, callback) {

    var self = this;

    var request = function(controller, error) {

        if (!controller || error) {
            callback(null, error);
            return;
        }

        if (expect && callback && (typeof callback === 'function')) {
            var tempCallback = function (message, error) {
                if (!message || error) {
                    callback(null, error);
                    return;
                }
                callback(message);
            };
            if (!self.apiHandlers[expect]) {
                self.apiHandlers[expect] = [];
            }
            _addArrayCallback(self.apiHandlers[expect], tempCallback);
        }

        $port.mqtt.publish(self.client, topic, payload, (callback ? true : false), function (error) {
            if (error && callback) {
                callback(null, error);
                return;
            }
            if (!expect && callback) {
                callback(payload);
            }
        });
    };

    if (!this.isConnected()) {
        this.connect(request);
    } else {
        request(this);
    }
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/$impl-dcl.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/** @ignore */
$impl.reqroot = '/iot/api/v2';
$impl.privateRoot = '/iot/privateapi/v2';

$impl.protocolReq = function (options, payload, callback, retryCallback, dcd, dcdUtil) {
    if (!options.tam) {
        options.tam = new lib.device.TrustedAssetsManager();
    }
    if (options.tam.getServerScheme && (options.tam.getServerScheme().indexOf('mqtt') > -1)) {
        $impl.mqtt.apiReq(options, payload, callback, retryCallback, dcd, dcdUtil);
    } else {
        if (options.path.startsWith($impl.reqroot+'/activation/policy')
            || options.path.startsWith($impl.reqroot+'/activation/direct')
            || options.path.startsWith($impl.reqroot+'/oauth2/token')){
            $impl.https.req(options, payload, callback);
        } else {
            $impl.https.bearerReq(options, payload, callback, retryCallback, dcd, dcdUtil);
        }
    }
};

function _mqttControllerInit (dcd) {
    if (!dcd._.mqttController) {
        var getTopics = function () {
            var topics = [];
            var id = dcd._.tam.getClientId();
            if (dcd.isActivated()) {
                id = dcd._.tam.getEndpointId();
                topics.push({
                    responseHandler: 'devices/' + id + '/deviceModels',
                    errorHandler: 'devices/' + id + '/deviceModels/error'
                });
                topics.push({
                    responseHandler: 'devices/' + id + '/messages',
                    errorHandler: 'devices/' + id + '/messages/error'
                });
                topics.push({
                    responseHandler: 'devices/' + id + '/messages/acceptBytes'
                });
                if (dcd._.gateway) {
                    topics.push({
                        responseHandler: 'devices/' + id + '/activation/indirect/device',
                        errorHandler: 'devices/' + id + '/activation/indirect/device/error'
                    });
                }
            } else {
                topics.push({
                    responseHandler: 'devices/' + id + '/activation/policy',
                    errorHandler: 'devices/' + id + '/activation/policy/error'
                });
                topics.push({
                    responseHandler: 'devices/' + id + '/deviceModels',
                    errorHandler: 'devices/' + id + '/deviceModels/error'
                });
                topics.push({
                    responseHandler: 'devices/' + id + '/activation/direct',
                    errorHandler: 'devices/' + id + '/activation/direct/error'
                });
            }
            return topics;
        };
        Object.defineProperty(dcd._, 'mqttController', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: new $impl.mqtt.MqttController(dcd._.tam, getTopics)
        });
    }
}

$impl.protocolRegister = function (path, callback, dcd) {
    if (dcd.isActivated() && dcd._.tam.getServerScheme && (dcd._.tam.getServerScheme().indexOf('mqtt') > -1)) {
        _mqttControllerInit(dcd);
        if (path.startsWith($impl.reqroot+'/messages/acceptBytes')) {
            dcd._.mqttController.register('devices/' + dcd.getEndpointId() + '/messages/acceptBytes', callback);
        } else if (path.startsWith($impl.reqroot+'/messages')) {
            dcd._.mqttController.register('devices/' + dcd.getEndpointId() + '/messages', callback);
        }
    }
};

$impl.mqtt.apiReq = function (options, payload, callback, retryCallback, dcd, dcdUtil) {

    var tempCallback = callback;

    var tempCallbackBearer = function (response_body, error) {
        if (error) {
            var exception = null;
            try {
                exception = JSON.parse(error.message);
                if (exception.status && (exception.status === 401)) {
                    dcd._.mqttController.disconnect(retryCallback);
                    return;
                }
            } catch (e) {}
        }
        callback(response_body, error, dcdUtil);
    };

    function callApi(controller) {
        var id = (dcd.isActivated() ? dcd._.tam.getEndpointId() : dcd._.tam.getClientId());
        var topic = null;
        var expect = null;
        if (options.method === 'GET') {
            if (options.path.startsWith($impl.reqroot+'/activation/policy')) {
                topic = 'iotcs/' + id + '/activation/policy';
                expect = 'devices/' + id + '/activation/policy';
                payload = JSON.stringify({OSName: $port.os.type(), OSVersion: $port.os.release()});
            } else if (options.path.startsWith($impl.reqroot+'/deviceModels')) {
                topic = 'iotcs/' + id + '/deviceModels';
                expect = 'devices/' + id + '/deviceModels';
                tempCallback = tempCallbackBearer;
                payload = JSON.stringify({urn: options.path.substring(options.path.lastIndexOf('/') + 1)});
            }
        } else if (options.method === 'POST') {
            if (options.path.startsWith($impl.reqroot+'/activation/direct')) {
                topic = 'iotcs/' + id + '/activation/direct';
                expect = 'devices/' + id + '/activation/direct';
                tempCallback = function (response_body, error) {
                    if (error) {
                        dcd._.tam.setEndpointCredentials(dcd._.tam.getClientId(), null);
                    }
                    controller.disconnect(function () {
                        callback(response_body, error);
                    });
                };
            } else if (options.path.startsWith($impl.reqroot+'/oauth2/token')) {
                callback({token_type: 'empty', access_token: 'empty'});
                return;
            } else if (options.path.startsWith($impl.reqroot+'/activation/indirect/device')) {
                topic = 'iotcs/' + id + '/activation/indirect/device';
                expect = 'devices/' + id + '/activation/indirect/device';
                tempCallback = tempCallbackBearer;
            } else if (options.path.startsWith($impl.reqroot+'/messages')) {
                expect = 'devices/' + id + '/messages';
                topic = 'iotcs/' + id + '/messages';
                tempCallback = tempCallbackBearer;
                var acceptBytes = parseInt(options.path.substring(options.path.indexOf('acceptBytes=')+12));
                if (acceptBytes && ((typeof controller.acceptBytes === 'undefined') || (controller.acceptBytes !== acceptBytes))) {
                    topic = 'iotcs/' + id + '/messages/acceptBytes';
                    var buffer = forge.util.createBuffer();
                    buffer.putInt32(acceptBytes);
                    controller.req(topic, buffer.toString(), null, function () {
                        controller.acceptBytes = acceptBytes;
                        topic = 'iotcs/' + id + '/messages';
                        controller.req(topic, payload, expect, tempCallback);
                    });
                    return;
                }
            }
        }
        controller.req(topic, payload, expect, tempCallback);
    }
    _mqttControllerInit(dcd);
    callApi(dcd._.mqttController);
};

$impl.https.bearerReq = function (options, payload, callback, retryCallback, dcd, dcdUtil) {
    $impl.https.req(options, payload, function (response_body, error) {
        if (error) {
            var exception = null;
            try {
                exception = JSON.parse(error.message);
                if (exception.statusCode && (exception.statusCode === 401)) {
                    dcd._.refresh_bearer(false, function (error) {
                        if (error) {
                            callback(response_body, error, dcdUtil);
                            return;
                        }
                        retryCallback();
                    });
                    return;
                }
            } catch (e) {}
        }
        callback(response_body, error, dcdUtil);
    });
};


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/Client.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//@TODO: add and validate this.tam = new $impl.TrustedAssetsManager();

/**
 * Client of the Oracle IoT Cloud Service. A client is a
 * directly-connected device, a gateway, or an enterprise
 * application.
 *
 * @class
 */
lib.Client = function () {
    this.cache = this.cache || {};
    this.cache.deviceModels = {};
};

/**
 * Create an AbstractVirtualDevice instance with the given device model
 * for the given device identifier. This method creates a new
 * AbstractVirtualDevice instance for the given parameters. The client
 * library does not cache previously created AbstractVirtualDevice
 * objects.
 * <p>
 * A device model can be obtained by it's afferent urn with the
 * Client if it is registered on the cloud.
 *
 * @see {@link iotcs.Client#getDeviceModel}
 * @param {string} endpointId - The endpoint identifier of the
 * device being modeled. 
 * @param {object} deviceModel - The device model object
 * holding the full description of that device model that this
 * device implements. 
 * @returns {iotcs.AbstractVirtualDevice} The newly created virtual device
 *
 * @memberof iotcs.Client.prototype
 * @function createVirtualDevice
 */
lib.Client.prototype.createVirtualDevice = function (endpointId, deviceModel) {
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(deviceModel, 'object');
    return new lib.AbstractVirtualDevice(endpointId, deviceModel);
};

/**
 * Get the device model for the urn.
 *
 * @param {string} deviceModelUrn - The URN of the device model
 * @param {function} callback - The callback function. This
 * function is called with the following argument: a
 * deviceModel object holding full description e.g. <code>{ name:"",
 * description:"", fields:[...], created:date,
 * isProtected:boolean, lastModified:date ... }</code>.
 * If an error occurs the deviceModel object is null
 * and an error object is passed: callback(deviceModel, error) and
 * the reason can be taken from error.message
 *
 * @memberof iotcs.Client.prototype
 * @function getDeviceModel
 */
lib.Client.prototype.getDeviceModel = function (deviceModelUrn, callback) {
    _mandatoryArg(deviceModelUrn, 'string');
    _mandatoryArg(callback, 'function');
    var deviceModel = this.cache.deviceModels[deviceModelUrn];
    if (deviceModel) {
        callback(deviceModel);
        return;
    }
    var self = this;
    $impl.https.bearerReq({
        method: 'GET',
        path:   $impl.reqroot
            + '/deviceModels/' + deviceModelUrn
    }, '', function (response, error) {
        if(!response || error || !(response.urn)){
            callback(null, lib.createError('invalid response on get device model', error));
            return;
        }
        var deviceModel = response;
        Object.freeze(deviceModel);
        self.cache.deviceModels[deviceModelUrn] = deviceModel;
        callback(deviceModel);
    }, function () {
        self.getDeviceModel(deviceModelUrn, callback);
    }, (lib.$port.userAuthNeeded() ? null : (lib.$impl.DirectlyConnectedDevice ? new lib.$impl.DirectlyConnectedDevice() : new lib.$impl.EnterpriseClientImpl())));
};

/**
 * Create a new {@link iotcs.device.StorageObject} with the given object name and mime&ndash;type.
 *
 * @param {String} name - the unique name to be used to reference the content in storage
 * @param {String} type - The mime-type of the content.
 * If not set, the mime&ndash;type defaults to {@link lib.device.StorageObject.MIME_TYPE}
 * @returns {iotcs.device.StorageObject} a storage object
 *
 * @memberof iotcs.Client.prototype
 * @function createStorageObject
 */
lib.Client.prototype.createStorageObject = function (name, type) {
    _mandatoryArg(name, "string");
    _optionalArg(type, "string");
    var storage = new lib.device.StorageObject(null, name, type);
    storage._.setDevice(this._.internalDev);
    return storage;
};


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/Monitor.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//@TODO: a little more JSDOC is needed; explain the (simple) state machine and e.g. when the monitor thread is actually started, whether start and stop can be called multiple time; the default frequency ...etc...

/**
 * @param {function()} callback - function associated to this monitor
 * @class
 */
/** @ignore */
$impl.Monitor = function (callback) {
    _mandatoryArg(callback, 'function');
    this.running = false;
    this.callback = callback;
};

//@TODO: a little more JSDOC is needed

/**
 * @memberof iotcs.util.Monitor.prototype
 * @function start
 */
$impl.Monitor.prototype.start = function () {
    if (this.running) {
        return;
    }
    this.running = true;
    var self = this;
    this.monitorid = _register(this.callback);
};

//@TODO: a little more JSDOC is needed

/**
 * @memberof iotcs.util.Monitor.prototype
 * @function stop
 */
$impl.Monitor.prototype.stop = function () {
    if (!this.running) {
        return;
    }
    this.running = false;
    _unregister(this.monitorid);
};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
var monitors = {};

/** @ignore */
var index = 0;

/** @ignore */
var threadid = null;

/** @ignore */
function _caroussel() {
    Object.keys(monitors).forEach(function (id) {
        if (typeof monitors[id] === 'function') {
            monitors[id]();
        }
    });
}

/** @ignore */
function _register(callback) {
    monitors[++index] = callback;
    if (Object.keys(monitors).length === 1) {
        // if at least one registered monitor, then start thread
        if (threadid) {
            lib.log('inconsistent state: monitor thread already started!');
            return;
        }
        threadid = setInterval(_caroussel, lib.oracle.iot.client.monitor.pollingInterval);
    }
    return index;
}

/** @ignore */
function _unregister(id) {
    if ((typeof id === 'undefined') || !monitors[id]) {
        lib.log('unknown monitor id');
        return;
    }
    delete monitors[id];
    if (Object.keys(monitors).length === 0) {
        // if no registered monitor left, then stop thread
        if (!threadid) {
            lib.log('inconsistent state: monitor thread already stopped!');
            return;
        }
        clearInterval(threadid);
        threadid = null;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/AbstractVirtualDevice.js

/**
 * Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * AbstractVirtualDevice is a representation of a device model
 * implemented by an endpoint. A device model is a
 * specification of the attributes, formats, and resources
 * available on the endpoint. 
 * <p>
 * The AbstractVirtualDevice API is identical for both the enterprise
 * client and the device client. The semantics of the API are
 * also the same. The processing model on the enterprise
 * client is different, however, from the processing model on
 * the device client. 
 * <p>
 * A device model can be obtained by it's afferent urn with the
 * Client if it is registered on the cloud.
 * <p>
 * An AbstractVirtualDevice can also be created with the appropriate
 * parameters from the Client.
 *
 * @see {@link iotcs.Client#getDeviceModel}
 * @see {@link iotcs.Client#createVirtualDevice}
 * @param {string} endpointId - The endpoint id of this device
 * @param {object} deviceModel - The device model object
 * holding the full description of that device model that this
 * device implements.
 * @class
 */
lib.AbstractVirtualDevice = function (endpointId, deviceModel) {
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(deviceModel, 'object');

    this.endpointId = endpointId;
    this.deviceModel = deviceModel;

    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this, 'onChange', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this._.onChange;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onChange that is not a function!');
                return;
            }
            this._.onChange = newValue;
        }
    });
    this._.onChange = null;

    Object.defineProperty(this, 'onError', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this._.onError;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onError that is not a function!');
                return;
            }
            this._.onError = newValue;
        }
    });
    this._.onError = null;
};

/**
 * Get the device model of this device object. This is the exact model
 * that was used at construction of the device object.
 *
 * @returns {Object} the object representing the device model for this
 * device
 *
 * @memberof iotcs.AbstractVirtualDevice.prototype
 * @function getDeviceModel
 */
lib.AbstractVirtualDevice.prototype.getDeviceModel = function () {
    return this.deviceModel;
};

/**
 * Get the endpoint id of the device.
 *
 * @returns {string} The endpoint id of this device as given at construction
 * of the virtual device
 *
 * @memberof iotcs.AbstractVirtualDevice.prototype
 * @function getEndpointId
 */
lib.AbstractVirtualDevice.prototype.getEndpointId = function () {
    return this.endpointId;
};

//@TODO: accessing directly a very internal object is not clean: e.g. "this.attributes[attribute]._."

/**
 * The update call allows more than one value to be set on
 * this Device object and in the end, it is sending the values
 * to the server.
 * <p>
 * The values are sent to the server when the method is
 * called, which also marks the end of the update
 * transaction.
 * <p>
 * For example <code>device.update({"min":10, "max":20});</code>
 * <p>
 * If the virtual device has the onError property set with a callback
 * method or any/all of the attributes given in the update call
 * have the onError attribute set with a callback method, in case
 * of error on update the callbacks will be called with related attribute
 * information. See VirtualDevice description for more info on onError.
 *
 * @param {Object} attributes - An object holding a list of attribute name/
 * value pairs to be updated as part of this transaction,
 * e.g. <code>{ "temperature":23, ... }</code>. Note that keys shall refer
 * to device attribute names.
 *
 * @see {@link iotcs.enterprise.VirtualDevice}
 * @memberof iotcs.AbstractVirtualDevice.prototype
 * @function update
 */
lib.AbstractVirtualDevice.prototype.update = function (attributes) {
};

/**
 * Close this virtual device and all afferent resources used
 * for monitoring or controlling the device.
 *
 * @memberof iotcs.AbstractVirtualDevice.prototype
 * @function close
 */
lib.AbstractVirtualDevice.prototype.close = function () {
    this.endpointId = null;
    this.deviceModel = null;
    this.onChange = function (arg) {};
    this.onError = function (arg) {};
};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
function _link(name, device, element) {
    _mandatoryArg(name, 'string');
    _mandatoryArg(device, 'object'); //@TODO: should be checked against instance name
    _mandatoryArg(element, 'object');
    if (device[name]) {
        return;
    }
    Object.defineProperty(device, name, {
        enumerable: true,
        configurable: false,
        writable: false,
        value: element
    });
    Object.defineProperty(element, 'device', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: device
    });
}


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/UnifiedTrustStore.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This class provides an implementation of the trusted assets format
 * as values of the tag-length-value form in a Base64 encoded AES encrypted
 * file.
 * <p>
 * Unified client provisioning format:
 * <p>
 * format = version & blob & *comment<br>
 * version = 1 byte, value 33<br>
 * blob = MIME base64 of encrypted & new line<br>
 * encrypted = IV & AES-128/CBC/PKCS5Padding of values<br>
 * IV = 16 random bytes<br>
 * values = *TLV<br>
 * TLV = tag & length & value<br>
 * tag = byte<br>
 * length = 2 byte BE unsigned int<br>
 * value = length bytes<br>
 * comment = # & string & : & string & new line<br>
 * string = UTF-8 chars<br>
 * <p>
 * The password based encryption key is the password processed by 10000
 * interations of PBKDF2WithHmacSHA1 with the IV as the salt.
 * <p>
 * This class is internally used by the trusted assets store managers
 * to read/write files in the unified format
 *
 * @class
 * @memberOf iotcs
 * @alias UnifiedTrustStore
 *
 */
lib.UnifiedTrustStore = function (taStoreFileExt, taStorePasswordExt, forProvisioning) {

    this.trustStoreValues = {
        clientId: null,
        sharedSecret: null,
        serverHost: null,
        serverPort: null,
        endpointId: null,
        serverScheme: null,
        privateKey: null,
        publicKey: null,
        trustAnchors: null,
        certificate: null,
        connectedDevices: null
    };
    this.userInfo = "#";

    var taStoreFile = taStoreFileExt || lib.oracle.iot.tam.store;
    var taStorePassword = taStorePasswordExt || lib.oracle.iot.tam.storePassword;

    if (!taStoreFile) {
        lib.error('No TA Store file defined');
        return;
    }
    if (!taStorePassword) {
        lib.error('No TA Store password defined');
        return;
    }

    var self = this;

    this.load = function () {
        var input = $port.file.load(taStoreFile);
        if (input.charCodeAt(0) != lib.UnifiedTrustStore.constants.version) {
            lib.error('Invalid unified trust store version');
            return;
        }
        var base64BlockStr = input.substring(1, input.indexOf('#'));
        this.userInfo = input.substring(input.indexOf('#')) || this.userInfo;
        var encryptedData = forge.util.decode64(base64BlockStr);
        if (encryptedData.length <= 0) {
            lib.error('Invalid unified trust store');
            return;
        }
        var iv = forge.util.createBuffer();
        var encrypted = forge.util.createBuffer();
        for (var i = 0; i < lib.UnifiedTrustStore.constants.AES_BLOCK_SIZE; i++) {
            iv.putInt(encryptedData.charCodeAt(i), 8);
        }
        iv = iv.getBytes();
        for (i = lib.UnifiedTrustStore.constants.AES_BLOCK_SIZE; i < encryptedData.length; i++) {
            encrypted.putInt(encryptedData.charCodeAt(i), 8);
        }
        var key = forge.pkcs5.pbkdf2(taStorePassword, iv, lib.UnifiedTrustStore.constants.PBKDF2_ITERATIONS, lib.UnifiedTrustStore.constants.AES_KEY_SIZE);
        var decipher = forge.cipher.createDecipher('AES-CBC', key);
        decipher.start({iv: iv});
        decipher.update(encrypted);
        decipher.finish();
        var output = decipher.output;
        while (!output.isEmpty()) {
            var tag = output.getInt(8);
            var length = (output.getInt(16) >> 0);
            var buf = output.getBytes(length);
            switch (tag) {
                case lib.UnifiedTrustStore.constants.TAGS.serverUri:
                    var urlObj = forge.util.parseUrl(buf);
                    self.trustStoreValues.serverHost = urlObj.host;
                    self.trustStoreValues.serverPort = urlObj.port;
                    self.trustStoreValues.serverScheme = urlObj.scheme;
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.clientId:
                    self.trustStoreValues.clientId = buf;
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.sharedSecret:
                    self.trustStoreValues.sharedSecret = buf;
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.endpointId:
                    self.trustStoreValues.endpointId = buf;
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.trustAnchor:
                    if (!self.trustStoreValues.trustAnchors) {
                        self.trustStoreValues.trustAnchors = [];
                    }
                    self.trustStoreValues.trustAnchors.push(forge.pki.certificateToPem(forge.pki.certificateFromAsn1(forge.asn1.fromDer(buf))));
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.privateKey:
                    self.trustStoreValues.privateKey = forge.pki.privateKeyFromAsn1(forge.asn1.fromDer(buf));
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.publicKey:
                    self.trustStoreValues.publicKey = forge.pki.publicKeyFromAsn1(forge.asn1.fromDer(buf));
                    break;

                case lib.UnifiedTrustStore.constants.TAGS.connectedDevice:
                    if (!self.trustStoreValues.connectedDevices) {
                        self.trustStoreValues.connectedDevices = {};
                    }
                    var _data = { error: false };
                    var _output = new forge.util.ByteStringBuffer().putBytes(buf);
                    connectedDevice_loop:
                    while (!_output.isEmpty()) {
                        var _tag = _output.getInt(8);
                        var _length = (_output.getInt(16) >> 0);
                        var _buf = _output.getBytes(_length);
                        switch (_tag) {
                            case lib.UnifiedTrustStore.constants.TAGS.clientId:
                                _data.deviceId = _buf;
                                break;

                            case lib.UnifiedTrustStore.constants.TAGS.sharedSecret:
                                _data.sharedSecret = _buf;
                                break;

                            default:
                                lib.error("Invalid TAG inside indirect connected device data.");
                                _data.error = true;
                                break connectedDevice_loop;
                        }
                    }
                    if (!_data.error && _data.deviceId && _data.sharedSecret) {
                        self.trustStoreValues.connectedDevices[_data.deviceId] = _data.sharedSecret;
                    }
                    break;

                default:
                    lib.error('Invalid unified trust store TAG');
                    return;
            }
        }
    };

    this.store = function (values) {
        if (values) {
            Object.keys(values).forEach(function (key) {
                self.trustStoreValues[key] = values[key];
            });
        }
        var buffer = forge.util.createBuffer();
        var serverUri = self.trustStoreValues.serverScheme + '://' + self.trustStoreValues.serverHost + ':' + self.trustStoreValues.serverPort;
        buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.serverUri, 8);
        buffer.putInt(serverUri.length, 16);
        buffer.putBytes(serverUri);
        buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.clientId, 8);
        buffer.putInt(self.trustStoreValues.clientId.length, 16);
        buffer.putBytes(self.trustStoreValues.clientId);
        buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.sharedSecret, 8);
        buffer.putInt(self.trustStoreValues.sharedSecret.length, 16);
        buffer.putBytes(self.trustStoreValues.sharedSecret);
        if (self.trustStoreValues.endpointId) {
            buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.endpointId, 8);
            buffer.putInt(self.trustStoreValues.endpointId.length, 16);
            buffer.putBytes(self.trustStoreValues.endpointId);
        }
        if (Array.isArray(self.trustStoreValues.trustAnchors)) {
            self.trustStoreValues.trustAnchors.forEach(function (trustAnchor) {
                var trust = forge.asn1.toDer(forge.pki.certificateToAsn1(forge.pki.certificateFromPem(trustAnchor))).getBytes();
                buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.trustAnchor, 8);
                buffer.putInt(trust.length, 16);
                buffer.putBytes(trust);
            });
        }
        if (self.trustStoreValues.privateKey) {
            buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.privateKey, 8);
            var tempBytes = forge.asn1.toDer(forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(self.trustStoreValues.privateKey))).getBytes();
            buffer.putInt(tempBytes.length, 16);
            buffer.putBytes(tempBytes);
        }
        if (self.trustStoreValues.publicKey) {
            buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.publicKey, 8);
            var tempBytes1 = forge.asn1.toDer(forge.pki.publicKeyToAsn1(self.trustStoreValues.publicKey)).getBytes();
            buffer.putInt(tempBytes1.length, 16);
            buffer.putBytes(tempBytes1);
        }
        if (self.trustStoreValues.connectedDevices) {
            for (var deviceId in self.trustStoreValues.connectedDevices) {
                buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.connectedDevice, 8);
                // deviceId.length + sharedSecret.length + 6
                // where 6 bytes contains [ACTIVATION_ID_TAG|<icd activation id length> and [SHARED_SECRET_TAG|<icd shared secret length>
                buffer.putInt(deviceId.length + self.trustStoreValues.connectedDevices[deviceId].length + 6, 16);
                buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.clientId, 8);
                buffer.putInt(deviceId.length, 16);
                buffer.putBytes(deviceId);
                buffer.putInt(lib.UnifiedTrustStore.constants.TAGS.sharedSecret, 8);
                buffer.putInt(self.trustStoreValues.connectedDevices[deviceId].length, 16);
                buffer.putBytes(self.trustStoreValues.connectedDevices[deviceId]);
            }
        }
        var iv = forge.random.getBytesSync(lib.UnifiedTrustStore.constants.AES_BLOCK_SIZE);
        var key = forge.pkcs5.pbkdf2(taStorePassword, iv, lib.UnifiedTrustStore.constants.PBKDF2_ITERATIONS, lib.UnifiedTrustStore.constants.AES_KEY_SIZE);
        var cipher = forge.cipher.createCipher('AES-CBC', key);
        cipher.start({iv: iv});
        cipher.update(buffer);
        cipher.finish();
        var finalBuffer = forge.util.createBuffer();
        finalBuffer.putInt(lib.UnifiedTrustStore.constants.version, 8);
        finalBuffer.putBytes(forge.util.encode64(iv+cipher.output.getBytes()));
        finalBuffer.putBytes("\n" + this.userInfo);
        $port.file.store(taStoreFile, finalBuffer.getBytes());
    };

    this.setValues = function (otherManager) {
        Object.keys(otherManager).forEach(function (key) {
            if (self.trustStoreValues[key]) {
                otherManager[key] = self.trustStoreValues[key];
            }
        });
    };

    this.update = function (otherManager) {
        Object.keys(otherManager).forEach(function (key) {
            if (otherManager[key] && (typeof self.trustStoreValues[key] !== 'undefined')) {
                self.trustStoreValues[key] = otherManager[key];
            }
        });
        self.store();
    };

    if (!forProvisioning) {
        this.load();
    }

};

/**
 * Enumeration of unified trust store format constants
 *
 * @memberOf iotcs.UnifiedTrustStore
 * @alias constants
 * @class
 * @readonly
 * @enum {Integer}
 */
lib.UnifiedTrustStore.constants = {
    version: 33,
    AES_BLOCK_SIZE: 16,
    AES_KEY_SIZE: 16,
    PBKDF2_ITERATIONS: 10000,
    TAGS: {}
};

lib.UnifiedTrustStore.constants.TAGS = {
    /**
     * The URI of the server, e.g., https://iotinst-mydomain.iot.us.oraclecloud.com:443
     */
    serverUri: 1,
    /** A client id is either an integration id (for enterprise clients), or an
     * activation id (for device clients). An activation id may also be
     * referred to a hardware id.
     */
    clientId: 2,
    /**
     * The shared secret as plain text
     */
    sharedSecret: 3,
    /**
     * For devices, the endpoint id TLV is omitted from the provisioning file
     * (unless part of a CONNECTED_DEVICE_TAG TLV).
     * For enterpise integrations, the endpoint id is set in the provisioning file
     * by the inclusion of the second ID argument.
     */
    endpointId: 4,
    /**
     * The trust anchor is the X509 cert
     */
    trustAnchor: 5,
    privateKey: 6,
    publicKey: 7,
    /**
     * The client id and shared secret of a device that can connect
     * indirectly through the device client
     *
     * Connected device TLV =
     * [CONNECTED_DEVICE_TAG|<length>|[CLIENT_ID_TAG|<icd activation id length>|<icd activation id>][SHARED_SECRET_TAG|<icd shared secrect length>|<icd shared secret>]]
     */
    connectedDevice: 8
};


/**
 * This is a helper method for provisioning files used by
 * the trusted assets store managers in the unified trust
 * store format.
 *
 * @param {string} taStoreFile - the Trusted Assets Store file name.
 * @param {string} taStorePassword - the Trusted Assets Store password.
 * @param {string} serverScheme - the scheme used to communicate with the server. Possible values are http(s) or mqtt(s).
 * @param {string} serverHost - the IoT CS server host name.
 * @param {number} serverPort - the IoT CS server port.
 * @param {string} clientId - activation ID for devices or client ID for application integrations.
 * @param {string} sharedSecret - the client's shared secret.
 * @param {string} truststore - the truststore file containing PEM-encoded trust anchors certificates to be used to validate the IoT CS server
 * certificate chain.
 * @param {string} connectedDevices - array of indirect connect devices.
 *
 * @memberOf iotcs.UnifiedTrustStore
 * @function provision
 */
lib.UnifiedTrustStore.provision = function (taStoreFile, taStorePassword, serverScheme, serverHost, serverPort, clientId, sharedSecret, truststore, connectedDevices) {
    if (!taStoreFile) {
        throw 'No TA Store file provided';
    }
    if (!taStorePassword) {
        throw 'No TA Store password provided';
    }
    var entries = {
        clientId: clientId,
        serverHost: serverHost,
        serverPort: serverPort,
        serverScheme: (serverScheme ? serverScheme : 'https'),
        sharedSecret: sharedSecret,
        trustAnchors: (truststore ? (Array.isArray(truststore) ? truststore : _loadTrustAnchorsBinary(truststore)) : []),
        connectedDevices: (connectedDevices ? connectedDevices : {})
    };
    new lib.UnifiedTrustStore(taStoreFile, taStorePassword, true).store(entries);
};

/** @ignore */
function _loadTrustAnchorsBinary (truststore) {
    return $port.file.load(truststore)
        .split(/\-{5}(?:B|E)(?:[A-Z]*) CERTIFICATE\-{5}/)
        .filter(function(elem) { return ((elem.length > 1) && (elem.indexOf('M') > -1)); })
        .map(function(elem) { return '-----BEGIN CERTIFICATE-----' + elem.replace(new RegExp('\r\n', 'g'),'\n') + '-----END CERTIFICATE-----'; });
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/TrustedAssetsManager.js

/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and 
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * The <code>TrustedAssetsManager</code> interface defines methods for handling trust
 * material used for activation and authentication to the IoT CS. Depending on
 * the capability of the client or device as well as on the security
 * requirements implementations of this interface may simply store sensitive
 * trust material in a plain persistent store, in some keystore or in a secure
 * token.
 * <dl>
 * <dt>Authentication of Devices with the IoT CS</dt>
 * <dd>
 * <dl>
 * <dt>Before/Upon Device Activation</dt>
 * <dd>
 * A device must use client secret-based authentication to authenticate with the
 * OAuth service and retrieve an access token to perform activation with the IoT
 * CS server. This is done by using an activation ID and a shared secret.
 * </dd>
 * <dt>After Device Activation</dt>
 * <dd>
 * A device must use client assertion-based authentication to authenticate with
 * the OAuth service and retrieve an access token to perform send and retrieve
 * messages from the IoT CS server. This is done by using the assigned endpoint ID
 * and generated private key.</dd>
 * </dl>
 * </dd>
 * <dt>Authentication of <em>Pre-activated</em> Enterprise Applications with the
 * IoT CS</dt>
 * <dd>
 * <dl>
 * <dt>Before/After Application Activation</dt>
 * <dd>
 * An enterprise integration must use client secret-based authentication to authenticate with the
 * OAuth service and retrieve an access token to perform any REST calls with the IoT
 * CS server. This is done by using the integration ID and a shared secret.</dd>
 * </dd>
 * </dl>
 *
 * @class
 * @memberOf iotcs.device
 * @alias TrustedAssetsManager
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 *
 */
lib.device.TrustedAssetsManager = function (taStoreFile, taStorePassword) {
    this.clientId = null;
    this.sharedSecret = null;
    this.serverHost = null;
    this.serverPort = null;
    this.endpointId = null;
    this.serverScheme = 'https';
    this.taStoreFile = null;

    this.privateKey = null;
    this.publicKey = null;
    this.certificate = null;
    this.trustAnchors = [];
    this.connectedDevices = {};

    var _taStoreFile = taStoreFile || lib.oracle.iot.tam.store;
    var _taStorePassword = taStorePassword || lib.oracle.iot.tam.storePassword;

    if (!_taStoreFile) {
        lib.error('No TA Store file defined');
        return;
    }
    if (!_taStorePassword) {
        lib.error('No TA Store password defined');
        return;
    }

    if (!_taStoreFile.endsWith('.json')) {
        this.unifiedTrustStore = new lib.UnifiedTrustStore(_taStoreFile, _taStorePassword, false);
        this.unifiedTrustStore.setValues(this);
        this.taStoreFile = _taStoreFile;
    } else {
        this.load = function () {
            var input = $port.file.load(_taStoreFile);
            var entries = JSON.parse(input);

            if (!_verifyTaStoreContent(entries, _taStorePassword)) {
                lib.error('TA Store not signed or tampered with');
                return;
            }

            this.clientId = entries.clientId;
            this.serverHost = entries.serverHost;
            this.serverPort = entries.serverPort;
            this.serverScheme = entries.serverScheme;
            this.sharedSecret = _decryptSharedSecret(entries.sharedSecret, _taStorePassword);
            this.trustAnchors = entries.trustAnchors;
            this.connectedDevices = entries.connectedDevices;

            {
                var keyPair = entries.keyPair;
                if (keyPair) {
                    var p12Der = forge.util.decode64(entries.keyPair);
                    var p12Asn1 = forge.asn1.fromDer(p12Der, false);
                    var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, _taStorePassword);

                    var bags = p12.getBags({
                        bagType: forge.pki.oids.certBag
                    });
                    this.certificate = bags[forge.pki.oids.certBag][0].cert;
                    bags = p12.getBags({
                        bagType: forge.pki.oids.pkcs8ShroudedKeyBag
                    });
                    var bag = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
                    this.privateKey = bag.key;
                    this.endpointId = bag.attributes.friendlyName[0];
                }
            }
        };

        this.store = function () {
            lib.log('store ' + ((this.privateKey !== null) ? 'true' : 'false') + ' ' + this.endpointId);
            var keyPairEntry = null;
            if (this.privateKey) {
                var p12Asn1 = forge.pkcs12.toPkcs12Asn1(
                    this.privateKey,
                    this.certificate,
                    _taStorePassword, {
                        'friendlyName': this.endpointId
                    });
                var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
                keyPairEntry = forge.util.encode64(p12Der);
            }
            var entries = {
                'clientId': this.clientId,
                'serverHost': this.serverHost,
                'serverPort': this.serverPort,
                'serverScheme': this.serverScheme,
                'sharedSecret': _encryptSharedSecret(this.sharedSecret, _taStorePassword),
                'trustAnchors': this.trustAnchors,
                'keyPair': keyPairEntry,
                'connectedDevices': this.connectedDevices
            };

            entries = _signTaStoreContent(entries, _taStorePassword);

            var output = JSON.stringify(entries);
            $port.file.store(_taStoreFile, output);
        };
        this.load();
    }
};

/**
 * Retrieves the IoT CS server host name.
 *
 * @returns {?string} the IoT CS server host name
 * or <code>null</code> if any error occurs retrieving the server host
 * name.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getServerHost
 */
lib.device.TrustedAssetsManager.prototype.getServerHost = function () {
    return this.serverHost;
};

/**
 * Retrieves the IoT CS server port.
 *
 * @returns {?number} the IoT CS server port (a positive integer)
 * or <code>null</code> if any error occurs retrieving the server port.
 * 
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getServerPort
 */
lib.device.TrustedAssetsManager.prototype.getServerPort = function () {
    return this.serverPort;
};

/**
 * Retrieves the ID of this client. If the client is a device the client ID
 * is the device activation ID; if the client is a pre-activated enterprise application
 * the client ID corresponds to the assigned integration ID. The client ID is
 * used along with a client secret derived from the shared secret to perform
 * secret-based client authentication with the IoT CS server.
 *
 * @returns {?string} the ID of this client.
 * or <code>null</code> if any error occurs retrieving the client ID.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getClientId
 */
lib.device.TrustedAssetsManager.prototype.getClientId = function () {
    return this.clientId;
};

/**
 * Retrieves the IoT CS connected devices.
 *
 * @returns {?Object} the IoT CS connected devices
 * or <code>null</code> if any error occurs retrieving connected devices.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getConnectedDevices
 */
lib.device.TrustedAssetsManager.prototype.getConnectedDevices = function () {
    return this.connectedDevices;
};

/**
 * Retrieves the public key to be used for certificate request.
 *
 * @returns {?string} the device public key as a PEM-encoded string
 * or <code>null</code> if any error occurs retrieving the public key.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getPublicKey
 */
lib.device.TrustedAssetsManager.prototype.getPublicKey = function () {
    if ((!this.publicKey) && (!this.certificate)) {
        throw new Error('Key pair not yet generated or certificate not yet assigned');
    }
    var key = (this.publicKey) ? this.publicKey : this.certificate.publicKey;
    return forge.pki.publicKeyToPem(key);
};

/**
 * Retrieves the trust anchor or most-trusted Certification
 * Authority (CA) to be used to validate the IoT CS server
 * certificate chain.
 *
 * @returns {?Array} the PEM-encoded trust anchor certificates.
 * or <code>null</code> if any error occurs retrieving the trust anchor.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getTrustAnchorCertificates
 */
lib.device.TrustedAssetsManager.prototype.getTrustAnchorCertificates = function () {
    return this.trustAnchors;
};

/**
 * Sets the assigned endpoint ID and certificate as returned
 * by the activation procedure.
 * Upon a call to this method, a compliant implementation of the
 * <code>TrustedAssetsManager</code>
 * interface must ensure the persistence of the provided endpoint
 * credentials.
 * This method can only be called once; unless the <code>TrustedAssetsManager</code> has
 * been reset.
 * <p>
 * If the client is a pre-activated enterprise application, the endpoint ID
 * has already been provisioned and calling this method MUST fail with an
 * <code>IllegalStateException</code>.
 * </p>
 *
 * @param endpointId the assigned endpoint ID.
 * @param certificate the PEM-encoded certificate issued by the server or <code>null</code> if no certificate was provided
 *            by the server.
 * @returns {boolean} whether setting the endpoint credentials succeeded.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function setEndpointCredentials
 */
lib.device.TrustedAssetsManager.prototype.setEndpointCredentials = function (endpointId, certificate) {
    /*if (!endpointId) {
        lib.error('EndpointId cannot be null');
        return false;
    }
    if (this.endpointId) {
        lib.error('EndpointId already assigned');
        return false;
    }*/
    if (!this.privateKey) {
        lib.error('Private key not yet generated');
        return false;
    }
    if (endpointId) {
        this.endpointId = endpointId;
    } else {
        this.endpointId = '';
    }
    try {
        if (!certificate || certificate.length <= 0) {
            this.certificate = _generateSelfSignedCert(this.privateKey, this.publicKey, this.clientId);
        } else {
            this.certificate = forge.pki.certificateFromPem(certificate);
        }
    } catch (e) {
        lib.error('Error generating certificate: ' + e);
        return false;
    }
    try {
        if (this.unifiedTrustStore) {
            this.unifiedTrustStore.update(this);
        } else {
            this.store();
        }
    } catch (e) {
        lib.error('Error storing the trust assets: ' + e);
        return false;
    }
    return true;
};

/**
 * Retrieves the assigned endpoint ID.
 *
 * @return {?string} the assigned endpoint ID or <code>null</code> if any error occurs retrieving the
 * endpoint ID.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getEndpointId
 */
lib.device.TrustedAssetsManager.prototype.getEndpointId = function () {
    if (!this.endpointId) {
        throw new Error('EndpointId not assigned');
    }
    return this.endpointId;
};

/**
 * Retrieves the assigned endpoint certificate.
 *
 * @returns {?string} the PEM-encoded certificate or <code>null</code> if no certificate was assigned,
 * or if any error occurs retrieving the endpoint certificate.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getEndpointCertificate
 */
lib.device.TrustedAssetsManager.prototype.getEndpointCertificate = function () {
    var certificate = null;
    if (!this.certificate) {
        lib.error('Endpoint certificate not assigned');
        return null;
    }
    try {
        if (!_isSelfSigned(this.certificate)) {
            certificate = forge.pki.certificateToPem(this.certificate);
        }
    } catch (e) {
        lib.error('Unexpected error retrieving certificate encoding: ' + 2);
        return null;
    }
    //XXX ??? is it an array or a string
    return certificate;
};

/**
 * Generates the key pair to be used for assertion-based client
 * authentication with the IoT CS.
 *
 * @param {string} algorithm the key algorithm.
 * @param {number} keySize the key size.
 * @returns {boolean} whether the key pair generation succeeded.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function generateKeyPair
 */
lib.device.TrustedAssetsManager.prototype.generateKeyPair = function (algorithm, keySize) {
    if (!algorithm) {
        lib.error('Algorithm cannot be null');
        return false;
    }
    if (keySize <= 0) {
        lib.error('Key size cannot be negative or 0');
        return false;
    }
    if (this.privateKey) {
        lib.error('Key pair already generated');
        return false;
    }
    try {
        var keypair = forge.rsa.generateKeyPair({
            bits : keySize
            //, e: 0x10001
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    } catch (e) {
        lib.error('Could not generate key pair: ' + e);
        return false;
    }
    return true;
};

/**
 * Signs the provided data using the specified algorithm and the
 * private key. This method is only use for assertion-based client authentication
 * with the IoT CS.
 *
 * @param {Array|string} data - a byte string to sign.
 * @param {string} algorithm - the algorithm to use.
 * @returns {?Array} the signature bytes
 * or <code>null</code> if any error occurs retrieving the necessary key
 * material or performing the operation.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function signWithPrivateKey
 */
lib.device.TrustedAssetsManager.prototype.signWithPrivateKey = function (data, algorithm) {
    var signature = null;
    if (!algorithm) {
        lib.error('Algorithm cannot be null');
        return null;
    }
    if (!data) {
        lib.error('Data cannot be null');
        return null;
    }
    if (!this.privateKey) {
        lib.error('Private key not yet generated');
        return null;
    }
    try {
        var md = null;
        switch (algorithm) {
        case 'md5': {
            md = forge.md.md5.create();
            break;
        }
        case 'sha1': {
            md = forge.md.sha1.create();
            break;
        }
        case 'sha256': {
            md = forge.md.sha256.create();
            break;
        }
        case 'sha512': {
            md = forge.md.sha512.create();
            break;
        }
        case 'sha512/224': {
            md = forge.md.sha512.sha224.create();
            break;
        }
        case 'sha512/256': {
            md = forge.md.sha512.sha256.create();
            break;
        }
        }
        if (md) {
            md.update(data);
            signature = this.privateKey.sign(md);
        }
    } catch (e) {
        lib.error('Error signing with private key: ' + e);
        return null;
    }
    return signature;
};

/**
 * Signs the provided data using the specified algorithm and the shared
 * secret of the device indicated by the given hardware id.
 * Passing <code>null</code> for <code>hardwareId</code> is identical to passing
 * {@link #getClientId()}.
 *
 * @param {Array} data - the bytes to be signed.
 * @param {string} algorithm - the hash algorithm to use.
 * @param {?string} hardwareId - the hardware id of the device whose shared secret is to be used for signing.
 * @return {?Array} the signature bytes
 * or <code>null</code> if any error occurs retrieving the necessary key
 * material or performing the operation.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function signWithSharedSecret
 */
lib.device.TrustedAssetsManager.prototype.signWithSharedSecret = function (data, algorithm, hardwareId) {
    var digest = null;
    if (!algorithm) {
        lib.error('Algorithm cannot be null');
        return null;
    }
    if (!data) {
        lib.error('Data cannot be null');
        return null;
    }
    var secretKey;
    if (hardwareId === null || hardwareId == this.clientId) {
        secretKey = this.sharedSecret;
    } else {
        secretKey = this.connectedDevices[hardwareId];
    }

    if (secretKey === null || (typeof secretKey === "undefined")) {
        lib.log("Shared secret is not provisioned for " + (hardwareId ? hardwareId : this.clientId) + " device");
        return null;
    }
    try {
        var hmac = forge.hmac.create();
        hmac.start(algorithm, secretKey);
        hmac.update(data);
        digest = hmac.digest();
        // lib.log(digest.toHex());
    } catch (e) {
        lib.error('Error signing with shared secret: ' + e);
        return null;
    }
    return digest;
};

/**
 * Returns whether the client is activated. The client is deemed activated
 * if it has at least been assigned endpoint ID.
 *
 * @returns {boolean} whether the device is activated.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function isActivated
 */
lib.device.TrustedAssetsManager.prototype.isActivated = function () {
    return (this.endpointId && (this.endpointId !== null) && (this.endpointId !== '')) ? true : false;
};

/** 
 * Resets the trust material back to its provisioning state; in
 * particular, the key pair is erased.  The client will have to go, at least,through activation again;
 * depending on the provisioning policy in place, the client may have to go 
 * through registration again.
 * 
 * @return {boolean} whether the operation was successful.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function reset
 */
lib.device.TrustedAssetsManager.prototype.reset = function () {
    this.endpointId = null;
    this.privateKey = null;
    this.publicKey = null;
    this.certificate = null;
    try {
        if (this.unifiedTrustStore) {
            this.unifiedTrustStore.update(this);
        } else {
            this.store();
        }
    } catch (e) {
        lib.error('Error resetting the trust assets: ' + e);
        return false;
    }
    return true;
};

lib.device.TrustedAssetsManager.prototype.buildClientAssertion = function () {
    var id = (!this.isActivated() ? this.getClientId() : this.getEndpointId());
    var now = ((typeof this.serverDelay === 'undefined') ? Date.now() : (Date.now() + this.serverDelay));
    var exp = parseInt((now + 900000)/1000);
    var header = {
        typ: 'JWT',
        alg: (!this.isActivated() ? 'HS256' : 'RS256')
    };
    var claims = {
        iss: id,
        sub: id,
        aud: 'oracle/iot/oauth2/token',
        exp: exp
    };

    var inputToSign =
        $port.util.btoa(JSON.stringify(header))
        + '.'
        + $port.util.btoa(JSON.stringify(claims));

    var signed;

    try {
        if (!this.isActivated()) {
            var digest = this.signWithSharedSecret(inputToSign, "sha256", null);
            signed = forge.util.encode64(forge.util.hexToBytes(digest.toHex()));
        } else {
            var signatureBytes = this.signWithPrivateKey(inputToSign, "sha256");
            signed = forge.util.encode64(signatureBytes);
        }
    } catch (e) {
        var error = lib.createError('error on generating oauth signature', e);
        return null;
    }

    inputToSign = inputToSign + '.' + signed;
    inputToSign = inputToSign.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
    return inputToSign;
};

/**
 * Retrieves the IoT CS server scheme.
 *
 * @returns {?string} the IoT CS server scheme,
 * or <code>null</code> if any error occurs retrieving the server scheme.
 *
 * @memberof iotcs.device.TrustedAssetsManager.prototype
 * @function getServerScheme
 */
lib.device.TrustedAssetsManager.prototype.getServerScheme = function () {
    return this.serverScheme;
};

/**
 * Provisions the designated Trusted Assets Store with the provided provisioning assets.
 * The provided shared secret will be encrypted using the provided password.
 * 
 * @param {string} taStoreFile - the Trusted Assets Store file name.
 * @param {string} taStorePassword - the Trusted Assets Store password.
 * @param {string} serverScheme - the scheme used to communicate with the server. Possible values are http(s) or mqtt(s).
 * @param {string} serverHost - the IoT CS server host name.
 * @param {number} serverPort - the IoT CS server port.
 * @param {string} clientId - the ID of the client.
 * @param {string} sharedSecret - the client's shared secret.
 * @param {string} truststore - the truststore file containing PEM-encoded trust anchors certificates
 * to be used to validate the IoT CS server certificate chain.
 * @param {Object} connectedDevices - indirect connect devices.
 *
 * @memberof iotcs.device.TrustedAssetsManager
 * @function provision
 *
 */
lib.device.TrustedAssetsManager.provision = function (taStoreFile, taStorePassword, serverScheme, serverHost, serverPort, clientId, sharedSecret, truststore, connectedDevices) {
	if (!taStoreFile) {
		throw 'No TA Store file provided';
	}
	if (!taStorePassword) {
		throw 'No TA Store password provided';
	}
	var entries = {
		'clientId' : clientId,
		'serverHost' : serverHost,
		'serverPort' : serverPort,
        'serverScheme' : (serverScheme ? serverScheme : 'https'),
		'sharedSecret' : _encryptSharedSecret(sharedSecret, taStorePassword),
		'trustAnchors' : (truststore ? (Array.isArray(truststore) ? truststore : _loadTrustAnchors(truststore)) : []),
        'connectedDevices': (connectedDevices ? connectedDevices : {})
	};
	entries = _signTaStoreContent(entries, taStorePassword);
	var output = JSON.stringify(entries);
	$port.file.store(taStoreFile, output);
};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
function _isSelfSigned (certificate) {
    return certificate.isIssuer(certificate);
}

/** @ignore */
function _generateSelfSignedCert (privateKey, publicKey, clientId) {
    var cert = forge.pki.createCertificate();
    cert.publicKey = publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    var attrs = [{
        name: 'commonName',
        value: clientId
    }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(privateKey);
    return cert;
}

/** @ignore */
function _signTaStoreContent (taStoreEntries, password) {
    var data = '{' + taStoreEntries.clientId + '}'
    	+ '{' + taStoreEntries.serverHost + '}'
    	+ '{' + taStoreEntries.serverPort + '}'
        + '{' + taStoreEntries.serverScheme + '}'
    	+ '{' + taStoreEntries.sharedSecret + '}'
    	+ '{' + taStoreEntries.trustAnchors + '}'
    	+ '{' + (taStoreEntries.keyPair ? taStoreEntries.keyPair : null) + '}'
        + '{' + (taStoreEntries.connectedDevices ? taStoreEntries.connectedDevices : {}) + '}';
    var key = _pbkdf(password);
    var hmac = forge.hmac.create();
	hmac.start('sha256', key);
	hmac.update(data);
    return {
        clientId: taStoreEntries.clientId,
        serverHost: taStoreEntries.serverHost,
        serverPort: taStoreEntries.serverPort,
        serverScheme: taStoreEntries.serverScheme,
        sharedSecret: taStoreEntries.sharedSecret,
        trustAnchors: taStoreEntries.trustAnchors,
        keyPair: (taStoreEntries.keyPair ? taStoreEntries.keyPair : null),
        connectedDevices: (taStoreEntries.connectedDevices ? taStoreEntries.connectedDevices : {}),
        signature: hmac.digest().toHex()
    };
}

/** @ignore */
function _verifyTaStoreContent (taStoreEntries, password) {
    var data = '{' + taStoreEntries.clientId + '}'
	+ '{' + taStoreEntries.serverHost + '}'
	+ '{' + taStoreEntries.serverPort + '}'
    + (taStoreEntries.serverScheme ? ('{' + taStoreEntries.serverScheme + '}') : '')
	+ '{' + taStoreEntries.sharedSecret + '}'
	+ '{' + taStoreEntries.trustAnchors + '}'
	+ '{' + (taStoreEntries.keyPair ? taStoreEntries.keyPair : null) + '}'
    + (taStoreEntries.connectedDevices ? '{' + taStoreEntries.connectedDevices + '}' : '');
    var key = _pbkdf(password);
    var hmac = forge.hmac.create();
    hmac.start('sha256', key);
    hmac.update(data);
	return taStoreEntries.signature && hmac.digest().toHex() === taStoreEntries.signature;
}

/** @ignore */
//PBKDF2 (RFC 2898) 
function _pbkdf (password) {
	return forge.pkcs5.pbkdf2(password, '', 1000, 16);
}

/** @ignore */
function _encryptSharedSecret (sharedSecret, password) {
	var key = _pbkdf(password);
	var cipher = forge.cipher.createCipher('AES-CBC', key);
	cipher.start({iv: forge.util.createBuffer(16).fillWithByte(0, 16)});
	cipher.update(forge.util.createBuffer(sharedSecret, 'utf8'));
	cipher.finish();
	return cipher.output.toHex();
}

/** @ignore */
function _decryptSharedSecret (encryptedSharedSecret, password) {
	var key = _pbkdf(password);
	var cipher = forge.cipher.createDecipher('AES-CBC', key);
	cipher.start({iv: forge.util.createBuffer(16).fillWithByte(0, 16)});
	cipher.update(forge.util.createBuffer(forge.util.hexToBytes(encryptedSharedSecret), 'binary'));
	cipher.finish();
	return cipher.output.toString();
}

/** @ignore */
function _loadTrustAnchors (truststore) {
	return $port.file.load(truststore)
		.split(/\-{5}(?:B|E)(?:[A-Z]*) CERTIFICATE\-{5}/)
		.filter(function(elem) { return ((elem.length > 1) && (elem.indexOf('M') > -1)); })
		//.filter(elem => elem.length > 0)
		.map(function(elem) { return '-----BEGIN CERTIFICATE-----' + elem.replace(new RegExp('\r\n', 'g'),'\n') + '-----END CERTIFICATE-----'; });
	    //.map(elem => elem = '-----BEGIN CERTIFICATE-----' + elem + '-----END CERTIFICATE-----');
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/Message.js

/**
 * Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * @namespace
 * @alias iotcs.message
 * @memberOf iotcs
 */
lib.message = {};

/**
 * This object helps in the construction of a general type
 * message to be sent to the server. This object and
 * it's components are used as utilities by the
 * Messaging API clients, like the DirectlyConnectedDevice
 * or GatewayDevice or indirectly by the MessageDispatcher.
 *
 * @memberOf iotcs.message
 * @alias Message
 * @class
 */
lib.message.Message = function () {
    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this._, 'internalObject',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {
            clientId: $port.util.uuidv4(),
            source: null,
            destination: '',
            sender: '',
            priority: 'MEDIUM',
            reliability: 'BEST_EFFORT',
            eventTime: new Date().getTime(),
            type: null,
            properties: {},
            payload: {},
            remainingRetries: 3
        }
    });

    /**
     * Constant which defines the number of times sending of a message should be retried.  The
     * minimum is 3.
     *
     * @constant BASIC_NUMBER_OF_RETRIES
     * @memberOf iotcs.message.Message
     * @type {number}
     * @default 3
     */
    Object.defineProperty(this._.internalObject, 'BASIC_NUMBER_OF_RETRIES', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: 3
    });

    // TODO: Set the value of BASIC_NUMBER_OF_RETRIES after getting the environment variable
    // setting and then prevent the value from being changed.
    // Set the values of BASIC_NUMBER_OF_RETRIES and remainingRetries from environment variable.
    let maxRetries =
        (process.env['oracle.iot.client.device.dispatcher_basic_number_of_retries'] || 3);

    this._.internalObject.BASIC_NUMBER_OF_RETRIES = maxRetries > 3 ? maxRetries : 3;
    this._.internalObject.remainingRetries = this._.internalObject.BASIC_NUMBER_OF_RETRIES;
};

/**
 * Sets the payload of the message as object.
 *
 * @param {Object} payload - the payload to set.
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function payload
 */
lib.message.Message.prototype.payload = function (payload) {
    _mandatoryArg(payload, 'object');

    this._.internalObject.payload = payload;
    return this;
};

/**
 * Gets the number of remaining retries for this message.
 * Not intended for general use.
 * Used internally by the message dispatcher implementation.
 *
 * @returns {integer} remainingRetries the new number of remaining retries.
 *
 * @memberOf iotcs.message.Message.prototype
 * @function getRemainingRetries
 */
lib.message.Message.prototype.getRemainingRetries = function () {
    return this._.internalObject.remainingRetries;
}

/**
 * Sets the number of remaining retries for this message.
 * Not intended for general use.
 * Used internally by the message dispatcher implementation.
 *
 * @param {integer} remainingRetries the new number of remaining retries.
 * @returns {iotcs.message.Message} This object.
 *
 * @memberOf iotcs.message.Message.prototype
 * @function setRemainingRetries
 */
lib.message.Message.prototype.setRemainingRetries = function (remainingRetries) {
    _mandatoryArg(remainingRetries, 'integer');
    this._.internalObject.remainingRetries = remainingRetries;
    return this;
}

/**
 * Sets the source of the message.
 *
 * @param {string} source - the source to set
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function source
 */
lib.message.Message.prototype.source = function (source) {
    _mandatoryArg(source, 'string');

    if(this._.internalObject.source === null) {
        this._.internalObject.source = source;
    }
    return this;
};

/**
 * Sets the destination of the message.
 *
 * @param {string} destination - the destination
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function destination
 */
lib.message.Message.prototype.destination = function (destination) {
    _mandatoryArg(destination, 'string');

    this._.internalObject.destination = destination;
    return this;
};

/**
 * This returns the built message as JSON to be sent
 * to the server as it is.
 *
 * @returns {Object} JSON representation of the message to be sent
 *
 * @memberOf iotcs.message.Message.prototype
 * @function payload
 */
lib.message.Message.prototype.getJSONObject = function () {
    return this._.internalObject;
};

/**
 * This sets the type of the message. Types are defined in the
 * Message.Type enumeration. If an invalid type is given an
 * exception is thrown.
 *
 * @param {string} type - the type to set
 * @returns {iotcs.message.Message} This object
 *
 * @see {@link iotcs.message.Message.Type}
 * @memberOf iotcs.message.Message.prototype
 * @function type
 */
lib.message.Message.prototype.type = function (type) {
    _mandatoryArg(type, 'string');
    if (Object.keys(lib.message.Message.Type).indexOf(type) < 0) {
        lib.error('invalid message type given');
        return;
    }

    if(type === lib.message.Message.Type.RESOURCES_REPORT) {
        this._.internalObject.id = $port.util.uuidv4();
    }
    this._.internalObject.type = type;
    return this;
};

/**
 * This sets the format URN in the payload of the message.
 * This is mostly specific for the DATA or ALERT type
 * of messages.
 *
 * @param {string} format - the format to set
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function format
 */
lib.message.Message.prototype.format = function (format) {
    _mandatoryArg(format, 'string');
    this._.internalObject.payload.format = format;
    return this;
};

/**
 * This sets a key/value pair in the data property of the payload
 * of the message. This is specific to DATA or ALERT type messages.
 *
 * @param {string} dataKey - the key
 * @param {Object} [dataValue] - the value associated with the key
 * @returns {iotcs.message.Message} This object
 *
 * @memberOf iotcs.message.Message.prototype
 * @function dataItem
 */
lib.message.Message.prototype.dataItem = function (dataKey, dataValue) {
    _mandatoryArg(dataKey, 'string');

    if (!('data' in this._.internalObject.payload)) {
        this._.internalObject.payload.data = {};
    }
    this._.internalObject.payload.data[dataKey] = dataValue;
    return this;
};

/**
 * This sets the priority of the message. Priorities are defined in the
 * Message.Priority enumeration. If an invalid type is given an
 * exception is thrown. The MessageDispatcher implements a
 * priority queue and it will use this parameter.
 *
 * @param {string} priority - the priority to set
 * @returns {iotcs.message.Message} This object
 *
 * @see {@link iotcs.device.util.MessageDispatcher}
 * @see {@link iotcs.message.Message.Priority}
 * @memberOf iotcs.message.Message.prototype
 * @function priority
 */
lib.message.Message.prototype.priority = function (priority) {
    _mandatoryArg(priority, 'string');
    if (Object.keys(lib.message.Message.Priority).indexOf(priority) < 0) {
        lib.error('invalid priority given');
        return;
    }

    this._.internalObject.priority = priority;
    return this;
};

/**
 * This sets the reliability of the message. Reliabilities are defined in the
 * Message.Reliability enumeration. If an invalid type is given, an
 * exception is thrown.
 *
 * @param {string} priority - the reliability to set.
 * @returns {iotcs.message.Message} this object.
 *
 * @see {@link iotcs.device.util.MessageDispatcher}
 * @see {@link iotcs.message.Message.Reliability}
 * @memberOf iotcs.message.Message.prototype
 * @function reliability
 */
lib.message.Message.prototype.reliability = function (reliability) {
    _mandatoryArg(reliability, 'string');
    if (Object.keys(lib.message.Message.Reliability).indexOf(reliability) < 0) {
        lib.error('Invalid reliability given.');
        return;
    }

    this._.internalObject.reliability = reliability;
    return this;
};


/**
 * @constant MAX_KEY_LENGTH
 * @memberOf iotcs.message.Message
 * @type {number}
 * @default 2048
 */
Object.defineProperty(lib.message.Message, 'MAX_KEY_LENGTH',{
    enumerable: false,
    configurable: false,
    writable: false,
    value: 2048
});

/**
 * @constant MAX_STRING_VALUE_LENGTH
 * @memberOf iotcs.message.Message
 * @type {number}
 * @default 65536
 */
Object.defineProperty(lib.message.Message, 'MAX_STRING_VALUE_LENGTH',{
    enumerable: false,
    configurable: false,
    writable: false,
    value: 64 * 1024
});

/**
 * Returns the number of remaining send retries available for this message.
 *
 * @memberOf iotcs.message.Message
 * @type {number}
 * @default BASIC_NUMBER_OF_RETRIES
 */
Object.defineProperty(lib.message.Message, 'remainingRetries',{
    enumerable: false,
    configurable: false,
    writable: false,
    value: 3
});

/** @ignore */
function _recursiveSearchInMessageObject(obj, callback){
    var arrKeys = Object.keys(obj);
    for (var i = 0; i < arrKeys.length; i++) {
        callback(arrKeys[i], obj[arrKeys[i]]);
        if (typeof obj[arrKeys[i]] === 'object') {
            _recursiveSearchInMessageObject(obj[arrKeys[i]], callback);
        }
    }
}

/**
 * This is a helper method for checking if an array of
 * created messages pass the boundaries on key/value length
 * test. If the test does not pass an error is thrown.
 *
 * @param {iotcs.message.Message[]} messages - the array of
 * messages that need to be tested
 *
 * @see {@link iotcs.message.Message.MAX_KEY_LENGTH}
 * @see {@link iotcs.message.Message.MAX_STRING_VALUE_LENGTH}
 * @memberOf iotcs.message.Message
 * @function checkMessagesBoundaries
 */
lib.message.Message.checkMessagesBoundaries = function (messages) {
    _mandatoryArg(messages, 'array');
    messages.forEach(function (message) {
        _mandatoryArg(message, lib.message.Message);
        _recursiveSearchInMessageObject(message.getJSONObject(), function (key, value) {
            if (_getUtf8BytesLength(key) > lib.message.Message.MAX_KEY_LENGTH) {
                lib.error('Max length for key in message item exceeded');
            }
            if ((typeof value === 'string') && (_getUtf8BytesLength(value) > lib.message.Message.MAX_STRING_VALUE_LENGTH)) {
                lib.error('Max length for value in message item exceeded');
            }
        });
    });
};

/**
 * Enumeration of message types
 *
 * @memberOf iotcs.message.Message
 * @alias Type
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.Type = {
    DATA: 'DATA',
    ALERT: 'ALERT',
    REQUEST: 'REQUEST',
    RESPONSE: 'RESPONSE',
    RESOURCES_REPORT: 'RESOURCES_REPORT'
};

/**
 * Enumeration of message priorities
 *
 * @memberOf iotcs.message.Message
 * @alias Priority
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.Priority = {
    LOWEST: 'LOWEST',
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    HIGHEST: 'HIGHEST'
};

/**
 * Enumeration of message reliability options.
 *
 * @memberOf iotcs.message.Message
 * @alias Reliability
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.Reliability = {
    BEST_EFFORT: 'BEST_EFFORT',
    GUARANTEED_DELIVERY: 'GUARANTEED_DELIVERY',
    NO_GUARANTEE: 'NO_GUARANTEE'
};

/**
 * This is a helper method for building a response
 * message to be sent to the server as response
 * to a request message sent from the server.
 * This is mostly used by handlers registered
 * with the RequestDispatcher. If no requestMessage
 * is given the id for the response message will be
 * a random UUID.
 *
 * @param {Object} [requestMessage] - the message received
 * from the server as JSON
 * @param {number} statusCode - the status code to be
 * added in the payload of the response message
 * @param {Object} [headers] - the headers to be added in
 * the payload of the response message
 * @param {string} [body] - the body to be added in the
 * payload of the response message
 * @param {string} [url] - the url to be added in the payload
 * of the response message
 *
 * @returns {iotcs.message.Message} The response message
 * instance built on the given parameters
 *
 * @see {@link iotcs.device.util.RequestDispatcher}
 * @memberOf iotcs.message.Message
 * @function buildResponseMessage
 */
lib.message.Message.buildResponseMessage = function (requestMessage, statusCode, headers, body, url) {
    _optionalArg(requestMessage, 'object');
    _mandatoryArg(statusCode, 'number');
    _optionalArg(headers, 'object');
    _optionalArg(body, 'string');
    _optionalArg(url, 'string');

    var payload = {
        statusCode: statusCode,
        url: (url ? url : ''),
        requestId: ((requestMessage && requestMessage.id) ? requestMessage.id : $port.util.uuidv4()),
        headers: (headers ? headers : {}),
        body: (body ? $port.util.btoa(body) : '')
    };
    var message = new lib.message.Message();
    message.type(lib.message.Message.Type.RESPONSE)
        .source((requestMessage && requestMessage.destination) ? requestMessage.destination : '')
        .destination((requestMessage && requestMessage.source) ? requestMessage.source : '')
        .payload(payload);
    return message;
};

/**
 * This is a helper method for building a response wait
 * message to notify RequestDispatcher that response for server
 * will be sent to the server later. RequestDispatcher doesn't
 * send these kind of messages to the server.
 * This is mostly used by handlers registered
 * with the RequestDispatcher in asynchronous cases, for example,
 * when device creates storage object by URI.
 *
 * @returns {iotcs.message.Message} The response message
 * that notified about waiting final response.
 *
 * @see {@link iotcs.device.util.RequestDispatcher}
 * @see {@link iotcs.device.util.DirectlyConnectedDevice#createStorageObject}
 * @memberOf iotcs.message.Message
 * @function buildResponseWaitMessage
 */
lib.message.Message.buildResponseWaitMessage = function() {
    var message = new lib.message.Message();
    message._.internalObject.type = "RESPONSE_WAIT";
    return message;
};

/**
 * Helpers for building alert messages.
 *
 * @memberOf iotcs.message.Message
 * @alias AlertMessage
 * @class
 */
lib.message.Message.AlertMessage = {};

/**
 * Enumeration of severities for alert messages
 *
 * @memberOf iotcs.message.Message.AlertMessage
 * @alias Severity
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.AlertMessage.Severity = {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    SIGNIFICANT: 'SIGNIFICANT',
    CRITICAL: 'CRITICAL'
};

/**
 * Helper method used for building alert messages
 * to be sent to the server. The severity is defined
 * in the AlertMessage.Severity enumeration. If an invalid
 * value is given an exception is thrown.
 *
 * @param {string} format - the format added in the
 * payload of the generated message
 * @param {string} description - the description added
 * in the payload of the generated message
 * @param {string} severity - the severity added in the
 * payload of the generated message
 *
 * @returns {iotcs.message.Message} The instance of
 * the alert message built based on the given
 * parameters.
 *
 * @see {@link iotcs.message.Message.AlertMessage.Severity}
 * @memberOf iotcs.message.Message.AlertMessage
 * @function buildAlertMessage
 */
lib.message.Message.AlertMessage.buildAlertMessage = function (format, description, severity) {
    _mandatoryArg(format, 'string');
    _mandatoryArg(description, 'string');
    _mandatoryArg(severity, 'string');
    if (Object.keys(lib.message.Message.AlertMessage.Severity).indexOf(severity) < 0) {
        lib.error('invalid severity given');
        return;
    }

    var payload = {
        format: format,
        reliability: 'BEST_EFFORT',
        severity: severity,
        description: description,
        data: {}
    };
    var message = new lib.message.Message();
    message.type(lib.message.Message.Type.ALERT)
        .priority(lib.message.Message.Priority.HIGHEST)
        .payload(payload);
    return message;
};

/**
 * Helpers for building resource report messages
 *
 * @memberOf iotcs.message.Message
 * @alias ResourceMessage
 * @class
 */
lib.message.Message.ResourceMessage = {};

/**
 * Enumeration of the type of resource report messages
 *
 * @memberOf iotcs.message.Message.ResourceMessage
 * @alias Type
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.ResourceMessage.Type = {
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    RECONCILIATION: 'RECONCILIATION'
};

/**
 * This generates an MD5 hash of an array of
 * strings. Thi has to be used to generate
 * the reconciliationMark of the resource
 * report message.
 *
 * @param {string[]} stringArray - the array of string
 * for which to generate the hash
 *
 * @returns {string} The MD5 hash
 *
 * @memberOf iotcs.message.Message.ResourceMessage
 * @function getMD5ofList
 */
lib.message.Message.ResourceMessage.getMD5ofList = function (stringArray) {
    _mandatoryArg(stringArray, 'array');
    stringArray.forEach( function (str) {
        _mandatoryArg(str, 'string');
    });

    var hash = forge.md.md5.create();
    var i;
    for (i = 0; i < stringArray.length; i++) {
        hash.update(stringArray[i]);
    }
    return hash.digest().toHex();
};

/**
 * Helper method used for building a resource report
 * message to be sent to the server. Th resources
 * objects can be generated by using the
 * ResourceMessage.Resource.buildResource method.
 * The reportType must be taken from the
 * ResourceMessage.Type enumeration. If an invalid
 * value is given an exception is thrown.
 * The rM parameter is the reconciliationMark that can
 * be calculated by using the ResourceMessage.getMD5ofList
 * over the array of paths of the resources given as objects.
 * A resource is an object that must have at least 2
 * properties as strings: path and methods. Also methods
 * must be string that represents a concatenation of
 * valid HTTP methods comma separated.
 *
 * @param {Object[]} resources - the array of resources that are
 * included in the report message
 * resource report message
 * @param {string} endpointName - the endpoint that is giving the
 * resource report
 * @param {string} reportType - the type of the report
 * @param {string} [rM] - the reconciliationMark used by teh server
 * to validate the report
 *
 * @returns {iotcs.message.Message} The isntance of the resource
 * report message to be sent to the server.
 *
 * @see {@link iotcs.message.Message.ResourceMessage.Resource.buildResource}
 * @see {@link iotcs.message.Message.ResourceMessage.Type}
 * @memberOf iotcs.message.Message.ResourceMessage
 * @function buildResourceMessage
 */
lib.message.Message.ResourceMessage.buildResourceMessage = function (resources, endpointName, reportType, rM) {
    _mandatoryArg(resources, 'array');
    resources.forEach( function(resource) {
        _mandatoryArg(resource, 'object');
        _mandatoryArg(resource.path, 'string');
        _mandatoryArg(resource.methods, 'string');
        resource.methods.split(',').forEach( function (method) {
            if (['GET', 'PUT', 'POST', 'HEAD', 'OPTIONS', 'CONNECT', 'DELETE', 'TRACE'].indexOf(method) < 0) {
                lib.error('invalid method in resource message');
                return;
            }
        });
    });
    _mandatoryArg(endpointName, 'string');
    _mandatoryArg(reportType, 'string');
    if (Object.keys(lib.message.Message.ResourceMessage.Type).indexOf(reportType) < 0) {
        lib.error('invalid report type given');
        return;
    }
    _optionalArg(rM, 'string');

    var payload = {
        type: 'JSON',
        value: {}
    };
    payload.value.reportType = reportType;
    payload.value.endpointName = endpointName;
    payload.value.resources = resources;
    if (rM) {
        payload.value.reconciliationMark = rM;
    }
    var message = new lib.message.Message();
    message.type(lib.message.Message.Type.RESOURCES_REPORT)
        .payload(payload);
    return message;
};

/**
 * Helpers used to build resource objects, used by the
 * resource report messages.
 *
 * @memberOf iotcs.message.Message.ResourceMessage
 * @alias Resource
 * @class
 */
lib.message.Message.ResourceMessage.Resource = {};

/**
 * Enumeration of possible statuses of the resources
 *
 * @memberOf iotcs.message.Message.ResourceMessage.Resource
 * @alias Status
 * @class
 * @readonly
 * @enum {string}
 */
lib.message.Message.ResourceMessage.Resource.Status = {
    ADDED: 'ADDED',
    REMOVED: 'REMOVED'
};

/**
 * Helper method used to build a resource object. The status parameter must be given from the
 * Resource.Status enumeration. If an invalid value is given the method will throw an exception.
 * Also the methods array must be an array of valid HTTP methods, otherwise an exception will be
 * thrown.
 *
 * @param {string} name - the name of the resource.
 * @param {string} path - the path of the resource.
 * @param {string} methods - a comma-separated string of the methods that the resource implements.
 * @param {string} status - the status of the resource.  Must be one of
 *        lib.message.Message.ResourceMessage.Resource.Status.
 * @param {string} [endpointName] - the endpoint associated with the resource.
 *
 * @returns {Object} The instance of the object representing a resource.
 *
 * @see {@link iotcs.message.Message.ResourceMessage.Resource.Status}
 * @memberOf iotcs.message.Message.ResourceMessage.Resource
 * @function buildResource
 */
lib.message.Message.ResourceMessage.Resource.buildResource = function (name, path, methods, status,
                                                                       endpointName)
{
    _mandatoryArg(name, 'string');
    _mandatoryArg(path, 'string');
    _mandatoryArg(methods, 'string');
    methods.split(',').forEach( function (method) {
        if (['GET', 'PUT', 'POST', 'HEAD', 'OPTIONS', 'CONNECT', 'DELETE', 'TRACE'].indexOf(method) < 0) {
            lib.error('invalid method in resource message');
            return;
        }
    });
    _mandatoryArg(status, 'string');
    _optionalArg(endpointName, 'string');
    if (Object.keys(lib.message.Message.ResourceMessage.Resource.Status).indexOf(status) < 0) {
        lib.error('invalid status given');
        return;
    }

    var obj = {};
    obj.name = name;
    obj.path = path;
    obj.status = status;
    obj.methods = methods.toString();

    if (endpointName) {
        obj.endpointName = endpointName;
    }

    return obj;
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DataItem.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

class DataItem {
    /**
     * Constructor that takes a string key and value.
     *
     * @param {string} key data item key.
     * @param {object} value data item value.
     *
     * TODO: Handle these two situations (below).
     * @throws IllegalArgumentException when value is {@link Double#NEGATIVE_INFINITY}, {@link Double#POSITIVE_INFINITY}
     *                                  or {@link Double#NaN} or the key is empty or long string. Maximum length for key
     *                                  is {@link Message.Utils#MAX_KEY_LENGTH} bytes. The length is measured after
     *                                  the key is encoded using UTF-8 encoding.
     * @throws NullPointerException when the key is {@code null}.
     */
    constructor(key, value) {
        // Note: We need to use 'typeof undefined' for value as a !value check is true when value is
        // 0, which is an OK value.
        if (!key || (typeof value === 'undefined')) {
            throw new Error('Key and value must be defined.');
        }

        // Instance "variables"/properties.
        /**
         * Data item key
         * @type {string}
         */
        this.key = key;
        /**
         * Data item value.
         * @type {object}
         */
        this.value = value;
        /**
         * Type of the value.
         * @type {object} (Type)
         */
        this.type = '';
        // Instance "variables"/properties.
    }

    getKey() {
        return this.key;
    }

    getType() {
        return this.type;
    }

    getValue() {
        return this.value;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/PersistenceMetaData.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * Meta-data related to persistence.
 */
class PersistenceMetaData {
    static isPersistenceEnabled() {
        return false;
    }
}

//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceFunction.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * DeviceFunction is an abstraction of a policy device function.
 */
class DeviceFunction {
    // Instance "variables"/properties...see constructor.

    /**
     * @param {lib.message.Message} alertMessage
     * @param {DeviceModelFormatField} field
     * @param {object} value
     */
    static addDataItem(alertMessage, field, value) {
        switch (field.getType()) {
            case 'integer':
            case 'number':
                if (value instanceof Number) {
                    if (field.getType() === DeviceModelAttribute.Type.INTEGER) {
                        alertMessage.dataItem(field.getName(), value);
                    } else {
                        alertMessage.dataItem(field.getName(), Number(value));
                    }
                } else {
                    throw new Error("value of attribute '" + field.getName() + "' is not a " +
                        field.getType());
                }

                break;
            case 'string':
            case 'uri':
            default:
                alertMessage.dataItem(field.getName(), String(value));
                break;
            case 'boolean':
                if (value instanceof Boolean) {
                    alertMessage.dataItem(field.getName(), value);
                } else {
                    throw new Error("Value of attribute '" + field.getName() + "' is not a " +
                        field.getType());
                }

                break;
            case 'datetime':
                if (value instanceof Number) {
                    alertMessage.dataItem(field.getName(), value);
                } else if (value instanceof Date) {
                    alertMessage.dataItem(field.getName(), new Date(value).getTime());
                } else {
                    throw new Error("value of attribute '" + field.getName() + "' is not a " +
                        field.getType());
                }

                break;
        }
    }

    /**
     *
     * @param {FormulaParserNode} node
     * @param {DeviceAnalog} deviceAnalog
     * @return {number}
     */
    static compute(node, deviceAnalog) {
        if (!node) {
            return NaN;
        }

        if (node instanceof FormulaParserTerminal) {
            const attr = node.getValue();

            switch (node.type) {
                case FormulaParserTerminal.Type.CURRENT_ATTRIBUTE: {
                    // {number}
                    const value = deviceAnalog.getAttributeValue(attr);

                    if (typeof value === 'number') {
                        return value;
                    } else if (typeof value === 'boolean') {
                        return value ? 1 : 0;
                    }

                    break;
                }
                case FormulaParserTerminal.Type.IN_PROCESS_ATTRIBUTE:
                    // @type {number}
                    let value = DeviceFunction.getInProcessValue(deviceAnalog.getEndpointId(),
                        deviceAnalog.getDeviceModel().getUrn(), attr);

                    if (value || deviceAnalog.getAttributeValue(attr)) {
                        if (typeof value === 'number') {
                            return value;
                        } else if (typeof value === 'boolean') {
                            return value ? 1 : 0;
                        }
                    }

                    break;
                case FormulaParserTerminal.Type.NUMBER:
                    return parseFloat(attr);
            }

            return NaN;
        }

        if (node.getOperation() === FormulaParserOperation.Op.TERNARY) {
            // @type {number}
            let cond = DeviceFunction.compute(node.getLeftHandSide(), deviceAnalog);

            if (cond === 1.0) {
                return DeviceFunction.compute(node.getRightHandSide().getLeftHandSide(),
                    deviceAnalog);
            } else {
                return DeviceFunction.compute(node.getRightHandSide().getRightHandSide(),
                    deviceAnalog);
            }
        } else if (node.getOperation() === FormulaParserOperation.Op.GROUP) {
            return DeviceFunction.compute(node.getLeftHandSide(), deviceAnalog);
        }

        // @type {number}
        let lhs = DeviceFunction.compute(node.getLeftHandSide(), deviceAnalog);
        // @type {number}
        let rhs = DeviceFunction.compute(node.getRightHandSide(), deviceAnalog);
        // @type {Operation}
        const operation = node.getOperation();

        switch (operation) {
            case FormulaParserOperation.Op.UNARY_MINUS:
                return -lhs;
            case FormulaParserOperation.Op.UNARY_PLUS:
                return +lhs;
            case FormulaParserOperation.Op.DIV:
                return lhs / rhs;
            case FormulaParserOperation.Op.MUL:
                return lhs * rhs;
            case FormulaParserOperation.Op.PLUS:
                return lhs + rhs;
            case FormulaParserOperation.Op.MINUS:
                return lhs - rhs;
            case FormulaParserOperation.Op.MOD:
                return lhs % rhs;
            case FormulaParserOperation.Op.OR:
                // Let NaN or NaN be false.
                if (isNaN(lhs)) {
                    return isNaN(rhs) ? 0.0 : 1.0;
                } else {
                    return lhs !== 0.0 || rhs!== 0.0 ? 1.0 : 0.0;
                }
            case FormulaParserOperation.Op.AND:
                // If lhs or rhs is NaN, return false
                if (isNaN(lhs) || isNaN(rhs)) {
                    return 0.0;
                } else {
                    return lhs !== 0.0 && rhs !== 0.0 ? 1.0 : 0.0;
                }
            case FormulaParserOperation.Op.EQ:
                // NaN.compareTo(42) == 1, 42.compareTo(NaN) == -1
                return lhs === rhs ? 1.0 : 0.0;
            case FormulaParserOperation.Op.NEQ:
                return lhs === rhs ? 0.0 : 1.0;
            case FormulaParserOperation.Op.GT:
                // NaN.compareTo(42) == 1, 42.compareTo(NaN) == -1
                // Let NaN > 42 return false, and 42 > NaN return true
                if (isNaN(lhs)) {return 0.0;}
                if (isNaN(rhs)) {return 1.0;}
                return lhs > rhs ? 1.0 : 0.0;
            case FormulaParserOperation.Op.GTE:
                // NaN.compareTo(42) == 1, 42.compareTo(NaN) == -1
                // Let NaN >= 42 return false, and 42 >= NaN return true
                if (isNaN(lhs)) {return isNaN(rhs) ? 1.0 : 0.0;}
                if (isNaN(rhs)) {return 1.0;}
                return lhs >= rhs ? 1.0 : 0.0;
            case FormulaParserOperation.Op.LT:
                // NaN.compareTo(42) == 1, 42.compareTo(NaN) == -1
                // Let NaN < 42 return false, and 42 < NaN return true
                if (isNaN(lhs)) {return 0.0;}
                if (isNaN(rhs)) {return 1.0;}
                return lhs < rhs ? 1.0 : 0.0;
            case FormulaParserOperation.Op.LTE:
                // NaN.compareTo(42) == 1, 42.compareTo(NaN) == -1
                // Let NaN <= 42 return false, and 42 <= NaN return true
                if (isNaN(lhs)) {return isNaN(rhs) ? 1.0 : 0.0;}
                if (isNaN(rhs)) {return 1.0;}
                return lhs <= rhs ? 1.0 : 0.0;
            case FormulaParserOperation.Op.TERNARY:
                break;
            case FormulaParserOperation.Op.ALTERNATIVE:
                break;
            case FormulaParserOperation.Op.NOT:
                return lhs === 1.0 ? 0.0 : 1.0;
            case FormulaParserOperation.Op.FUNCTION:
                break;
            case FormulaParserOperation.Op.GROUP:
                break;
            case FormulaParserOperation.Op.TERMINAL:
                break;
        }

        return NaN;
    }

    /**
     * @param {DeviceAnalog} deviceAnalog
     * @param {Map<String, object>} configuration
     * @return {Message} - alert message.
     */
    static createAlert(deviceAnalog, configuration) {
        // @type {DeviceModel}
        const deviceModel = deviceAnalog.getDeviceModel();

        // @type {Map<String, DeviceModelFormat>}
        const deviceModelFormatMap = deviceModel.getDeviceModelFormats();

        if (!deviceModelFormatMap) {
            throw new Error(deviceModel.getUrn() + " does not contain alert formats.");
        }

        // @type {string}
        const format = configuration.get("urn");
        // @type {DeviceModelFormat}
        const deviceModelFormat = deviceModelFormatMap.get(format);

        if (!deviceModelFormat) {
            throw new Error(deviceModel.getUrn() + " does not contain alert format '" + format +
                "'");
        }

        // @type {List<DeviceModelFormatField>}
        const fields = deviceModelFormat.getFields();

        // @type {AlertMessage.Severity}
        let alertSeverity;

        try {
            // @type {string}
            const severityConfig = configuration.get("severity");

            alertSeverity = severityConfig ?
                severityConfig : lib.message.Message.AlertMessage.Severity.NORMAL;
        } catch (error) {
            alertSeverity = lib.message.Message.AlertMessage.Severity.NORMAL;
        }

        // @type {AlertMessage}
        let alertMessage = lib.message.Message.AlertMessage.buildAlertMessage(format,
            deviceModelFormat.getName(), alertSeverity);

        alertMessage
            .format(format)
            .source(deviceAnalog.getEndpointId());

        // @type {Map<String,Object>}
        const fieldsFromPolicy = configuration.get("fields");

        fields.forEach (field => {
            // @type {object}
            const policyValue = fieldsFromPolicy.get(field.getName());

            if (!policyValue) {
                return;  //continue
            }

            try {
                // @type {object}
                let value = DeviceFunction.convertArg(deviceAnalog, field.getType(), policyValue);
                DeviceFunction.addDataItem(alertMessage, field, value);
            } catch (error) {
                console.log("Bad value for '" + field.getName() + "' in '" + deviceModel.getUrn() +
                    "' :" + error);
            }
        });

        return alertMessage;
    }

    /**
     * @param {string} endpointId
     * @param {string} deviceModelUrn
     * @param {string} attribute
     * @return {string}
     */
    static createInProcessMapKey(endpointId, deviceModelUrn, attribute) {
        return endpointId + '/deviceModels/' + deviceModelUrn + ':attributes/' + attribute;
    }

    /**
     * @param {DeviceAnalog} deviceAnalog
     * @param {string} type ({DeviceModelAttribute.Type})
     * @param {object} arg
     * @return {object} {@code null} if arg is undefined.
     */
    static convertArg(deviceAnalog, type, arg) {
        if (!arg) {
            return null;
        }

        switch (type) {
            case 'string':
                return DeviceFunction.convertFormulaToString(deviceAnalog, String(arg));
            case 'uri':
            case 'boolean':
            case 'datetime':
            default:
                // No conversion
                return arg;
            case 'number':
                // Treat as formula.
                // @type {number}
                let num;

                if (typeof arg === 'string') {
                    num = DeviceFunction.convertFormula(deviceAnalog, arg);
                } else if (typeof arg === 'number') {
                    num =  arg;
                } else {
                    throw new Error("Expected NUMBER or STRING, found '" + typeof arg + "'");
                }

                if (type === DeviceModelAttribute.Type.INTEGER) {
                    return num;
                }

                return num;
        }
    }

    /**
     * @param {DeviceAnalog} deviceAnalog
     * @param {string} formula
     * @return {number}
     */
    static convertFormula(deviceAnalog, formula) {
        try {
            // If arg is a string, it should be a FORMULA.
            // @type {Set<FormulaParser.token>}
            const tokens = FormulaParser.tokenize(formula);
            // @type {FormulaParserNode}
            const node = FormulaParser.parseFormula(tokens, formula);
            return DeviceFunction.compute(node, deviceAnalog);
        } catch (error) {
            console.log('Field in formula not in device model: ' + formula);
        }

        return NaN;
    }

    /**
     * @param {DeviceAnalog} deviceAnalog
     * @param {string} formula
     * @return {object}
     */
    static convertFormulaToString(deviceAnalog, formula) {
        // If arg is a string, it should be a FORMULA.
        try {
            // @type {Set<FormulaParserToken}
            const tokens = FormulaParser.tokenize(formula);
            // @type {Set<FormulaParserNode}
            const node = FormulaParser.parseFormula(tokens, formula);

            if (node instanceof FormulaParserTerminal) {
                // @type {FormulaParserTerminal }
                let terminal = node;
                // @type {string}
                const nodeValue = node.getValue();

                switch (terminal.type) {
                    case FormulaParserTerminal.Type.CURRENT_ATTRIBUTE: {
                        // @type {object}
                        const value = deviceAnalog.getAttributeValue(nodeValue);

                        if (typeof value === 'string') {
                            return value;
                        }

                        break;
                    }
                    case FormulaParserTerminal.Type.IN_PROCESS_ATTRIBUTE:
                        // @type {object}
                        let value = DeviceFunction.getInProcessValue(deviceAnalog.getEndpointId(),
                        deviceAnalog.getDeviceModel().getUrn(), nodeValue);

                        if (value != null ||
                            (value = deviceAnalog.getAttributeValue(nodeValue)) != null)
                        {
                            if (typeof value === 'string') {
                                return value;
                            }
                        }

                        break;
                    case FormulaParserTerminal.Type.IDENT:
                        return nodeValue;
                }
            }
        } catch (error) {
            console.log('Could not parse formula: ' + formula);
        }

        return formula;
    }

    /**
     * Greatest common factor, e.g., gcd(90,60) = 30.
     *
     * @param {number} x
     * @param {number} y
     * @return {number}
     */
    static gcd(x, y){
        return (y === 0) ? x : DeviceFunction.gcd(y, x % y);
    }

    /**
     * @param {DeviceAnalog} deviceAnalog
     * @param {Map<string, object>} configuration
     * @return {object[]}
     */
    static getActionArgs(deviceAnalog, configuration) {
        // This list comes from handling the "action" parameter in
        // com.oracle.iot.client.impl.device.DevicePolicyManager.devicePolicyFromJSON()
        // @type {Set<object>}
        let args = configuration.get('arguments');

        if (!args || args.size === 0) {
            return null;
        }

        // @type {object[]}
        let actionArgs = [args.size];

        for (let n = 0, nMax = args.size; n < nMax; n++) {
            // @type {DeviceModel}
            const deviceModel = deviceAnalog.getDeviceModel();
            // @type {Map<sgring, DeviceModelAction}
            const actionMap = deviceModel.getDeviceModelActions();

            if (!actionMap|| actionMap.size === 0) {
                // TODO: this could get annoying
                console.log('No actions in device model "' +
                    deviceModel.getUrn() + '"');

                actionArgs[n] = null;
                continue;
            }

            // @type {string}
            const actionName = configuration.get('name');
            // @type {DeviceModelAction}
            const deviceModelAction = actionMap.get(actionName);

            if (!deviceModelAction) {
                // TODO: this could also get annoying
                console.log('No action named "' + actionName
                    + '" in device model "' + deviceModel.getUrn() + '"');

                actionArgs[n] = null;
                continue;
            }

            // @type {string} ({DeviceModelAttribute.Type})
            const type = deviceModelAction.getArgType();

            try {
                actionArgs[n] = DeviceFunction.convertArg(deviceAnalog, type, args.get(n));
            } catch (error) {
                console.log('Bad argument to "' + actionName + '" in "' + deviceModel.getUrn() +
                    '" :' + error);

                // Maybe this was purposeful - let application handle.
                actionArgs[n] = args.get(n);
            }
        }

        return actionArgs;
    }

    /**
     * @param functionId (string)
     * @return DeviceFunction
     */
    static getDeviceFunction(functionId) {
        return DeviceFunction.POLICY_MAP.get(functionId);
    }

    /**
     * @param  {string} endpointId
     * @param  {string} deviceModelUrn
     * @param  {string} attribute
     * @return {object}
     */
    static getInProcessValue(endpointId, deviceModelUrn, attribute) {
        if (!DeviceFunction.inProcessValues) {
            DeviceFunction.inProcessValues = new Map();
        }

        if (!this.inProcessValues) {
            this.inProcessValues = new Map();
        }

        let k = DeviceFunction.createInProcessMapKey(endpointId, deviceModelUrn, attribute);
        return this.inProcessValues.get(k);
    }

    /**
     *
     * @param {DeviceAnalog} DeviceAnalog
     * @return {Set<Pair<Message, StorageObject>>}
     */
    static getPersistedBatchedData(deviceAnalog) {
        // @type {Set<Message>}
        const messages = batchByPersistence.get(deviceAnalog.getEndpointId());
        batchByPersistence.delete(messages);
        // @type {Set<Pair<Message, StorageObject>>}
        const pairs = new Set();

        messages.forEach(message => {
            pairs.add(new Pair(message, null));
        });

        return pairs;
    }


    /**
     * Utility for getting a "slide" value from a configuration.
     *
     * @param {Map<string, object>} configuration the parameters for this function from the device
     *        policy.
     * @param {number} window the corresponding window for the slide.
     * @return {number} the configured slide value, or window if there is no slide or slide is zero
     */
    static getSlide(configuration, window) {
        // @type {number}
        const slide = configuration.get("slide");

        if (slide) {
            return slide > 0 ? slide : window;
        }

        return window;
    }

/**
     * Utility for getting a "window" value from a configuration.
     *
     * @param {Map<string, object>} configuration the parameters for this function from the device
     *        policy
     * @return {number} a window value, or -1 if the configuration is not time based
     */
    static getWindow(configuration) {
        let criterion = -1;
        ['window', 'delayLimit'].forEach(key => {
            let criterionTmp = configuration.get(key);

            if (criterionTmp) {
                criterion = criterionTmp;
            }
        });

        return criterion;
    }

    /**
     *
     * @param {string} endpointId
     * @param {string} deviceModelUrn
     * @param {string} attribute
     * @param {object} value
     * @return {void}
     */
    static putInProcessValue(endpointId, deviceModelUrn, attribute, value) {
        if (!DeviceFunction.inProcessValues) {
            DeviceFunction.inProcessValues = new Map();
        }

        let k = DeviceFunction.createInProcessMapKey(endpointId, deviceModelUrn, attribute);
        DeviceFunction.inProcessValues.set(k, value);
    }

    static removeInProcessValue(endpointId, deviceModelUrn, attribute) {
        let value = null;
        let key = DeviceFunction.createInProcessMapKey(endpointId, deviceModelUrn, attribute);

        if (DeviceFunction.inProcessValues.has(key)) {
            value = DeviceFunction.inProcessValues.get(key);
            DeviceFunction.inProcessValues.delete(key);
        }

        return value;
    }

    /**
     *
     * @param {string} id
     */
    constructor(id) {
        // Instance "variables"/properties.
        /**
         * The id of the function. This is the unique id from the function definition.
         *
         * @type {string}
         */
        this.id = id;
        Object.freeze(this.id);
        // @type {BatchByPersistence}
        this.batchByPersistence =
            PersistenceMetaData.isPersistenceEnabled() ? new BatchByPersistence() : null;
        // Instance "variables"/properties.

        if (!DeviceFunction.inProcessValues) {
            DeviceFunction.inProcessValues = new Map();
        }
    }

    /**
     * The {@code apply} method is where the logic for the function is coded.
     * This method returns {@code true} if the conditions for the function have
     * been met. Only when this function's apply method returns true
     * will the next function in the pipeline be applied.
     * <p>
     * After this method returns {@code true}, use
     * {@link #get(DeviceAnalog, String, Map, Map)} to retrieve
     * the value from the function.
     *
     * @param {DeviceAnalog} deviceAnalog the VirtualDevice, never {@code null}.
     * @param {(string|null)} attribute the DeviceModelAttribute, which may be {@code null} if the
     *                           function is being applied at the device model level
     * @param {Map<string, object>} configuration the parameters for this function from the device
     * policy
     * @param {Map<string, object>} data a place for storing data between invocations of the
     * function
     * @param {object} value the value to which the function is being applied
     * @return {boolean} {@code true} if the conditions for the function have been satisfied.
     */
    apply(deviceAnalog, attribute, configuration, data, value){
        throw new Error('Must implement the apply method in subclass.');
    }

    /**
     * Return the value from the function. This method should only be called after
     * {@link #apply(DeviceAnalog, String, Map, Map, Object)} returns {@code true}, or when a
     * window expires.
     *
     * @param {DeviceAnalog} deviceAnalog the VirtualDevice, never {@code null}.
     * @param {(string|null)} attribute the DeviceModelAttribute, which may be {@code null} if the
     *        function is being applied at the device model level.
     * @param {Map<string, object>} configuration the parameters for this function from the device
     *         policy.
     * @param {Map<string, object>} data a place for storing data between invocations of the
     *        function.
     * @return {object} the value from having applied the function
     */
    get(deviceAnalog, attribute, configuration, data) {
        throw new Error('Must implement the get method in subclass.');
    }

    /**
     * Return a string representation of this function. Useful for logging.
     *
     * @param {Map<string, object>} configuration the parameters for this function from the device
     *        policy.
     * @return {string} a string representation of this function.
     */
    getDetails(configuration) {
        return this.getId();
    }

    /**
     * Get the ID of the function. This is the unique ID from the function definition.
     *
     * @return {string} the policy ID.
     */
    getId() {
        return this.id;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Policy definitions
////////////////////////////////////////////////////////////////////////////////////////////////////
class ACTION_CONDITION extends DeviceFunction {
    constructor() {
        super('actionCondition');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // @type {FormulaParserNode}
        let condition = data.get('actionCondition.condition');

        if (!condition) {
            // @type {string}
            const str = configuration.get('condition');
            // @type {Set<FormulaParserToken>}
            let tokens = FormulaParser.tokenize(String(str));
            // @type {Stack<FormulaParserNode>}
            let stack = new Stack();
            FormulaParser.parseConditionalOrExpression(stack, tokens, str, 0);
            condition = stack.pop();
            data.set('actionCondition.condition', condition);
        }

        // @type {number}
        const computedValue = DeviceFunction.compute(condition, deviceAnalog);

        if (!isFinite(computedValue) || (computedValue === 0.0)) { //zero is false.
            data.set('actionCondition.value', value);
            return true;
        }

        // getActionArgs may return null.
        // @type {object[]}
        const actionArgs = DeviceFunction.getActionArgs(deviceAnalog, configuration);
        // @type {string}
        let actionName = configuration.get('name');
        deviceAnalog.call(String(actionName), actionArgs);
        // @type {boolean}
        let filter = configuration.get('filter');

        if (filter === null || filter) {
            // If this is a filter, returning false stops the pipeline.
            return false;
        }

        data.set('actionCondition.value', value);
        return true;
    }

    /**
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     *
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        const value = data.get('actionCondition.value');
        data.delete('actionCondition.value');
        return value;
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        // @type {object}
        const filter = config.containsKey('filter') ? config.get('filter') : true;

        return super.getDetails(config) +
            '[condition="' + config.get('condition') +
            '", action="'+ config.get('name')+
            '", arguments="'+ config.get('arguments') +
            '", filter="' + filter + ']';
    }
}

class ALERT_CONDITION extends DeviceFunction {
    constructor() {
        super('alertCondition');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // @type {FormulaParserNode}
        let condition = data.get('alertCondition.condition');

        if (!condition) {
            // @type {string}
            const str = configuration.get('condition');
            // @type {Set<FormulaParser.Token}
            let tokens = FormulaParser.tokenize(String(str));
            // @type {Stack<FormulaParserNode>}
            let stack = new Stack();
            FormulaParser.parseConditionalOrExpression(stack, tokens, str, 0);
            condition = stack.pop();
            data.set('alertCondition.condition', condition);
        }

        // @type {number}
        const computedValue = DeviceFunction.compute(condition, deviceAnalog);

        if (!isFinite(computedValue) || (computedValue === 0.0))  // zero is false.
        {
            data.set('alertCondition.value', value);
            return true;
        }

        // @type {AlertMessage}
        const alertMessage = DeviceFunction.createAlert(deviceAnalog, configuration);
        deviceAnalog.queueMessage(alertMessage);
        // @type {boolean}
        let filter = configuration.get('filter');

        if (!filter || filter) {
            // if this is a filter, returning false stops the pipeline
            return false;
        }

        data.set('alertCondition.value', value);
        return true;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        // @type {object}
        const value = data.get('alertCondition.value');
        data.delete('alertCondition.value');
        return value;
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        // @type {object}
        const filter = config.has('filter') ? config.get('filter') : true;

        return super.getDetails(config) +
            '[condition="' + config.get('condition') +
            '", urn="'+ config.get('urn') + '", fields=' +
            config.get('fields') +
            '", filter='+ filter +']';
    }
}

// Will batch data until networkCost (Satellite > Cellular > Ethernet) lowers to the configured value
class BATCH_BY_COST extends DeviceFunction {
    constructor() {
        super('batchByCost');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        if (this.batchByPersistence) {
            // @type {Message}
            const message = value.getKey();
            this.batchByPersistence.save(deviceAnalog.getEndpointId(), message);
        } else {
            // @type {Set<object>}
            let list = data.get("batchByCost.value");

            if (!list) {
                list = new Set();
                data.set("batchByCost.value", list);
            }

            list.add(value);
        }

         // Assume the configured cost is the most expensive
        // @type {number}
        const configuredCost = NetworkCost.getCost(configuration.get("networkCost"),
                        "networkCost", NetworkCost.Type.SATELLITE);

        // Assume the client cost is the least expensive
        // @type {number}
        const networkCost = NetworkCost.getCost((process['env_oracle_iot_client_network_cost']),
            'oracle_iot_client_network_cost', NetworkCost.Type.ETHERNET);

        // If the cost of the network the client is on (networkCost) is greater than
        // the cost of the network the policy is willing to bear (configuredCost),
        // then return false (the value is filtered).
        if (networkCost > configuredCost) {
            return false;
        }

        return true;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        if (this.batchByPersistence) {
            // @type {Set<Pair<Message, StorageObject>>}
            const value = getPersistedBatchedData(deviceAnalog);
            return value;
        } else {
            // @type {object}
            const value = data.get("batchByCost.value");
            data.delete("batchByCost.value");
            return value;
        }
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        return super.getDetails(config) + '[networkCost=' + config.get('networkCost') + ']';
    }
}

class BATCH_BY_SIZE extends DeviceFunction {
    constructor() {
        super('batchBySize');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        if (this.batchByPersistence) {
            // @type {Message}
            const message = value.getKey();
            this.batchByPersistence.save(deviceAnalog.getEndpointId(), message);

        } else {
            // @type {Set<object>}
            let list = data.get("batchBySize.value");

            if (!list) {
                list = new Set();
                data.set("batchBySize.value", list);
            }

            list.add(value);
        }

        // @type {number}
        let batchCount = data.get("batchBySize.batchCount");

        if (!batchCount) {
            batchCount = 0;
        }

        batchCount += 1;
        data.set("batchBySize.batchCount", batchCount);

        // @type {number}
        let batchSize = configuration.get('batchSize');
        return !batchSize || batchSize === list.size;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        data.set("batchBySize.batchCount", 0);

        if (this.batchByPersistence) {
            // @type {Set<Pair<Message, StorageObject>>}
            const value = getPersistedBatchedData(deviceAnalog);
            return value;
        } else {
            // @type {object}
            const value = data.get("batchBySize.value");
            data.delete("batchBySize.value");
            return value;
        }
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        return super.getDetails(config) + '[batchSize=' + config.get('batchSize') + ']';
    }
}

class BATCH_BY_TIME extends DeviceFunction {
    constructor() {
        super('batchByTime');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        debug('DeviceFunction.BATCH_BY_TIME.apply called.');
        // @type {Set<object>}
        let list = data.get('batchByTime.value');

        if (this.batchByPersistence) {
            // @type {Message}
            const message = value.getKey();
            this.batchByPersistence.save(deviceAnalog.getEndpointId(), message);
        } else {
            // @type {Set<object>}
            let list = data.get("batchByTime.value");

            if (!list) {
                list = new Set();
                data.set("batchByTime.value", list);
            }

            list.add(value);
        }

        return false;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        debug('DeviceFunction.BATCH_BY_TIME.get called @' + new Date());
        let value = data.get('batchByTime.value');
        debug('DeviceFunction.BATCH_BY_TIME.get value = ' + util.inspect(value));

        if (this.batchByPersistence) {
            // @type {Set<Pair<Message, StorageObject>>}
            const value = getPersistedBatchedData(deviceAnalog);
            return value;
        } else {
            // @type {object}
            const value = data.get("batchByTime.value");
            data.delete("batchByTime.value");
            return value;
        }
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        return super.getDetails(config) + '[delayLimit=' + config.get('delayLimit') + ']';
    }
}

class COMPUTED_METRIC extends DeviceFunction {
    constructor() {
        super('computedMetric');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // @type {FormulaParserNode}
        let formula = data.get('computedMetric.formula');

        if (!formula) {
            // @type {string}
            const str = configuration.get('formula');
            // @type {Set<FormulaParser.Token>}
            let tokens = FormulaParser.tokenize(str);
            formula = FormulaParser.parseFormula(tokens, str);
            data.set('computedMetric.formula', formula);
        }

        // @type {number}
        const computedValue = DeviceFunction.compute(formula, deviceAnalog);

        if (!isFinite(computedValue)) {
            return false;
        }

        data.set('computedMetric.value', computedValue);
        return true;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        const value = data.get('computedMetric.value');
        data.delete('computedMetric.value');
        return value;
    }


    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        return super.getDetails(config) + '[formula="' + config.get('formula') + '"]';
    }
}

class DETECT_DUPLICATES extends DeviceFunction {
    constructor() {
        super('detectDuplicates');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // @type {number}
        const now = new Date().getTime();
        // @type {object}
        const lastValue = data.get('detectDuplicates.lastValue');
        data.set('detectDuplicates.lastValue', value);

        // If value equals lastValue, then this is a duplicate value.
        // If value is the first duplicate value, then lastValue has already
        // been passed along and we want to filter out the current value and
        // all other sequential duplicates within the window.
        if (value === lastValue) {
            // windowEnd is the end time of the current window.
            // @type {number}
            const windowEnd = data.get("detectDuplicates.windowEnd");

            // If the current window has expired (i.e., windowEnd <= now), then update windowEnd.
            if (windowEnd <= now) {
                // windowEnd is the current time plus the window. window is normalized so that
                // window is greater than or equal to zero.
                // @type {number}
                const window = DeviceFunction.getWindow(configuration);
                data.set("detectDuplicates.windowEnd", now + (window > 0 ? window : 0));
                // When the window moves, we need to send an alert.
                data.set("detectDuplicates.alertSent", false);
            }

            // The first time we get here, alertSent will be false (because of the "else" part
            // below) and an alert will be sent. alertSent will then be true until the window
            // expires or a non-duplicate value is received.
            // @type {boolean}
            const alertSent = data.get("detectDuplicates.alertSent");

            if (!alertSent) {
                data.set("detectDuplicates.alertSent", true);
                // @type {AlertMessage}
                const alertMessage = DeviceFunction.createAlert(deviceAnalog, configuration);
                deviceAnalog.queueMessage(alertMessage);
            }
        } else {
            // Values are not duplicates. Move window. windowEnd is the current time plus the
            // window. window is normalized so that window is greater than or equal to zero.
            // @type {number}
             const window = DeviceFunction.getWindow(configuration);
            data.set("detectDuplicates.windowEnd", now + (window > 0 ? window : 0));
            data.set("detectDuplicates.alertSent", false);
        }

        // detectDuplicates does not filter data. Return true.
        return true;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        // @type {object}
        return data.get('detectDuplicates.lastValue');
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        return super.getDetails(config) + '[window=' + config.get('window') +
            ', alertFormatURN="' + config.get('alertFormatURN') + '"]';
    }
}

class ELIMINATE_DUPLICATES extends DeviceFunction {
    constructor() {
        super('eliminateDuplicates');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // @type {boolean}
        let isDuplicate = false;
        // @type {number}
        const now = new Date().getTime();
        // @type {object}
        const lastValue = data.get('eliminateDuplicates.lastValue');
        data.set('eliminateDuplicates.lastValue', value);

        // If value equals lastValue, then this is a duplicate value.
        // If value is the first duplicate value, then lastValue has already
        // been passed along and we want to filter out the current value and
        // all other sequential duplicates within the window.
        if (value === lastValue) {
            // windowEnd is the end time of the current window.
            // @type {number}
            const windowEnd = data.get("eliminateDuplicates.windowEnd");

            // If the current window has not expired (i.e., now <= windowEnd), then the value is
            // filtered out.
            isDuplicate = (now <= windowEnd);

            // If the current window has expired (i.e., windowEnd <= now),
            // then update windowEnd.
            if (windowEnd <= now) {
                // windowEnd is the current time plus the window.
                // window is normalized so that window is greater than or equal to zero.
                // @type {number}
                const window = DeviceFunction.getWindow(configuration);
                data.set("eliminateDuplicates.windowEnd", now + (window > 0 ? window : 0));
            }
        } else {
            // Values are not duplicates. Move window. windowEnd is the current time plus the
            // window. window is normalized so that window is greater than or equal to zero.
            // @type {number}
            const window = DeviceFunction.getWindow(configuration);
            data.set("eliminateDuplicates.windowEnd", now + (window > 0 ? window : 0));
        }

        return !isDuplicate;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        return data.get('eliminateDuplicates.lastValue');
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        return super.getDetails(config) + '[window=' + config.get('window') + ']';
    }
}

class FILTER_CONDITION extends DeviceFunction {
    constructor() {
        super('filterCondition');
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        data.set('filterCondition.value', value);
        // @type {FormulaParserNode}
        let condition = data.get('filterCondition.condition');

        if (!condition) {
            // @type {string}
            const str = configuration.get('condition');
            // @type {Set<Token>}
            let tokens = FormulaParser.tokenize(String(str));

            // @type {Stack<FormulaParserNode>}
            let stack = new Stack();
            FormulaParser.parseConditionalOrExpression(stack, tokens, str, 0);
            condition = stack.pop();
            data.set('filterCondition.condition', condition);
        }

        // @type {number}
        const computedValue = DeviceFunction.compute(condition, deviceAnalog);
        // For a filter condition, if the computation returns 0.0, meaning
        // the condition evaluated to false, then we want to return 'true'
        // because "filter" means out, not in.
        return -1.0 < computedValue && computedValue < 1.0;
    }


    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        // @type {object}
        const value = data.get('filterCondition.value');
        data.delete('filterCondition.value');
        return value;
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        return super.getDetails(config) + '[condition="' + config.get('condition') + '"]';
    }
}

class MAX extends DeviceFunction {
    constructor() {
        super('max');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // See DeviceFunction("mean") for details on handling slide
        // and what all this bucket stuff is about
        // @type {number}
        const now = new Date().getTime();
        // @type {number}
        let windowStartTime = data.get("max.windowStartTime");

        if (!windowStartTime) {
            windowStartTime = now;
            data.set("max.windowStartTime", windowStartTime);
        }

        // @type {number}
        const window =DeviceFunction.getWindow(configuration);
        // @type {number}
        const slide =DeviceFunction.getSlide(configuration, window);
        // @type {number}
        const span =DeviceFunction.gcd(window, slide);
        // @type {Bucket[]}
        let buckets = data.get("max.buckets");

        if (!buckets) {
            // @type {number}
            const numberOfBuckets = (Math.max(slide,window) / span) + 1;
            buckets = new Array(numberOfBuckets);

            for (let i = 0; i < numberOfBuckets; i++) {
                buckets[i] = new Bucket(Number.MIN_VALUE);
            }

            data.set("max.buckets", buckets);
        }

        // @type {number}
        let bucketZero = data.get("max.bucketZero");

        if (!bucketZero && (bucketZero !== 0)) {
            bucketZero = 0;
            data.set("max.bucketZero", bucketZero);
        }

        // @type {number}
        const bucketIndex = Math.trunc((now - windowStartTime) / span);
        // @type {number}
        const bucket = (bucketZero + bucketIndex) % buckets.length;

        // @type {number}
        let max = buckets[bucket].value;

        buckets[bucket].value = (value <= max) ? max : value;
        return false;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        // See DeviceFunction("mean")#get for explanation of slide and buckets
        // @type {Bucket[]}
        const buckets = data.get("max.buckets");

        if (!buckets) {
            // Must have called get before apply.
            return null;
        }

        // @type {number}
        const bucketZero = data.get("max.bucketZero");

        if (!bucketZero && (bucketZero !== 0)) {
            // If buckets is not null, but bucketZero is, something is wrong with our implementation.
            return null;
        }

        // @type {number}
        const window =DeviceFunction.getWindow(configuration);
        // @type {number}
        const slide =DeviceFunction.getSlide(configuration, window);
        // @type {number}
        const span =DeviceFunction.gcd(window, slide);
        // @type {number}
        const bucketsPerWindow = window / span;
        // @type {number}
        const bucketsPerSlide = slide / span;
        // @type {number}
        let windowStartTime = data.get("max.windowStartTime");

        if (!windowStartTime) {
            windowStartTime = new Date().getTime();
        }

        data.set("max.windowStartTime", windowStartTime + span * bucketsPerSlide);
        data.set("max.bucketZero", (bucketZero + bucketsPerSlide) % buckets.length);

        // @type {number}
        let max = Number.MIN_VALUE;

        for (let i = 0; i < bucketsPerWindow; i++) {
            // @type {number}
            const index = (bucketZero + i) % buckets.length;
            // @type {Bucket}
            let bucket = buckets[index];
            // @type {number}
            let num = bucket.value;
            max = (num <= max) ? max : num;
        }

        for (let i = 0; i < bucketsPerSlide; i++) {
            // @type {Bucket}
            let bucket = buckets[(bucketZero + i) % buckets.length];
            bucket.value = Number.MIN_VALUE;
        }

        return max;
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        // @type {string}
        let details = super.getDetails(config);
        // @type {object}
        const window = config.get("window");

        if (window) {
            details += '[window=' + window;
        }

        // @type {object}
        const slide = config.get("slide");

        if (slide) {
            details += (window) ? ',' : '[';
            details += 'slide=' + slide;
        }

        details += ']';
        return details;
    }
}

class MEAN extends DeviceFunction {
    constructor() {
        super('mean');
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // Handling slide:
        //
        // Slide is how much the window moves after the
        // window expires. If there is a window of 5 seconds
        // with a slide of 2 seconds, then at the end of
        // 5 seconds, the window slides over by two seconds.
        // That means that the next window's worth of data
        // would include 3 seconds of data from the previous
        // window, and 2 seconds of new data.
        //
        // To handle this, we divide up the window into buckets.
        // Each bucket represents a period of time, such
        // that the time period is the greatest common factor
        // between the window and the slide. For example, if
        // the window is 60 seconds and the slide is 90
        // seconds, a bucket would span 30 seconds, and
        // there would be three buckets.
        //
        // When the window expires and the get method is called,
        // the return value of the mean policy function will
        // include the value and number of terms of bucket[0]
        // through bucket[n]. Then the buckets that don't
        // contribute to the next window are emptied (so to speak)
        // and the cycle continues.
        //
        // Best case is that the slide equal to the window.
        // In this case, there is only ever one bucket.
        // The worst case is when greatest common factor between
        // slide and window is small. In this case, you end up
        // with a lot of buckets, potentially one bucket per
        // slide time unit (e.g., 90 seconds, 90 buckets).
        // But this is no worse (memory wise) than keeping
        // an array of values and timestamps.
        //
        // @type {number}
        const now = new Date().getTime();

        // windowStartTime is the time at which the first
        // call to apply was made for the current window
        // of time. We need to know when this window
        // started so that we can figure out what bucket
        // the data goes into.
        // @type {number}
        let windowStartTime = data.get("mean.windowStartTime");

        if (!windowStartTime) {
            windowStartTime = now;
            data.set("mean.windowStartTime", windowStartTime);
        }

        // The greatest common factor between the
        // window and the slide represents the greatest
        // amount of time that goes evenly into
        // both window and slide.
        // @type {number}
        const window = DeviceFunction.getWindow(configuration);
        // @type {number}
        const slide = DeviceFunction.getSlide(configuration, window);
        // Each bucket spans this amount of time.
        // @type {number}
        const span = DeviceFunction.gcd(window, slide);
        // @type {Bucket[]}
        let buckets = data.get("mean.buckets");

        if (!buckets) {
            // The number of buckets is the window or span
            // (which ever is greater) divided
            // by the amount of time it spans. Thus, if
            // there is a 5 second window with a 2 second slide,
            // the greatest common factor is 1 second and we end
            // up with 5 buckets. But if the slide was 7 seconds,
            // you'd end up with 7 buckets. This lets us fill
            // up buckets without worrying about whether the
            // window is greater than, equal to, or less than
            // the slide.
            // Note: we add 1 so there is a bucket for when
            // a value comes in for the next window, but before
            // the window has been moved.
            // @type {number}
            const numberOfBuckets = (Math.max(slide, window) / span) + 1;
            buckets = new Array(numberOfBuckets);

            for (let i = 0; i < numberOfBuckets; i++) {
                buckets[i] = new Bucket(0);
            }

            data.set("mean.buckets", buckets);
        }

        // bucketZero is the index of the zeroth bucket
        // in the buckets array. This allows the buckets array
        // to be treated as a circular buffer so we don't have
        // to move array elements when the window slides.
        // @type {number}
        let bucketZero = data.get("mean.bucketZero");

        if (!bucketZero && (bucketZero !== 0)) {
            bucketZero = 0;
            data.set("mean.bucketZero", bucketZero);
        }

        // Which bucket are we working on is calculated
        // by the dividing the amount of time we are into
        // the window by the span of time represented by
        // one bucket. For example, say we have a 2 second
        // slide and a 10 second window giving us 5 buckets.
        // Say our window started at 20 seconds and the
        // value arrives at 25 seconds (5 seconds into the
        // window). The value, then should be added to the
        // third bucket (buckets[2]) since that bucket
        // represents the time from 4 seconds to 6 seconds
        // into the current window.
        // @type {number}
        const bucketIndex = Math.trunc((now - windowStartTime) / span);
        // @type {number}
        const bucket = (bucketZero + bucketIndex) % buckets.length;
        buckets[bucket].value += value;
        buckets[bucket].terms += 1;

        return false;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        // @type {Bucket[]}
        const buckets = data.get("mean.buckets");

        if (!buckets) {
            // Must have called get before apply.
            return null;
        }

        // @type {number}
        const bucketZero = data.get("mean.bucketZero");

        if (!bucketZero && (bucketZero !== 0)) {
            // If buckets is not null, but bucketZero is, something is wrong with our implementation.
            return null;
        }

        // The greatest common factor between the
        // window and the slide represents the greatest
        // amount of time that goes evenly into
        // both window and slide.
        // @type {number}
        const window = DeviceFunction.getWindow(configuration);
        // @type {number}
        const slide = DeviceFunction.getSlide(configuration, window);

        // Each bucket spans this amount of time.
        // @type {number}
        const span = DeviceFunction.gcd(window, slide);

        // The number of buckets that make up a window.
        // @type {number}
        const bucketsPerWindow = window / span;

        // The number of buckets that make up the slide.
        // @type {number}
        const bucketsPerSlide = slide / span;

        // Update windowStartTime for the next window.
        // The new windowStartTime is just the current window
        // start time plus the slide.
        // @type {number}
        let windowStartTime = data.get("mean.windowStartTime");

        if (!windowStartTime) {
            windowStartTime = new Date().getTime();
        }

        data.set("mean.windowStartTime", windowStartTime + span * bucketsPerSlide);

        // Update bucketZero index. bucketZero is the index
        // of the zeroth bucket in the circular buckets array.
        data.set("mean.bucketZero", (bucketZero + bucketsPerSlide) % buckets.length);
        // @type {number}
        let sum = 0;
        // @type {number}
        let terms = 0;

        // Loop through the number of buckets in the window and sum them up.
        for (let i = 0; i < bucketsPerWindow; i++) {
            // @type {number}
            const index = (bucketZero + i) % buckets.length;
            // @type {Bucket}
            let bucket = buckets[index];
            sum += bucket.value;
            terms += bucket.terms;
        }

        // Now slide the window.
        for (let i = 0; i < bucketsPerSlide; i++) {
            // @type {Bucket}
            let bucket = buckets[(bucketZero + i) % buckets.length];
            bucket.value = 0;
            bucket.terms = 0;
        }

        if ((sum === DeviceFunction.ZERO) || (terms === 0)) {
            return null;
        }

        return sum / terms;
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        // @type {string}
        let details = super.getDetails(config);
        // @type {object}
        const window = config.get("window");

        if (window) {
            details += '[window=' + window;
        }

        // @type {object}
        const slide = config.get("slide");

        if (slide) {
            details += (window) ? ',' : '[';
            details += 'slide=' + slide;
        }

        details += ']';
        return details;
    }
}

class MIN extends DeviceFunction {
    constructor() {
        super('min');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // See DeviceFunction("mean") for details on handling slide
        // and what all this bucket stuff is about
        // @type {number}
        const now = new Date().getTime();
        // @type {number}
        let windowStartTime = data.get("min.windowStartTime");

        if (!windowStartTime) {
            windowStartTime = now;
            data.set("min.windowStartTime", windowStartTime);
        }

        // @type {number}
        const window = DeviceFunction.getWindow(configuration);
        // @type {number}
        const slide = DeviceFunction.getSlide(configuration, window);
        // @type {number}
        const span = DeviceFunction.gcd(window, slide);
        // @type {Bucket[]}
        let buckets = data.get("min.buckets");

        if (!buckets) {
            // @type {number}
            const numberOfBuckets = (Math.min(slide,window) / span) + 1;
            buckets = new Array(numberOfBuckets);

            for (let i = 0; i < numberOfBuckets; i++) {
                buckets[i] = new Bucket(Number.MAX_VALUE);
            }

            data.set("min.buckets", buckets);
        }

        // @type {number}
        let bucketZero = data.get("min.bucketZero");

        if (!bucketZero && (bucketZero !== 0)) {
            bucketZero = 0;
            data.set("min.bucketZero", bucketZero);
        }

        // @type {number}
        const bucketIndex = Math.trunc((now - windowStartTime) / span);
        // @type {number}
        const bucket = (bucketZero + bucketIndex) % buckets.length;
        // @type {number}
        const min = buckets[bucket].value;
        buckets[bucket].value = (value <= min) ? value : min;
        return false;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        // See DeviceFunction("mean")#get for explanation of slide and buckets.
        // @type {Bucket[]}
        const buckets = data.get("min.buckets");

        if (!buckets) {
            // Must have called get before apply.
            return null;
        }

        // @type {number}
        const bucketZero = data.get("min.bucketZero");

        if (!bucketZero && (bucketZero !== 0)) {
            // If buckets is not null, but bucketZero is, something is wrong with our implementation.
            return null;
        }

        // @type {number}
        const window = DeviceFunction.getWindow(configuration);
        // @type {number}
        const slide = DeviceFunction.getSlide(configuration, window);
        // @type {number}
        const span = DeviceFunction.gcd(window, slide);
        // @type {number}
        const bucketsPerWindow = window / span;
        // @type {number}
        const bucketsPerSlide = slide / span;
        // @type {number}
        let windowStartTime = data.get("min.windowStartTime");

        if (!windowStartTime) {
            windowStartTime = new Date().getTime();
        }

        data.set("min.windowStartTime", windowStartTime + span * bucketsPerSlide);
        data.set("min.bucketZero", (bucketZero + bucketsPerSlide) % buckets.length);
        // @type {number}
        let min = Number.MAX_VALUE;

        for (let i = 0; i < bucketsPerWindow; i++) {
            // @type {number}
            const index = (bucketZero + i) % buckets.length;
            // @type {Bucket}
            let bucket = buckets[index];
            // @type {number}
            let num = bucket.value;
            min = num <=  min ? num : min;
        }

        for (let i = 0; i < bucketsPerSlide; i++) {
            // @type {Bucket}
            let bucket = buckets[(bucketZero + i) % buckets.length];
            bucket.value = Number.MAX_VALUE;
        }

        return min;
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        // @type {string}
        let details = super.getDetails(config);
        // @type {object}
        const window = config.get("window");

        if (window) {
            details += '[window=' + window;
        }

        // @type {object}
        const slide = config.get("slide");

        if (slide) {
            details += (window) ? ',' : '[';
            details += 'slide=' + slide;
        }

        details += ']';
        return details;
    }
}

class SAMPLE_QUALITY extends DeviceFunction {
    constructor() {
        super('sampleQuality');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // Always put the value in the data map.
        data.set("sample.value", value);
        // @type {number}
        let terms = data.get("sample.terms");

        if (!terms || terms === Number.MAX_VALUE) {
            terms = 0;
        }

        data.set("sample.terms", ++terms);
        // @type {number}
        const criterion = configuration.get("rate");

        // -1 is random, 0 is all
        if (criterion === 0) {
            return true;
        } else if (criterion === -1) {
            // TODO: make configurable
            return (Math.floor(Math.random() * 30) === 0);
        }

        return (criterion === terms);
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        const sample = data.get("sample.value");
        data.delete("sample.value");
        data.delete("sample.terms");
        return sample;
    }


    getDetails(config) {
        // @type {object}
        const rate = config.get("rate");
        // @type {string}
        const isString = ("all" === rate) || ("none" === rate) || ("random" === rate);
        return super.getDetails(config) + '[rate=' + (isString ? '"' + rate + '"' : rate) + ']';
    }
}


class STANDARD_DEVIATION extends DeviceFunction {
    constructor() {
        super('standardDeviation');
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @param {object} value
     *
     * @return {boolean}
     */
    apply(deviceAnalog, attribute, configuration, data, value) {
        // See DeviceFunction("mean") for details on handling slide
        // and what all this bucket stuff is about
        // @type {number}
        const now = new Date().getTime();
        // @type {number}
        let windowStartTime = data.get("standardDeviation.windowStartTime");

        if (!windowStartTime) {
            windowStartTime = now;
            data.set("standardDeviation.windowStartTime", windowStartTime);
        }

        // @type {number}
        const window = DeviceFunction.getWindow(configuration);
        // @type {number}
        const slide = DeviceFunction.getSlide(configuration, window);
        // @type {number}
        const span = DeviceFunction.gcd(window, slide);
        // @type {Bucket<Set>>[]}
        let buckets = data.get("standardDeviation.buckets");

        if (!buckets) {
            // @type {number}
            const numberOfBuckets = (Math.min(slide, window) / span) + 1;
            buckets = new Array(numberOfBuckets);

            for (let i = 0; i < numberOfBuckets; i++) {
                buckets[i] = new Bucket(new Set());
            }

            data.set("standardDeviation.buckets", buckets);
        }

        // @type {number}
        let bucketZero = data.get("standardDeviation.bucketZero");

        if (!bucketZero && (bucketZero !== 0)) {
            bucketZero = 0;
            data.set("standardDeviation.bucketZero", bucketZero);
        }

        // @type {number}
        const bucketIndex = Math.trunc((now - windowStartTime) / span);
        // @type {number}
        const bucket = (bucketZero + bucketIndex) % buckets.length;
        buckets[bucket].value.add(value);
        return false;
    }

    /**
     * @Override
     * @param {DeviceAnalog} deviceAnalog
     * @param {(string|null)} attribute
     * @param {Map<string, object>} configuration
     * @param {Map<string, object>} data
     * @return {object}
     */
    get(deviceAnalog, attribute, configuration, data) {
        // See DeviceFunction("mean")#get for explanation of slide and buckets
        // @type {Bucket<Set>[]}
        const buckets = data.get("standardDeviation.buckets");

        if (!buckets) {
            // Must have called get before apply.
            return null;
        }

        // @type {number}
        const  bucketZero = data.get("standardDeviation.bucketZero");

        if (!bucketZero && (bucketZero !== 0)) {
            // If buckets is not null, but bucketZero is, something is wrong with our implementation.
            return null;
        }

        // @type {number}
        const window = DeviceFunction.getWindow(configuration);
        // @type {number}
        const slide = DeviceFunction.getSlide(configuration, window);
        // @type {number}
        const span = DeviceFunction.gcd(window, slide);
        // @type {number}
        const bucketsPerWindow = window / span;
        // @type {number}
        const bucketsPerSlide = slide / span;
        // @type {number}
        let windowStartTime = data.get("standardDeviation.windowStartTime");

        if (!windowStartTime) {
            windowStartTime = new Date().getTime();
        }

        data.set("standardDeviation.windowStartTime", windowStartTime + span * bucketsPerSlide);
        data.set("standardDeviation.bucketZero", (bucketZero + bucketsPerSlide) % buckets.length);
        // @type {Set<number>}
        let terms = new Set();

        for (let i = 0; i < bucketsPerWindow; i++) {
            // @type {number}
            const index = (bucketZero + i) % buckets.length;
            // @type {Bucket<Set<number>>}
            let bucket = buckets[index];
            // @type {Set<number>}
            let values = bucket.value;

            values.forEach(val => {
                terms.add(val);
            });
        }

        // @type {number}
        let sum = 0;
        let termsAry = Array.from(terms);

        for (let n = 0, nMax = termsAry.length; n < nMax; n++) {
            // @type {number}
            sum += termsAry[n];
        }

        // @type {number}
        let mean = sum / termsAry.length;

        for (let n = 0, nMax = termsAry.length; n < nMax; n++) {
            // @type {number}
            let d = termsAry[n] - mean;
            termsAry[n] = Math.pow(d, 2);
        }

        sum = 0;

        for (let n = 0, nMax = termsAry.length; n < nMax; n++) {
            // @type {number}
            sum += termsAry[n];
        }

        mean = sum / termsAry.length;

        // @type {number}
        let stdDeviation = Math.sqrt(mean);

        for (let i = 0; i < bucketsPerSlide; i++) {
            // @type {Bucket<Set<number>>}
            let bucket = buckets[(bucketZero + i) % buckets.length];
            bucket.value.clear();
        }

        return stdDeviation;
    }

    /**
     * @param {Map<string, object>} config
     * @return {string}
     */
    getDetails(config) {
        // @type {string}
        let details = super.getDetails(config);
        // @type {object}
        const window = config.get("window");

        if (window) {
            details += '[window=' + window;
        }

        // @type {object}
        const slide = config.get("slide");

        if (slide) {
            details += (window) ? ',' : '[';
            details += 'slide=' + slide;
        }

        details += ']';
        return details;
    }
}

DeviceFunction.ZERO = 0.0;
DeviceFunction.POLICY_MAP = new Map();
let actionConditionDeviceFunction = new ACTION_CONDITION();
DeviceFunction.POLICY_MAP.set(actionConditionDeviceFunction.getId(), actionConditionDeviceFunction);
let alertConditionDeviceFunction = new ALERT_CONDITION();
DeviceFunction.POLICY_MAP.set(alertConditionDeviceFunction.getId(), alertConditionDeviceFunction);
let batchByCostDeviceFunction = new BATCH_BY_COST();
DeviceFunction.POLICY_MAP.set(batchByCostDeviceFunction.getId(), batchByCostDeviceFunction);
let batchBySizeDeviceFunction = new BATCH_BY_SIZE();
DeviceFunction.POLICY_MAP.set(batchBySizeDeviceFunction.getId(), batchBySizeDeviceFunction);
let batchByTimeDeviceFunction = new BATCH_BY_TIME();
DeviceFunction.POLICY_MAP.set(batchByTimeDeviceFunction.getId(), batchByTimeDeviceFunction);
let computedMetricDeviceFunction = new COMPUTED_METRIC();
DeviceFunction.POLICY_MAP.set(computedMetricDeviceFunction.getId(), computedMetricDeviceFunction);
let detectDuplicatesDeviceFunction = new DETECT_DUPLICATES();
DeviceFunction.POLICY_MAP.set(detectDuplicatesDeviceFunction.getId(), detectDuplicatesDeviceFunction);
let eliminateDuplicatesDeviceFunction = new ELIMINATE_DUPLICATES();
DeviceFunction.POLICY_MAP.set(eliminateDuplicatesDeviceFunction.getId(),
    eliminateDuplicatesDeviceFunction);
let filterConditionDeviceFunction = new FILTER_CONDITION();
DeviceFunction.POLICY_MAP.set(filterConditionDeviceFunction.getId(), filterConditionDeviceFunction);
let maxDeviceFunction = new MAX();
DeviceFunction.POLICY_MAP.set(maxDeviceFunction.getId(), maxDeviceFunction);
let meanDeviceFunction = new MEAN();
DeviceFunction.POLICY_MAP.set(meanDeviceFunction.getId(), meanDeviceFunction);
let minDeviceFunction = new MIN();
DeviceFunction.POLICY_MAP.set(minDeviceFunction.getId(), minDeviceFunction);
let sampleQualityDeviceFunction = new SAMPLE_QUALITY();
DeviceFunction.POLICY_MAP.set(sampleQualityDeviceFunction.getId(), sampleQualityDeviceFunction);
let standardDeviationDeviceFunction = new STANDARD_DEVIATION();
DeviceFunction.POLICY_MAP.set(standardDeviationDeviceFunction.getId(),
    standardDeviationDeviceFunction);


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceModel.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * Detailed information on a device model. A device model is a specification
 * of the attributes, formats, and resources available on the device.
 */
class DeviceModel {
    // Instance "variables"/properties...see constructor.

    /**
     * @param {string} urn
     * @param {string} name
     * @param {string} description
     * @param {DeviceModelAttribute[]} deviceModelAttributes
     * @param {DeviceModelAction[]} deviceModelActions
     * @param {DeviceModelFormat[]} deviceModelFormats
     */
    constructor(urn, name, description, deviceModelAttributes, deviceModelActions,
                deviceModelFormats)
    {
        // Instance "variables"/properties.
        /**
         * The URN of the device model.
         *
         * @type {string}
         */
        this.urn = urn;
        /**
         * The device model's name.
         *
         * @type {string}
         */
        this.name = name;
        /**
         * The device model's description.
         *
         * @type {string}
         */
        this.description = description;

        /**
         * Map of attribute names to DeviceModelAttribute's.
         * {Map<String, DeviceModelAttribute[]>}
         */
        // {Map<string, DeviceModelAttribute>}
        this.deviceModelAttributes = new Map();
        // {Map<String, DeviceModelAction[]>}
        this.deviceModelActions = new Map();
        // {Map<String, DeviceModelFormat[]>}
        this.deviceModelFormats = new Map();

        if (deviceModelAttributes) {
            deviceModelAttributes.forEach(deviceModelAttribute => {
                let attributeName = deviceModelAttribute.name;

                if (!this.deviceModelAttributes.get(attributeName)) {
                    this.deviceModelAttributes.set(attributeName, deviceModelAttribute);
                }
            });
        }

        if (deviceModelActions) {
            for (let i = 0; i < deviceModelActions.length; i++) {
                let actName = deviceModelActions[i].name;

                if (this.deviceModelActions.get(actName) == null) {
                    let deviceModelAction = new DeviceModelAction(actName,
                        deviceModelActions[i].description, deviceModelActions[i].type,
                        deviceModelActions[i].lowerBound, deviceModelActions[i].upperBound,
                        deviceModelActions[i].alias);

                    this.deviceModelActions.set(actName, deviceModelAction);
                }
            }
        }

        if (deviceModelFormats) {
            for (let i = 0; i < deviceModelFormats.length; i++) {
                let formatUrn = deviceModelFormats[i].urn;

                if (!this.deviceModelFormats.get(formatUrn)) {
                    let fields = [];

                    if (deviceModelFormats[i].value &&
                        deviceModelFormats[i].value.fields &&
                        deviceModelFormats[i].value.fields.length > 0)
                    {
                        let fs = deviceModelFormats[i].value.fields;

                        fs.forEach(v => {
                            fields.push(new DeviceModelFormatField(v.name, v.description, v.type,
                                v.optional));
                        });
                    }

                    let deviceModelFormat = new DeviceModelFormat(deviceModelFormats[i].urn,
                        deviceModelFormats[i].name, deviceModelFormats[i].description,
                        deviceModelFormats[i].type, fields);

                    this.deviceModelFormats.set(formatUrn, deviceModelFormat);
                }
            }
        }
    }

    /**
     * Returns the actions for this device model.
     *
     * @return {Map<string, DeviceModelAction[]>} the actions for this device model.
     */
    getDeviceModelActions() {
        return this.deviceModelActions;
    }

    /**
     * Returns the attributes for this device model.
     *
     * @return {Map<string, DeviceModelAttribute[]>} the attributes for this device model.
     */
    getDeviceModelAttributes() {
        return this.deviceModelAttributes;
    }

    /**
     * @return {Map<string, DeviceModelFormat[]>}
     */
    getDeviceModelFormats() {
        return this.deviceModelFormats;
    }

    /**
     * Returns the device model's description.
     *
     * @return {string} the device model's description.
     */
    getDescription() {
        return this.description;
    }

    /**
     * Returns the device model's name.
     *
     * @return {string} the device model's name.
     */
    getName() {
        return this.name;
    }

    /**
     * Returns the device model's URN.
     *
     * @return {string} the device model's URN.
     */
    getUrn() {
        return this.urn;
    }

    /**
     * Returns a string representation of this device model.
     *
     * @return {string}
     */
    // toString() {
    //     // let StringBuilder = require('stringbuilder');
    //     // let firstItem = true;
    //     // let b = new StringBuilder("urn = ");
    //     // b.append("\t");
    //     // b.append(urn);
    //     // b.append(",\n\tname = ");
    //     // b.append(name);
    //     // b.append(",\n\tdescription = ");
    //     // b.append(description);
    //     // b.append(",\n\tattributes = [");
    //     //
    //     // for (let attribute of this.deviceModelAttributes.values()) {
    //     //     if (!firstItem) {
    //     //         b.append(",");
    //     //     } else {
    //     //         firstItem = false;
    //     //     }
    //     //
    //     //     b.append("\n\t{");
    //     //     b.append(attribute);
    //     //     b.append("}");
    //     // }
    //     //
    //     // if (!firstItem) {
    //     //     b.append("\n\t");
    //     // }
    //     //
    //     // b.append("],\n\tactions = [");
    //     // firstItem = true;
    //     //
    //     // for (let action of this.deviceModelActions.values()) {
    //     //     if (!firstItem) {
    //     //         b.append(",");
    //     //     } else {
    //     //         firstItem = false;
    //     //     }
    //     //
    //     //     b.append("\n\t{");
    //     //     b.append(action);
    //     //     b.append("}");
    //     // }
    //     //
    //     // if (!firstItem) {
    //     //     b.append("\n\t");
    //     // }
    //     //
    //     // b.append("],\n\tformats = [");
    //     // firstItem = true;
    //     //
    //     // for (let format of this.deviceModelFormats.values()) {
    //     //     if (!firstItem) {
    //     //         b.append(",");
    //     //     } else {
    //     //         firstItem = false;
    //     //     }
    //     //
    //     //     b.append("\n\t{");
    //     //     b.append(format);
    //     //     b.append("}");
    //     // }
    //     //
    //     // if (!firstItem) {
    //     //     b.append("\n\t");
    //     // }
    //     //
    //     // b.append("]");
    //     // return b.toString();
    //     return '';
    //  }
}

//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceModelFormat.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * DeviceModelFormat
 */
class DeviceModelFormat {
    // Instance "variables"/properties...see constructor.

    /**
     * @param {string} urn
     * @param {string} name
     * @param {string} description
     * @param {lib.message.Message.Type} type
     * @param {DeviceModelFormatField[]} fields
     */
    constructor(urn, name, description, type, fields) {
        // Instance "variables"/properties.
        this.urn = urn;
        this.name = name;
        this.description = description;
        this.fields = fields;

        if (lib.message.Message.Type.hasOwnProperty(type)) {
            this.type = type;
        } else {
            this.type = null;
        }
    }

    /**
     * @return {string}
     */
    getDescription() {
        return this.description;
    }

    /**
     *
     * @return {DeviceModelFormatField[]}
     */
    getFields() {
        return this.fields;
    }

    /**
     * @return {string}
     */
    getName() {
        return this.name;
    }

    /**
     * @return {string}
     */
    getType() {
        return this.type;
    }

    /**
     * @return {string}
     */
    getUrn() {
        return this.urn;
    }


    /**
     * @return {string}
     */
    toString() {
        let str =
            'name = ' + this.name +
            ', description = ' + this.description +
            ', type = ' + this.type +
            ',\n fields = [';


        let firstItem = true;

        this.fields.forEach(field => {
            if (!firstItem) {
                str += ',';
            } else {
                firstItem = false;
            }

            str += '\n {' + field + '}"';
        });

        if (!firstItem) {
            str += '\n';
        }

        str += ' ]';
        return str;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceModelFormatField.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * Describes a field of a message.
 */
class DeviceModelFormatField {
    // Instance "variables"/properties...see constructor.

    /**
     *
     * @param {string} name
     * @param {string} description
     * @param {string} type
     * @param {boolean} optional
     */
    constructor(name, description, type, optional) {
        this.name = name;
        this.description = description;
        this.optional = optional;

        if (DeviceModelAttribute.Type.hasOwnProperty(type)) {
            this.type = type;
        } else {
            this.type = null;
        }
    }


    /**
     * @return {string}
     */
    getName() {
        return this.name;
    }


    /**
     * @return {string} - DeviceModelAttribute.Type
     */
    getType() {
        return this.type;
    }


    /**
     * @return {boolean}
     */
    isOptional() {
        return this.optional;
    }

    /**
     * @return {string}
     */
    toString() {
        let str = 'name = ' + this.name +
        ', description = ' + this.description +
        ', type = ' + this.type +
        ', optional = ' + this.optional + 'optional';

        return str;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DevicePolicyFunction.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

class DevicePolicyFunction {
    // Instance "variables"/properties...see constructor.

    /**
     * Create a point.
     *
     * @param {string} id - The ID of the function.
     * @param {Map<string, object>} parameters - The parameters of the function.
     */
    constructor(id, parameters) {
        // Instance "variables"/properties.
        /** @type {string} */
        this.id = id;
        /** @type {Map<string, Set<Function>>} */
        this.parameters = '';

        if (parameters && parameters.size !== 0) {
            this.parameters = parameters;
        } else {
            this.parameters = new Map();
        }
    }

    /**
     * Returns the function's ID.
     *
     * @return {string} the function's ID.
     */
    getId() {
        return this.id;
    }

    /**
     * Returns the function's parameters.
     *
     * @return {Map<String, object>} the function's parameters.
     */
    getParameters() {
        return this.parameters;
    }
//
// @Override public boolean equals(Object obj) {
//     if (this == obj) return true;
//     if (obj == null || obj.getClass() != DevicePolicy.Function.class) {
//         return false;
//     }
//     return this.id.equals(((DevicePolicy.Function)obj).id);
// }
//
// @Override
// public int hashCode() {
//     return this.id.hashCode();
// }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DevicePolicy.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

class DevicePolicy {
    // Instance "variables"/properties...see constructor.

    /**
     *
     * @param id
     * @param deviceModelUrn
     * @param description
     * @param {Map<string, Set<DevicePolicyFunction>>} pipelines
     * @param enabled
     * @param lastModified
     */
    constructor(id, deviceModelUrn, description, pipelines, enabled, lastModified) {
        // Instance "variables"/properties.
        this.id = id;
        this.deviceModelUrn = deviceModelUrn;
        this.description = description;
        this.pipelines = pipelines;
        this.enabled = enabled;
        this.lastModified = lastModified;
        // Instance "variables"/properties.
    }

    /**
     * Converts a JSON representation of a device policy to a DevicePolicy object.
     *
     * @param {string} deviceModelUrn
     * @param {string} devicePolicyJson
     * @return {DevicePolicy} a device policy from a JSON representation of a device policy.
     */
    static fromJson(deviceModelUrn, devicePolicyJson) {
        // This *should* be a JSON representation of a device policy, but it might also be an array
        // of items of device policies.
        let devicePolicyJsonTmp = JSON.parse(devicePolicyJson);
        let devicePolicyJsonObj;

        if (devicePolicyJsonTmp && devicePolicyJsonTmp.items && (devicePolicyJsonTmp.count > 0)) {
            devicePolicyJsonObj = devicePolicyJsonTmp.items[0];
        } else if (devicePolicyJsonTmp && devicePolicyJsonTmp.pipelines) {
            devicePolicyJsonObj = devicePolicyJsonTmp;
        } else {
            return null;
        }

        /** @type {Map<string, Set<DevicePolicyFunction>>} */
        let pipelines = new Map();
        let pipelinesAry = devicePolicyJsonObj.pipelines;

        for (let i = 0; i < devicePolicyJsonObj.pipelines.length; i++) {
            /** @type {string} */
            let attributeName = devicePolicyJsonObj.pipelines[i].attributeName;
            /** @type {pipeline[]} */
            let pipelineAry = devicePolicyJsonObj.pipelines[i].pipeline;
            /** @type {Set<DevicePolicyFunction>} */
            let functions = new Set();

            for (let j = 0; j < pipelineAry.length; j++) {
                let functionObj = pipelineAry[j];
                /** @type {string} */
                let functionId = functionObj.id;
                /** @type {Map<string, object>} */
                let parameterMap = new Map();
                let parameters = functionObj.parameters;

                for (let parameterName of Object.keys(parameters)) {
                    let parameterValue = parameters[parameterName];

                    if ("action" === parameterName) {
                        parameterMap.set("name", parameterValue.name);
                        let args = parameterValue.arguments;

                        if (args && args.length > 0) {
                            /** @type {Set<object>} */
                            let argumentList = new Set();

                            for (let a = 0; a < arguments.length; a++) {
                                /** @type {object} */
                                let argTmp = arguments[a];
                                argumentList.add(argTmp);
                            }

                            parameterMap.set("arguments", argumentList);
                        }
                    } else if ("alert" === parameterName) {
                        let urn = parameterValue.urn;
                        parameterMap.set("urn", urn);
                        let fields = parameterValue.fields;
                        /** @type {Map<string, object>} */
                        let fieldMap = new Map();

                        for (let fieldName of Object.keys(fields)) {
                            let fieldValue = fields[fieldName];
                            fieldMap.set(fieldName, fieldValue);
                        }

                        parameterMap.set("fields", fieldMap);

                        if (parameterValue.severity) {
                            parameterMap.set("severity", parameterValue.severity);
                        }
                    } else {
                        parameterMap.set(parameterName, parameterValue);
                    }
                }

                functions.add(new DevicePolicyFunction(functionId, parameterMap));
            }

            pipelines.set(attributeName, functions);
        }

        return new DevicePolicy(devicePolicyJsonObj.id, deviceModelUrn,
            devicePolicyJsonObj.description, pipelines, devicePolicyJsonObj.enabled,
            devicePolicyJsonObj.lastModified);
    }

    /**
     * Get the free form description of the device policy.
     *
     * @return {string} the description of the model.
     */
    getDescription() {
        return this.description;
    }

    /**
     * Get the target device model URN.
     *
     * @return {string} the URN of the target device model
     */
    getDeviceModelUrn() {
        return this.deviceModelUrn;
    }

    /**
     * Returns the policy ID.
     *
     * @return {string} the policy ID.
     */
    getId() {
        return this.id;
    }

    /**
     * Get the date of last modification.
     *
     * @return {number} the date of last modification.
     */
    getLastModified() {
        return this.lastModified;
    }

    /**
     * Get the function pipeline of this policy for an attribute.
     *
     * @param {string} attributeName the name of the attribute to retrieve the pipeline for.
     * @return {Set} a read-only Set of {@link DevicePolicyFunction}.
     */
    getPipeline(attributeName) {
        if (attributeName) {
            return this.pipelines.get(attributeName);
        } else {
            return this.pipelines.get(DevicePolicy.ALL_ATTRIBUTES);
        }
    }

    /**
     * Get all the pipelines of this policy. The map key is an attribute name, the value is the
     * pipeline for that attribute.
     *
     * @return {Map<string, Set<DevicePolicyFunction>>} the pipelines of this policy.
     */
    getPipelines() {
        return this.pipelines;
    }

    /**
     * Get the {@code enabled} state of the device policy.
     *
     * @return {boolean} {@code true} if the policy is enabled.
     */
    isEnabled() {
        return this.enabled;
    }

// @Override public boolean equals(Object obj) {
//     if (this == obj) return true;
//     if (obj == null || obj.getClass() != DevicePolicy.class) {
//         return false;
//     }
//     return this.id.equals(((DevicePolicy)obj).id);
// }
//
// @Override
// public int hashCode() {
//     return this.id.hashCode();
// }
//
// public DevicePolicy(String id,
//     String deviceModelURN,
// Map<String, List<Function>> pipelines,
//     String description,
//     long lastModified,
//     boolean enabled)
// {
//     this.id = id;
//     this.deviceModelURN = deviceModelURN;
//
//     this.deviceIds = new HashSet<String>();
//
//     this.pipelines = new HashMap<String,List<Function>>();
//     if (pipelines) {
//         this.pipelines.putAll(pipelines);
//     }
//
//     this.description = description;
//     this.lastModified = lastModified;
//     this.enabled = enabled;
// }
}

DevicePolicy.ALL_ATTRIBUTES = '*';


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceModelParser.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//* @return {Promise<DeviceModel>}
class DeviceModelParser {
    /**
     * Returns a DeviceModel from a JSON string or object representation of a Device model.
     * @type {string|object}
     * @return {DeviceModel|null}
     */
    static fromJson(deviceModelJson) {
        if (!deviceModelJson) {
            return null;
        }

        let deviceModelJsonObj;

        // Is this a device model JSON string or object?  We need an object.
        if (deviceModelJson.hasOwnProperty('urn')) {
            deviceModelJsonObj = deviceModelJson;
        } else {
            deviceModelJsonObj = JSON.parse(deviceModelJson);
        }

        DeviceModelParser.printDeviceActions(deviceModelJsonObj.actions);
        DeviceModelParser.printDeviceAttributes(deviceModelJsonObj.attributes);
        DeviceModelParser.printDeviceFormats(deviceModelJsonObj.formats);
        let deviceModelActions = [];
        let deviceModelAttributes = [];
        let deviceModelFormats = [];

        if (deviceModelJsonObj.actions) {
            deviceModelJsonObj.actions.forEach(action => {
                deviceModelActions.push(new DeviceModelAction());
            });
        }

        if (deviceModelJsonObj.attributes) {
            deviceModelJsonObj.attributes.forEach(attribute => {
                deviceModelAttributes.push(new DeviceModelAttribute(deviceModelJson.urn,
                    attribute.name, attribute.description, attribute.type, attribute.lowerBound,
                    attribute.upperBound, attribute.access, attribute.alias,
                    attribute.defaultValue));
            });
        }

        if (deviceModelJsonObj.formats) {
            deviceModelJsonObj.formats.forEach(format => {
                let fields = [];

                if (format.fields) {
                    //format.value.fields?
                    format.fields.forEach(field => {
                        fields.push(new DeviceModelFormatField(field.name, field.description,
                            field.type, field.optional));
                    });
                }

                deviceModelFormats.push(new DeviceModelFormat(format.urn, format.name,
                    format.description, format.type, fields));
            });
        }

        return new DeviceModel(deviceModelJsonObj.urn, deviceModelJsonObj.name,
            deviceModelJsonObj.description, deviceModelAttributes,
            deviceModelActions, deviceModelFormats);
    }

    static printDeviceActions(actionsJson) {
        if (actionsJson) {
            for (let i = 0; i < actionsJson.length; i++) {
                let action = actionsJson[i];
            }
        }
    }

    static printDeviceAttributes(attributesJson) {
        if (attributesJson) {
            for (let i = 0; i < attributesJson.length; i++) {
                let attribute = attributesJson[i];
            }
        }
    }

    static printDeviceFormats(formatsJson) {
        if (formatsJson) {
            for (let i = 0; i < formatsJson.length; i++) {
                let format = formatsJson[i];
            }
        }
    }
}

//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceAnalog.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

class DeviceAnalog {
    // Instance "variables" & properties...see constructor.

    /**
     *
     * @param {$impl.DirectlyConnectedDevice} directlyConnectedDevice
     * @param {DeviceModel} deviceModel
     * @param {string} endpointId the endpoint ID of the DirectlyConnectedDevice with this device
     * model.
     */
    constructor(directlyConnectedDevice, deviceModel, endpointId) {
        // Instance "variables" & properties.
        /**
         *
         * @type {Map<String, Object>}
         */
        this.attributeValueMap = new Map();
        /**
         *
         * @type {$impl.DirectlyConnectedDevice}
         */
        this.directlyConnectedDevice = directlyConnectedDevice;
        /**
         *
         * @type {DeviceModel}
         */
        this.deviceModel = deviceModel;
        /**
         *
         * @type {string}
         */
        this.endpointId = endpointId;
        // Instance "variables" & properties.
    }

    /**
     *
     * @param {string} actionName
     * @param {object[]} args
     */
    call(actionName, args) {
        // @type {Map<string, DeviceModelAction}
        const deviceModelActionMap = this.deviceModel.getDeviceModelActions();

        if (!deviceModelActionMap) {
            return;
        }

        // @type {DeviceModelAction}
        const deviceModelAction = deviceModelActionMap.get(actionName);

        if (!deviceModelAction) {
            return;
        }

        // @type {DeviceModelAttribute.Type}
        const argType = deviceModelAction.getArgType();

        // TODO: currently, call only supports one arg
        // @type {object}
        const arg = args != null && args.length > 0 ? args[0] : null;

        // What this is doing is pushing a request message into the message
        // queue for the requested action. To the LL, it is handled just like
        // any other RequestMessage. But we don't want this RM going to the
        // server, so the source and destination are set to be the same
        // endpoint id. In SendReceiveImpl, if there is a RequestMessage
        // with a source == destination, it is treated it specially.
        // @type {object}
        let requestMessage = new Object();

        requestMessage.payload = {
            body: '',
            method: 'POST',
            url: "deviceModels/" + this.getDeviceModel().getUrn() + "/actions/" + actionName
        };

        requestMessage.destination = this.getEndpointId();
        requestMessage.source = this.getEndpointId();
        requestMessage.type = lib.message.Message.Type.REQUEST;

        // Check arg for correct type.
        if (argType) {
            if (!arg) {
                return;
            }

            // @type {boolean}
            let goodArg = false;

            switch (argType) {
                case 'number':
                    if (goodArg = (typeof arg === 'number')) {
                        // @type {number}
                        const number = arg;
                        // @type {string}
                        let value;

                        if (argType === DeviceModelAttribute.Type.INTEGER) {
                            value = Math.round(number);
                        } else {
                            value = number;
                        }

                        requestMessage.body = '{"value":' + value + '}';

                        // Assumption here is that lowerBound <= upperBound.
                        // @type {number}
                        const val = arg;

                        if (deviceModelAction.getUpperBound()) {
                            // @type {number}
                            const upper = deviceModelAction.getUpperBound();

                            if (val > upper) {
                                // This is a warning.
                                console.log(this.getDeviceModel().getUrn() + ' action "' +
                                    actionName + '" arg out of range: ' + val + ' > ' + upper);
                                // Even though the arg is out of range, pass it to the action.
                                // TODO is this the right thing to do?
                            }
                        }

                        if (deviceModelAction.getLowerBound()) {
                            // @type {number}
                            const lower = deviceModelAction.getLowerBound();

                            if(val < lower) {
                                // This is a warning.
                                console.log(this.getDeviceModel().getUrn() + ' action "' +
                                    actionName + '" arg out of range: ' + val + ' < ' + lower);
                                // Even though the arg is out of range, pass it to the action.
                                // TODO is this the right thing to do?
                            }
                        }

                    }

                    break;
                case 'datetime':
                    goodArg = (arg instanceof Date) || (typeof arg === 'number');

                    if (goodArg) {
                        // @type {string}
                        let value;

                        if (arg instanceof Date) {
                            value = arg.getTime();
                        } else {
                            value = arg
                        }

                        requestMessage.body = '{"value":' + value + '}';
                    }

                    break;
                case 'boolean':
                    if (goodArg = (typeof arg === 'boolean')) {
                        requestMessage.body = '{"value":' + arg + '}';
                    }

                    break;
                case 'string':
                case 'uri':
                    if (goodArg = (typeof arg === 'string')) {
                        requestMessage.body = '{"value":' + arg + '}';
                    }

                    break;
                default:
                    // This is a warning.
                    console.log('Unexpected type ' + argType);
                    goodArg = false;
            }

            if (!goodArg) {
                // This is a warning.
                console.log(this.getDeviceModel().getUrn() + ' action "' + actionName +
                    '": Wrong argument type. "' + 'Expected ' + argType + ' found ' + typeof arg);

                return;
            }
        }

        // @type {boolean}
        // const useLongPolling = (process.env['com.oracle.iot.client.disable_long_polling']);
        const useLongPolling = false;
        // Assumption here is that, if you are using long polling, you are using message dispatcher.
        // This could be a bad assumption. But if long polling is disabled, putting the message on
        // the request buffer will work regardless of whether message dispatcher is used.
        if (useLongPolling) {
            try {
                // @type {Message} (ResponseMessage)
                const responseMessage =
                    new lib.device.util.RequestDispatcher().dispatch(requestMessage);
            } catch (error) {
                console.log(error);
            }
        } else {
            // Not long polling, push request message back on request buffer.
            try {
                // @type {Message} (ResponseMessage)
                const responseMessage =
                    new lib.device.util.RequestDispatcher().dispatch(requestMessage);
            } catch (error) {
                console.log(error);
            }
        }
    }

    /**
     * @param {string} attributeName
     * @return {object}
     */
    getAttributeValue(attributeName) {
        /** {$impl.Attribute} */
        let deviceModelAttribute = this.deviceModel.getDeviceModelAttributes().get(attributeName);

        if (deviceModelAttribute === null) {
            throw new Error(this.deviceModel.getUrn() + " does not contain attribute " + attributeName);
        }

        let value = this.attributeValueMap.get(attributeName);

        if (value === null) {
            value = deviceModelAttribute.defaultValue;
        }

        return value;
    }


    /**
     * {DeviceModel}
     */
    getDeviceModel() {
        return this.deviceModel;
    }

    /**
     *
     * @return {string}
     */
    getEndpointId() {
        return this.directlyConnectedDevice.getEndpointId();
    }

    /**
     * @param {Message} message
     */
    queueMessage(message) {
        try {
            this.directlyConnectedDevice.dispatcher.queue(message);
        } catch(error) {
            console.log('Error queueing message: ' + error);
        }
    }

    /**
     * Set the named attribute to the given value.
     *
     * @param {string} attribute the attribute to set
     * @param {object} value the value of the attribute
     * @throws IllegalArgumentException if the attribute is not in the device model,
     * the value is {@code null}, or the value does not match the attribute type.
     */
    setAttributeValue(attribute, value) {
        if (value === null) {
            throw new Error("value cannot be null");
        }

        let deviceModelAttribute = this.deviceModel.getDeviceModelAttributes().get(attribute);

        if (!deviceModelAttribute) {
            throw new Error(this.deviceModel.getUrn() + " does not contain attribute " + attribute);
        }

        // {DeviceModelAttribute.Type}
        let type = deviceModelAttribute.type;
        let badValue;

        switch (type) {
            // TODO: e don't need all of these types in JavaScript.
            case DeviceModelAttribute.Type.DATETIME:
            case DeviceModelAttribute.Type.INTEGER:
            case DeviceModelAttribute.Type.NUMBER:
                badValue = !(typeof value === 'number');
                break;
            case DeviceModelAttribute.Type.STRING:
            case DeviceModelAttribute.Type.URI:
                badValue = !(typeof value === 'string');
                break;
            case DeviceModelAttribute.Type.BOOLEAN:
                badValue = !(typeof value ==='boolean');
                break;
            default:
                throw new Error('Unknown type ' + type);
        }

        if (badValue) {
            throw new Error("Cannot set '"+ this.deviceModel.getUrn() + ":attribute/" + attribute + "' to " +
                value.toString());
        }

        this.attributeValueMap.set(attribute, value);
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DirectlyConnectedDeviceImpl.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This is the private, internal directly-connected device which supports the low-level API
 * lib.device.util.DirectlyConnectedDevice.
 */
/** @ignore */
$impl.DirectlyConnectedDevice = function (taStoreFile, taStorePassword, dcd, gateway) {
    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    if (dcd) {
        // The "parent", low-level API DCD associated with this internal DCD.
        Object.defineProperty(this._, 'parentDcd', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: dcd
        });
    }

    if (gateway) {
        Object.defineProperty(this._, 'gateway', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: gateway
        });
    }

    Object.defineProperty(this._, 'tam',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: new lib.device.TrustedAssetsManager(taStoreFile, taStorePassword)
    });

    Object.defineProperty(this._, 'bearer',{
        enumerable: false,
        configurable: true,
        writable: false,
        value: ""
    });

    Object.defineProperty(this._, 'activating',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: false
    });

    Object.defineProperty(this._, 'refreshing',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: false
    });

    var self = this;

    Object.defineProperty(this._, 'getCurrentServerTime',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            if (typeof self._.serverDelay === 'undefined') {
                return Date.now();
            } else {
                return (Date.now() + self._.serverDelay);
            }
        }
    });

    Object.defineProperty(this._, 'refresh_bearer',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (activation, callback) {
            self._.refreshing = true;

            var inputToSign = self._.tam.buildClientAssertion();

            if (!inputToSign) {
                self._.refreshing = false;
                var error1 = lib.createError('error on generating oauth signature');
                if (callback) {
                    callback(error1);
                }
                return;
            }

            var dataObject = {
                grant_type: 'client_credentials',
                client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                client_assertion: inputToSign,
                scope: (activation ? 'oracle/iot/activation' : '')
            };

            var payload = $port.util.query.stringify(dataObject, null, null, {encodeURIComponent: $port.util.query.unescape});

            payload = payload.replace(new RegExp(':', 'g'),'%3A');

            var options = {
                path: $impl.reqroot + '/oauth2/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                tam: self._.tam
            };

            $impl.protocolReq(options, payload, function (response_body, error) {
                self._.refreshing = false;

                if (!response_body || error || !response_body.token_type || !response_body.access_token) {
                    if (error) {
                        var exception = null;
                        try {
                            exception = JSON.parse(error.message);
                            var now = Date.now();
                            if (exception.statusCode && (exception.statusCode === 400)) {
                                if (exception.body) {
                                    try{
                                        var body = JSON.parse(exception.body);
                                        if ((body.currentTime) && (typeof self._.serverDelay === 'undefined') && (now < parseInt(body.currentTime))) {
                                            Object.defineProperty(self._, 'serverDelay', {
                                                enumerable: false,
                                                configurable: false,
                                                writable: false,
                                                value: (parseInt(body.currentTime) - now)
                                            });
                                            Object.defineProperty(self._.tam, 'serverDelay', {
                                                enumerable: false,
                                                configurable: false,
                                                writable: false,
                                                value: (parseInt(body.currentTime) - now)
                                            });
                                            self._.refresh_bearer(activation, callback);
                                            return;
                                        }
                                    } catch (e) {}
                                }
                                if (activation) {
                                    self._.tam.setEndpointCredentials(self._.tam.getClientId(), null);
                                    self._.refresh_bearer(false, function (error) {
                                        self._.activating = false;
                                        if (error) {
                                            callback(null, error);
                                            return;
                                        }
                                        callback(self);
                                    });
                                    return;
                                }
                            }
                        } catch (e) {}
                        if (callback) {
                            callback(error);
                        }
                    } else {
                        if (callback) {
                            callback(new Error(JSON.stringify(response_body)));
                        }
                    }
                    return;
                }

                delete self._.bearer;
                Object.defineProperty(self._, 'bearer',{
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: (response_body.token_type + ' ' + response_body.access_token)
                });

                if (callback) {
                    callback();
                }
            }, null, self);
        }
    });

    Object.defineProperty(this._, 'storage_authToken',{
        enumerable: false,
        configurable: true,
        writable: false,
        value: ""
    });

    Object.defineProperty(this._, 'storageContainerUrl',{
        enumerable: false,
        configurable: true,
        writable: false,
        value: ""
    });

    Object.defineProperty(this._, 'storage_authTokenStartTime',{
        enumerable: false,
        configurable: true,
        writable: false,
        value: ""
    });

    Object.defineProperty(this._, 'storage_refreshing',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: false
    });

    Object.defineProperty(this._, 'refresh_storage_authToken',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (callback) {
            self._.storage_refreshing = true;

            var options = {
                path: $impl.reqroot + '/provisioner/storage',
                method: 'GET',
                headers: {
                    'Authorization': self._.bearer,
                    'X-EndpointId': self._.tam.getEndpointId()
                },
                tam: self._.tam
            };
            var refresh_function = function (response, error) {
                self._.storage_refreshing = false;

                if (!response || error || !response.storageContainerUrl || !response.authToken) {
                    if (error) {
                        if (callback) {
                            callback(error);
                        }
                    } else {
                        self._.refresh_storage_authToken(callback);
                    }
                    return;
                }

                delete self._.storage_authToken;
                Object.defineProperty(self._, 'storage_authToken',{
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: response.authToken
                });

                delete self._.storageContainerUrl;
                Object.defineProperty(self._, 'storageContainerUrl',{
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: response.storageContainerUrl
                });

                delete self._.storage_authTokenStartTime;
                Object.defineProperty(self._, 'storage_authTokenStartTime',{
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: Date.now()
                });

                if (callback) {
                    callback();
                }
            };
            $impl.protocolReq(options, "", refresh_function, function() {
                self._.refresh_storage_authToken(callback);
            }, self);
        }
    });

    if (this.isActivated()) {
        var persistenceStore = PersistenceStoreManager.get(this._.tam.getEndpointId());
        let devicePolicyManager = new DevicePolicyManager(this);

        if (devicePolicyManager) {
            persistenceStore
                .openTransaction()
                .putOpaque('DevicePolicyManager', devicePolicyManager)
                .commit();
        }
    }
};

/** @ignore */
$impl.DirectlyConnectedDevice.prototype.activate = function (deviceModelUrns, callback) {
    _mandatoryArg(deviceModelUrns, 'array');
    _mandatoryArg(callback, 'function');

    var self = this;

    if (this.isActivated()) {
        lib.error('Cannot activate an already activated device.');
        return;
    }

    // #############################################################
    // CS 1.1 Server still has enrollment compliant with REST API v1
    //function enroll(host, port, id, secret, cert, device_register_handler) {

    function private_get_policy(error) {
        if (error) {
            callback(null, lib.createError('error on get policy for activation', error));
            return;
        }

        var options = {
            path: $impl.reqroot + '/activation/policy?OSName=' + $port.os.type() + '&OSVersion=' + $port.os.release(),
            method: 'GET',
            headers: {
                'Authorization': self._.bearer,
                'X-ActivationId': self._.tam.getClientId()
            },
            tam: self._.tam
        };

        $impl.protocolReq(options, "", function (response_body, error) {
            if (!response_body || error || !response_body.keyType || !response_body.hashAlgorithm || !response_body.keySize) {
                self._.activating = false;
                callback(null, lib.createError('error on get policy for activation', error));
                return;
            }
            private_key_generation_and_activation(response_body);
        }, null, self);
    }

    function private_key_generation_and_activation(parsed) {
        var algorithm = parsed.keyType;
        var hashAlgorithm = parsed.hashAlgorithm;
        var keySize = parsed.keySize;
        var isGenKeys = null;

        try {
            isGenKeys = self._.tam.generateKeyPair(algorithm, keySize);
        } catch (e) {
            self._.activating = false;
            callback(null, lib.createError('keys generation failed on activation',e));
            return;
        }

        if (!isGenKeys) {
            self._.activating = false;
            callback(null, lib.createError('keys generation failed on activation'));
            return;
        }

        var content = self._.tam.getClientId();

        var payload = {};

        try {
            var client_secret = self._.tam.signWithSharedSecret(content, 'sha256', null);
            var publicKey = self._.tam.getPublicKey();
            publicKey = publicKey.substring(publicKey.indexOf('----BEGIN PUBLIC KEY-----')
                + '----BEGIN PUBLIC KEY-----'.length,
                publicKey.indexOf('-----END PUBLIC KEY-----')).replace(/\r?\n|\r/g, "");

            var toBeSigned = forge.util.bytesToHex(forge.util.encodeUtf8(self._.tam.getClientId() + '\n' + algorithm + '\nX.509\nHmacSHA256\n'))
                + forge.util.bytesToHex(client_secret)
                + forge.util.bytesToHex(forge.util.decode64(publicKey));
            toBeSigned = forge.util.hexToBytes(toBeSigned);

            var signature = forge.util.encode64(self._.tam.signWithPrivateKey(toBeSigned, 'sha256'));

            payload = {
                certificationRequestInfo: {
                    subject: self._.tam.getClientId(),
                    subjectPublicKeyInfo: {
                        algorithm: algorithm,
                        publicKey: publicKey,
                        format: 'X.509',
                        secretHashAlgorithm: 'HmacSHA256'
                    },
                    attributes: {}
                },
                signatureAlgorithm: hashAlgorithm,
                signature: signature,
                deviceModels: deviceModelUrns
            };
        } catch (e) {
            self._.activating = false;
            callback(null, lib.createError('certificate generation failed on activation',e));
            return;
        }

        var options = {
            path : $impl.reqroot + '/activation/direct'
                    + (lib.oracle.iot.client.device.allowDraftDeviceModels ? '' : '?createDraft=false'),
            method : 'POST',
            headers : {
                'Authorization' : self._.bearer,
                'X-ActivationId' : self._.tam.getClientId()
            },
            tam: self._.tam
        };

        $impl.protocolReq(options, JSON.stringify(payload), function (response_body, error) {

            if (!response_body || error || !response_body.endpointState || !response_body.endpointId) {
                self._.activating = false;
                callback(null,lib.createError('invalid response on activation',error));
                return;
            }

            if(response_body.endpointState !== 'ACTIVATED') {
                self._.activating = false;
                callback(null,lib.createError('endpoint not activated: '+JSON.stringify(response_body)));
                return;
            }

            try {
                self._.tam.setEndpointCredentials(response_body.endpointId, response_body.certificate);
                var persistenceStore = PersistenceStoreManager.get(self._.tam.getEndpointId());

                persistenceStore
                    .openTransaction()
                    .putOpaque('DevicePolicyManager', new DevicePolicyManager(self))
                    .commit();
            } catch (e) {
                self._.activating = false;
                callback(null,lib.createError('error when setting credentials on activation',e));
                return;
            }

            self._.refresh_bearer(false, function (error) {
                self._.activating = false;

                if (error) {
                    callback(null,lib.createError('error on authorization after activation',error));
                    return;
                }

                try {
                    self.registerDevicePolicyResource();
                } catch (error) {
                    console.log("Could not register device policy resource: " + error);
                }

                callback(self);
            });
        }, null, self);
    }

    self._.activating = true;

    // implementation-end of end-point auth/enroll method

    // ####################################################################################
    self._.refresh_bearer(true, private_get_policy);
};

/** @ignore */
$impl.DirectlyConnectedDevice.prototype.isActivated = function () {
    return this._.tam.isActivated();
};

/** @ignore */
$impl.DirectlyConnectedDevice.prototype.getEndpointId = function () {
    return this._.tam.getEndpointId();
};

/** @ignore */
$impl.DirectlyConnectedDevice.prototype.registerDevicePolicyResource = function() {
    if (!this.isActivated()) {
        return;
    }

    // Note: Any changes here should also be made in MessageDispatcher.  This should really not be
    // here.  It should reference the handlerMethods in MessageDispatcher.
    var handlerMethods = {
        "deviceModels/urn:oracle:iot:dcd:capability:device_policy/policyChanged": "PUT",
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/counters": 'GET',
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/reset": 'PUT',
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/pollingInterval": 'GET,PUT',
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/info": 'GET',
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/testConnectivity": 'GET,PUT'
    };

    var resources = [];

    resources.push(lib.message.Message.ResourceMessage.Resource.buildResource(
        "urn:oracle:iot:dcd:capability:device_policy",
        "deviceModels/urn:oracle:iot:dcd:capability:device_policy/policyChanged",
        'PUT',
        lib.message.Message.ResourceMessage.Resource.Status.ADDED,
        this._.tam.getEndpointId()));

        var resourceMessage = lib.message.Message.ResourceMessage.buildResourceMessage(
            resources,
            this._.parentDcd.getEndpointId(),
            lib.message.Message.ResourceMessage.Type.UPDATE,
            lib.message.Message.ResourceMessage.getMD5ofList(Object.keys(handlerMethods)))
        .source(this._.parentDcd.getEndpointId())
        .priority(lib.message.Message.Priority.HIGHEST);

    this._.parentDcd.send([resourceMessage], function(messages, error) {
        if (error) {
            console.log('Error registering device policy resources.  ' + error);
        }
    });
};

/** @ignore */
function _getUtf8BytesLength(string) {
    return forge.util.createBuffer(string, 'utf8').length();
}

/** @ignore */
function _optimizeOutgoingMessage(obj) {
    if (!__isArgOfType(obj, 'object')) { return; }
    if (_isEmpty(obj.properties)) { delete obj.properties; }
    return obj;
}

/** @ignore */
function _updateURIinMessagePayload(payload) {
    if (payload.data) {
        Object.keys(payload.data).forEach(function (key) {
            if (payload.data[key] instanceof lib.ExternalObject) {
                payload.data[key] = payload.data[key].getURI();
            }
        });
    }
    return payload;
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DirectlyConnectedDeviceUtil.js

/**
 * Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * @namespace
 * @alias iotcs.device.util
 * @memberOf iotcs.device
 */
lib.device.util = {};

/**
 * A directly-connected device is able to send messages to,
 * and receive messages from, the IoT server. When the
 * directly-connected device is activated on the server, the
 * server assigns a logical-endpoint identifier. This
 * logical-endpoint identifier is required for sending
 * messages to, and receiving messages from, the server.
 * <p>
 * The directly-connected device is able to activate itself using
 * the direct activation capability. The data required for activation
 * and authentication is retrieved from a TrustedAssetsStore generated
 * using the TrustedAssetsProvisioner tool using the Default TrustedAssetsManager.
 * <p>
 * This object represents the low-level API for the directly-connected device
 * and uses direct methods for sending or receiving messages.
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 * @param {boolean} [gateway] - indicate creation of a GatewayDevice representation
 *
 * @memberOf iotcs.device.util
 * @alias DirectlyConnectedDevice
 * @class
 */
lib.device.util.DirectlyConnectedDevice = function (taStoreFile, taStorePassword, gateway) {
    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    var maxAcceptBytes = lib.oracle.iot.client.device.requestBufferSize;
    var receive_message_queue = [];
    var sending = false;
    var self = this;
    var dcd = new $impl.DirectlyConnectedDevice(taStoreFile, taStorePassword, self, gateway);

    /** This keeps the dcd object private and unavailable to applications. */
    Object.defineProperty(this._, 'internalDev',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: dcd
    });

    Object.defineProperty(this._, 'get_received_message',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            if (receive_message_queue.length > 0) {
                return receive_message_queue.splice(0, 1)[0];
            } else {
                return null;
            }
        }
    });

    /**
     * Sends the messages in 'messages' and receives incoming messages and calls deliveryCallback or
     * errorCallback.
     *
     * @param {message[]} messages
     * @param {function(message[])} deliveryCallback Callback for successfully sent messages.
     * @param {function(message[], error)} errorCallback Callback for errors for sent messages.
     * @param {boolean} longPolling {@code true} to enable long polling.
     * @param {number} timeout the number of milliseconds to wait to hear a response from the
     *                 server before giving up.
     */
    Object.defineProperty(this._, 'send_receive_messages',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(messages, deliveryCallback, errorCallback, longPolling, timeout) {
            if (!dcd.isActivated()) {
                var error = lib.createError('device not yet activated');
                if (errorCallback) {
                    errorCallback(messages, error);
                }
                return;
            }

            try {
                lib.message.Message.checkMessagesBoundaries(messages);
            } catch (e) {
                if (errorCallback) {
                    errorCallback(messages, e);
                }
                return;
            }

            var bodyArray = [];
            var i;
            var len = messages.length;

            // Construct the messages to be sent.
            for (i = 0; i < len; i++) {
                var messagePush = messages[i].getJSONObject();
                if (self._.internalDev._.serverDelay) {
                    bodyArray.push(_optimizeOutgoingMessage({
                        clientId: messagePush.clientId,
                        source: messagePush.source,
                        destination: messagePush.destination,
                        sender: messagePush.sender,
                        priority: messagePush.priority,
                        reliability: messagePush.reliability,
                        eventTime: messagePush.eventTime + self._.internalDev._.serverDelay,
                        type: messagePush.type,
                        properties: messagePush.properties,
                        payload: _updateURIinMessagePayload(messagePush.payload)
                    }));
                } else {
                    messagePush.payload = _updateURIinMessagePayload(messagePush.payload);
                    bodyArray.push(_optimizeOutgoingMessage(messagePush));
                }
            }

            var post_body = JSON.stringify(bodyArray);
            debug('DirectlyConnectedDeviceUtil.send_receive_messages post_body = ' + post_body);
            var acceptBytes = maxAcceptBytes - _getUtf8BytesLength(JSON.stringify(receive_message_queue));

            if ((typeof acceptBytes !== 'number') || isNaN(acceptBytes) || (acceptBytes < 0) || (acceptBytes > maxAcceptBytes)) {
                var error1 = lib.createError('bad acceptBytes query parameter');
                if (errorCallback) {
                    errorCallback(messages, error1);
                }
                return;
            }
            var options = {
                path: $impl.reqroot + '/messages?acceptBytes=' + acceptBytes + (longPolling ? '&iot.sync' : '') + (timeout ? ('&iot.timeout=' + timeout) : ''),
                method: 'POST',
                headers: {
                    'Authorization': dcd._.bearer,
                    'X-EndpointId': dcd._.tam.getEndpointId(),
                    'Content-Length': Buffer.byteLength(post_body, 'utf-8')
                },
                tam: dcd._.tam
            };

            // Send the messages.
            $impl.protocolReq(options, post_body, function (response_body, error, dcdUtil) {
                if (!response_body || error) {
                    var err = error;

                    if (messages.length > 0) {
                        err = lib.createError('Error on sending messages, will re-try some.',
                            error);

                        // Re-queue messages with retries remaining.
                        messages.forEach(message => {
                            if ((message.remainingRetries > 0) ||
                                (message._.internalObject.reliability &&
                                    message._.internalObject.reliability === 'GUARANTEED_DELIVERY'))
                            {
                                if (dcdUtil.dispatcher) {
                                    dcdUtil.dispatcher.queue(message);

                                    message._.internalObject.remainingRetries =
                                        message.remainingRetries - 1;
                                }
                            }
                        });
                    }

                if (errorCallback) {
                        errorCallback(messages, err);
                    }

                    return;
                }

                // Messages were successfully sent.
                var messagePersistenceImpl = MessagePersistenceImpl.getInstance();

                // Guaranteed delivery messages are the only ones persisted.  Now that they're
                // sent, we need delete them from message persistence.
                if (messagePersistenceImpl) {
                    messages.forEach(message => {
                        if (message._.internalObject.reliability ===
                            lib.message.Message.Reliability.GUARANTEED_DELIVERY)
                        {
                            messagePersistenceImpl.delete(messages);
                        }
                    });
                }

                // Receive any messages coming in and add them to the receive_message_queue.
                if (Array.isArray(response_body) && response_body.length > 0) {
                    var i;
                    for (i = 0; i < response_body.length; i++) {
                        receive_message_queue.push(response_body[i]);
                    }
                } else if ((typeof response_body === 'object') && (response_body['x-min-acceptbytes'] !== 0)) {
                    var acceptBytes1 = maxAcceptBytes - _getUtf8BytesLength(JSON.stringify(receive_message_queue));
                    var bytes = parseInt(response_body['x-min-acceptbytes']);
                    if (bytes > maxAcceptBytes) {
                        lib.createError('The server has a request of ' + bytes +
                            ' bytes for this client, which is too large for the '+maxAcceptBytes+
                            ' byte request buffer. Please restart the client with larger value for the maxAcceptBytes property.');
                    } else if (bytes > acceptBytes1) {
                        lib.createError('The server has a request of ' + bytes +
                            ' which cannot be sent because the ' + maxAcceptBytes +
                            ' byte request buffer is filled with ' + (maxAcceptBytes - acceptBytes1) +
                            ' of unprocessed requests.');
                    }
                }

                if (deliveryCallback) {
                    deliveryCallback(messages);
                }

            }, function () {
                self._.send_receive_messages(messages, deliveryCallback, errorCallback, longPolling, timeout);
            }, dcd, self);
        }
    });

    Object.defineProperty(this._, 'isStorageAuthenticated', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            return (dcd._.storageContainerUrl && dcd._.storage_authToken);
        }
    });

    Object.defineProperty(this._, 'isStorageTokenExpired', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            // period in minutes recalculated in milliseconds
            return ((dcd._.storage_authTokenStartTime + lib.oracle.iot.client.storageTokenPeriod * 60000) < Date.now());
        }
    });

    Object.defineProperty(this._, 'sync_storage', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (storage, deliveryCallback, errorCallback, processCallback, timeout) {
            if (!dcd.isActivated()) {
                var error = lib.createError('device not yet activated');
                if (errorCallback) {
                    errorCallback(storage, error);
                }
                return;
            }

            if (!self._.isStorageAuthenticated() || self._.isStorageTokenExpired()) {
                dcd._.refresh_storage_authToken(function() {
                    self._.sync_storage(storage, deliveryCallback, errorCallback, processCallback, timeout);
                });
                return;
            }

            if (!storage.getURI()) {
                var path;
                var disableVirtualStorageDirectories =
                    process.env.com_oracle_iot_client_disable_storage_object_prefix;

                if (disableVirtualStorageDirectories && (disableVirtualStorageDirectories == "true")) {
                    path = storage.getName();
                } else {
                    path = dcd._.tam.getEndpointId() + '/' + storage.getName();
                }

                storage._.setURI(dcd._.storageContainerUrl + "/" + path);
            }

            var urlObj = require('url').parse(storage.getURI(), true);

            var options = {
                path: urlObj.path,
                host: urlObj.host,
                hostname: urlObj.hostname,
                port: urlObj.port || lib.oracle.iot.client.storageCloudPort,
                protocol: urlObj.protocol.slice(0, -1),
                headers: {
                    'X-Auth-Token': dcd._.storage_authToken
                }
            };

            if (storage.getInputStream()) {
                // Upload file
                options.method = "PUT";
                options.headers['Transfer-Encoding'] = "chunked";
                options.headers['Content-Type'] = storage.getType();
                var encoding = storage.getEncoding();
                if (encoding) options.headers['Content-Encoding'] = encoding;
            } else {
                // Download file
                options.method = "GET";
            }

            $port.https.storageReq(options, storage, deliveryCallback, function(error) {
                if (error) {
                    var exception = null;
                    try {
                        exception = JSON.parse(error.message);
                        if (exception.statusCode && (exception.statusCode === 401)) {
                            dcd._.refresh_storage_authToken(function () {
                                self._.sync_storage(storage, deliveryCallback, errorCallback, processCallback, timeout);
                            });
                            return;
                        }
                    } catch (e) {}
                    errorCallback(storage, error, -1);
                }
            }, processCallback);
        }
    });

    if (dcd._.tam.getServerScheme && (dcd._.tam.getServerScheme().indexOf('mqtt') > -1)) {

        /*Object.defineProperty(this._, 'receiver',{
            enumerable: false,
            configurable: false,
            writable: true,
            value: function (messages, error) {
                if (!messages || error) {
                    lib.createError('invalid message', error);
                    return;
                }
                if (Array.isArray(messages) && messages.length > 0) {
                    var acceptBytes = maxAcceptBytes - _getUtf8BytesLength(JSON.stringify(receive_message_queue));
                    if (acceptBytes >= _getUtf8BytesLength(JSON.stringify(messages))) {
                        var i;
                        for (i = 0; i < messages.length; i++) {
                            receive_message_queue.push(messages[i]);
                        }
                    } else {
                        lib.createError('not enough space for receiving messages');
                    }
                }
            }
        });*/

        var messageRegisterMonitor = null;
        messageRegisterMonitor = new $impl.Monitor(function () {
            if (!dcd.isActivated()) {
                return;
            }

            if (messageRegisterMonitor) {
                messageRegisterMonitor.stop();
            }

            /*$impl.protocolRegister($impl.reqroot + '/messages', function (message, error) {
                self._.receiver(message, error);
            }, dcd);*/

            $impl.protocolRegister($impl.reqroot + '/messages/acceptBytes', function (message, error) {
                var acceptBytes1 = maxAcceptBytes - _getUtf8BytesLength(JSON.stringify(receive_message_queue));
                var logMessage = (error ? error.message : JSON.stringify(message));
                var buffer = forge.util.createBuffer(logMessage, 'utf8');
                var bytes = buffer.getInt32();
                if (bytes > maxAcceptBytes) {
                    lib.createError('The server has a request of ' + bytes +
                        ' bytes for this client, which is too large for the '+maxAcceptBytes+
                        ' byte request buffer. Please restart the client with larger value for the maxAcceptBytes property.');
                } else if (bytes > acceptBytes1) {
                    lib.createError('The server has a request of ' + bytes +
                        ' which cannot be sent because the ' + maxAcceptBytes +
                        ' byte request buffer is filled with ' + (maxAcceptBytes - acceptBytes1) +
                        ' of unprocessed requests.');
                }
            }, dcd);
        });
        messageRegisterMonitor.start();
    }

    try {
        dcd.registerDevicePolicyResource();
    } catch (error) {
        console.log("Could not register device policy resource: " + error);
    }
};

/**
 * Activate the device. The device will be activated on the
 * server if necessary. When the device is activated on the
 * server. The activation would tell the server the models that
 * the device implements. Also the activation can generate
 * additional authorization information that will be stored in
 * the TrustedAssetsStore and used for future authentication
 * requests. This can be a time/resource consuming operation for
 * some platforms.
 * <p>
 * If the device is already activated, this method will throw
 * an exception. The user should call the isActivated() method
 * prior to calling activate.
 *
 * @param {string[]} deviceModelUrns - an array of deviceModel
 * URNs implemented by this directly connected device
 * @param {function} callback - the callback function. This
 * function is called with this object but in the activated
 * state. If the activation is not successful then the object
 * will be null and an error object is passed in the form
 * callback(device, error) and the reason can be taken from
 * error.message
 *
 * @memberOf iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function activate
 */
lib.device.util.DirectlyConnectedDevice.prototype.activate = function (deviceModelUrns, callback) {
    if (this.isActivated()) {
        lib.error('cannot activate an already activated device');
        return;
    }

    _mandatoryArg(deviceModelUrns, 'array');
    _mandatoryArg(callback, 'function');

    deviceModelUrns.forEach(function (urn) {
        _mandatoryArg(urn, 'string');
    });

    var deviceModels = deviceModelUrns;
    deviceModels.push('urn:oracle:iot:dcd:capability:direct_activation');
    deviceModels.push('urn:oracle:iot:dcd:capability:device_policy');
    var self = this;
    this._.internalDev.activate(deviceModels, function(activeDev, error) {
        if (!activeDev || error) {
            callback(null, error);
            return;
        }
        callback(self);
    });
};

/**
 * This will return the directly connected device state.
 *
 * @returns {boolean} whether the device is activated.
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function isActivated
 */
lib.device.util.DirectlyConnectedDevice.prototype.isActivated = function () {
    return this._.internalDev.isActivated();
};

/**
 * Return the logical-endpoint identifier of this
 * directly-connected device. The logical-endpoint identifier
 * is assigned by the server as part of the activation
 * process.
 *
 * @returns {string} the logical-endpoint identifier of this
 * directly-connected device.
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function getEndpointId
 */
lib.device.util.DirectlyConnectedDevice.prototype.getEndpointId = function () {
    return this._.internalDev.getEndpointId();
};

/**
 *
 * @param {Message[]} messages
 */
lib.device.util.DirectlyConnectedDevice.prototype.offer = function (messages) {
    if (this.isActivated()) {
        // We need to distinguish between an empty list of messages
        // that has been passed in versus an empty list of message
        // that has resulted from policies being applied.
        // So if the list we receive is empty, let send handle it.
        if (!messages || (messages.size === 0)) {
            this.send(messages, function(messages, error) {
                if (error) {
                    console.log('Error sending offered messages: ' + error);
                }
            });
        }

        // @type {PersistenceStore}
        const persistenceStore = PersistenceStoreManager.get(this.getEndpointId());
        // @type {MessagePolicyImpl}
        let messagingPolicyImpl;
        // @type {object}
        const mpiObj = persistenceStore.getOpaque('MessagingPolicyImpl', null);

        if (!mpiObj) {
                messagingPolicyImpl = new MessagingPolicyImpl(this);

                persistenceStore
                    .openTransaction()
                    .putOpaque('MessagingPolicyImpl', messagingPolicyImpl)
                    .commit();

                // @type {DevicePolicyManager}
                const devicePolicyManager =
                    DevicePolicyManager.getDevicePolicyManager(this.getEndpointId());
                devicePolicyManager.addChangeListener(messagingPolicyImpl);
            } else {
                messagingPolicyImpl = mpiObj;
            }

        // Now we know here that messages list is not empty.
        // If the message list is not empty after applying policies,
        // then send the messages. If it is empty after applying the
        // policies, then there is nothing to send because messages
        // were filtered, or are aggregating values (e.g., mean policy).
        // @type {Set<Message>}
        messages.forEach(message => {
            // @type {Message[]}
            messagingPolicyImpl.applyPolicies(message).then(messagesFromPolicies => {
                if (messagesFromPolicies) {
                    this.send(messagesFromPolicies, function(messages, error) {
                        if (error) {
                            console.log('Error sending offered messages: ' + error);
                        }
                    });
                }
            });
        });
    } else {
        throw new Error("Device not activated.");
    }
};

/**
 * This method is used for sending messages to the server.
 * If the directly connected device is not activated an exception
 * will be thrown. If the device is not yet authenticated the method
 * will try first to authenticate the device and then send the messages.
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function send
 *
 * @param {iotcs.message.Message[]} messages - An array of the messages to be sent
 * @param {function} callback - The callback function. This
 * function is called with the messages that have been sent and in case of error
 * the actual error from sending as the second parameter.
 */
lib.device.util.DirectlyConnectedDevice.prototype.send = function (messages, callback) {
    if (!this.isActivated()) {
        lib.error('device not activated yet');
        return;
    }

    _mandatoryArg(messages, 'array');
    _mandatoryArg(callback, 'function');

    messages.forEach(function (message) {
        _mandatoryArg(message, lib.message.Message);
    });

    this._.send_receive_messages(messages, callback, callback);
};

/**
 * This method is used for retrieving messages. The DirectlyConnectedDevice
 * uses an internal buffer for the messages received that has a size of
 * 4192 bytes. When this method is called and there is at least one message
 * in the buffer, the first message from the buffer is retrieved. If no
 * message is in the buffer a force send of an empty message is tried so to
 * see if any messages are pending on the server side for the device and if there
 * are, the buffer will be filled with them and the first message retrieved.
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function receive
 *
 * @param {number} [timeout] - The forcing for retrieving the pending messages
 * will be done this amount of time.
 * @param {function} callback - The callback function. This function is called
 * with the first message received or null is no message is received in the
 * timeout period.
 */
lib.device.util.DirectlyConnectedDevice.prototype.receive = function (timeout, callback) {
    if (!this.isActivated()) {
        lib.error('device not activated yet');
        return;
    }

    if (typeof  timeout === 'function') {
        callback = timeout;
    } else {
        _optionalArg(timeout, 'number');
    }
    _mandatoryArg(callback, 'function');

    var message = this._.get_received_message();
    if (message) {
        callback(message);
    } else {
        var self = this;
        var startTime = Date.now();
        var monitor = null;
        var handleReceivedMessages = function () {
            message = self._.get_received_message();
            if (message || (timeout && (Date.now() > (startTime + timeout)))) {
                if (monitor) {
                    monitor.stop();
                }
                callback(message);
            }
        };
        var handleSendReceiveMessages = function () {
            if (self._.internalDev._.refreshing) {
                return;
            }
            self._.send_receive_messages([], handleReceivedMessages, handleReceivedMessages);
        };
        if (self._.receiver) {
            monitor = new $impl.Monitor(handleReceivedMessages);
            monitor.start();
        } else if (lib.oracle.iot.client.device.disableLongPolling || self._.internalDev._.mqttController) {
            monitor = new $impl.Monitor(handleSendReceiveMessages);
            monitor.start();
        } else {
            self._.send_receive_messages([], handleReceivedMessages, handleReceivedMessages, true, (typeof timeout === 'number' ? Math.floor(timeout/1000) : null));
        }
    }
};

/**
 * Get the device model for the urn.
 *
 * @param {string} deviceModelUrn - The URN of the device model
 * @param {function} callback - The callback function. This
 * function is called with the following argument: a
 * deviceModel object holding full description e.g. <code>{ name:"",
 * description:"", fields:[...], created:date,
 * isProtected:boolean, lastModified:date ... }</code>.
 * If an error occurs the deviceModel object is null
 * and an error object is passed: callback(deviceModel, error) and
 * the reason can be taken from error.message
 *
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function getDeviceModel
 */
lib.device.util.DirectlyConnectedDevice.prototype.getDeviceModel = function (deviceModelUrn, callback) {
    new $impl.DeviceModelFactory().getDeviceModel(this, deviceModelUrn, callback);
};

/**
 * This method will close this directly connected device (client) and
 * all it's resources. All monitors required by the message dispatcher
 * associated with this client will be stopped, if there is one.
 *
 * @see {@link iotcs.device.util.MessageDispatcher}
 * @memberof iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function close
 */
lib.device.util.DirectlyConnectedDevice.prototype.close = function () {
    if (this.dispatcher) {
        this.dispatcher._.stop();
    }
    if (this.storageDispatcher) {
        this.storageDispatcher._.stop();
    }
};

/**
 * Create a new {@link iotcs.StorageObject}.
 *
 * <p>
 * createStorageObject method works in two modes:
 * </p><p>
 * 1. device.createStorageObject(name, type) -
 * Create a new {@link iotcs.StorageObject} with given object name and mime&ndash;type.  If
 * contentType is null, the mime type defaults to "application/octet-stream".  Create a new
 * {@code StorageObject} that will have a name with the given object name prefixed with the device's
 * endpoint ID and a directory separator. The prefix addition can be disabled by setting the
 * {@code com_oracle_iot_client_disable_storage_object_prefix} environment variable to {@code true}.  Used for
 * uploading a storage object.
 * </p><pre>
 * Parameters:
 * {String} name - the unique name to be used to reference the content in storage
 * {?String} [type] - The mime-type of the content. If <code>type</code> is <code>null</code> or omitted,
 * the mime&ndash;type defaults to {@link iotcs.StorageObject.MIME_TYPE}.
 *
 * Returns:
 * {iotcs.StorageObject} StorageObject
 * </pre><p>
 * 2. device.createStorageObject(uri, callback) -
 * Create a new {@link iotcs.StorageObject} from the URL for a named object in storage and return it in a callback.
 * </p><pre>
 * Parameters:
 * {String} url - the URL of the object in the storage cloud
 * {function(storage, error)} callback - callback called once the getting storage data completes.
 * </pre>
 *
 * @param {String} arg1 - first argument
 * @param {String | function} arg2 - second argument
 *
 * @see {@link http://www.iana.org/assignments/media-types/media-types.xhtml|IANA Media Types}
 * @memberOf iotcs.device.util.DirectlyConnectedDevice.prototype
 * @function createStorageObject
 */
lib.device.util.DirectlyConnectedDevice.prototype.createStorageObject = function (arg1, arg2) {
    _mandatoryArg(arg1, "string");
    var storage = null;

    if ((typeof arg2 === "string") || (typeof arg2 === "undefined") || arg2 === null) {
        // DirectlyConnectedDevice.createStorageObject(name, type)
        storage = new lib.StorageObject(null, arg1, arg2);
        storage._.setDevice(this);
        return storage;
    } else {
        // DirectlyConnectedDevice.createStorageObject(uri, callback)
        _mandatoryArg(arg2, "function");
        if (!this.isActivated()) {
            lib.error('device not activated yet');
            return;
        }
        var url = arg1;
        var callback = arg2;
        var self = this;
        if (!this._.isStorageAuthenticated() || this._.isStorageTokenExpired()) {
            self._.internalDev._.refresh_storage_authToken(function() {
                self.createStorageObject(url, callback);
            });
        } else {
            var fullContainerUrl = this._.internalDev._.storageContainerUrl + "/";
            // url starts with fullContainerUrl
            if (url.indexOf(fullContainerUrl) !== 0) {
                callback(null, new Error("Storage Cloud URL is invalid."));
                return;
            }
            var name = url.substring(fullContainerUrl.length);
            var urlObj = require('url').parse(url, true);
            var options = {
                path: urlObj.path,
                host: urlObj.host,
                hostname: urlObj.hostname,
                port: urlObj.port || lib.oracle.iot.client.storageCloudPort,
                protocol: urlObj.protocol,
                method: "HEAD",
                headers: {
                    'X-Auth-Token': this._.internalDev._.storage_authToken
                },
                rejectUnauthorized: true,
                agent: false
            };

            debug("Request: " + new Date().getTime());
            debug(options.path);
            debug(options);

            var protocol = options.protocol.indexOf("https") !== -1 ? require('https') : require('http');
            var req = protocol.request(options, function (response) {

                debug();
                debug("Response: " + response.statusCode + ' ' + response.statusMessage);
                debug(response.headers);

                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('end', function () {
                    if (response.statusCode === 200) {
                        var type = response.headers["content-type"];
                        var encoding = response.headers["content-encoding"];
                        var date = new Date(Date.parse(response.headers["last-modified"]));
                        var len = parseInt(response.headers["content-length"]);
                        storage = new lib.StorageObject(url, name, type, encoding, date, len);
                        storage._.setDevice(self);
                        callback(storage);
                    } else if (response.statusCode === 401) {
                        self._.internalDev._.refresh_storage_authToken(function () {
                            self.createStorageObject(url, callback);
                        });
                    } else {
                        var e = new Error(JSON.stringify({
                            statusCode: response.statusCode,
                            statusMessage: (response.statusMessage ? response.statusMessage : null),
                            body: body
                        }));
                        callback(null, e);
                    }
                });
            });
            req.on('timeout', function () {
                callback(null, new Error('connection timeout'));
            });
            req.on('error', function (error) {
                callback(null, error);
            });
            req.end();
        }
    }
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/FormulaParser.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

class FormulaParser {
    // Instance "variables"/properties...see constructor.
    /**
     *
     * @param {FormulaParserNode} left
     * @param {FormulaParserNode} right
     * @return {number}
     */
    static comparePrecedence(left, right) {
        return FormulaParserOperation.getPrecedence(left.getOperation()) -
            FormulaParserOperation.getPrecedence(right.getOperation());
    }

    static dump(node) {
        if (!node) {
            return null;
        }

        if (node instanceof FormulaParserTerminal) {
            let s = node.getValue();

            if (node.type === FormulaParserTerminal.Type.IN_PROCESS_ATTRIBUTE) {
                s = "$(".concat(s).concat(")");
            } else if (node.type === FormulaParserTerminal.Type.CURRENT_ATTRIBUTE) {
                s = "$(".concat(s).concat(")");
            }

            return s;
        }

        const lhs = FormulaParser.dump(node.getLeftHandSide());
        const rhs = FormulaParser.dump(node.getRightHandSide());

        const operation = node.getOperation();
        return "["+operation + "|" + lhs + "|" + rhs + "]";
    }

    //
    // additiveExpression
    //     : multiplicativeExpression (PLUS multiplicativeExpression | MINUS multiplicativeExpression )*
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     * @param stack (Stack<Node>)
     * @param tokens (Set<Token>)
     * @param formula (string)
     * @param index (int)
     */
    static parseAdditiveExpression(stack, tokens, formula, index) {
        if (index >= tokens.size) {
            return tokens.size();
        }

        index = FormulaParser.parseMultiplicativeExpression(stack, tokens, formula, index);

        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];
        let lhs;

        switch (token.getType()) {
            case FormulaParserToken.Type.PLUS:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.PLUS, stack.pop());
                index += 1;
                break;
            case FormulaParserToken.Type.MINUS:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.MINUS, stack.pop());
                index += 1;
                break;
            default:
                return index;
        }

        index = FormulaParser.parseAdditiveExpression(stack, tokens, formula, index);
        stack.push(FormulaParser.prioritize(lhs, stack.pop()));

        return index;
    }

    //
    // args
    //     : conditionalOrExpression
    //     | conditionalOrExpression COMMA args
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseArgs(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        let previous = null;

        while (index < tokens.size) {
            index = FormulaParser.parseConditionalOrExpression(stack, tokens, formula, index);
            let arg = previous === null ? stack.peek() : stack.pop();

            if (previous !== null) {
                previous.setRightHandSide(arg);
            }

            previous = arg;
            const tokensAry = Array.from(tokens);
            const current = tokensAry[index];

            switch (current.getType()) {
                case FormulaParserToken.Type.COMMA:
                    index += 1;
                    break;
                default:
                    return index;
            }
        }

        return index;
    }


//
    // brackettedExpression
    //     : LPAREN conditionalOrExpression RPAREN
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseBrackettedExpression(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];

        switch (token.getType()) {
            case FormulaParserToken.Type.LPAREN: {
                index = FormulaParser.parseConditionalOrExpression(stack, tokens, formula,
                    index + 1);

                let current = FormulaParser.peekSet(tokens, index);

                if (current.getType() !== FormulaParserToken.Type.RPAREN) {
                    throw new TypeError("term: Found " + current.getType() + " @ " +
                        current.getPos() + " expected RPAREN");
                }

                stack.push(new FormulaParserNode(FormulaParserOperation.Op.GROUP, stack.pop()));
                index += 1; // consume RPAREN
            }
        }

        return index;
    }

    //
    // conditionalAndExpression
    //     : valueLogical ( AND valueLogical )*
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     * Takes a formula as a string along with the tokens present in the formula
     *
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseConditionalAndExpression(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        index = FormulaParser.parseValueLogical(stack, tokens, formula, index);

        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];

        let lhs;

        switch (token.getType()) {
            case FormulaParserToken.Type.AND:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.AND, stack.pop());
                index += 1;
                break;
            default:
                return index;
        }

        index = FormulaParser.parseConditionalAndExpression(stack, tokens, formula, index);
        stack.push(FormulaParser.prioritize(lhs, stack.pop()));

        return index;
    }


    // conditionalOrExpression
    //     : conditionalAndExpression ( OR conditionalAndExpression )*
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseConditionalOrExpression(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        index = FormulaParser.parseConditionalAndExpression(stack, tokens, formula, index);

        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];
        let lhs;

        switch (token.getType()) {
            case FormulaParserToken.Type.OR:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.OR, stack.pop());
                index += 1;
                break;
            default:
                return index;
        }

        index = FormulaParser.parseConditionalOrExpression(stack, tokens, formula, index);
        stack.push(FormulaParser.prioritize(lhs, stack.pop()));

        return index;
    }

    //
    // expressionElement
    //     : IDENT | NUMBER | propertyRef
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseExpressionElement(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];

        switch (token.getType()) {
            case FormulaParserTerminal.Type.IDENT: {
                const value = formula.substring(token.getPos(), token.getPos() + token.getLength());
                stack.push(new FormulaParserTerminal(FormulaParserTerminal.Type.IDENT, value));
                index += 1; // consume IDENT
                break;
            }
            case FormulaParserTerminal.Type.NUMBER: {
                const value = formula.substring(token.getPos(), token.getPos() + token.getLength());
                stack.push(new FormulaParserTerminal(FormulaParserTerminal.Type.NUMBER, value));
                index += 1; // consume NUMBER
                break;
            }
            default: {
                index = FormulaParser.parsePropertyRef(stack, tokens, formula, index);
                break;
            }
        }

        return index;
    }

    // formula
    //    : numericExpression
    //    | ternaryExpression
    //    ;
    //
    // returns the root of the AST
    /**
     * @param {Set<FormulaParserToken>} tokens
     * @param {string} formula
     * @return {FormulaParserNode}
     */
    static parseFormula(tokens, formula) {
        // @type {Stack<Node>}
        const stack = new Stack();
        let index = -1;

        try {
            index = FormulaParser.parseNumericExpression(stack, tokens, formula, 0);
        } catch (error) {
            // drop through = try as conditional expression
        }

        if (index < tokens.size) {
            stack.clear();
            index = FormulaParser.parseTernaryExpression(stack, tokens, formula, 0);
        }

        let tokensAry = Array.from(tokens);

        if (index < tokens.size) {
            // @type {FormulaParserToken}
            const lastToken = tokensAry[index];
            throw new Error('Formula: parser bailed @ ' + lastToken.pos);
        }

        return stack.get(0);
    }

    //
    // functionElement
    //     : FUNCTION (args)? RPAREN
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseFunctionElement(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];

        switch (token.getType()) {
            case FormulaParserToken.Type.FUNCTION: {
                const next = FormulaParser.peekSet(tokens, index + 1);
                // token.getLength()-1 to strip off LPAREN
                const value = formula.substring(token.getPos(), token.getPos() +
                    token.getLength() - 1);

                // FUNCTION operation has function name on LHS, args chaining from RHS to RHS
                const func = new FormulaParserNode(FormulaParserOperation.Op.FUNCTION,
                    new FormulaParserTerminal(FormulaParserTerminal.Type.IDENT, value));

                if (next.getType() === FormulaParserToken.Type.RPAREN) {
                    // no-arg function
                } else {
                    // FUNCTION arg [, arg]* )
                    index = FormulaParser.parseArgs(stack, tokens, formula, index + 1);
                    func.setRightHandSide(stack.pop());
                    let current = FormulaParser.peekSet(tokens, index);

                    if (current.getType() !== FormulaParserToken.Type.RPAREN) {
                        throw new TypeError("term: Found " + current.getType() + " @ " +
                            current.getPos() + ". Expected RPAREN");
                    }

                    index += 1;
                }

                stack.push(func);
                index += 1; // consume RPAREN
                break;
            }
        }

        return index;
    }


    //
    // multiplicativeExpression
    //     : exponentiationExpression (MUL exponentiationExpression | DIV exponentiationExpression |
    // MOD exponentiationExpression)*
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseMultiplicativeExpression(stack, tokens, formula, index) {
        if (index >= tokens.size) {
            return tokens.size;
        }

        index = FormulaParser.parseUnaryExpression(stack, tokens, formula, index);

        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];
        let lhs;

        switch (token.getType()) {
            case FormulaParserToken.Type.MUL:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.MUL, stack.pop());
                index += 1;
                break;
            case FormulaParserToken.Type.DIV:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.DIV, stack.pop());
                index += 1;
                break;
            case FormulaParserToken.Type.MOD:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.MOD, stack.pop());
                index += 1;
                break;
            default:
                return index;
        }

        index = FormulaParser.parseMultiplicativeExpression(stack, tokens, formula, index);
        stack.push(FormulaParser.prioritize(lhs, stack.pop()));

        return index;
    }

    //
    // numericExpression
    //     : additiveExpression
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     *
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseNumericExpression(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        return FormulaParser.parseAdditiveExpression(stack, tokens, formula, index);
    }

    //
    // primaryExpression
    //     : brackettedExpression
    //     | functionElement
    //     | expressionElement
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     *
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parsePrimaryExpression(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        let newIndex = FormulaParser.parseBrackettedExpression(stack, tokens, formula, index);

        if (newIndex === index) {
            newIndex = FormulaParser.parseFunctionElement(stack, tokens, formula, index);
            if (newIndex === index) {
                newIndex = FormulaParser.parseExpressionElement(stack, tokens, formula, index);
            }
        }

        if (newIndex === index) {
            throw new TypeError(
                "parsePrimaryExpression: expected [brackettedExpression|functionElement|expressionElement]"
            );
        }

        return newIndex;
    }

    //
    // propertyRef
    //     : DOLLAR? ATTRIBUTE IDENT RPAREN
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     *
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parsePropertyRef(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];

        switch (token.getType()) {
            case FormulaParserToken.Type.ATTRIBUTE:
            case FormulaParserToken.Type.DOLLAR: {
                let current = token;

                // Handle attribute, which is $? $( IDENT )
                let dollarCount = 0;

                while (current.getType() === FormulaParserToken.Type.DOLLAR) {
                    dollarCount += 1;

                    if (dollarCount > 1) {
                        throw new TypeError("term: " + current.getType() + " @ " +
                            current.getPos() + " not expected");
                    }

                    index += 1;
                    current = FormulaParser.peekSet(tokens, index);
                }

                const attrType = FormulaParserTerminal.getTypeValue(dollarCount);

                if (current.getType() !== FormulaParserToken.Type.ATTRIBUTE) {
                    throw new TypeError("term: Found " + current.getType() + " @ " +
                        current.getPos() + ". Expected ATTRIBUTE");
                }

                index += 1;
                current = FormulaParser.peekSet(tokens, index);

                if (current.getType() !== FormulaParserToken.Type.IDENT) {
                    throw new TypeError("term: Found " + current.getType() + " @ " +
                        current.getPos() + ". Expected IDENT");}

                const value = formula.substring(current.getPos(), current.getPos() +
                    current.getLength());

                index += 1;
                current = FormulaParser.peekSet(tokens, index);

                if (current.getType() !== FormulaParserToken.Type.RPAREN) {
                    throw new TypeError("term: Found " + current.getType() + " @ " +
                        current.getPos() + ". Expected RPAREN");
                }

                stack.push(new FormulaParserTerminal(attrType, value));
                index += 1; // consume RPAREN
                break;
            }
        }

        return index;
    }


    //
    // relationalExpression
    //     : numericExpression (EQ numericExpression | NEQ numericExpression | LT numericExpression | GT numericExpression | LTE numericExpression | GTE numericExpression )?
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     *
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseRelationalExpression(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        index = FormulaParser.parseNumericExpression(stack, tokens, formula, index);

        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];
        let lhs;

        switch (token.getType()) {
            case FormulaParserToken.Type.EQ:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.EQ, stack.pop());
                index += 1;
                break;
            case FormulaParserToken.Type.NEQ:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.NEQ, stack.pop());
                index += 1;
                break;
            case FormulaParserToken.Type.LT:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.LT, stack.pop());
                index += 1;
                break;
            case FormulaParserToken.Type.LTE:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.LTE, stack.pop());
                index += 1;
                break;
            case FormulaParserToken.Type.GT:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.GT, stack.pop());
                index += 1;
                break;
            case FormulaParserToken.Type.GTE:
                lhs = new FormulaParserNode(FormulaParserOperation.Op.GTE, stack.pop());
                index += 1;
                break;
            default:
                return index;
        }

        index = FormulaParser.parseRelationalExpression(stack, tokens, formula, index);
        stack.push(FormulaParser.prioritize(lhs, stack.pop()));

        return index;
    }

    // ternaryExpression
    //     : conditionalOrExpression QUESTION_MARK additiveExpression COLON additiveExpression
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     *
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseTernaryExpression(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        index = FormulaParser.parseConditionalOrExpression(stack, tokens, formula, index);
        let tokensAry = Array.from(tokens);
        let token = tokensAry[index];

        if (token.getType() !== FormulaParserToken.Type.QUESTION_MARK) {
            throw new TypeError("parseTernaryExpression: found " + token +
                ", expected QUESTION_MARK");
        }

        let ternary = new FormulaParserNode(FormulaParserOperation.Op.TERNARY, stack.pop());
        index = FormulaParser.parseAdditiveExpression(stack, tokens, formula, index + 1);
        tokensAry = Array.from(tokens);
        token = tokensAry[index];

        if (token.getType() !== FormulaParserToken.Type.COLON) {
            throw new TypeError("parseTernaryExpression: found " + token + ", expected COLON");
        }

        let alternatives = new FormulaParserNode(FormulaParserOperation.Op.ALTERNATIVE, stack.pop());
        ternary.setRightHandSide(alternatives);
        index = FormulaParser.parseAdditiveExpression(stack, tokens, formula, index+1);
        alternatives.setRightHandSide(stack.pop());
        stack.push(ternary);

        return index;
    }

    //
    // unaryExpression
    //     : NOT primaryExpression
    //     | PLUS primaryExpression
    //     | MINUS primaryExpression
    //     | primaryExpression
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     *
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseUnaryExpression(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        const tokensAry = Array.from(tokens);
        const token = tokensAry[index];

        switch (token.getType()) {
            case FormulaParserToken.Type.NOT: {
                index = FormulaParser.parsePrimaryExpression(stack, tokens, formula, index + 1);
                stack.push(new FormulaParserNode(FormulaParserOperation.Op.NOT, stack.pop()));
                break;
            }
            case FormulaParserToken.Type.PLUS: {
                index = FormulaParser.parsePrimaryExpression(stack, tokens, formula, index + 1);
                stack.push(new FormulaParserNode(FormulaParserOperation.Op.UNARY_PLUS, stack.pop()));
                break;
            }
            case FormulaParserToken.Type.MINUS: {
                index = FormulaParser.parsePrimaryExpression(stack, tokens, formula, index + 1);
                stack.push(new FormulaParserNode(FormulaParserOperation.Op.UNARY_MINUS, stack.pop()));
                break;
            }
            default: {
                index = FormulaParser.parsePrimaryExpression(stack, tokens, formula, index);
                break;
            }
        }

        return index;
    }

    //
    // valueLogical
    //     : relationalExpression
    //     ;
    //
    // returns the index of the next token to be processed.
    /**
     *
     * @param stack (Stack<Node>)
     * @param tokens (Set<FormulaParserToken>)
     * @param formula (string)
     * @param index (int)
     */
    static parseValueLogical(stack, tokens, formula, index)  {
        if (index >= tokens.size) {
            return tokens.size;
        }

        return FormulaParser.parseRelationalExpression(stack, tokens, formula, index);
    }

    /**
     *
     * @param tokens Set<FormulaParserToken>
     * @param offset int
     */
    static peekSet(tokens, offset) {
        let index = 0 <= offset && offset <= tokens.size - 1 ? offset : tokens.size - 1;
        const tokensAry = Array.from(tokens);
        return tokensAry[index];
    }

    /**
     *
     * @param {string} str
     * @param {number} offset
     * @return {string}
     */
    static peekString(str, offset) {
        return (offset < str.length) ? str.charAt(offset) : '\0';
    }

    // left hand side needs to have higher precedence than right hand side
    // so that post-fix traversal does higher precedence operations first.
    // The swap on compare == 0 ensures the remaining operations are left-to-right.
    /**
     * @param lhs (Node)
     * @param rhs (Node)
     */
    static prioritize(lhs, rhs) {
        if (rhs.getOperation() !== FormulaParserOperation.Op.TERMINAL) {
            let c = FormulaParser.comparePrecedence(lhs, rhs);

            if (c === 0) {
                lhs.setRightHandSide(rhs.getLeftHandSide());
                const rightHandSide = rhs.getRightHandSide();
                rhs.setLeftHandSide(lhs);
                rhs.setRightHandSide(rightHandSide);
                return rhs;
            } else if (c > 0) {
                const leftHandSide = rhs.getLeftHandSide();
                rhs.setLeftHandSide(lhs);
                lhs.setRightHandSide(leftHandSide);
                return lhs;
            } else {
                lhs.setRightHandSide(rhs);
                return lhs;
            }
        } else {
            lhs.setRightHandSide(rhs);
            return lhs;
        }
    }

    /**
     * Takes a formula as a string and returns the Set of tokens in the formula.
     *
     * @param {string} formula
     * @return {Set<FormulaParserToken>}
     */
    static tokenize(formula) {
        const tokens = new Set();
        let pos = 0;
        let tokenType = null;

        for (let i = 0; i < formula.length; ++i) {
            let type = tokenType;
            let length = i - pos;
            const ch = formula.charAt(i);

            switch (ch) {
                case '(':
                    type = FormulaParserToken.Type.LPAREN;
                    break;
                case ')':
                    type = FormulaParserToken.Type.RPAREN;
                    break;
                case ',':
                    type = FormulaParserToken.Type.COMMA;
                    break;
                case '?':
                    type = FormulaParserToken.Type.QUESTION_MARK;
                    break;
                case ':':
                    type = FormulaParserToken.Type.COLON;
                    break;
                case '+':
                    type = FormulaParserToken.Type.PLUS;
                    break;
                case '-':
                    if (tokenType !== FormulaParserToken.Type.IDENT) {
                        type = FormulaParserToken.Type.MINUS;
                    }

                    break;
                case '*':
                    type = FormulaParserToken.Type.MUL;
                    break;
                case '/':
                    type = FormulaParserToken.Type.DIV;
                    break;
                case '%':
                    type = FormulaParserToken.Type.MOD;
                    break;
                case '=': {
                    type = FormulaParserToken.Type.EQ;
                    let peekChar = FormulaParser.peekString(formula, i + 1);

                    // Be forgiving of '=='.
                    if (peekChar === '=') {
                        i += 1;
                    }

                    break;
                }
                case '!': {
                    let peekChar = FormulaParser.peekString(formula, i + 1);

                    if (peekChar === '=') {
                        type = FormulaParserToken.Type.NEQ;
                        i += 1;
                    } else {
                        type = FormulaParserToken.Type.NOT;
                    }

                    break;
                }
                case '>': {
                    let peekChar = FormulaParser.peekString(formula, i + 1);

                    if (peekChar === '=') {
                        type = FormulaParserToken.Type.GTE;
                        i += 1;
                    } else {
                        type = FormulaParserToken.Type.GT;
                    }

                    break;
                }
                case '<': {
                    let peekChar = FormulaParser.peekString(formula, i + 1);

                    if (peekChar === '=') {
                        type = FormulaParserToken.Type.LTE;
                        i += 1;
                    } else {
                        type = FormulaParserToken.Type.LT;
                    }

                    break;
                }
                case '|': {
                    let peekChar = FormulaParser.peekString(formula, i + 1);

                    if (peekChar === '|') {
                        type = FormulaParserToken.Type.OR;
                        i += 1;
                    }

                    break;
                }
                case '&': {
                    let peekChar = FormulaParser.peekString(formula, i + 1);

                    if (peekChar === '&') {
                        type = FormulaParserToken.Type.AND;
                        i += 1;
                    }

                    break;
                }
                // The $ case needs to be in double quotes otherwise the build will fail.
                case "$": {
                    let peekChar = FormulaParser.peekString(formula, i + 1);

                    if (peekChar === '(') {
                        type = FormulaParserToken.Type.ATTRIBUTE;
                        i += 1;
                    } else {
                        type = FormulaParserToken.Type.DOLLAR;
                    }

                    break;
                }
               default:
                    if (ch === ' ') {
                        type = FormulaParserToken.Type.WS;
                    } else if (tokenType !== FormulaParserToken.Type.IDENT) {
                        if (Number.isInteger(parseInt(ch))) {
                            type = FormulaParserToken.Type.NUMBER;
                        } else if (ch === '.') {
                            // [0-9]+|[0-9]*"."[0-9]+
                            if (tokenType !== FormulaParserToken.Type.NUMBER) {
                                let peekChar = FormulaParser.peekString(formula, i + 1);

                                if (Number.isInteger(parseInt(peekChar))) {
                                    type = FormulaParserToken.Type.NUMBER;
                                    i += 1;
                                } else {
                                    throw new TypeError("Found '" + peekChar + "' @ " + i + 1 +
                                        ": expected [0-9]");
                                }
                            }
                        } else {
                            type = FormulaParserToken.Type.IDENT;
                        }
                    }

                   break;
            }

            // Add previous token when lexer hits a new token.
            if (tokenType !== type) {
                if (tokenType === FormulaParserToken.Type.IDENT) {
                    const token = formula.substring(pos, pos+length);

                    if ("AND" === token.toUpperCase()) {
                        tokenType = FormulaParserToken.Type.AND;
                    } else if ("OR" === token.toUpperCase()) {
                        tokenType = FormulaParserToken.Type.OR;
                    } else if ("NOT" === token.toUpperCase()) {
                        tokenType = FormulaParserToken.Type.NOT;
                    } else if (type === FormulaParserToken.Type.LPAREN) {
                        tokenType = type = FormulaParserToken.Type.FUNCTION;
                        continue;
                    }
                }

                // tokenType should only be null the first time through
                if (tokenType) {
                    if (tokenType !== FormulaParserToken.Type.WS) {
                        tokens.add(new FormulaParserToken(tokenType, pos, length));
                    }

                    pos += length;
                }

                // Previous token is now current token.
                tokenType = type;
            }
        }

        // Add the last token.
        if (tokenType !== FormulaParserToken.Type.WS) {
            tokens.add(new FormulaParserToken(tokenType, pos, formula.length - pos));
        }

        return tokens;
    }

    constructor(height, width) {
        // Instance "variables"/properties.
        this.height = height;
        this.width = width;
        // Instance "variables"/properties.
    }
}

class FormulaParserNode {
    // Instance "variables" & properties...see constructor.

    /**
     *
     * @param {number} operation
     * @param {FormulaParserNode} leftHandSide
     */
    constructor(operation, leftHandSide) {
        // Instance "variables" & properties.
        this.operation = operation;
        this.leftHandSide = leftHandSide;
        this.rightHandSide = null;
        this.type = 'node';
        Object.freeze(this.type);
        // Instance "variables" & properties.
    }

    /**
     * @param {object} obj
     * @return {boolean} {@code true} if they are equal.
     */
    equals(obj) {
        if (this === obj) {
            return true;
        }

        if (obj === null || typeof obj !== typeof this)  {
            return false;
        }

        if (this.leftHandSide !== null ? !this.leftHandSide === obj.leftHandSide :
                obj.leftHandSide !== null)
        {
            return false;
        }

        return this.rightHandSide !== null ? this.rightHandSide === obj.rightHandSide :
            obj.rightHandSide === null;
    }

    /**
     * @return {FormulaParserNode}
     */
    getLeftHandSide() {
        return this.leftHandSide;
    }

    /**
     *
     * @return {FormulaParserOperation}
     */
    getOperation() {
        return this.operation;
    }

    /**
     *
     * @return {FormulaParserNode}
     */
    getRightHandSide() {
        return this.rightHandSide;
    }

    /**
     *
     * @param {FormulaParserNode} leftHandSide
     */
    setLeftHandSide(leftHandSide) {
        this.leftHandSide = leftHandSide;
    }

    /**
     *
     * @param {FormulaParserNode} rightHandSide
     */
    setRightHandSide(rightHandSide) {
        this.rightHandSide = rightHandSide;
    }
}

class FormulaParserOperation {
    // Instance "variables" & properties...see constructor.

    /**
     *
     * @param {string} operation
     * @return {number} the precedence of this operation.
     */
    static getPrecedence(operation) {
        switch(operation) {
            case FormulaParserOperation.Op.GROUP:
            case FormulaParserOperation.Op.TERMINAL:
                return -1;
            case FormulaParserOperation.Op.ALTERNATIVE:
            case FormulaParserOperation.Op.TERNARY:
                return 0;
            case FormulaParserOperation.Op.AND:
            case FormulaParserOperation.Op.OR:
                return 1;
            case FormulaParserOperation.Op.EQ:
            case FormulaParserOperation.Op.GT:
            case FormulaParserOperation.Op.GTE:
            case FormulaParserOperation.Op.LT:
            case FormulaParserOperation.Op.LTE:
            case FormulaParserOperation.Op.NEQ:
                return 2;
            case FormulaParserOperation.Op.MINUS:
            case FormulaParserOperation.Op.PLUS:
                return 3;
            case FormulaParserOperation.Op.DIV:
            case FormulaParserOperation.Op.MOD:
            case FormulaParserOperation.Op.MUL:
                return 4;
            case FormulaParserOperation.Op.FUNCTION:
            case FormulaParserOperation.Op.NOT:
            case FormulaParserOperation.Op.UNARY_MINUS:
            case FormulaParserOperation.Op.UNARY_PLUS:
                return 6;
        }
    }
}

FormulaParserOperation.Op = {
    // This is for the alternatives part of ?:, RHS is true choice, LHS is false choice.
    ALTERNATIVE: 'ALTERNATIVE',
    AND: 'AND',
    DIV: 'DIV',
    EQ: 'EQ',
    FUNCTION: 'FUNCTION', // function LHS is function name. args, if any, chain to rhs
    GROUP: 'GROUP', // group LHS is the enclosed arithmetic expression
    GT: 'GT',
    GTE: 'GTE',
    LT: 'LT',
    LTE: 'LTE',
    MINUS: 'MINUS',
    MOD: 'MOD',
    MUL: 'MUL',
    NEQ: 'NEQ',
    NOT: 'NOT', // ! has only LHS, no RHS. LHS is an equality expression or numeric expression
    OR: 'OR',
    PLUS: 'PLUS',
    TERMINAL: 'TERMINAL', // terminal is a number or attribute, LHS is a Terminal, no RHS
    TERNARY: 'TERNARY', // this is for the logical part of ?:, LHS is the logical, RHS is the alternatives
    UNARY_MINUS: 'UNARY_MINUS',
    UNARY_PLUS: 'UNARY_PLUS'
};

class FormulaParserTerminal extends FormulaParserNode {
    // Instance "variables" & properties...see constructor.

    /**
     *
     * @param {number} num
     * @return {string} the FormulaParserTerminal.Type
     */
    static getTypeValue(num) {
        switch(num) {
            case 0:
                return FormulaParserTerminal.Type.IN_PROCESS_ATTRIBUTE;
            case 1:
                return FormulaParserTerminal.Type.CURRENT_ATTRIBUTE;
            case 2:
                return FormulaParserTerminal.Type.NUMBER;
            case 3:
                return FormulaParserTerminal.Type.IDENT;
            default:
        }
    }

    /**
     *
     * @param {string} type
     * @param {string} value
     */
    constructor(type, value) {
        super(FormulaParserOperation.Op.TERMINAL, null);
        // Instance "variables" & properties.
        this.type = type;
        Object.freeze(this.type);
        this.value = value;
        // Instance "variables" & properties.
    }

    /**
     * @param {object} obj
     * @return {boolean} {@code true} if the objects are equal.
     */
    equals(obj) {
        if (this === obj) {
            return true;
        }

        if (!obj || typeof obj !== typeof this) {
            return false;
        }

        if (this.type !== obj.type) {
            return false;
        }

        return !(!this.value ? this.value !== obj.value : obj.value);
    }

    /**
     * @return {string}
     */
    getValue() {
        return this.value;
    }
}

FormulaParserTerminal.Type = {
    TYPE: 'TERMINAL',
    IN_PROCESS_ATTRIBUTE: 'IN_PROCESS_ATTRIBUTE',
    CURRENT_ATTRIBUTE: 'CURRENT_ATTRIBUTE',
    NUMBER: 'NUMBER',
    IDENT: 'IDENT',
};

class FormulaParserToken {
    // Instance "variables" & properties...see constructor.

    /**
     *
     * @param {FormulaParserToken.Type} type
     * @param {number} pos
     * @param {number} length
     */
    constructor(type, pos, length) {
        // Instance "variables" & properties.
        this.type = type;
        Object.freeze(this.type);
        this.pos = pos;
        this.length = length;
        // Instance "variables" & properties.
    }

    /**
     * @return {FormulaParserToken.Type}
     */
    getType() {
        return this.type;
    }

    /**
     * @return {number}
     */
    getPos() {
        return this.pos;
    }

    /**
     * @return {number}
     */
    getLength() {
        return this.length;
    }

    /**
     * @param {object} obj
     * @return {boolean}
     */
    equals(obj) {
        if (this === obj) {
            return true;
        }

        if (!obj || typeof obj !== typeof this) {
            return false;
        }

        return this.type === obj.type && this.pos === obj.pos && this.length === obj.length;
    }
}

// Token types
FormulaParserToken.Type = {
    AND: 'AND',    // &&
    COLON: 'COLON',  // :
    COMMA: 'COMMA',  // ,
    DIV: 'DIV',    // \
    DOLLAR: 'DOLLAR', // $
    EQ: 'EQ',     // =
    FUNCTION: 'FUNCTION', // IDENT '('
    ATTRIBUTE: 'ATTRIBUTE', // '$(' IDENT ')'
    GT: 'GT',     // >
    GTE: 'GTE',    // >=
    IDENT: 'IDENT',  // [_a-zA-Z]+ [_a-zA-Z0-9\-]*
    LPAREN: 'LPARN', // (
    LT: 'LT',     // <
    LTE: 'LTE',    // <=
    MINUS: 'MINUS',  // -
    MOD: 'MOD',    // %
    MUL: 'MUL',    // *
    NEQ: 'NEQ',    // !=
    NOT: 'NOT',    // !
    NUMBER: 'NUMBER', // [0-9]+|[0-9]*"."[0-9]+
    OR: 'OR',     // ||
    PLUS: 'PLUS',   // +
    QUESTION_MARK: 'QUESTION_MARK',
    RPAREN: 'RPAREN', // )
    WS: 'WS'     // whitespace is not significant and is consumed
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/GatewayDeviceUtil.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This represents a GatewayDevice in the Messaging API.
 * It has the exact same specifications and capabilities as
 * a directly connected device from the Messaging API and additionally
 * it has the capability to register indirectly connected devices.
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 *
 * @memberOf iotcs.device.util
 * @alias GatewayDevice
 * @class
 * @extends iotcs.device.util.DirectlyConnectedDevice
 */
lib.device.util.GatewayDevice = function (taStoreFile, taStorePassword) {
    lib.device.util.DirectlyConnectedDevice.call(this, taStoreFile, taStorePassword, true);
};

lib.device.util.GatewayDevice.prototype = Object.create(lib.device.util.DirectlyConnectedDevice.prototype);
lib.device.util.GatewayDevice.constructor = lib.device.util.GatewayDevice;

/** @inheritdoc */
lib.device.util.GatewayDevice.prototype.activate = function (deviceModelUrns, callback) {
    if (this.isActivated()) {
        lib.error('cannot activate an already activated device');
        return;
    }

    _mandatoryArg(deviceModelUrns, 'array');
    _mandatoryArg(callback, 'function');

    deviceModelUrns.forEach(function (urn) {
        _mandatoryArg(urn, 'string');
    });

    var deviceModels = deviceModelUrns;
    deviceModels.push('urn:oracle:iot:dcd:capability:direct_activation');
    deviceModels.push('urn:oracle:iot:dcd:capability:indirect_activation');
    deviceModels.push('urn:oracle:iot:dcd:capability:device_policy');
    var self = this;
    this._.internalDev.activate(deviceModels, function(activeDev, error) {
        if (!activeDev || error) {
            callback(null, error);
            return;
        }
        callback(self);
    });
};

/**
 * Register an indirectly-connected device with the cloud service and specify whether
 * the gateway device is required to have the appropriate credentials for activating
 * the indirectly-connected device.
 *
 * The <code>restricted</code> parameter controls whether or not the client
 * library is <em>required</em> to supply credentials for activating
 * the indirectly-connected device. The client library will
 * <em>always</em> supply credentials for an indirectly-connected
 * device whose trusted assets have been provisioned to the client.
 * If, however, the trusted assets of the indirectly-connected device
 * have not been provisioned to the client, the client library can
 * create credentials that attempt to restrict the indirectly connected
 * device to this gateway device.
 *
 * Pass <code>true</code> for the <code>restricted</code> parameter
 * to ensure the indirectly-connected device cannot be activated
 * by this gateway device without presenting credentials. If <code>restricted</code>
 * is <code>true</code>, the client library will provide credentials to the server.
 * The server will reject the activation request if the indirectly connected
 * device is not allowed to roam to this gateway device.
 *
 * Pass <code>false</code> to allow the indirectly-connected device to be activated
 * without presenting credentials if the trusted assets of the
 * indirectly-connected device have not been provisioned to the client.
 * If <code>restricted</code> is <code>false</code>, the client library will provide
 * credentials if, and only if, the credentials have been provisioned to the
 * client. The server will reject the activation if credentials are required
 * but not supplied, or if the provisioned credentials do not allow the
 * indirectly connected device to roam to this gateway device.
 *
 * The <code>hardwareId</code> is a unique identifier within the cloud service
 * instance and may not be <code>null</code>. If one is not present for the device,
 * it should be generated based on other metadata such as: model, manufacturer,
 * serial number, etc.
 *
 * The <code>metaData</code> Object should typically contain all the standard
 * metadata (the constants documented in this class) along with any other
 * vendor defined metadata.
 *
 * @param {boolean} restricted - indicate whether or not credentials are required
 * for activating the indirectly connected device
 * @param {!string} hardwareId - an identifier unique within the Cloud Service instance
 * @param {Object} metaData - The metadata of the device
 * @param {string[]} deviceModelUrns - array of device model URNs
 * supported by the indirectly connected device
 * @param {function} callback - the callback function. This
 * function is called with the following argument: the endpoint id
 * of the indirectly-connected device is the registration was successful
 * or null and an error object as the second parameter: callback(id, error).
 * The reason can be retrieved from error.message and it represents
 * the actual response from the server or any other network or framework
 * error that can appear.
 *
 * @memberof iotcs.device.util.GatewayDevice.prototype
 * @function registerDevice
 */
lib.device.util.GatewayDevice.prototype.registerDevice = function (restricted, hardwareId, metaData, deviceModelUrns, callback) {
    if (!this.isActivated()) {
        lib.error('device not activated yet');
        return;
    }

    if (typeof (restricted) !== 'boolean') {
        lib.log('type mismatch: got '+ typeof (restricted) +' but expecting any of boolean)');
        lib.error('illegal argument type');
        return;
    }
    _mandatoryArg(hardwareId, 'string');
    _mandatoryArg(metaData, 'object');
    _mandatoryArg(callback, 'function');
    deviceModelUrns.forEach(function (urn) {
        _mandatoryArg(urn, 'string');
    });

    var payload = metaData;
    payload.hardwareId = hardwareId;
    payload.deviceModels = deviceModelUrns;

    var self = this;
    var data = self._.internalDev._.tam.getEndpointId();
    // If the ICD has been provisioned, use the shared secret to generate the
    // signature for the indirect activation request.
    // If this call return null, then the ICD has not been provisioned.
    var signature = self._.internalDev._.tam.signWithSharedSecret(data, "sha256", hardwareId);

    // If the signature is null, then the ICD was not provisioned. But if
    // the restricted flag is true, then we generate a signature which will
    // cause the ICD to be locked (for roaming) to the gateway
    if (restricted && (signature === null)) {
        signature = self._.internalDev._.tam.signWithPrivateKey(data, "sha256");
    }

    if (signature !== null) {
        if (typeof signature === 'object') {
            payload.signature = forge.util.encode64(signature.bytes());
        } else {
            payload.signature = forge.util.encode64(signature);
        }
    }

    var indirect_request;

    indirect_request = function () {
        var options = {
            path: $impl.reqroot + '/activation/indirect/device'
            + (lib.oracle.iot.client.device.allowDraftDeviceModels ? '' : '?createDraft=false'),
            method: 'POST',
            headers: {
                'Authorization': self._.internalDev._.bearer,
                'X-EndpointId': self._.internalDev._.tam.getEndpointId()
            },
            tam: self._.internalDev._.tam
        };
        $impl.protocolReq(options, JSON.stringify(payload), function (response_body, error) {

            if (!response_body || error || !response_body.endpointState) {
                callback(null, lib.createError('invalid response on indirect registration', error));
                return;
            }

            if(response_body.endpointState !== 'ACTIVATED') {
                callback(null, lib.createError('endpoint not activated: '+JSON.stringify(response_body)));
                return;
            }

            callback(response_body.endpointId);

        },indirect_request, self._.internalDev);
    };

    indirect_request();
};

//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceModelFactory.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**@ignore*/
$impl.DeviceModelFactory = function () {
    if ($impl.DeviceModelFactory.prototype._singletonInstance) {
        return $impl.DeviceModelFactory.prototype._singletonInstance;
    }

    $impl.DeviceModelFactory.prototype._singletonInstance = this;
    this.cache = this.cache || {};
    this.cache.deviceModels = {};
};

/**@ignore*/
$impl.DeviceModelFactory.prototype.getDeviceModel = function (dcd, deviceModelUrn, callback) {
    debug('DeviceModelFactory.getDeviceModel Getting device model for deviceModelUrn: ' +
        deviceModelUrn);

    _mandatoryArg(dcd, lib.device.util.DirectlyConnectedDevice);

    if (!dcd.isActivated()) {
        lib.error('Device not activated yet.');
        return;
    }

    _mandatoryArg(deviceModelUrn, 'string');
    _mandatoryArg(callback, 'function');

    var deviceModel = this.cache.deviceModels[deviceModelUrn];

    if (deviceModel) {
        callback(deviceModel);
        return;
    }

    var self = this;

    var options = {
        headers: {
            'Authorization': dcd._.internalDev._.bearer,
            'X-EndpointId': dcd._.internalDev._.tam.getEndpointId()
        },
        method: 'GET',
        path: $impl.reqroot + '/deviceModels/' + deviceModelUrn,
        tam: dcd._.internalDev._.tam
    };

    $impl.protocolReq(options, '', function (response, error) {
        debug('DeviceModelFactory.getDeviceModel response = ' + response + ', error = ' +
            error);

        if (!response || !(response.urn) || error) {
            callback(null, lib.createError('Invalid response when getting device model.', error));
            return;
        }

        var deviceModel = response;

        if (!lib.oracle.iot.client.device.allowDraftDeviceModels && deviceModel.draft) {
            callback(null,
                lib.createError('Found draft device model.  Library is not configured for draft device models.'));

            return;
        }

        Object.freeze(deviceModel);
        self.cache.deviceModels[deviceModelUrn] = deviceModel;
        callback(deviceModel);
    }, function () {
        self.getDeviceModel(dcd, deviceModelUrn, callback);
    }, dcd._.internalDev);
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/InMemoryPersistenceStore.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * InMemoryPersistenceStore
 */
class InMemoryPersistenceStore {
    // Instance "variables"/properties...see constructor.

    /**
     *
     * @param {string} name
     */
    constructor(name) {
        // Instance "variables"/properties.
        this.name = name;
        /**
         * Map of items.  Key is the item name.
         * @type {Map<string, object> }
         */
        this.items = new Map();
        // Instance "variables"/properties.
    }

    /**
     * Return true if this PersistenceStore contains the given key.
     *
     * @param key the key to search for.
     * @returns {boolean} true if this {PersistenceStore contains the given key.
     */
    contains(key) {
        return PersistenceStoreManager.has(key);
    }

    /**
     * Return a map of all key/value pairs in this PersistenceStore.
     *
     * @return {Map<string, object>}
     */
    getAll() {
        return new Map(this.items);
    }

    getName() {
        return name;
    }

    /**
     * Return an object value for the given key.
     *
     * @param {string} key the key to search for.
     * @param {object} defaultValue the value to use if this PersistenceStore does not contain the
     *                 key.
     * @return {object} the value for the key.
     */
    getOpaque(key, defaultValue) {
        let obj = this.items.get(key);
        return obj ? obj : defaultValue;
    }

    openTransaction() {
        return new PersistenceStoreTransaction(this);
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/TestConnectivity.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**@ignore*/
$impl.TestConnectivity = function (messageDispatcher) {
    this.count = 0;
    this.currentCount = 0;
    this.size = 0;
    this.interval = 0;

    this.messageDispatcher = messageDispatcher;
    this.startPooling = null;

    var self = this;

    this.monitor = new $impl.Monitor( function () {
        var currentTime = Date.now();
        if (currentTime >= (self.startPooling + self.interval)) {

            if (messageDispatcher._.dcd.isActivated()) {

                var message = new lib.message.Message();
                message
                    .type(lib.message.Message.Type.DATA)
                    .source(messageDispatcher._.dcd.getEndpointId())
                    .format("urn:oracle:iot:dcd:capability:diagnostics:test_message")
                    .dataItem("count", self.currentCount)
                    .dataItem("payload", _strRepeat('*', self.size))
                    .priority(lib.message.Message.Priority.LOWEST);

                self.messageDispatcher.queue(message);
                self.currentCount = self.currentCount + 1;

            }

            self.startPooling = currentTime;

            if (self.currentCount === self.count) {
                self.monitor.stop();
                self.count = 0;
                self.currentCount = 0;
                self.size = 0;
                self.interval = 0;
            }
        }
    });

};

/**@ignore*/
$impl.TestConnectivity.prototype.startHandler = function (requestMessage) {
    var method = _getMethodForRequestMessage(requestMessage);
    if (!method || (method !== 'PUT')) {
        return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
    }
    var data = null;
    try {
        data = JSON.parse($port.util.atob(requestMessage.payload.body));
    } catch (e) {
        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
    }
    if (!data || !data.interval || !data.size || !data.count
        || (typeof data.interval !== 'number') || (data.interval % 1 !== 0)
        || (typeof data.size !== 'number') || (data.size < 0) || (data.size % 1 !== 0)
        || (typeof data.count !== 'number') || (data.count < 0) || (data.count % 1 !== 0)) {
        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
    }
    if (this.monitor.running) {
        return lib.message.Message.buildResponseMessage(requestMessage, 409, {}, 'Conflict', '');
    }
    this.size = data.size;
    this.interval = (data.interval < lib.oracle.iot.client.monitor.pollingInterval ? lib.oracle.iot.client.monitor.pollingInterval : data.interval);
    this.count = data.count;
    this.currentCount = 0;
    this.startPooling = Date.now();
    this.monitor.start();
    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, '', '');
};

/**@ignore*/
$impl.TestConnectivity.prototype.stopHandler = function (requestMessage) {
    var method = _getMethodForRequestMessage(requestMessage);
    if (!method || (method !== 'PUT')) {
        return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
    }
    this.monitor.stop();
    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, '', '');
};

/**@ignore*/
$impl.TestConnectivity.prototype.testHandler = function (requestMessage) {
    var method = _getMethodForRequestMessage(requestMessage);
    if (!method || (method !== 'GET')) {
        return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
    }
    var obj = {
        active: this.monitor.running,
        count: this.count,
        currentCount: this.currentCount,
        interval: this.interval,
        size: this.size
    };
    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, JSON.stringify(obj), '');
};

/** @ignore */
function _strRepeat(str, qty) {
    if (qty < 1) return '';
    var result = '';
    while (qty > 0) {
        if (qty & 1) {
            result += str;
        }
        qty >>= 1;
        str = str + str;
    }
    return result;
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/MessageDispatcher.js

/**
 * Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This object is used for store and forward messages
 * to the cloud by using a priority queue and handling the
 * priority attribute of messages. It is also used for
 * monitoring received messages and any errors that can
 * arise when sending messages.
 * <p>
 * There can be only one MessageDispatcher instance per
 * DirectlyConnectedDevice at a time and it is created
 * at first use. To close an instance of a MessageDispatcher
 * the DirectlyConnectedDevice.close method must be used.
 * <p>
 * The message dispatcher uses the RequestDispatcher
 * for dispatching automatically request messages that
 * come from the server and generate response messages
 * to the server.
 * <p>
 * The onDelivery and onError attributes can be used to
 * set handlers that are called when messages are successfully
 * delivered or an error occurs:<br>
 * <code>messageDispatcher.onDelivery = function (messages);</code><br>
 * <code>messageDispatcher.onError = function (messages, error);</code><br>
 * Where messages is an array of the iotcs.message.Message object
 * representing the messages that were sent or not and error is
 * an Error object.
 * <p>
 * Also the MessageDispatcher implements the message dispatcher,
 * diagnostics and connectivity test capabilities.
 *
 * @see {@link iotcs.message.Message}
 * @see {@link iotcs.message.Message.Priority}
 * @see {@link iotcs.device.util.RequestDispatcher}
 * @see {@link iotcs.device.util.DirectlyConnectedDevice#close}
 * @memberOf iotcs.device.util
 * @alias MessageDispatcher
 * @class
 *
 * @param {iotcs.device.util.DirectlyConnectedDevice} dcd - The directly
 * connected device (Messaging API) associated with this message dispatcher
 */
lib.device.util.MessageDispatcher = function (dcd) {
    _mandatoryArg(dcd, lib.device.util.DirectlyConnectedDevice);
    if (dcd.dispatcher) {
        return dcd.dispatcher;
    }
    var self = this;

    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this._, 'dcd', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: dcd
    });

    Object.defineProperty(this, 'onDelivery', {
        enumerable: false,
        configurable: false,
        get: function () {
            return self._.onDelivery;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onDelivery that is not a function!');
                return;
            }
            self._.onDelivery = newValue;
        }
    });

    this._.onDelivery = function (arg) {};

    Object.defineProperty(this, 'onError', {
        enumerable: false,
        configurable: false,
        get: function () {
            return self._.onError;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('Trying to set something to onDelivery that is not a function!');
                return;
            }

            self._.onError = newValue;
        }
    });

    this._.onError = function (arg1, arg2) {};

    var queue = new $impl.PriorityQueue(lib.oracle.iot.client.device.maximumMessagesToQueue);
    var client = dcd;

    Object.defineProperty(this._, 'push', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (message) {
            queue.push(message);
        }
    });

    Object.defineProperty(this._, 'storageDependencies', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {
            keys: [],
            values: []
        }
    });

    Object.defineProperty(this._, 'failMessageClientIdArray', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: []
    });

    Object.defineProperty(this._, 'addStorageDependency', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (storage, msgClientId) {
            var index = self._.storageDependencies.keys.indexOf(storage);
            if (index == -1) {
                // add new KV in storageDependencies
                self._.storageDependencies.keys.push(storage);
                self._.storageDependencies.values.push([msgClientId]);
            } else {
                // add value for key
                self._.storageDependencies.values[index].push(msgClientId);
            }
        }
    });

    Object.defineProperty(this._, 'removeStorageDependency', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (storage) {
            var completed = (storage.getSyncStatus() === lib.device.StorageObject.SyncStatus.IN_SYNC);
            var index = self._.storageDependencies.keys.indexOf(storage);
            self._.storageDependencies.keys.splice(index, 1);
            var msgClientIds = self._.storageDependencies.values.splice(index, 1)[0];
            if (!completed && msgClientIds.length > 0) {
                //save failed clientIds
                msgClientIds.forEach(function (msgClientId) {
                    if (self._.failMessageClientIdArray.indexOf(msgClientId) === -1) self._.failMessageClientIdArray.push(msgClientId);
                });
            }
        }
    });

    // TODO: This really should be renamed to 'isStorageDependent' to be consistent.
    Object.defineProperty(this._, 'isContentDependent', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (clientId) {
            for (var i = 0; i < self._.storageDependencies.values.length; ++i) {
                if (self._.storageDependencies.values[i].indexOf(clientId) !== -1) {
                    return true;
                }
            }

            return false;
        }
    });

    var poolingInterval = lib.oracle.iot.client.device.defaultMessagePoolingInterval;
    var startPooling = null;
    var startTime = dcd._.internalDev._.getCurrentServerTime();

    var totalMessagesSent = 0;
    var totalMessagesReceived = 0;
    var totalMessagesRetried = 0;
    var totalBytesSent = 0;
    var totalBytesReceived = 0;
    var totalProtocolErrors = 0;

    var connectivityTestObj = new $impl.TestConnectivity(this);

    var handlers = {
        "deviceModels/urn:oracle:iot:dcd:capability:device_policy/policyChanged": function(requestMessage) {
            var method = _getMethodForRequestMessage(requestMessage);

            if (!method || method !== 'POST') {
                return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
            }

            let devicePolicyManager = DevicePolicyManager.getDevicePolicyManager(dcd.getEndpointId());
            return devicePolicyManager.policyChanged(dcd, requestMessage);
        },
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/counters": function (requestMessage) {
                var method = _getMethodForRequestMessage(requestMessage);
                if (!method || method !== 'GET') {
                    return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
                }
                var counterObj = {
                    totalMessagesSent: totalMessagesSent,
                    totalMessagesReceived: totalMessagesReceived,
                    totalMessagesRetried: totalMessagesRetried,
                    totalBytesSent: totalBytesSent,
                    totalBytesReceived: totalBytesReceived,
                    totalProtocolErrors: totalProtocolErrors
                };
                return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, JSON.stringify(counterObj), '');
            },
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/reset": function (requestMessage) {
                var method = _getMethodForRequestMessage(requestMessage);
                if (!method || (method !== 'PUT')) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
                }
                totalMessagesSent = 0;
                totalMessagesReceived = 0;
                totalMessagesRetried = 0;
                totalBytesSent = 0;
                totalBytesReceived = 0;
                totalProtocolErrors = 0;
                return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, '', '');
            },
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/pollingInterval": function (requestMessage) {
                var method = _getMethodForRequestMessage(requestMessage);
                if (!method || ((method !== 'PUT') && (method !== 'GET'))) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
                }
                if (method === 'GET') {
                    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, JSON.stringify({pollingInterval: poolingInterval}), '');
                } else {
                    var data = null;
                    try {
                        data = JSON.parse($port.util.atob(requestMessage.payload.body));
                    } catch (e) {
                        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                    }
                    if (!data || (typeof data.pollingInterval !== 'number') || (data.pollingInterval % 1 !== 0)) {
                        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                    }
                    poolingInterval = (data.pollingInterval < lib.oracle.iot.client.monitor.pollingInterval ? lib.oracle.iot.client.monitor.pollingInterval : data.pollingInterval);
                    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, '', '');
                }
            },
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/info": function (requestMessage) {
            var method = _getMethodForRequestMessage(requestMessage);
            if (!method || method !== 'GET') {
                return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
            }
            var obj = {
                freeDiskSpace: 'Unknown',
                ipAddress: 'Unknown',
                macAddress: 'Unknown',
                totalDiskSpace: 'Unknown',
                version: 'Unknown',
                startTime: startTime
            };
            if ($port.util.diagnostics) {
                obj = $port.util.diagnostics();
            }
            return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, JSON.stringify(obj), '');
        },
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/testConnectivity": function (requestMessage) {
            var method = _getMethodForRequestMessage(requestMessage);
            var data = null;
            try {
                data = JSON.parse($port.util.atob(requestMessage.payload.body));
            } catch (e) {
                return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
            }
            if (!data || ((method === 'PUT') && (typeof data.active !== 'boolean'))) {
                return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
            }
            if (method === 'PUT') {
                if (data.active) {
                    return connectivityTestObj.startHandler(requestMessage);
                } else {
                    return connectivityTestObj.stopHandler(requestMessage);
                }
            } else {
                return connectivityTestObj.testHandler(requestMessage);
            }
        }
    };

    // Note: Any changes here must also be changed in
    // $impl.DirectlyConnectedDevice.prototype.registerDevicePolicyResource.
    var handlerMethods = {
        "deviceModels/urn:oracle:iot:dcd:capability:device_policy/policyChanged": "PUT",
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/counters": 'GET',
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/reset": 'PUT',
        "deviceModels/urn:oracle:iot:dcd:capability:message_dispatcher/pollingInterval": 'GET,PUT',
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/info": 'GET',
        "deviceModels/urn:oracle:iot:dcd:capability:diagnostics/testConnectivity": 'GET,PUT'
    };

    var deliveryCallback = function (messages) {
        totalMessagesSent = totalMessagesSent + messages.length;
        messages.forEach(function (message) {
            totalBytesSent = totalBytesSent + _getUtf8BytesLength(JSON.stringify(message));
        });
        self.onDelivery(messages);
    };

    var errorCallback = function (messages, error) {
        totalProtocolErrors = totalProtocolErrors + 1;
        self.onError(messages, error);
    };

    /**
     * Callback handler for DirectlyConnectedDeviceUtil.send_receive_messages when messages are
     * successfully sent and when errors occur sending messages.
     *
     * @param {message[]} messages the messages to be sent.
     * @param error the error when sending messages, if there is one.
     */
    var handleReceivedMessages = function (messages, error) {
        try {
            if (error) {
                errorCallback(messages, error);
            } else {
                deliveryCallback(messages);
            }
        } catch (e) {

        }
        var message = client._.get_received_message();
        while (message) {
            totalMessagesReceived = totalMessagesReceived + 1;
            totalBytesReceived = totalBytesReceived + _getUtf8BytesLength(JSON.stringify(message));
            if (message.type === lib.message.Message.Type.REQUEST) {
                var responseMessage = self.getRequestDispatcher().dispatch(message);
                if (responseMessage) {
                    self.queue(responseMessage);
                }
            }
            message = client._.get_received_message();
        }
    };

    var longPollingStarted = false;

    var pushMessage = function (array, message) {
        var inArray = array.forEach(function (msg) {
            if (JSON.stringify(msg.getJSONObject()) === JSON.stringify(message.getJSONObject())) {
                return true;
            }
        });
        if (!inArray) array.push(message);
    };

    var sendMonitor = new $impl.Monitor(function () {
        var currentTime = Date.now();

        if (currentTime >= (startPooling + poolingInterval)) {
            if (!dcd.isActivated() || dcd._.internalDev._.activating || dcd._.internalDev._.refreshing) {
                startPooling = currentTime;
                return;
            }

            var sent = false;
            var message;
            var waitMessageArray = [];
            var sendMessageArray = [];
            var errorMessageArray = [];
            var inProgressSources = [];

            // Go through the queue and add the messages to the send message or wait message arrays
            // depending on whether it's a request message, if it has a storage dependency, or if
            // messages to this source are in-progress (so we can group messages to the same source
            // together in the same connection).
            while ((message = queue.pop()) !== null) {
                var clientId = message._.internalObject.clientId;
                var source = message._.internalObject.source;

                if (self._.failMessageClientIdArray.indexOf(clientId) > -1) {
                    if (errorMessageArray.indexOf(message) === -1) {
                        errorMessageArray.push(message);
                    }

                    continue;
                }

                if (message._.internalObject.type === lib.message.Message.Type.REQUEST ||
                    !(inProgressSources.indexOf(source) !== -1 ||
                        self._.isContentDependent(clientId)))
                {
                    message._.internalObject.remainingRetries =
                        message._.internalObject.BASIC_NUMBER_OF_RETRIES;

                    pushMessage(sendMessageArray, message);

                    if (sendMessageArray.length === lib.oracle.iot.client.device.maximumMessagesPerConnection) {
                        break;
                    }
                } else {
                    if (inProgressSources.indexOf(source) === -1) {
                        inProgressSources.push(source);
                    }

                    pushMessage(waitMessageArray, message);
                }
            }

            sent = true;
            var messageArr = [];

            if (sendMessageArray.length > 0) {
                messageArr = sendMessageArray;
            }

            waitMessageArray.forEach(function (message) {
                self.queue(message);
            });

            client._.send_receive_messages(messageArr, handleReceivedMessages, handleReceivedMessages);

            if (errorMessageArray.length > 0) {
                errorCallback(errorMessageArray, new Error("Content sync failed"));
            }

            if (!sent && !client._.receiver && (lib.oracle.iot.client.device.disableLongPolling || client._.internalDev._.mqttController)) {
                client._.send_receive_messages([], handleReceivedMessages, handleReceivedMessages);
            }

            if (!client._.receiver && !lib.oracle.iot.client.device.disableLongPolling && !client._.internalDev._.mqttController) {
                var longPollCallback = null;

                longPollCallback = function (messages, error) {
                    if (!error) {
                        client._.send_receive_messages([], longPollCallback, longPollCallback, true);
                    } else {
                        longPollingStarted = false;
                    }

                    handleReceivedMessages(messages, error);
                };

                if (!longPollingStarted) {
                    client._.send_receive_messages([], longPollCallback, longPollCallback, true);
                    longPollingStarted = true;
                }
            }

            startPooling = currentTime;
        }
    });

    if (client._.receiver) {
        var oldReceiver = client._.receiver;
        client._.receiver = function (messages, error) {
            oldReceiver(messages, error);
            var message = client._.get_received_message();
            while (message) {
                totalMessagesReceived = totalMessagesReceived + 1;
                totalBytesReceived = totalBytesReceived + _getUtf8BytesLength(JSON.stringify(message));
                if (message.type === lib.message.Message.Type.REQUEST) {
                    var responseMessage = self.getRequestDispatcher().dispatch(message);
                    if (responseMessage) {
                        self.queue(responseMessage);
                    }
                }
                message = client._.get_received_message();
            }
        };
    }

    var resourceMessageMonitor = null;

    resourceMessageMonitor = new $impl.Monitor(function () {
        if (!dcd.isActivated()) {
            return;
        }

        if (resourceMessageMonitor) {
            resourceMessageMonitor.stop();
        }

        for (var path in handlers) {
            self.getRequestDispatcher().registerRequestHandler(dcd.getEndpointId(), path, handlers[path]);
        }
        var resources = [];

        for (var path1 in handlerMethods) {
            resources.push(lib.message.Message.ResourceMessage.Resource.buildResource(path1, path1, handlerMethods[path1], lib.message.Message.ResourceMessage.Resource.Status.ADDED));
        }
        var message = lib.message.Message.ResourceMessage.buildResourceMessage(resources, dcd.getEndpointId(), lib.message.Message.ResourceMessage.Type.UPDATE, lib.message.Message.ResourceMessage.getMD5ofList(Object.keys(handlerMethods)))
            .source(dcd.getEndpointId())
            .priority(lib.message.Message.Priority.HIGHEST);
        self.queue(message);
    });

    resourceMessageMonitor.start();

    Object.defineProperty(this._, 'stop', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            sendMonitor.stop();
            if (resourceMessageMonitor) {
                resourceMessageMonitor.stop();
            }
        }
    });

    Object.defineProperty(dcd, 'dispatcher', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: this
    });

    startPooling = Date.now();
    sendMonitor.start();
    startTime = dcd._.internalDev._.getCurrentServerTime();

    // Do this last after everything else is established.
    // Populate outgoing message queue from persisted messages, but leave the
    // messages in persistence. The messages are removed from persistence when
    // they are delivered successfully.
    // @type {MessagePersistenceImpl}
    const messagePersistence = MessagePersistenceImpl.getInstance();

    if (dcd.isActivated() === true) {
        messagePersistence.load(dcd.getEndpointId()).then(messages => {
            if (messages && messages.size > 0) {
                messages.forEach(message => {
                    this.queue(message);
                });
            }
        }).catch(error => {
            //console.log('Error loading persistent messages: ' + error);
        });
    }
};

/**
 * This method returns the RequestDispatcher used by this
 * MessageDispatcher for dispatching messages.
 *
 * @returns {iotcs.device.util.RequestDispatcher} The RequestDispatcher
 * instance
 *
 * @memberOf iotcs.device.util.MessageDispatcher.prototype
 * @function getRequestDispatcher
 */
lib.device.util.MessageDispatcher.prototype.getRequestDispatcher = function () {
    return new lib.device.util.RequestDispatcher();
};

/**
 * This method adds a message to the queue of this MessageDispatcher
 * to be sent to the cloud.
 *
 * @param {iotcs.message.Message} message - the message to be sent
 *
 * @memberOf iotcs.device.util.MessageDispatcher.prototype
 * @function queue
 */
lib.device.util.MessageDispatcher.prototype.queue = function (message) {
    _mandatoryArg(message, lib.message.Message);

    const messagePersistenceImpl = MessagePersistenceImpl.getInstance();

    if (messagePersistenceImpl && message._.internalObject.reliability ===
        lib.message.Message.Reliability.GUARANTEED_DELIVERY)
    {
        const messages = new Set();
        messages.add(message);
        messagePersistenceImpl.save(messages, this._.dcd.getEndpointId());
    }

    this._.push(message);
};

function _getMethodForRequestMessage(requestMessage){
    var method = null;
    if (requestMessage.payload && requestMessage.payload.method) {
        method = requestMessage.payload.method.toUpperCase();
    }
    if (requestMessage.payload.headers && Array.isArray(requestMessage.payload.headers['x-http-method-override']) && (requestMessage.payload.headers['x-http-method-override'].length > 0)) {
        method = requestMessage.payload.headers['x-http-method-override'][0].toUpperCase();
    }
    return method;
}

/**
 * Offer a message to be queued. Depending on the policies, if any, the message will be queued if it is possible to do
 * so without violating capacity restrictions.
 *
 * @param {iotcs.message.Message} message - the message to be offered.
 * @throws ArrayStoreException if all the messages cannot be added to the queue
 * @throws IllegalArgumentException if {@code messages} is null or empty
 *
 * @memberOf iotcs.device.util.MessageDispatcher.prototype
 * @function offer
 */
lib.device.util.MessageDispatcher.prototype.offer = function (message) {
    _mandatoryArg(message, lib.message.Message);

    // @type {PersistenceStore}
    const persistenceStore =
        PersistenceStoreManager.get(this._.dcd.getEndpointId());

    // @type {MessagingPolicyImpl}
    const mpi = persistenceStore.getOpaque('MessagingPolicyImpl', null);
    // @type {MessagingPolicyImpl}
    let messagingPolicyImpl;

    if (mpi) {
        messagingPolicyImpl = mpi;
    } else {
        messagingPolicyImpl = new MessagingPolicyImpl(this._.dcd);

        persistenceStore
            .openTransaction()
            .putOpaque('MessagingPolicyImpl', messagingPolicyImpl)
            .commit();

        // @type {DevicePolicyManager}
        const devicePolicyManager =
            DevicePolicyManager.getDevicePolicyManager(this._.dcd.getEndpointId());

        devicePolicyManager.addChangeListener(messagingPolicyImpl);
    }

    var messageDispatcher = this;

    messagingPolicyImpl.applyPolicies(message).then(messageAry => {
        if (messageAry) {
            messageAry.forEach(function (message) {
                messageDispatcher._.push(message);
            });
        }
    }).catch(error => {
        console.log('MessageDispatcher.offer error: ' + error);
    });
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/MessagePersistenceImpl.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * Provides for storing and retrieving messages to a persistent store.
 */
class MessagePersistenceImpl {
    static getInstance() {
        if (!MessagePersistenceImpl.instance) {
            MessagePersistenceImpl.instance = new MessagePersistenceImpl();
        }

        return MessagePersistenceImpl.instance;
    }

    constructor() {
        if (MessagePersistenceImpl.PERSISTENCE_ENABLED) {
          /*  this.db = new sqlite3.Database(MessagePersistenceImpl.DB_NAME, error => {
                if (error) {
                    return console.error(error.message);
                } else {
                    this.createMspsTableIfNotExists();
                }
            }); */
        }
    }

    /**
     * Creates the message persistent storage table if it doesn't exist.
     */
    createMspsTableIfNotExists() {
        /* let tableExistsSql = "SELECT name FROM sqlite_master WHERE type='table' AND name=?";

        this.db.get(tableExistsSql, [MessagePersistenceImpl.TABLE_NAME], (error, row) => {
            if (error || !row) {
                //console.log('Creating message persistent storage table.');
                let maxEndpointIdLength = 100;
                let maxUuidLength = 40;

                let createTableSql =
                    "CREATE TABLE " + MessagePersistenceImpl.TABLE_NAME +
                    "(TIMESTAMP BIGINT NOT NULL," +
                    "UUID VARCHAR(" + maxUuidLength + ") NOT NULL," +
                    "ENDPOINT_ID VARCHAR(" + maxEndpointIdLength + ") NOT NULL," +
                    "MESSAGE BLOB," +
                    " PRIMARY KEY (UUID))";

                this.db.run(createTableSql, error => {
                    if (error) {
                        console.log('Error creating table: ' + error);
                    }
                });
            }
        }); */
    }

    /**
     *
     * @param {Set<Message>} messages
     */
    delete(messages) {
        if (!MessagePersistenceImpl.PERSISTENCE_ENABLED) {
            return;
        }

        let stmt = '';

        // Construct multiple delete statements into one for better performance.
        messages.forEach(message => {
            stmt += MessagePersistenceImpl.DELETE + "'" + message._.internalObject.clientId + "';";
        });

        if (stmt && (stmt.length > 0)) {
            this.db.exec(stmt);
        }
    }

    /**
     * @param {string} endpointId
     * @return {Promise} - a Set<Message> a set of loaded messages.  May be an empty set if there
     *         are no messages to load.
     */
    load(endpointId) {
        return new Promise((resolve, reject) => {
            let messages = new Set();

            if (!MessagePersistenceImpl.PERSISTENCE_ENABLED) {
                resolve(messages);
                return;
            }

            this.db.all(MessagePersistenceImpl.LOAD, endpointId, (error, rows) => {
                if (error) {
                    let errorMsg = 'Table does not exist: ' + MessagePersistenceImpl.TABLE_NAME;
                    //console.log(errorMsg);
                    reject(errorMsg);
                } else {
                    rows.forEach(row => {
                        let message = new lib.message.Message();
                        message._.internalObject.clientId = row.UUID;
                        message._.internalObject.eventTime = row.TIMESTAMP;
                        message._.internalObject.source = row.ENDPOINT_ID;
                        let messageJson = JSON.parse(row.MESSAGE);

                        if (messageJson) {
                            message._.internalObject.BASIC_NUMBER_OF_RETRIES =
                                messageJson.BASIC_NUMBER_OF_RETRIES;
                            message._.internalObject.destination = messageJson.destination;
                            message._.internalObject.payload = messageJson.payload;
                            message._.internalObject.priority = messageJson.priority;
                            message._.internalObject.reliability = messageJson.reliability;
                            message._.internalObject.remainingRetries = messageJson.remainingRetries;
                            message._.internalObject.sender = messageJson.sender;
                            message._.internalObject.type = messageJson.type;
                            messages.add(message);
                        }
                    });

                    resolve(messages);
                }
            });
        });
    }

    /**
     *
     * @param {Set<Message>} messages
     * @param {string} endpointId
     */
    save(messages, endpointId) {
        if (!MessagePersistenceImpl.PERSISTENCE_ENABLED) {
            return;
        }

        messages.forEach(message => {
            this.db.serialize(function () {
                let stmt = this.prepare(MessagePersistenceImpl.SAVE);

                stmt.run(message._.internalObject.eventTime, message._.internalObject.clientId,
                    endpointId, JSON.stringify(message.getJSONObject()), function(error)
                    {
                        if (error) {
                            if (error.message &&
                                !error.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed'))
                            {
                                console.log('Error persisting message: ' + error);
                            }
                        }

                        stmt.finalize();
                    });
            });
        });
    }
}

// Default name of the database
MessagePersistenceImpl.DB_NAME = (process.env['com.oracle.iot.messagingservice.persistent.store.dbname'], 'msps.sqlite');
MessagePersistenceImpl.TABLE_NAME = 'MESSAGE_PERSISTENT_STORE';
MessagePersistenceImpl.SAVE = 'INSERT INTO ' + MessagePersistenceImpl.TABLE_NAME + ' VALUES (?, ?, ?, ?)';
// This statement is not parmaterized.
MessagePersistenceImpl.DELETE = 'DELETE FROM ' + MessagePersistenceImpl.TABLE_NAME + ' WHERE uuid = ';
MessagePersistenceImpl.LOAD = 'SELECT * FROM ' + MessagePersistenceImpl.TABLE_NAME + ' WHERE ENDPOINT_ID = ? ORDER BY timestamp';
MessagePersistenceImpl.ENDPOINT_ID_INDEX = 'CREATE INDEX endpoint_id ON ' + MessagePersistenceImpl.TABLE_NAME + '(ENDPOINT_ID)';
MessagePersistenceImpl.PERSISTENCE_ENABLED = (process.env['com.oracle.iot.message_persistence_enabled'], 'true');
MessagePersistenceImpl.POOL_CONNECTIONS = (process.env['com.oracle.iot.message_persistence_pool_connections'], 'true');
MessagePersistenceImpl.ISOLATION_LEVEL = (process.env['com.oracle.iot.message_persistence_isoloation'], 1);


//////////////////////////////////////////////////////////////////////////////
// file: library/device/RequestDispatcher.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This object is used for request messages dispatch.
 * You can register handlers to an instance of this
 * object that will handle request messages that come
 * from the cloud and will return a response message
 * associated for that request message.
 * <p>
 * There can be only one instance of This object (singleton)
 * generated at first use.
 *
 * @memberOf iotcs.device.util
 * @alias RequestDispatcher
 * @class
 */
lib.device.util.RequestDispatcher = function () {
    if (lib.device.util.RequestDispatcher.prototype._singletonInstance) {
        return lib.device.util.RequestDispatcher.prototype._singletonInstance;
    }
    lib.device.util.RequestDispatcher.prototype._singletonInstance = this;

    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this._, 'requestHandlers', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    Object.defineProperty(this._, 'defaultHandler', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (requestMessage) {
            return lib.message.Message.buildResponseMessage(requestMessage, 404, {}, 'Not Found', '');
        }
    });
};

/**
 * This is main function of the RequestDispatcher that
 * dispatches a request message to the appropriate handler,
 * if one is found and the handler is called so the
 * appropriate response message is returned. If no handler
 * is found, the RequestDispatcher implements a default request
 * message dispatcher that would just return a
 * 404 (Not Found) response message. This method will never
 * return null.
 *
 * @param {object} requestMessage - the request message to dispatch
 *
 * @returns {iotcs.message.Message} The response message associated
 * with the request.
 *
 * @memberOf iotcs.device.util.RequestDispatcher.prototype
 * @function dispatch
 */
lib.device.util.RequestDispatcher.prototype.dispatch = function (requestMessage) {
    if (!requestMessage || !requestMessage.type
        || (requestMessage.type !== lib.message.Message.Type.REQUEST)
        || !requestMessage.destination
        || !requestMessage.payload
        || !requestMessage.payload.url
        || !this._.requestHandlers[requestMessage.destination]
        || !this._.requestHandlers[requestMessage.destination][requestMessage.payload.url]) {
        return this._.defaultHandler(requestMessage);
    }
    var message = this._.requestHandlers[requestMessage.destination][requestMessage.payload.url](requestMessage);
    if (message && (message instanceof lib.message.Message)
        && (message.getJSONObject().type === "RESPONSE_WAIT")) {
        return null;
    }
    if (!message || !(message instanceof lib.message.Message)
        || (message.getJSONObject().type !== lib.message.Message.Type.RESPONSE)) {
        return this._.defaultHandler(requestMessage);
    }
    return message;
};

/**
 * This method registers a handler to the RequestDispatcher.
 * The handler is a function that must have the form:<br>
 * <code>handler = function (requestMessage) { ... return responseMessage};</code><br>
 * Where requestMessage if a JSON representing the exact message
 * received from the cloud that has the type REQUEST and
 * responseMessage is an instance of iotcs.message.Message that has type RESPONSE.
 * If neither of the conditions are satisfied the RequestDispatcher
 * will use the default handler.
 * <p>
 * It is advisable to use the iotcs.message.Message.buildResponseMessage
 * method for generating response messages.
 *
 * @param {string} endpointId - the endpointId that is the destination
 * of the request message
 * @param {string} path - the path that is the "address" (resource definition)
 * of the request message
 * @param {function} handler - tha actual handler to be registered
 *
 * @see {@link iotcs.message.Message.Type}
 * @see {@link iotcs.message.Message.buildResponseMessage}
 * @memberOf iotcs.device.util.RequestDispatcher.prototype
 * @function registerRequestHandler
 */
lib.device.util.RequestDispatcher.prototype.registerRequestHandler = function (endpointId, path, handler) {
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(path, 'string');
    _mandatoryArg(handler, 'function');

    if (!this._.requestHandlers[endpointId]) {
        this._.requestHandlers[endpointId] = {};
    }
    this._.requestHandlers[endpointId][path] = handler;
};

/**
 * Returns a registered request handler, if it is registered,
 * otherwise null.
 *
 * @param {string} endpointId - the endpoint id that the handler
 * was registered with
 * @param {string} path - the path that the handler was registered
 * with
 *
 * @returns {function} The actual handler or null
 *
 * @memberOf iotcs.device.util.RequestDispatcher.prototype
 * @function getRequestHandler
 */
lib.device.util.RequestDispatcher.prototype.getRequestHandler = function (endpointId, path) {
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(path, 'string');

    if (!this._.requestHandlers[endpointId] || !this._.requestHandlers[endpointId][path]) {
        return null;
    }
    return this._.requestHandlers[endpointId][path];
};

/**
 * This method removed a handler from the registered handlers
 * list of the RequestDispatcher. If handler is present as parameter,
 * then endpointId and path parameters are ignored.
 *
 * @param {function} handler - the reference to the handler to
 * be removed
 * @param {string} endpointId - he endpoint id that the handler
 * was registered with
 * @param {string} path - the path that the handler was registered
 * with
 *
 * @memberOf iotcs.device.util.RequestDispatcher.prototype
 * @function unregisterRequestHandler
 */
lib.device.util.RequestDispatcher.prototype.unregisterRequestHandler = function (handler, endpointId, path) {
    if (handler && (typeof handler === 'string')) {
        endpointId = handler;
        path = endpointId;
        handler = null;
    }

    if (handler && (typeof handler === 'function')) {
        Object.keys(this._.requestHandlers).forEach(function (endpointId){
            Object.keys(this._.requestHandlers[endpointId]).forEach(function (path) {
                delete this._.requestHandlers[endpointId][path];
                if (Object.keys(this._.requestHandlers[endpointId]).length === 0) {
                    delete this._.requestHandlers[endpointId];
                }
            });
        });
        return;
    } else {
        _mandatoryArg(endpointId, 'string');
        _mandatoryArg(path, 'string');
    }

    if (!this._.requestHandlers[endpointId] || !this._.requestHandlers[endpointId][path]) {
        return;
    }
    delete this._.requestHandlers[endpointId][path];
    if (Object.keys(this._.requestHandlers[endpointId]).length === 0) {
        delete this._.requestHandlers[endpointId];
    }
};

//////////////////////////////////////////////////////////////////////////////
// file: library/device/Attribute.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//@TODO: missing jsdoc

/**
 * Attribute is an attribute in the device model.
 *
 * @class
 */

/** @ignore */
$impl.Attribute = function (attributeSpec) {
    _mandatoryArg(attributeSpec, 'object');

    if ((!attributeSpec.name) || (!attributeSpec.type)) {
        lib.error('attribute specification in device model is incomplete');
        return;
    }

    var spec = {
        name: attributeSpec.name,
        description: (attributeSpec.description || ''),
        type: attributeSpec.type,
        writable: (attributeSpec.writable || false),
        alias: (attributeSpec.alias || null),
        range: (attributeSpec.range ? _parseRange(attributeSpec.type, attributeSpec.range) : null),
        defaultValue: ((typeof attributeSpec.defaultValue !== 'undefined') ? attributeSpec.defaultValue : null)
    };

    if (spec.type === "URI" && (typeof spec.defaultValue === "string")) {
        spec.defaultValue = new lib.ExternalObject(spec.defaultValue);
    }

    /** @private */
    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });
    this._.value = spec.defaultValue;
    this._.lastKnownValue = spec.defaultValue;
    this._.lastUpdate = null;

    var self = this;

    //@TODO: see comment in AbstractVirtualDevice; this is not clean especially it is supposed to be a private function and yet used in 4 other objects ...etc...; this looks like a required ((semi-)public) API ... or an $impl.XXX or a function ()...

    /** @private */
    Object.defineProperty(this._, 'isValidValue', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (newValue) {
            try {
                newValue = _checkAndGetNewValue(newValue, spec);
            } catch (e) {
                lib.createError('invalid value', e);
                return false;
            }

            if (typeof newValue === 'undefined') {
                lib.createError('trying to set an invalid value');
                return false;
            }

            if (spec.range && ((newValue < spec.range.low) || (newValue > spec.range.high))) {
                lib.createError('trying to set a value out of range [' + spec.range.low + ' - ' + spec.range.high + ']');
                return false;
            }
            return true;
        }
    });

    /** @private */
    Object.defineProperty(this._, 'remoteUpdate', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (newValue) {
            try {
                if (self._.isValidValue(newValue)) {
                    if (!spec.writable) {
                        lib.createError('trying to set a read only value');
                        return false;
                    }
                    self._.lastUpdate = Date.now();

                    if (_equal(newValue, self._.lastKnownValue, spec)) {
                        return;
                    }

                    self._.lastKnownValue = newValue;

                    var consoleValue = (self._.value instanceof lib.ExternalObject)? self._.value.getURI() : self._.value;
                    var consoleNewValue = (newValue instanceof lib.ExternalObject)? newValue.getURI() : newValue;
                    lib.log('updating attribute "' + spec.name + '" of type "' + spec.type + '" from ' + consoleValue + ' to ' + consoleNewValue);
                    self._.value = newValue;
                }
            } catch (e) {
                lib.createError('invalid value ', e);
            }
        }
    });

    /** @private */
    Object.defineProperty(this._, 'getNewValue', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (newValue, virtualDevice, callback) {
            try {
                if (self._.isValidValue(newValue)) {
                    _checkAndGetNewValueCallback(newValue, spec, virtualDevice, function(attributeValue, isSync) {
                        if (callback) {
                            callback(attributeValue, isSync);
                        }
                    });
                }
            } catch (e) {
                lib.createError('invalid value: ', e);
            }
        }
    });

    /**
     * The model for the attribute.
     *
     * private
     * @memberof iotcs.Attribute
     * @member {AttributeModel} deviceModel - the device model for this attribute.
     * the device model for this attribute.
     */
    Object.defineProperty(this, 'deviceModel', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: ''
    });

    /** @private */
    Object.defineProperty(this._, 'onUpdateResponse', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (error) {
            if (error) {
                var consoleValue = (self._.value instanceof lib.ExternalObject)? self._.value.getURI() : self._.value;
                var consoleLastKnownValue = (self._.lastKnownValue instanceof lib.ExternalObject)?
                    self._.lastKnownValue.getURI() : self._.lastKnownValue;
                lib.log('updating attribute "' + spec.name + '" of type "' + spec.type + '" from ' + consoleValue + ' to ' + consoleLastKnownValue);
                self._.value = self._.lastKnownValue;
            } else {
                self._.lastKnownValue = self._.value;
            }
            self._.lastUpdate = new Date().getTime();
        }
    });

    /** @private */
    Object.defineProperty(this._, 'localUpdate', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (newValue, nosync) {
            if (self._.isValidValue(newValue)) {
                newValue = _checkAndGetNewValue(newValue, spec);

                if (_equal(newValue, self._.value, spec)) {
                    return;
                }

                var consoleValue = (self._.value instanceof lib.ExternalObject) ? self._.value.getURI() : self._.value;
                var consoleNewValue = (newValue instanceof lib.ExternalObject) ? newValue.getURI() : newValue;
                lib.log('updating attribute "' + spec.name + '" of type "' + spec.type + '" from ' + consoleValue + ' to ' + consoleNewValue);
                self._.value = newValue;
                self._.lastKnownValue = newValue;

                if (!nosync) {
                    var attributes = {};
                    attributes[spec.name] = newValue;
                    if (!self.device || !(self.device instanceof lib.device.VirtualDevice)) {
                        return;
                    }
                    self.device._.updateAttributes(attributes);
                }
            } else {
                lib.error('invalid value');
            }
        }
    });

    // public properties

    /**
     * @memberof iotcs.Attribute
     * @member {string} id - the unique/reproducible
     * id for this attribute (usually its name)
     */
    Object.defineProperty(this, 'id', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.name
    });

    /**
     * @memberof iotcs.Attribute
     * @member {string} description - the description
     * of this attribute
     */
    Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.description
    });

    /**
     * @memberof iotcs.Attribute
     * @member {string} type - one of <code>INTEGER</code>,
     * <code>NUMBER</code>, <code>STRING</code>, <code>BOOLEAN</code>,
     * <code>DATETIME</code>
     */
    Object.defineProperty(this, 'type', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.type
    });

    Object.defineProperty(this, 'defaultValue', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.defaultValue
    });

    /**
     * @ignore
     * @memberof iotcs.Attribute
     * @member {boolean} writable - expressing whether
     * this attribute is writable or not
     */
    Object.defineProperty(this, 'writable', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.writable
    });

    /**
     * @memberof iotcs.Attribute
     * @member {function(Object)} onChange - function called
     * back when value as changed on the server side. Callback
     * signature is <code>function (e) {}</code>, where <code>e</code>
     * is <code>{'attribute':this, 'newValue':, 'oldValue':}</code>
     */
    Object.defineProperty(this, 'onChange', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.onChange;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set to onChange something that is not a function!');
                return;
            }
            this._.onChange = newValue;
        }
    });

    /**
     * @memberof iotcs.Attribute
     * @member {function(Object)} onError - function called
     * back when value could not be changed. Callback signature is
     * <code>function (e) {}</code>, where <code>e</code> is
     * <code>{'attribute':this, 'newValue':, 'tryValue':}</code>
     */
    Object.defineProperty(this, 'onError', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.onError;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set to onError something that is not a function!');
                return;
            }
            this._.onError = newValue;
        }
    });

    /**
     * @memberof iotcs.Attribute
     * @member {(number|string|boolean|Date)} value - used for setting or
     * getting the current value of this attribute (subject to whether it is writable
     * or not).
     */
    Object.defineProperty(this, 'value', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.value;
        },
        set: function (newValue) {
            this._.localUpdate(newValue, false);
        }
    });

    /**
     * @memberof iotcs.Attribute
     * @member {(number|string|boolean|Date)} lastKnownValue -
     * used for getting the current value of this attribute
     */
    Object.defineProperty(this, 'lastKnownValue', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.lastKnownValue;
        },
        set: function (newValue) {
        }
    });

    /**
     * @memberof iotcs.Attribute
     * @member {Date} lastUpdate - the date of the last value update
     */
    Object.defineProperty(this, 'lastUpdate', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.lastUpdate;
        },
        set: function (newValue) {
        }
    });
};

//////////////////////////////////////////////////////////////////////////////

/** @ignore */
function _parseRange(type, rangeStr) {
    _mandatoryArg(type, 'string');
    _mandatoryArg(rangeStr, 'string');
    if ((type !== 'NUMBER') && (type !== 'INTEGER')) {
        lib.error('device model specification is invalid');
        return;
    }
    var rangeLimits = rangeStr.split(',');
    if (rangeLimits.length != 2) {
        lib.error('device model specification is invalid');
        return;
    }
    var first = parseFloat(rangeLimits[0]);
    var second = parseFloat(rangeLimits[1]);
    return { low:Math.min(first,second), high:Math.max(first,second) };
}

/** @ignore */
function _matchType(reqType, value) {
    _mandatoryArg(reqType, 'string');
    switch(reqType) {
        case 'INTEGER':
            return ((typeof value === 'number') && (value % 1 === 0));
        case 'NUMBER':
            return (typeof value === 'number');
        case 'STRING':
            return (typeof value === 'string');
        case 'BOOLEAN':
            return (typeof value === 'boolean');
        case 'DATETIME':
            return (value instanceof Date);
        case 'URI':
            return (value instanceof lib.ExternalObject) || (typeof value === 'string');
        default:
            lib.error('illegal state');
            return;
    }
}

/** @ignore */
function _checkAndGetNewValue(newValue, spec) {
    if (spec.type === 'DATETIME') {
        if (typeof newValue === 'number') {
            var str = '' + newValue;
            if (str.match(/^[-+]?[1-9]\.[0-9]+e[-]?[1-9][0-9]*$/)) {
                newValue = newValue.toFixed();
            }
        }
        newValue = new Date(newValue);
        if (isNaN(newValue.getTime())) {
            lib.error('invalid date in date time parameter');
            return;
        }
    }
    if (!_matchType(spec.type, newValue)) {
        lib.error('type mismatch; attribute "' + spec.name + '" has type [' + spec.type + ']');
        return;
    }
    return newValue;
}

/** @ignore */
function _checkAndGetNewValueCallback(newValue, spec, virtualDevice, callback) {
    var isURICallback = false;
    if (spec.type === 'DATETIME') {
        if (typeof newValue === 'number') {
            var str = '' + newValue;
            if (str.match(/^[-+]?[1-9]\.[0-9]+e[-]?[1-9][0-9]*$/)) {
                newValue = newValue.toFixed();
            }
        }
        newValue = new Date(newValue);
        if (isNaN(newValue.getTime())) {
            lib.error('invalid date in date time parameter');
            return;
        }
    }
    if (spec.type === 'URI') {
        if (newValue instanceof lib.ExternalObject) {
            // nothing to do
        } else if (typeof newValue === 'string') {
            // get uri from server
            if (_isStorageCloudURI(newValue)) {
                isURICallback = true;
                virtualDevice.client._.internalDev.createStorageObject(newValue, function (storage, error) {
                    if (error) {
                        lib.error('Error during creation storage object: ' + error);
                        return;
                    }

                    var storageObject = new lib.device.StorageObject(storage.getURI(), storage.getName(),
                        storage.getType(), storage.getEncoding(), storage.getDate(), storage.getLength());
                    storageObject._.setDevice(virtualDevice.client._.internalDev);
                    storageObject._.setSyncEventInfo(spec.name, virtualDevice);

                    if (!_matchType(spec.type, storageObject)) {
                        lib.error('type mismatch; attribute "' + spec.name + '" has type [' + spec.type + ']');
                        return;
                    }
                    callback(storageObject);
                });
                return;
            } else {
                newValue = new lib.ExternalObject(newValue);
            }
        } else {
            lib.error('invalid URI parameter');
            return;
        }
    }

    if (!_matchType(spec.type, newValue)) {
        lib.error('type mismatch; attribute "' + spec.name + '" has type [' + spec.type + ']');
        return;
    }

    if (!isURICallback) {
        callback(newValue, true);
    }
}

/** @ignore */
function _equal(newValue, oldValue, spec) {
    if (spec.type === 'DATETIME'
        && (newValue instanceof Date)
        && (oldValue instanceof Date)) {
        return (newValue.getTime() === oldValue.getTime());
    } else {
        return (newValue === oldValue);
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/Action.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

//@TODO: missing JSDOC

/**
 * @class
 */
/** @ignore */
$impl.Action = function (actionSpec) {
    _mandatoryArg(actionSpec, 'object');

    if (!actionSpec.name) {
        lib.error('attribute specification in device model is incomplete');
        return;
    }

    var spec = {
        name: actionSpec.name,
        description: (actionSpec.description || ''),
        argType: (actionSpec.argType || null),
        alias: (actionSpec.alias || null),
        range: (actionSpec.range ? _parseRange(actionSpec.argType, actionSpec.range) : null)
    };

    /** @private */
    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    // public members

    /**
     * @memberof iotcs.Action
     * @member {string} name - the name of this action
     */
    Object.defineProperty(this, 'name', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.name
    });

    /**
     * @memberof iotcs.Action
     * @member {string} description - the description of this action
     */
    Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.description
    });

    /**
     * @memberof iotcs.Action
     * @member {function(Object)} onExecute - the action to perform when the an execute() is
     * received from the other party
     */
    Object.defineProperty(this, 'onExecute', {
        enumerable: false,
        configurable: false,
        get: function () {
            return this._.onExecute;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onExecute that is not a function!');
                return;
            }
            this._.onExecute = newValue;
        }
    });
    this._.onExecute = null;

    /** @private */
    this.checkAndGetVarArg = function (arg, virtualDevice, callback) {
        var isURICallback = false;
        if (!spec.argType) {
            if (typeof arg !== 'undefined') {
                lib.error('invalid number of arguments');
                return;
            }
        } else {
            if (typeof arg === 'undefined') {
                lib.error('invalid number of arguments');
                return;
            }

            if (spec.argType === 'URI') {
                if (arg instanceof lib.ExternalObject) {
                    arg = arg.getURI();
                } else if (typeof arg === 'string') {
                    // get uri from server
                    if (_isStorageCloudURI(arg)) {
                        isURICallback = true;
                        virtualDevice.client._.internalDev.createStorageObject(arg, function (storage, error) {
                            if (error) {
                                lib.error('Error during creation storage object: ' + error);
                                return;
                            }

                            var storageObject = new lib.device.StorageObject(storage.getURI(), storage.getName(),
                                storage.getType(), storage.getEncoding(), storage.getDate(), storage.getLength());
                            storageObject._.setDevice(virtualDevice.client._.internalDev);
                            storageObject._.setSyncEventInfo(spec.name, virtualDevice);

                            if (!_matchType(spec.argType, storageObject)) {
                                lib.error('type mismatch; action "'+spec.name+'" requires arg type [' + spec.argType + ']');
                                return;
                            }
                            callback(storageObject);
                        });
                        return;
                    } else {
                        arg = new lib.ExternalObject(arg);
                    }
                } else {
                    lib.error('invalid URI parameter');
                    return;
                }
            }

            if (!_matchType(spec.argType, arg)) {
                lib.error('type mismatch; action "'+spec.name+'" requires arg type [' + spec.argType + ']');
                return;
            }
            if (spec.range && ((arg<spec.range.low) || (arg>spec.range.high))) {
                lib.error('trying to use an argument which is out of range ['+spec.range.low+' - '+spec.range.high+']');
                return;
            }
        }
        if (!isURICallback) {
            callback(arg, true);
        }
    };
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/Alert.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * The Alert is an object that represents an alert type message format
 * defined in the formats section of the device model. Alerts can be used
 * to send alert messages to the server.
 * <p>
 * The Alert API is specific to the device client library and the alerts
 * can be created by the VirtualDevice objects or using them.
 * For setting the fields of the alert as defined in the model, the fields
 * property of the alert will be used e.g.:<br>
 * <code>alert.fields.temp = 50;</code>
 * <p>
 * The constructor of the Alert should not be used directly but the
 * {@link iotcs.device.VirtualDevice#createAlert} method should be used
 * for creating alert objects.
 *
 * @memberOf iotcs.device
 * @alias Alert
 * @class
 *
 * @param {iotcs.device.VirtualDevice} virtualDevice - the virtual device that has
 * in it's device model the alert specification
 * @param {string} formatUrn - the urn format of the alert spec
 *
 * @see {@link iotcs.device.VirtualDevice#createAlert}
 */
lib.device.Alert = function (virtualDevice, formatUrn) {
    _mandatoryArg(virtualDevice, lib.device.VirtualDevice);
    _mandatoryArg(formatUrn, 'string');

    var alertSpec = virtualDevice[formatUrn];

    if (!alertSpec.urn || (alertSpec.type !== 'ALERT')) {
        lib.error('alert specification in device model is invalid');
        return;
    }

    this.device = virtualDevice;

    var spec = {
        urn: alertSpec.urn,
        description: (alertSpec.description || ''),
        name: (alertSpec.name || null)
    };

    if (alertSpec.value && alertSpec.value.fields && Array.isArray(alertSpec.value.fields)) {

        Object.defineProperty(this, 'fields', {
            enumerable: true,
            configurable: false,
            writable: false,
            value: {}
        });

        /** @private */
        Object.defineProperty(this, '_', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {}
        });

        var self = this;

        alertSpec.value.fields.forEach(function (field) {
            self._[field.name] = {};
            self._[field.name].type = field.type.toUpperCase();
            self._[field.name].optional = field.optional;
            self._[field.name].name = field.name;
            self._[field.name].value = null;
            Object.defineProperty(self.fields, field.name, {
                enumerable: false,
                configurable: false,
                get: function () {
                    return self._[field.name].value;
                },
                set: function (newValue) {

                    if (!self._[field.name].optional && ((typeof newValue === 'undefined') || (newValue === null))) {
                        lib.error('trying to unset a mandatory field in the alert');
                        return;
                    }

                    newValue = _checkAndGetNewValue(newValue, self._[field.name]);

                    if (typeof newValue === 'undefined') {
                        lib.error('trying to set an invalid type of field in the alert');
                        return;
                    }

                    self._[field.name].value = newValue;
                }
            });
        });
    }

    // public members

    Object.defineProperty(this, 'urn', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.urn
    });

    Object.defineProperty(this, 'name', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.name
    });

    Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.description
    });
};

/**
 * This method is used to actually send the alert message to the server.
 * The default severity for the alert sent is SIGNIFICANT.
 * All mandatory fields (according to the device model definition)
 * must be set before sending, otherwise an error will be thrown.
 * Any error that can arise while sending will be handled by the
 * VirtualDevice.onError handler, if set.
 * <p>
 * After a successful raise all the values are reset so to raise
 * again the values must be first set.
 *
 * @see {@link iotcs.device.VirtualDevice}
 * @memberOf iotcs.device.Alert.prototype
 * @function raise
 */
lib.device.Alert.prototype.raise = function () {
    var message = lib.message.Message.AlertMessage.buildAlertMessage(this.urn, this.description, lib.message.Message.AlertMessage.Severity.SIGNIFICANT);
    message.source(this.device.getEndpointId());
    var messageDispatcher = new lib.device.util.MessageDispatcher(this.device.client._.internalDev);
    var storageObjects = [];
    for (var key in this._) {
        var field = this._[key];
        if (!field.optional && ((typeof field.value === 'undefined') || (field.value === null))) {
            lib.error('all mandatory fields not set');
            return;
        }
        if ((typeof field.value !== 'undefined') && (field.value !== null)) {
            if ((field.type === "URI") && (field.value instanceof lib.StorageObject)) {
                var syncStatus = field.value.getSyncStatus();
                if (syncStatus === lib.device.StorageObject.SyncStatus.NOT_IN_SYNC ||
                    syncStatus === lib.device.StorageObject.SyncStatus.SYNC_PENDING) {
                    storageObjects.push(field.value);
                }
                field.value._.setSyncEventInfo(key, this.device);
                field.value.sync();
            }
            message.dataItem(key, field.value);
        }
    }

    storageObjects.forEach(function (storageObject) {
        messageDispatcher._.addStorageDependency(storageObject, message._.internalObject.clientId);
    });
    messageDispatcher.queue(message);
    for (var key1 in this._) {
        this._[key1].value = null;
    }
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/Data.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * The Data is an object that represents a set of custom data fields (key/value pairs)
 * defined in the formats section of the device model. Data can be used
 * to send these fields to the server.
 * <p>
 * The Data API is specific to the device client library and the data fields
 * can be created by the VirtualDevice objects or using them.
 * For setting the fields of the data object as defined in the model, the fields
 * property of the data object will be used e.g.:<br>
 * <code>data.fields.temp = 50;</code>
 * <p>
 * The constructor of the Data object should not be used directly but the
 * {@link iotcs.device.VirtualDevice#createData} method should be used
 * for creating data objects.
 *
 * @memberOf iotcs.device
 * @alias Data
 * @class
 *
 * @param {iotcs.device.VirtualDevice} virtualDevice - the virtual device that has
 * in it's device model the custom format specification
 * @param {string} formatUrn - the urn format of the custom data fields spec
 *
 * @see {@link iotcs.device.VirtualDevice#createData}
 */
lib.device.Data = function (virtualDevice, formatUrn) {
    _mandatoryArg(virtualDevice, lib.device.VirtualDevice);
    _mandatoryArg(formatUrn, 'string');

    var dataSpec = virtualDevice[formatUrn];

    if (!dataSpec.urn || (dataSpec.type !== 'DATA')) {
        lib.error('data specification in device model is invalid');
        return;
    }

    this.device = virtualDevice;

    var spec = {
        urn: dataSpec.urn,
        description: (dataSpec.description || ''),
        name: (dataSpec.name || null)
    };

    if (dataSpec.value && dataSpec.value.fields && Array.isArray(dataSpec.value.fields)) {
        Object.defineProperty(this, 'fields', {
            enumerable: true,
            configurable: false,
            writable: false,
            value: {}
        });

        Object.defineProperty(this, '_', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {}
        });

        var self = this;

        dataSpec.value.fields.forEach(function (field) {
            self._[field.name] = {};
            self._[field.name].type = field.type.toUpperCase();
            self._[field.name].optional = field.optional;
            self._[field.name].name = field.name;
            self._[field.name].value = null;
            Object.defineProperty(self.fields, field.name, {
                enumerable: false,
                configurable: false,
                get: function () {
                    return self._[field.name].value;
                },
                set: function (newValue) {

                    if (!self._[field.name].optional && ((typeof newValue === 'undefined') || (newValue === null))) {
                        lib.error('trying to unset a mandatory field in the data object');
                        return;
                    }

                    newValue = _checkAndGetNewValue(newValue, self._[field.name]);

                    if (typeof newValue === 'undefined') {
                        lib.error('trying to set an invalid type of field in the data object');
                        return;
                    }

                    self._[field.name].value = newValue;
                }
            });

        });
    }

    // public members
    Object.defineProperty(this, 'urn', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.urn
    });

    Object.defineProperty(this, 'name', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.name
    });

    Object.defineProperty(this, 'description', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: spec.description
    });
};

/**
 * This method is used to actually send the custom data fields to the server.
 * All mandatory fields (according to the device model definition)
 * must be set before sending, otherwise an error will be thrown.
 * Any error that can arise while sending will be handled by the
 * VirtualDevice.onError handler, if set.
 * <p>
 * After a successful send all the values are reset so to send
 * again the values must be first set.
 *
 * @see {@link iotcs.device.VirtualDevice}
 * @memberOf iotcs.device.Data.prototype
 * @function submit
 */
lib.device.Data.prototype.submit = function () {
    var message = new lib.message.Message();
    message
        .type(lib.message.Message.Type.DATA)
        .source(this.device.getEndpointId())
        .format(this.urn);

    var messageDispatcher = new lib.device.util.MessageDispatcher(this.device.client._.internalDev);
    var storageObjects = [];
    for (var key in this._) {
        var field = this._[key];
        if (!field.optional && ((typeof field.value === 'undefined') || (field.value === null))) {
            lib.error('all mandatory fields not set');
            return;
        }
        if ((typeof field.value !== 'undefined') && (field.value !== null)) {
            if ((field.type === "URI") && (field.value instanceof lib.StorageObject)) {
                var syncStatus = field.value.getSyncStatus();
                if (syncStatus === lib.device.StorageObject.SyncStatus.NOT_IN_SYNC ||
                    syncStatus === lib.device.StorageObject.SyncStatus.SYNC_PENDING) {
                    storageObjects.push(field.value);
                }
                field.value._.setSyncEventInfo(key, this.device);
                field.value.sync();
            }
            message.dataItem(key, field.value);
        }
    }

    storageObjects.forEach(function (storageObject) {
        messageDispatcher._.addStorageDependency(storageObject, message._.internalObject.clientId);
    });
    messageDispatcher.queue(message);
    for (var key1 in this._) {
        this._[key1].value = null;
    }
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DirectlyConnectedDevice.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * A directly-connected device is able to send messages to,
 * and receive messages from, the IoT server. When the
 * directly-connected device is activated on the server, the
 * server assigns a logical-endpoint identifier. This
 * logical-endpoint identifier is required for sending
 * messages to, and receiving messages from, the server.
 * <p>
 * The directly-connected device is able to activate itself using
 * the direct activation capability. The data required for activation
 * and authentication is retrieved from a TrustedAssetsStore generated
 * using the TrustedAssetsProvisioner tool using the Default TrustedAssetsManager.
 * <p>
 * This object represents the Virtualization API (high-level API) for the directly-connected device
 * and uses the MessageDispatcher for sending/receiving messages.
 * Also it implements the message dispatcher, diagnostics and connectivity test
 * capabilities. Also it can be used for creating virtual devices.
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 * @param {boolean} [gateway] - indicate creation of a GatewayDevice representation
 *
 * @see {@link iotcs.device.util.MessageDispatcher}
 * @memberOf iotcs.device
 * @alias DirectlyConnectedDevice
 * @class
 * @extends iotcs.Client
 */
lib.device.DirectlyConnectedDevice = function (taStoreFile, taStorePassword, gateway) {
    lib.Client.call(this);

    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    Object.defineProperty(this._, 'internalDev',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: (gateway ? new lib.device.util.GatewayDevice(taStoreFile, taStorePassword) : new lib.device.util.DirectlyConnectedDevice(taStoreFile, taStorePassword))
    });

    Object.defineProperty(this._, 'virtualDevices',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    var self = this;

    Object.defineProperty(this._, 'removeVirtualDevice',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(device) {
            if (self._.virtualDevices[device.getEndpointId()]) {
                if (self._.virtualDevices[device.getEndpointId()][device.getDeviceModel().urn]) {
                    delete self._.virtualDevices[device.getEndpointId()][device.getDeviceModel().urn];
                }
                if (Object.keys(self._.virtualDevices[device.getEndpointId()]).length === 0) {
                    delete self._.virtualDevices[device.getEndpointId()];
                }
            }
        }
    });

    Object.defineProperty(this._, 'addVirtualDevice',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(device){
            self._.removeVirtualDevice(device);
            if (!self._.virtualDevices[device.getEndpointId()]) {
                self._.virtualDevices[device.getEndpointId()] = {};
            }
            self._.virtualDevices[device.getEndpointId()][device.getDeviceModel().urn] = device;
        }
    });

    var messageResponseHandler = function (messages, exception) {
        var deviceMap = {};

        messages.forEach(function (messageObj) {
            var message = messageObj.getJSONObject();
            if ((message.type === lib.message.Message.Type.DATA) && message.payload.data
                && message.payload.format && (message.payload.format.indexOf(':attributes') > -1)) {
                var model = message.payload.format.substring(0, message.payload.format.indexOf(':attributes'));
                var devId = message.source;
                if (!(devId in deviceMap)) {
                    deviceMap[devId] = {};
                }
                if (!(model in deviceMap)) {
                    deviceMap[devId][model] = {};
                }
                for (var key in message.payload.data) {
                    deviceMap[devId][model][key] = message.payload.data[key];
                }
            } else if (((message.type === lib.message.Message.Type.ALERT) || (message.type === lib.message.Message.Type.DATA))
                && message.payload.format) {
                var devId1 = message.source;
                if (!(devId1 in deviceMap)) {
                    deviceMap[devId1] = {};
                }
                var format = message.payload.format;
                if (devId1 in self._.virtualDevices) {
                    for (var model1 in self._.virtualDevices[devId1]) {
                        if (format in self._.virtualDevices[devId1][model1]) {
                            if (!(model1 in deviceMap)) {
                                deviceMap[devId1][model1] = {};
                            }
                            deviceMap[devId1][model1][format] = message.payload.data;
                        }
                    }
                }
            }
        });

        for (var deviceId in deviceMap) {
            for (var deviceModel in deviceMap[deviceId]) {
                if ((deviceId in self._.virtualDevices) && (deviceModel in self._.virtualDevices[deviceId])) {
                    var device = self._.virtualDevices[deviceId][deviceModel];
                    var attributeNameValuePairs = deviceMap[deviceId][deviceModel];
                    var attrObj = {};
                    var newValObj = {};
                    var tryValObj = {};
                    for (var attributeName in attributeNameValuePairs) {
                        var attribute = device[attributeName];
                        if (attribute && (attribute instanceof $impl.Attribute)) {
                            attribute._.onUpdateResponse(exception);
                            attrObj[attribute.id] = attribute;
                            newValObj[attribute.id] = attribute.value;
                            tryValObj[attribute.id] = attributeNameValuePairs[attributeName];
                            if (exception && attribute.onError) {
                                var onAttributeErrorTuple = {
                                    attribute: attribute,
                                    newValue: attribute.value,
                                    tryValue: attributeNameValuePairs[attributeName],
                                    errorResponse: exception
                                };
                                attribute.onError(onAttributeErrorTuple);
                            }
                        }
                        else if (attribute && (attribute.type === 'ALERT')) {
                            attrObj[attribute.urn] = new lib.device.Alert(device, attribute.urn);
                            var data = attributeNameValuePairs[attributeName];
                            for(var key in data) {
                                attrObj[attribute.urn].fields[key] = data[key];
                            }
                        }
                        else if (attribute && (attribute.type === 'DATA')) {
                            attrObj[attribute.urn] = new lib.device.Data(device, attribute.urn);
                            var data1 = attributeNameValuePairs[attributeName];
                            for(var key1 in data1) {
                                attrObj[attribute.urn].fields[key1] = data1[key1];
                            }
                        }
                    }
                    if (exception && device.onError) {
                        var onDeviceErrorTuple = {
                            attributes: attrObj,
                            newValues: newValObj,
                            tryValues: tryValObj,
                            errorResponse: exception
                        };
                        device.onError(onDeviceErrorTuple);
                    }
                }
            }
        }
    };

    var storageHandler = function (progress, error) {
        var storage = progress.getStorageObject();
        if (error) {
            if (storage._.deviceForSync && storage._.deviceForSync.onError) {
                var tryValues = {};
                tryValues[storage._.nameForSyncEvent] = storage.getURI();
                var onDeviceErrorTuple = {
                    newValues: tryValues,
                    tryValues: tryValues,
                    errorResponse: error
                };
                storage._.deviceForSync.onError(onDeviceErrorTuple);
            }
            return;
        }
        if (storage) {
            var state = progress.getState();
            var oldSyncStatus = storage.getSyncStatus();
            switch (state) {
                case lib.StorageDispatcher.Progress.State.COMPLETED:
                    storage._.internal.syncStatus = lib.device.StorageObject.SyncStatus.IN_SYNC;
                    break;
                case lib.StorageDispatcher.Progress.State.CANCELLED:
                case lib.StorageDispatcher.Progress.State.FAILED:
                    storage._.internal.syncStatus = lib.device.StorageObject.SyncStatus.SYNC_FAILED;
                    break;
                case lib.StorageDispatcher.Progress.State.IN_PROGRESS:
                case lib.StorageDispatcher.Progress.State.INITIATED:
                case lib.StorageDispatcher.Progress.State.QUEUED:
                    // do nothing
            }
            if (oldSyncStatus !== storage.getSyncStatus()) {
                storage._.handleStateChange();
                if (storage._.onSync) {
                    var syncEvent;
                    while ((syncEvent = storage._.internal.syncEvents.pop()) !== null) {
                        storage._.onSync(syncEvent);
                    }
                }
            }
        }
    };
    new lib.device.util.MessageDispatcher(this._.internalDev).onError = messageResponseHandler;
    new lib.device.util.MessageDispatcher(this._.internalDev).onDelivery = messageResponseHandler;

    new lib.device.util.StorageDispatcher(this._.internalDev).onProgress = storageHandler;
};

lib.device.DirectlyConnectedDevice.prototype = Object.create(lib.Client.prototype);
lib.device.DirectlyConnectedDevice.constructor = lib.device.DirectlyConnectedDevice;

/**
 * Activate the device. The device will be activated on the
 * server if necessary. When the device is activated on the
 * server. The activation would tell the server the models that
 * the device implements. Also the activation can generate
 * additional authorization information that will be stored in
 * the TrustedAssetsStore and used for future authentication
 * requests. This can be a time/resource consuming operation for
 * some platforms.
 * <p>
 * If the device is already activated, this method will throw
 * an exception. The user should call the isActivated() method
 * prior to calling activate.
 *
 * @param {string[]} deviceModelUrns - an array of deviceModel
 * URNs implemented by this directly connected device
 * @param {function} callback - the callback function. This
 * function is called with this object but in the activated
 * state. If the activation is not successful then the object
 * will be null and an error object is passed in the form
 * callback(device, error) and the reason can be taken from
 * error.message
 *
 * @memberOf iotcs.device.DirectlyConnectedDevice.prototype
 * @function activate
 */
lib.device.DirectlyConnectedDevice.prototype.activate = function (deviceModelUrns, callback) {
    if (this.isActivated()) {
        lib.error('cannot activate an already activated device');
        return;
    }

    _mandatoryArg(deviceModelUrns, 'array');
    _mandatoryArg(callback, 'function');

    deviceModelUrns.forEach(function (urn) {
        _mandatoryArg(urn, 'string');
    });

    var deviceModels = deviceModelUrns;
    deviceModels.push('urn:oracle:iot:dcd:capability:diagnostics');
    deviceModels.push('urn:oracle:iot:dcd:capability:message_dispatcher');
    deviceModels.push('urn:oracle:iot:dcd:capability:device_policy');
    var self = this;
    this._.internalDev.activate(deviceModels, function(activeDev, error) {
        if (!activeDev || error) {
            callback(null, error);
            return;
        }
        callback(self);
    });
};

/**
 * This will return the directly connected device state.
 *
 * @returns {boolean} whether the device is activated.
 *
 * @memberof iotcs.device.DirectlyConnectedDevice.prototype
 * @function isActivated
 */
lib.device.DirectlyConnectedDevice.prototype.isActivated = function () {
    return this._.internalDev.isActivated();
};

/**
 * Return the logical-endpoint identifier of this
 * directly-connected device. The logical-endpoint identifier
 * is assigned by the server as part of the activation
 * process.
 *
 * @returns {string} the logical-endpoint identifier of this
 * directly-connected device.
 *
 * @memberof iotcs.device.DirectlyConnectedDevice.prototype
 * @function getEndpointId
 */
lib.device.DirectlyConnectedDevice.prototype.getEndpointId = function () {
    return this._.internalDev.getEndpointId();
};

/**@inheritdoc*/
lib.device.DirectlyConnectedDevice.prototype.getDeviceModel = function (deviceModelUrn, callback) {
    return this._.internalDev.getDeviceModel(deviceModelUrn, callback);
};

/**
 * Create a VirtualDevice instance with the given device model
 * for the given device identifier. This method creates a new
 * VirtualDevice instance for the given parameters. The client
 * library does not cache previously created VirtualDevice
 * objects.
 * <p>
 * A device model can be obtained by it's afferent urn with the
 * DirectlyConnectedDevice if it is registered on the cloud.
 *
 * @param {string} endpointId - The endpoint identifier of the
 * device being modeled.
 * @param {object} deviceModel - The device model object
 * holding the full description of that device model that this
 * device implements.
 * @returns {iotcs.device.VirtualDevice} The newly created virtual device
 *
 * @see {@link iotcs.device.DirectlyConnectedDevice#getDeviceModel}
 * @memberof lib.device.DirectlyConnectedDevice.prototype
 * @function createVirtualDevice
 */
lib.device.DirectlyConnectedDevice.prototype.createVirtualDevice = function (endpointId, deviceModel) {
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(deviceModel, 'object');

    // // Add the device policy manager for the Gateway.
    // let persistenceStore = PersistenceStoreManager.get(endpointId);
    // let devicePolicyManager = new DevicePolicyManager(this);
    // console.log('DirectlyConnectedDevice devicePolicyManager for endpointId: ' + this._.internalDev.getEndpointId() + ' = ' + devicePolicyManager);
    //
    // if (devicePolicyManager) {
    //     persistenceStore
    //         .openTransaction()
    //         .putOpaque('DevicePolicyManager', devicePolicyManager)
    //         .commit();
    // }

    // let dcd = new lib.device.DirectlyConnectedDevice(
    //     this._.internalDev._.internalDev._.tam.taStoreFile,
    //     this._.internalDev._.internalDev._.tam.sharedSecret,
    //     this);

    return new lib.device.VirtualDevice(endpointId, deviceModel, this);
};

/**
 * This method will close this directly connected device (client) and
 * all it's resources. All monitors required by the message dispatcher
 * associated with this client will be stopped and all created virtual
 * devices will be removed.
 *
 * @memberof iotcs.device.DirectlyConnectedDevice.prototype
 * @function close
 */
lib.device.DirectlyConnectedDevice.prototype.close = function () {
    this._.internalDev.close();
    for (var key in this._.virtualDevices) {
        for (var key1 in this._.virtualDevices[key]) {
            this._.virtualDevices[key][key1].close();
        }
    }
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/GatewayDevice.js

/**
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * This represents a GatewayDevice in the Virtualization API.
 * It has the exact same specifications and capabilities as
 * a directly connected device from the Virtualization API and additionally
 * it has the capability to register indirectly connected devices.
 *
 * @param {string} [taStoreFile] - trusted assets store file path
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.store
 * @param {string} [taStorePassword] - trusted assets store file password
 * to be used for trusted assets manager creation. This is optional.
 * If none is given the default global library parameter is used:
 * lib.oracle.iot.tam.storePassword
 *
 * @memberOf iotcs.device
 * @alias GatewayDevice
 * @class
 * @extends iotcs.device.DirectlyConnectedDevice
 */
lib.device.GatewayDevice = function (taStoreFile, taStorePassword) {
    lib.device.DirectlyConnectedDevice.call(this, (taStoreFile ? taStoreFile : null), (taStorePassword ? taStorePassword : null), true);
};

// Construct this Gateway's DCD (all devices are DCD's).
lib.device.GatewayDevice.prototype = Object.create(lib.device.DirectlyConnectedDevice.prototype);
lib.device.GatewayDevice.constructor = lib.device.GatewayDevice.prototype;

/**
 * Enumeration of the standard properties that can
 * be used in the metadata object given as parameter
 * on indirect registration
 *
 * @memberOf iotcs.device.GatewayDevice
 * @alias DeviceMetadata
 * @class
 * @readonly
 * @enum {string}
 * @see {@link iotcs.device.GatewayDevice#registerDevice}
 */
lib.device.GatewayDevice.DeviceMetadata = {
    MANUFACTURER: 'manufacturer',
    MODEL_NUMBER: 'modelNumber',
    SERIAL_NUMBER: 'serialNumber',
    DEVICE_CLASS: 'deviceClass',
    PROTOCOL: 'protocol',
    PROTOCOL_DEVICE_CLASS: 'protocolDeviceClass',
    PROTOCOL_DEVICE_ID: 'protocolDeviceId'
};

/**
 * Register an indirectly-connected device with the cloud service and specify whether
 * the gateway device is required to have the appropriate credentials for activating
 * the indirectly-connected device.
 *
 * The <code>restricted</code> parameter controls whether or not the client
 * library is <em>required</em> to supply credentials for activating
 * the indirectly-connected device. The client library will
 * <em>always</em> supply credentials for an indirectly-connected
 * device whose trusted assets have been provisioned to the client.
 * If, however, the trusted assets of the indirectly-connected device
 * have not been provisioned to the client, the client library can
 * create credentials that attempt to restrict the indirectly connected
 * device to this gateway device.
 *
 * The <code>restricted</code> parameter could be omitted. This is the equivalent of calling
 * <code>iotcs.device.util.GatewayDevice.registerDevice(false, hardwareId, metaData, deviceModels, callback)</code>.
 *
 * Pass <code>true</code> for the <code>restricted</code> parameter
 * to ensure the indirectly-connected device cannot be activated
 * by this gateway device without presenting credentials. If <code>restricted</code>
 * is <code>true</code>, the client library will provide credentials to the server.
 * The server will reject the activation request if the indirectly connected
 * device is not allowed to roam to this gateway device.
 *
 * Pass <code>false</code> to allow the indirectly-connected device to be activated
 * without presenting credentials if the trusted assets of the
 * indirectly-connected device have not been provisioned to the client.
 * If <code>restricted</code> is <code>false</code>, the client library will provide
 * credentials if, and only if, the credentials have been provisioned to the
 * client. The server will reject the activation if credentials are required
 * but not supplied, or if the provisioned credentials do not allow the
 * indirectly connected device to roam to this gateway device.
 *
 * The <code>hardwareId</code> is a unique identifier within the cloud service
 * instance and may not be <code>null</code>. If one is not present for the device,
 * it should be generated based on other metadata such as: model, manufacturer,
 * serial number, etc.
 *
 * The <code>metaData</code> Object should typically contain all the standard
 * metadata (the constants documented in this class) along with any other
 * vendor defined metadata.
 *
 * @param {boolean} [restricted] - indicate whether or not credentials are required
 * for activating the indirectly connected device
 * @param {!string} hardwareId - an identifier unique within the Cloud Service instance
 * @param {Object} metaData - The metadata of the device
 * @param {string[]} deviceModelUrns - array of device model URNs
 * supported by the indirectly connected device
 * @param {function(Object)} callback - the callback function. This
 * function is called with the following argument: the endpoint id
 * of the indirectly-connected device is the registration was successful
 * or null and an error object as the second parameter: callback(id, error).
 * The reason can be retrieved from error.message and it represents
 * the actual response from the server or any other network or framework
 * error that can appear.
 *
 * @see {@link iotcs.device.GatewayDevice.DeviceMetadata}
 * @memberof iotcs.device.GatewayDevice.prototype
 * @function registerDevice
 */
lib.device.GatewayDevice.prototype.registerDevice = function (restricted, hardwareId, metaData, deviceModelUrns, callback) {
    if (arguments.length == 4) {
        hardwareId = arguments[0];
        metaData = arguments[1];
        deviceModelUrns = arguments[2];
        callback = arguments[3];
        restricted = false;
    }
    this._.internalDev.registerDevice(restricted, hardwareId, metaData, deviceModelUrns, callback);
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/VirtualDevice.js

/**
 * Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * VirtualDevice is a representation of a device model
 * implemented by an endpoint. A device model is a
 * specification of the attributes, formats, and resources
 * available on the endpoint.
 * <p>
 * This VirtualDevice API is specific to the device
 * client. This implements the alerts defined in the
 * device model and can be used for raising alerts to
 * be sent to the server for the device. Also it has
 * action handlers for actions that come as requests
 * from the server side.
 * <p>
 * A device model can be obtained by it's afferent urn with the
 * DirectlyConnectedDevice if it is registered on the cloud.
 * <p>
 * The VirtualDevice has the attributes, actions and alerts of the device
 * model as properties and it provides functionality to the device
 * model in the following ways:
 * <p>
 * <b>Get the value of an attribute:</b><br>
 * <code>var value = device.temperature.value;</code><br>
 * <p>
 * <b>Get the last known value of an attribute:</b><br>
 * <code>var lastValue = device.temperature.lastKnownValue;</code><br>
 * <p>
 * <b>Set the value of an attribute (with update on cloud and error callback handling):</b><br>
 * <code>device.temperature.onError = function (errorTuple);</code><br>
 * <code>device.temperature.value = 27;</code><br>
 * where errorTuple is an object of the form
 * <code>{attribute: ... , newValue: ... , tryValue: ... , errorResponse: ...}</code>.
 * The library will throw an error in the value to update is invalid
 * according to the device model.
 * <p>
 * <b>Monitor a specific attribute for any value change (that comes from the cloud):</b><br>
 * <code>device.maxThreshold.onChange = function (changeTuple);</code><br>
 * where changeTuple is an object of the form
 * <code>{attribute: ... , newValue: ... , oldValue: ...}</code>.
 * To tell the cloud that the attribute update has failed
 * an exception must be thrown in the onChange function, otherwise the
 * library will send an OK response message to the cloud.
 * <p>
 * <b>Monitor a specific action that was requested from the server:</b><br>
 * <code>device.reset.onExecute = function (value);</code><br>
 * where value is an optional parameter given if the action has parameters
 * defined in the device model. To tell the cloud that an action has failed
 * an exception must be thrown in the onExecute function, otherwise the
 * library will send an OK response message to the cloud.
 * <p>
 * <b>Monitor all attributes for any value change (that comes from the cloud):</b><br>
 * <code>device.onChange = function (changeTuple);</code><br>
 * where changeTuple is an object with array type properties of the form
 * <code>[{attribute: ... , newValue: ... , oldValue: ...}]</code>.
 * To tell the cloud that the attribute update has failed
 * an exception must be thrown in the onChange function, otherwise the
 * library will send an OK response message to the cloud.
 * <p>
 * <b>Monitor all update errors:</b><br>
 * <code>device.onError = function (errorTuple);</code><br>
 * where errorTuple is an object with array type properties (besides errorResponse) of the form
 * <code>{attributes: ... , newValues: ... , tryValues: ... , errorResponse: ...}</code>.
 * <p>
 * <b>Raising alerts:</b><br>
 * <code>var alert = device.createAlert('urn:com:oracle:iot:device:temperature_sensor:too_hot');</code><br>
 * <code>alert.fields.temp = 100;</code><br>
 * <code>alert.fields.maxThreshold = 90;</code><br>
 * <code>alert.raise();</code><br>
 * If an alert was not sent the error is handled by the device.onError handler where errorTuple has
 * the following structure:<br>
 * <code>{attributes: ... , errorResponse: ...}</code><br>
 * where attributes are the alerts that failed with fields already set, so the alert can be retried
 * only by raising them.
 * <p>
 * <b>Sending custom data fields:</b><br>
 * <code>var data = device.createData('urn:com:oracle:iot:device:motion_sensor:rfid_detected');</code><br>
 * <code>data.fields.detecting_motion = true;</code><br>
 * <code>data.submit();</code><br>
 * If the custom data fields were not sent, the error is handled by the device.onError handler where errorTuple has
 * the following structure:<br>
 * <code>{attributes: ... , errorResponse: ...}</code><br>
 * where attributes are the Data objects that failed to be sent with fields already set, so the Data objects can be retried
 * only by sending them.
 * <p>
 * A VirtualDevice can also be created with the appropriate
 * parameters from the DirectlyConnectedDevice.
 *
 * @param {string} endpointId - The endpoint ID of this device.
 * @param {object} deviceModel - The device model object.
 *        holding the full description of that device model that this device implements.
 * @param {iotcs.device.DirectlyConnectedDevice} client - The device client
 *        used as message dispatcher for this virtual device.
 *
 * @see {@link iotcs.device.DirectlyConnectedDevice#getDeviceModel}
 * @see {@link iotcs.device.DirectlyConnectedDevice#createVirtualDevice}
 * @class
 * @memberOf iotcs.device
 * @alias VirtualDevice
 * @extends iotcs.AbstractVirtualDevice
 */
lib.device.VirtualDevice = function (endpointId, deviceModel, client) {
    // Instance "variables"/properties...see constructor.
    _mandatoryArg(endpointId, 'string');
    _mandatoryArg(deviceModel, 'object');
    _mandatoryArg(client, lib.device.DirectlyConnectedDevice);

    lib.AbstractVirtualDevice.call(this, endpointId, deviceModel);

    this.client = client;

    let persistenceStore = PersistenceStoreManager.get(endpointId);
    this.devicePolicyManager = new DevicePolicyManager(client);

    if (this.devicePolicyManager) {
        persistenceStore
            .openTransaction()
            .putOpaque('DevicePolicyManager', this.devicePolicyManager)
            .commit();
    }

    /**
     * @param {VirtualDevice} virtualDevice
     * @param {DeviceModel} deviceModel
     * @return {Map<string, VirtualDeviceAttribute>}
     */
    Object.defineProperty(this._, 'createAttributeMap', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(virtualDevice, deviceModel) {
            // @type {Map<String, VirtualDeviceAttributeBase<VirtualDevice, Object>>}
            const map = new Map();
            const deviceModelObj = DeviceModelParser.fromJson(deviceModel);

            deviceModelObj.getDeviceModelAttributes().forEach((attribute, attributeName) => {
                // @type {VirtualDeviceAttributeImpl<Object>}
                let vda = new VirtualDeviceAttribute(virtualDevice, attribute);
                map.set(attributeName, vda);
                // @type {string}
                let alias = attribute.getName();

                if (alias && (alias.length > 0)) {
                    map.set(alias, vda);
                }
            });

            return map;
        }
    });

    this.attributeMap = this._.createAttributeMap(this, deviceModel);
    this.messageDispatcher = new lib.device.util.MessageDispatcher(this.client._.internalDev);
    let messageDispatcher = this.messageDispatcher; // TODO: fix references to local dispatcher.

    var self = this;
    // @type {Map<string, VirtualDeviceAttribute}
    this.attributes = this;

    // The key is the set of attributes that are referred to in the computedMetric formula.
    // The value is the attribute that is computed.
    // @type {Set<Pair<Set<string>, string>>}
    this.computedMetricTriggerMap = new Set();
    // @type {DevicePolicyManager}
    this.devicePolicyManager = DevicePolicyManager.getDevicePolicyManager(endpointId);
    this.devicePolicyManager.addChangeListener(this);
    // Millisecond time in the future at which the policy value should be computed.
    // @type {number}
    this.expiry = 0;
    // {Map<string, Set<Map<string, object>>>}
    this.pipelineDataCache = new Map();
    // { attributeName : pipelineIndex }
    // @type {Map<string, number}
    this.pipelineIndices = new Map();

    // Window based policy support (as in "window", not Windows OS). Have one scheduled task for
    // each policy "slide" value. The slide value is how much to move the window, so we want to run
    // the policy when the slide expires. When the slide expires, the runnable will call back each
    // VirtualDeviceAttribute that has a policy for that slide value.
    // Window and slide are the key.
    // { {window,slide} : ScheduledPolicyData }
    // @type {Map<ScheduledPolicyDataKey, ScheduledPolicyData}
    this.scheduledPolicies = new Map();
    // How much the window moves is used to calculate expiry.
    // @type {number}
    this.slide = 0;
    // @type {TimedPolicyThread}
    this.timedPolicyThread = new TimedPolicyThread(this);

    var attributeHandler = function (requestMessage) {
        var method = _getMethodForRequestMessage(requestMessage);

        if (!method || (method !== 'PUT')) {
            return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
        }

        var urlAttribute = requestMessage.payload.url.substring(requestMessage.payload.url.lastIndexOf('/') + 1);

        if ((urlAttribute in self.attributes) &&
            (self.attributes[urlAttribute] instanceof $impl.Attribute))
        {
            try {
                var attribute = self.attributes[urlAttribute];
                var data = null;
                var isDone = false;

                try {
                    data = JSON.parse($port.util.atob(requestMessage.payload.body));
                } catch (e) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }

                var oldValue = attribute.value;

                if (!data || (typeof data.value === 'undefined') || !attribute._.isValidValue(data.value)) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }

                attribute._.getNewValue(data.value, self, function(attributeValue, isSync) {
                    var onChangeTuple = {
                        attribute: attribute,
                        newValue: attributeValue,
                        oldValue: oldValue
                    };

                    if (attribute.onChange) {
                        attribute.onChange(onChangeTuple);
                    }

                    if (self.onChange) {
                        self.onChange([onChangeTuple]);
                    }

                    attribute._.remoteUpdate(attributeValue);
                    var message = new lib.message.Message();
                    message
                        .type(lib.message.Message.Type.DATA)
                        .source(self.getEndpointId())
                        .format(self.model.urn+":attributes");

                    message.dataItem(urlAttribute, attributeValue);
                    messageDispatcher.queue(message);

                    if (isSync) {
                        isDone = true;
                    } else {
                        messageDispatcher.queue(lib.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', ''));
                    }
                });

                if (isDone) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', '');
                } else {
                    return lib.message.Message.buildResponseWaitMessage();
                }
            } catch (e) {
                return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
            }
        } else {
            return lib.message.Message.buildResponseMessage(requestMessage, 404, {}, 'Not Found', '');
        }
    };

    var attributes = this.deviceModel.attributes;
    for (var indexAttr in attributes) {
        var attribute = new $impl.Attribute(attributes[indexAttr]);

        if (attributes[indexAttr].alias) {
            _link(attributes[indexAttr].alias, this, attribute);
            messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.deviceModel.urn+'/attributes/'+attributes[indexAttr].alias, attributeHandler);
        }

        _link(attributes[indexAttr].name, this, attribute);
        messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.deviceModel.urn+'/attributes/'+attributes[indexAttr].name, attributeHandler);
    }

    this.actions = this;

    var actionHandler = function (requestMessage) {
        var method = _getMethodForRequestMessage(requestMessage);
        var urlAction = requestMessage.payload.url.substring(requestMessage.payload.url.lastIndexOf('/') + 1);
        if (!method || (method !== 'POST')) {
            return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
        }
        if ((urlAction in self.actions)
            && (self.actions[urlAction] instanceof $impl.Action)
            && self.actions[urlAction].onExecute) {
            try {
                var action = self.actions[urlAction];
                var data = null;
                var isDone = false;
                try {
                    data = JSON.parse($port.util.atob(requestMessage.payload.body));
                } catch (e) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }

                if (!data) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }

                action.checkAndGetVarArg(data.value, self, function (actionValue, isSync) {
                    action.onExecute(actionValue);
                    if (isSync) {
                        isDone = true;
                    } else {
                        messageDispatcher.queue(lib.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', ''));
                    }
                });
                if (isDone) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', '');
                } else {
                    return lib.message.Message.buildResponseWaitMessage();
                }
            } catch (e) {
                return lib.message.Message.buildResponseMessage(requestMessage, 500, {}, 'Internal Server Error', '');
            }
        } else {
            return lib.message.Message.buildResponseMessage(requestMessage, 404, {}, 'Not Found', '');
        }
    };

    var actions = this.deviceModel.actions;
    for (var indexAction in actions) {
        var action = new $impl.Action(actions[indexAction]);
        if (actions[indexAction].alias) {
            _link(actions[indexAction].alias, this.actions, action);
            messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.deviceModel.urn+'/actions/'+actions[indexAction].alias, actionHandler);
        }
        _link(actions[indexAction].name, this.actions, action);
        messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.deviceModel.urn+'/actions/'+actions[indexAction].name, actionHandler);
    }

    if (this.deviceModel.formats) {
        this.alerts = this;
        this.dataFormats = this;
        this.deviceModel.formats.forEach(function (format) {
            if (format.type && format.urn) {
                if (format.type === 'ALERT') {
                    self.alerts[format.urn] = format;
                }
                if (format.type === 'DATA') {
                    self.dataFormats[format.urn] = format;
                }
            }
        });
    }

    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    Object.defineProperty(this._, 'offer', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (attributeName, value) {
            let tmp = {attributeName, value};
            // @type {VirtualDeviceAttribute}
            const attribute = self.getAttribute(attributeName);
            debug('VirtualDevice._.offer attribute=' + attribute);

            if (!attribute) {
                throw new Error("No such attribute '" + attributeName +
                    "'.\n\tVerify that the URN for the device model you created " +
                    "matches the URN that you use when activating the device in " +
                    "the Java application.\n\tVerify that the attribute name " +
                    "(and spelling) you chose for your device model matches the " +
                    "attribute you are setting in the Java application.");
            }

            if (!attribute.isSettable()) {
                throw new Error("Attempt to modify read-only attribute '" + attributeName + "'.");
            }

            debug('VirtualDevice.offer self.deviceModel.urn=' + self.deviceModel.urn);

            // @type {DevicePolicy}
            self.devicePolicyManager.getPolicy(self.deviceModel.urn, endpointId).then(devicePolicy => {
                debug('VirtualDevice._.offer = devicePolicy = ' + devicePolicy);
                if (!devicePolicy) {
                    const updateObj = {};
                    updateObj[attributeName] = value;
                    return self.update(updateObj);
                }

                // @type {Set<DevicePolicyFunction>}
                const pipeline = devicePolicy.getPipeline(attributeName);
                debug('VirtualDevice._.offer pipeline=' + pipeline);

                if (!pipeline || (pipeline.size === 0)) {
                    const updateObj = {};
                    updateObj[attributeName] = value;
                    return self.update(updateObj);
                }

                // @type {Set<Map<string, object>>}
                self.getPipelineData(attributeName, function (pipelineData) {
                    debug('VirtualDevice._.offer pipelineData=' + pipelineData);
                    // @type {}
                    const policyValue = self.offer0(attribute.getDeviceModelAttribute(), value,
                        pipeline, pipelineData);

                    debug('VirtualDevice._.offer policyValue = ' + policyValue);

                    if (policyValue) {
                        debug(self.endpointId + ' : Set   : "' + attributeName + '=' +
                            policyValue);

                        // Handle calling offer outside of an update when there are computed metrics
                        // involved.  Call updateFields to ensure the computed metrics get run, and
                        // will put this attribute and computed attributes into one data message.
                        // @type {Pair}
                        const updatedAttributes = new Set();
                        updatedAttributes.add(new Pair(attribute, policyValue));
                        self.updateFields(updatedAttributes);
                    }
                });
            }).catch(error => {
                console.log('Error offering value: ' + error);
            });
        }
    });

    Object.defineProperty(this._, 'updateAttributes', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (attributes) {
            var message = new lib.message.Message();

            message
                .type(lib.message.Message.Type.DATA)
                .source(self.getEndpointId())
                .format(self.deviceModel.urn + ":attributes");

            var storageObjects = [];

            for (var attribute in attributes) {
                var value = attributes[attribute];

                if (attribute in self.attributes) {
                    if (value instanceof lib.StorageObject) {
                        var syncStatus = value.getSyncStatus();

                        if (syncStatus === lib.device.StorageObject.SyncStatus.NOT_IN_SYNC ||
                            syncStatus === lib.device.StorageObject.SyncStatus.SYNC_PENDING) {
                            storageObjects.push(value);
                        }

                        value._.setSyncEventInfo(attribute, self);
                        value.sync();
                    }

                    message.dataItem(attribute,value);
                } else {
                    lib.error('unknown attribute "'+attribute+'"');
                    return;
                }
            }

            storageObjects.forEach(function (storageObject) {
                messageDispatcher._.addStorageDependency(storageObject,
                    message._.internalObject.clientId);
            });

            messageDispatcher.queue(message);
        }
    });

    Object.defineProperty(this._, 'handleStorageObjectStateChange', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (storage) {
            messageDispatcher._.removeStorageDependency(storage);
        }
    });

    messageDispatcher.getRequestDispatcher().registerRequestHandler(endpointId, 'deviceModels/'+this.deviceModel.urn+'/attributes', function (requestMessage) {
        var method = _getMethodForRequestMessage(requestMessage);
        if (!method || (method !== 'PATCH')) {
            return lib.message.Message.buildResponseMessage(requestMessage, 405, {}, 'Method Not Allowed', '');
        }
        if (self.onChange) {
            try {
                var data = null;
                try {
                    data = JSON.parse($port.util.atob(requestMessage.payload.body));
                } catch (e) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }
                if (!data) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                }
                var tupleArray = [];
                var index = 0;
                var isDoneForEach = new Array(Object.keys(data).length);
                isDoneForEach.fill(false);
                Object.keys(data).forEach(function(attributeName) {
                    var attribute = self.attributes[attributeName];
                    if (!attribute) {
                        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                    }
                    var oldValue = attribute.value;
                    if (!attribute._.isValidValue(data[attributeName])) {
                        return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, 'Bad Request', '');
                    }

                    attribute._.getNewValue(data[attributeName], self, function (attributeValue, isSync) {
                        var onChangeTuple = {
                            attribute: attribute,
                            newValue: attributeValue,
                            oldValue: oldValue
                        };
                        if (attribute.onChange) {
                            attribute.onChange(onChangeTuple);
                        }
                        tupleArray.push(onChangeTuple);
                        if (isSync) {
                            isDoneForEach[index] = true;
                        }
                        if (++index === Object.keys(data).length) {
                            // run after last attribute handle
                            self.onChange(tupleArray);

                            var message = new lib.message.Message();
                            message
                                .type(lib.message.Message.Type.DATA)
                                .source(self.getEndpointId())
                                .format(self.deviceModel.urn + ":attributes");
                            Object.keys(data).forEach(function (attributeName1) {
                                var attribute1 = self.attributes[attributeName1];
                                var attributeValue1 = tupleArray.filter(function(tuple) {
                                    return tuple.attribute === attribute1;
                                }, attribute1)[0].newValue;
                                attribute1._.remoteUpdate(attributeValue1);
                                message.dataItem(attributeName1, attributeValue1);
                            });
                            messageDispatcher.queue(message);
                            // one of async attribute handle will be the last
                            // check if at least one async attribute handle was called
                            if (isDoneForEach.indexOf(false) !== -1) {
                                messageDispatcher.queue(lib.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', ''));
                            }
                        }
                    });
                });
                if (isDoneForEach.indexOf(false) === -1) {
                    return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, 'OK', '');
                } else {
                    return lib.message.Message.buildResponseWaitMessage();
                }
            } catch (e) {
                return lib.message.Message.buildResponseMessage(requestMessage, 500, {}, 'Internal Server Error', '');
            }
        } else {
            return lib.message.Message.buildResponseMessage(requestMessage, 404, {}, 'Not Found', '');
        }
    });

    // seal object
    Object.preventExtensions(this);
    this.client._.addVirtualDevice(this);
};

lib.device.VirtualDevice.prototype = Object.create(lib.AbstractVirtualDevice.prototype);
lib.device.VirtualDevice.constructor = lib.device.VirtualDevice;

/**
 *
 * @param {number} window
 * @param {number} slide
 * @param {number} timeZero
 * @param {string} attributeName
 * @param {number} pipelineIndex
 */
lib.device.VirtualDevice.prototype.addScheduledPolicy = function(window, slide, timeZero,
                                                                 attributeName, pipelineIndex)
{
    debug('VirtualDevice.addScheduledPolicy called.');
    debug('VirtualDevice.addScheduledPolicy window = ' + window);
    // @type {ScheduledPolicyDataKey}
    const key = new ScheduledPolicyDataKey(window, slide).toString();
    // @type {ScheduledPolicyData}
    let scheduledPolicyData = this.scheduledPolicies.get(key);
    debug('VirtualDevice.addScheduledPolicy scheduledPolicyData = ' + scheduledPolicyData);

    if (!scheduledPolicyData) {
        scheduledPolicyData = new ScheduledPolicyData(window, slide, timeZero);
        this.scheduledPolicies.set(key, scheduledPolicyData);
        this.timedPolicyThread.addTimedPolicyData(scheduledPolicyData);

        if (!this.timedPolicyThread.isAlive() && !this.timedPolicyThread.isCancelled()) {
            this.timedPolicyThread.start();
        }
    }

    scheduledPolicyData.addAttribute(attributeName, pipelineIndex);
};

/**
 *
 * @param {Set<string>} updatedAttributes
 * @returns {Set<string>}
 */
lib.device.VirtualDevice.prototype.checkComputedMetrics = function(updatedAttributes) {
    if (!updatedAttributes || (updatedAttributes.size === 0)) {
        return new Set();
    }

    if (this.computedMetricTriggerMap.size === 0) {
        return new Set();
    }

    // This will be the set of attributes that have computed metrics
    // that are triggered by the set of updated attributes.
    // @type {Set<string>}
    let computedAttributes = new Set();

    // key is @type {Set<string>}, value is @type {string}.
    this.computedMetricTriggerMap.forEach((value, key) => {
        // If the set of attributes that the formula refers to
        // is a subset of the updated attributes, then compute
        // the value of the attribute.
        if (key.every(val => updatedAttributes.has(val))) {
            computedAttributes.add(value);
        }
    });

    if (computedAttributes.size > 0) {
        // @type {Iterator<string>}
        let computedAttributesAry = Array.from(computedAttributes.entries());

        for (let i = computedAttributesAry.length - 1; i > 0; i--) {
            // @type {string}
            const attributeName = computedAttributesAry[i];
            const attribute = this.getAttribute(attributeName);

            if (!attribute.isSettable()) {
                debug('Attempt to modify read-only attribute "' + attributeName + '"');
                computedAttributes.delete(attributeName);
                continue;
            }
            // TODO: djmdjmdjm
            // @type {DevicePolicy}
            const devicePolicy = this.devicePolicyManager.getPolicy(this.deviceModel.urn,
                endpointId);

            if (!devicePolicy) {
                continue;
            }

            // @type {Set<DevicePolicyFunction>}
            const pipeline = devicePolicy.getPipeline(attributeName);

            if (!pipeline || (pipeline.size === 0)) {
                continue;
            }

            // @type {Set<Map<string, object>>}
            const pipelineData = this.getPipelineData(attributeName);

            // offer0 returns true if the attribute was set. If the attribute was not set,
            // then remove the attribute name from the list of attributesToCompute.
            // @type {object}
            const policyValue = this.offer0(attribute.getDeviceModelAttribute(), attribute.get(),
                pipeline, pipelineData);

            if (policyValue) {
                debug(endpointId + ' : Set   : ' + attributeName + '" = ' + policyValue);
                attribute.update(policyValue);
            } else {
                computedAttributesAry.splice(i, 1);
            }

            computedAttributes = new Set(computedAttributesAry);
        }
    }

    return computedAttributes;
};

/**
 * This method returns an Alert object created based on the
 * format given as parameter. An Alert object can be used to
 * send alerts to the server by calling the raise method,
 * after all mandatory fields of the alert are set.
 *
 * @param {string} formatUrn - the urn format of the alert spec
 * as defined in the device model that this virtual device represents
 *
 * @returns {iotcs.device.Alert} The Alert instance
 *
 * @memberOf iotcs.device.VirtualDevice.prototype
 * @function createAlert
 */
lib.device.VirtualDevice.prototype.createAlert = function (formatUrn) {
    return new lib.device.Alert(this, formatUrn);
};

/**
 * This method returns a Data object created based on the
 * format given as parameter. A Data object can be used to
 * send custom data fields to the server by calling the submit method,
 * after all mandatory fields of the data object are set.
 *
 * @param {string} formatUrn - the urn format of the custom data spec
 * as defined in the device model that this virtual device represents
 *
 * @returns {iotcs.device.Data} The Data instance
 *
 * @memberOf iotcs.device.VirtualDevice.prototype
 * @function createData
 */
lib.device.VirtualDevice.prototype.createData = function (formatUrn) {
    return new lib.device.Data(this, formatUrn);
};

/**@inheritdoc */
lib.device.VirtualDevice.prototype.update = function (attributes) {
    _mandatoryArg(attributes, 'object');

    if (Object.keys(attributes).length === 0) {
        return;
    }

    for (var attribute in attributes) {
        var value = attributes[attribute];

        if (attribute in this.attributes) {
            this.attributes[attribute]._.localUpdate(value, true); //XXX not clean
        } else {
            lib.error('unknown attribute "'+attribute+'"');
            return;
        }
    }

    this._.updateAttributes(attributes);
};

/**
 * @param {string} attributeName
 * @return {VirtualDeviceAttribute}
 */
lib.device.VirtualDevice.prototype.getAttribute = function(attributeName) {
    // @type {VirtualDeviceAttribute}
    const virtualDeviceAttribute = this.attributeMap.get(attributeName);

    if (!virtualDeviceAttribute) {
        throw new Error('No such attribute "' + attributeName +
            '".\n\tVerify that the URN for the device model you created ' +
            'matches the URN that you use when activating the device in ' +
            'the Java application.\n\tVerify that the attribute name ' +
            '(and spelling) you chose for your device model matches the ' +
            'attribute you are setting in the Java application.');
    }

    return virtualDeviceAttribute;
};

/** @inheritdoc */
lib.device.VirtualDevice.getDeviceModel = function() {
    return self.getDeviceModel();
}

/**@inheritdoc */
lib.device.VirtualDevice.prototype.close = function () {
    if (this.client) {
        this.client._.removeVirtualDevice(this);
    }

    this.endpointId = null;
    this.onChange = function (arg) {};
    this.onError = function (arg) {};
};

/**
 * Returns the pipeline data for the specified attribute.
 *
 * @param {string} attribute
 * @param {function} callback
 * @return {Set<Map<string, object>>} the pipeline.
 */
// TODO: Needs to be made "private".
lib.device.VirtualDevice.prototype.getPipelineData = function (attribute, callback) {
    debug('VirtualDevice.getPipelineData called.');
    this.devicePolicyManager.getPolicy(this.getDeviceModel().urn, this.getEndpointId())
        .then(devicePolicy =>
    {
        if (!devicePolicy) {
            callback(new Set());
        }

        let pipeline = devicePolicy.getPipeline(attribute);

        if (!pipeline || (pipeline.size === 0)) {
            callback(new Set());
        }

        // {Set<Map<string, object>>}
        let pipelineData = this.pipelineDataCache.get(attribute);

        if (!pipelineData) {
            pipelineData = new Set();
            this.pipelineDataCache.set(attribute, pipelineData);
        }

        // Create missing function maps.
        if (pipelineData.size < pipeline.size) {
            // Create missing function data maps.
            for (let n = pipelineData.size, nMax = pipeline.size; n < nMax; n++) {
                pipelineData.add(new Map());
            }
        }

        callback(pipelineData);
    }).catch(error => {
        console.log('Error getting device policy.  error=' + error);
    });
};

/**@inheritdoc */
lib.device.VirtualDevice.prototype.offer = function (attributeName, value) {
    this._.offer(attributeName, value);
};

/**
 * The main logic for handling a policy pipeline.
 *
 * @param {DeviceModelAttribute} attribute
 * @param {object} value
 * @param {Set<DevicePolicyFunction>} pipeline
 * @param {Set<Map<string, object>>} pipelineData
 * @return {object} a policy value.
 */
lib.device.VirtualDevice.prototype.offer0 = function (attribute, value, pipeline, pipelineData) {
    debug('VirtualDevice.offer0 called.');
    let attributeName = attribute.getName();
    let policyValue = value;

    if (pipeline && (pipeline.size > 0)) {
        debug('VirtualDevice.offer0 we have a pipeline, size = ' + pipeline.size);
        DeviceFunction.putInProcessValue(this.endpointId, this.deviceModel.urn, attributeName,
            policyValue);

        let pipelineAry = Array.from(pipeline);
        let pipelineDataAry = Array.from(pipelineData);

        for (let index = 0, maxIndex = pipelineAry.length; index < maxIndex; index++) {
            let devicePolicyFunction = pipelineAry[index];
            debug('VirtualDevice.offer0 devicePolicyFunction = ' + devicePolicyFunction);

            /** @type {Map<string, object>} */
            let functionData;

            if (index < pipelineData.size) {
                functionData = pipelineDataAry[index];
            } else {
                functionData = new Map();
                pipelineData.add(functionData);
            }

            // @type {string}
            const key = devicePolicyFunction.getId();
            // @type {Map<string, object}
            const parameters = devicePolicyFunction.getParameters();
            // @type {DeviceFunction}
            const deviceFunction = DeviceFunction.getDeviceFunction(key);
            debug('VirtualDevice.offer0 deviceFunction = ' + deviceFunction);

            if (!deviceFunction) {
                continue;
            }

            if (deviceFunction.apply(this, attributeName, parameters, functionData, policyValue)) {
                debug('VirtualDevice.offer0 in deviceFunction.apply.');

                // @type {object}
                let valueFromPolicy = deviceFunction.get(this, attributeName, parameters,
                    functionData);

                if (valueFromPolicy) {
                    policyValue = valueFromPolicy;

                    DeviceFunction.putInProcessValue(endpointId, this.deviceModel.urn,
                        attributeName, policyValue);
                } else {
                    debug(attributeName + ' got null value from policy.' +
                        deviceFunction.getDetails(parameters));

                    return null;
                }
            } else {
                debug('VirtualDevice.offer0 in deviceFunction.apply else.');
                if (deviceFunction.getId().startsWith("filter")) {
                    debug('VirtualDevice: ' + endpointId + ': offer "' + attributeName +
                        '" = ' + policyValue + ' rejected by policy "' +
                        deviceFunction.getDetails(parameters) + '"');
                }

                return null;
            }

        }
    }

    return policyValue;
};

/**
 * DevicePolicyManager.ChangeListener interface
 *
 * @param {DevicePolicy} devicePolicy
 * @param {Set<string>} assignedDevices
 */
lib.device.VirtualDevice.prototype.policyAssigned = function(devicePolicy, assignedDevices) {
    debug('VirtualDevice.policyAssigned called.');
    if (!assignedDevices || !assignedDevices.has(this.endpointId)) {
        return;
    }

    debug(this.endpointId + " : Policy assigned : " + devicePolicy.getId());
    // @type {number}
    const timeZero = new Date().getTime();

    devicePolicy.getPipelines().forEach((value, key) => {
        this.policyAssigned2(key, value, timeZero);
    });
};

/**
 *
 * @param {string} attributeName
 * @param {Set<DevicePolicyFunction>} newPipeline
 * @param {number} timeZero
 */
lib.device.VirtualDevice.prototype.policyAssigned2 = function(attributeName, newPipeline, timeZero) {
    debug('VirtualDevice.policyAssigned2 called.');
    if (newPipeline && (newPipeline.size > 0)) {
        // @type {DevicePolicyFunction[]}
        let newPipelineAry = Array.from(newPipeline);

        for (let index = 0, indexMax = newPipeline.size; index < indexMax; index++) {
            // @type {DevicePolicyFunction}
            const pipelineFunction = newPipelineAry[index];
            // @type {string}
            const id = pipelineFunction.getId();
            // @type {Map<string, object}
            const parameters = pipelineFunction.getParameters();
            // @type {number}
            const newWindow = DeviceFunction.getWindow(parameters);

            if (newWindow > -1 && ('eliminateDuplicates' !== id)) {
                // @type {number}
                const newSlide = DeviceFunction.getSlide(parameters, newWindow);
                this.addScheduledPolicy(newWindow, newSlide, timeZero, attributeName, index);
            }

            // If the first policy in the chain is a computed metric,
            // see if it refers to other attributes.
            if ((index === 0) && ('computedMetric' === id)) {
                // @type {string}
                const formula = parameters.get('formula');
                // @type {Set<string>}
                const triggerAttributes = new Set();
                // @type {number}
                let pos = formula.indexOf('$(');

                while (pos !== -1) {
                    // @type {number}
                    const end = formula.indexOf(')', pos + 1);

                    if ((pos === 0) || (formula.charAt(pos - 1) !== '$')) {
                        // @type {string}
                        const attr = formula.substring(pos + '$('.length, end);

                        if (!attr.equals(attributeName)) {
                            triggerAttributes.add(attr);
                        }
                    }

                    pos = formula.indexOf('$(', end + 1);
                }

                if (triggerAttributes.size > 0) {
                    this.computedMetricTriggerMap.add(new Pair(triggerAttributes, attributeName));
                }
            }
        }
    }
};

/**
 *
 * @param {DevicePolicy} devicePolicy
 * @param {Set<string>} unassignedDevices
 */
lib.device.VirtualDevice.prototype.policyUnassigned = function(devicePolicy, unassignedDevices) {
    if (!unassignedDevices || !unassignedDevices.has(this.getEndpointId())) {
        return;
    }

    debug(this.getEndpointId() + " : Policy un-assigned : " + devicePolicy.getId());

    // @type {Set<Pair<VirtualDeviceAttribute<VirtualDevice, object>, object>>}
    const updatedAttributes = new Set();

    devicePolicy.getPipelines().forEach((value, key) => {
        this.policyUnassigned2(updatedAttributes, key, value);
    });

    if (updatedAttributes.size > 0) {
        // Call updateFields to ensure the computed metrics get run,
        // and will put all attributes into one data message.
        this.updateFields(updatedAttributes);
    }
};

/**
 * @param {Set<Pair<VirtualDeviceAttribute, object>>} updatedAttributes
 * @param {string} attributeName
 * @param {Set<DevicePolicyFunction>} oldPipeline
 */
lib.device.VirtualDevice.prototype.policyUnassigned2 = function(updatedAttributes, attributeName,
                                                                oldPipeline)
{
    if (oldPipeline && (oldPipeline.size > 0)) {
        const oldPipelineAry = Array.from(oldPipeline);
        // The order in which the oldPipeline is finalized is important.
        // First, remove any scheduled policies so they don't get executed. Any
        // pending data will be committed in the next step.
        // Second, commit any "in process" values. This may cause a computedMetric
        // to be triggered.
        // Third, remove any computed metric triggers.
        // Lastly, remove any data for this pipeline from the policy data cache
        for (let index = 0, indexMax = oldPipelineAry.length; index < indexMax; index++) {
            // @type {DevicePolicyFunction}
            const oldPipelineFunction = oldPipelineAry[index];
            // @type {string}
            const id = oldPipelineFunction.getId();
            // @type {Map<string, object>}
            const parameters = oldPipelineFunction.getParameters();
            // @type {number}
            const window = DeviceFunction.getWindow(parameters);

            if ((window > -1) && ('eliminateDuplicates' !== id)) {
                // @type {number}
                const slide = DeviceFunction.getSlide(parameters, window);
                this.removeScheduledPolicy(slide, attributeName, index, window);
            }
        }

        // Commit values from old pipeline.
        // @type {Set<Map<string, object>>}
        this.getPipelineData(attributeName, function(pipelineData) {
            if (pipelineData && (pipelineData.size > 0)) {
                if (DevicePolicy.ALL_ATTRIBUTES !== attributeName) {
                    this.processExpiredFunction2(updatedAttributes, attributeName, oldPipeline,
                        pipelineData);
                } else {
                    this.processExpiredFunction1(oldPipeline, pipelineData);
                }
            }

            if (attributeName) {
                // Remove this attribute from the computedMetricTriggerMap.
                this.computedMetricTriggerMap.forEach(computedMetricTriggerPair => {
                    if (attributeName === computedMetricTriggerPair.getValue()) {
                        this.computedMetricTriggerMap.delete(computedMetricTriggerPair);
                    }
                });
            }

            // Remove data from cache.
            this.pipelineDataCache.delete(attributeName);
        });
    }
};

/**
 * Routine for handling invocation of a policy function when the window's
 * slide expires. This routine gets the value of the function, and then
 * processes the remaining functions in the pipeline (if any).
 *
 * @param {Set<DevicePolicyFunction>} pipeline
 * @param {Map<string, object>} pipelineData
 */
lib.device.VirtualDevice.prototype.processExpiredFunction1 = function(pipeline, pipelineData) {
    debug('VirtualDevice.processExpiredFunction1 called.');

    if (!pipeline || pipeline.size === 0) {
        return;
    }

    try {
        const pipelineAry = Array.from(pipeline);
        const pipelineDataAry = Array.from(pipelineData);
        // @type {DevicePolicyFunction}
        const devicePolicyFunction = pipelineAry[0];
        // @type {string}
        const functionId = devicePolicyFunction.getId();
        // @type {Map<string, object}
        const config = devicePolicyFunction.getParameters();
        // @type {Map<string, object>}
        const data = pipelineDataAry[0];
        // @type {DeviceFunction}
        const deviceFunction = DeviceFunction.getDeviceFunction(functionId);

        if (!deviceFunction) {
            console.log('Device function "' + functionId + '" not found.');
            return;
        }

        // @type {object}
        let value = deviceFunction.get(this, null, config, data);

        if (value && (pipeline.size > 1)) {
            // Process remaining policies in the pipeline.
            value = this.offer0(null, value, pipeline.subList(1, pipeline.size),
                pipelineData.subList(1, pipelineData.size));
        }

        if (value) {
            // @type {Set<Pair<Message, StorageObjectImpl>>}
            const pairs = value;

            if (pairs.size === 0) {
                return;
            }

            // @type {Message[]}
            let messages = new Message[pairs.size];

            for (let n = 0, nMax = pairs.size; n < nMax; n++) {
                // @type {Pair<Message, StorageObjectImpl>}
                const messagePair = pairs.get(n);
                messages[n] = messagePair.getKey();
                // @type {StorageObject}
                const storageObject = messagePair.getValue();

                if (storageObject) {
                    this.messageDispatcher.addStorageObjectDependency(storageObject,
                        messages[n].getClientId());

                    storageObject.sync();
                }
            }

            this.messageDispatcher.queue(messages);

        }
    } catch (error) {
        console.log('Error occurred: ' + error);
    }
};

/**
 * Routine for handling invocation of a policy function when the window's
 * slide expires. This routine gets the value of the function, and then
 * processes the remaining functions in the pipeline (if any).
 *
 * @param {Set<Pair<VirtualDeviceAttribute<VirtualDevice, object>, object>>} updatedAttributes
 * @param {string} attributeName
 * @param {Set<DevicePolicyFunction>} pipeline
 * @param {Set<Map<string, object>>} pipelineData
 */
lib.device.VirtualDevice.prototype.processExpiredFunction2 = function(updatedAttributes,
    attributeName, pipeline, pipelineData)
{
    debug('VirtualDevice.processExpiredFunction2 called.');

    if (!pipeline || (pipeline.size === 0)) {
        return;
    }

    try {
        // Convert the pipeline and pipeline data Sets to arrays so we can index from them.
        let pipelineDataAry = Array.from(pipelineData);
        let pipelineAry = Array.from(pipeline);
        // @type {VirtualDeviceAttribute}
        const attribute = this.getAttribute(attributeName);
        // @type {DeviceModelAttribute}
        const deviceModelAttribute = attribute.getDeviceModelAttribute();
        // @type {DevicePolicyFunction}
        const devicePolicyFunction = pipelineAry[0];
        // @type {string}
        const functionId = devicePolicyFunction.getId();
        // @type {Map<string, object>}
        const config = devicePolicyFunction.getParameters();
        // @type {Map<string, object>}
        const data = pipelineDataAry[0];
        // @type {DeviceFunction}
        const deviceFunction = DeviceFunction.getDeviceFunction(functionId);

        if (!deviceFunction) {
            console.log('Device function "' + functionId + '" not found.');
            return;
        }

        // @type {object}
        let value = deviceFunction.get(null, attributeName, config, data);

        if (value && pipeline.size > 1) {
            // Process remaining policies in the pipeline.
            value = this.offer0(deviceModelAttribute, value, pipeline.subList(1, pipeline.size),
                pipelineData.subList(1, pipelineData.size));
        }

        if (value) {
            // @type {object}
            let policyValue = value;

            if (policyValue) {
                debug('VirtualDevice.processExpiredFunction 2 adding to updatedAttributes:"' + attributeName + '" = ' + policyValue);
                updatedAttributes.add(new Pair(attribute, policyValue));
            }
        }
    } catch (error) {
        console.log('Error occurred: ' + error);
    }
};

/**
 * Called from updateFields.
 *
 * @param {Set<Pair<VirtualDeviceAttribute, object>>} updatedAttributes
 */
lib.device.VirtualDevice.prototype.processOnChange1 = function(updatedAttributes) {
    debug('VirtualDevice.processOnChange1 called.');
    if (updatedAttributes.size === 0) {
        return;
    }

    // @type {Set<VirtualDeviceAttribute>}
    const keySet = new Set();
    let dataMessage = new lib.message.Message();
    dataMessage.type(dcl.message.Message.Type.DATA);
    let storageObject = new WritableValue();

    // Use for here so we can break out of the loop.
    // @type {Pair<VirtualDeviceAttribute, object>}
    for (let entry of updatedAttributes) {
        // @type {VirtualDeviceAttribute}
        const attribute = entry.getKey();
        keySet.add(attribute);
        // @type {object}
        const newValue = entry.getValue();

        try {
            this.processOnChange2(dataMessage, attribute, newValue, storageObject);
        } catch(error) {
            console.log(error);
            break;
        }
    }

    dataMessage.type(dcl.message.Message.Type.DATA);

    try {
        this.queueMessage(dataMessage, storageObject.getValue());
    } catch(error) {
        console.log('Message queue error: ' + error);
    }
};

/**
 *
 * @param {lib.message.Message} dataMessage
 * @param {VirtualDeviceAttribute} virtualDeviceAttribute
 * @param {object} newValue
 * @param {WritableValue} storageObject
 */
lib.device.VirtualDevice.prototype.processOnChange2 = function(dataMessage, virtualDeviceAttribute,
                                                              newValue, storageObject)
{
    debug('VirtualDevice.processOnChange2 called.');
    // @type {DeviceModelAttribute}
    const deviceModelAttribute = virtualDeviceAttribute.getDeviceModelAttribute();
    // @type {string}
    const attributeName = deviceModelAttribute.getName();

    dataMessage
    .format(this.deviceModel.urn + ":attributes")
    .source(this.endpointId);

    switch (deviceModelAttribute.getType()) {
        case 'INTEGER':
        case 'NUMBER':
        case 'STRING':
            dataMessage.dataItem(attributeName, newValue);
            break;
        case 'URI':
            if (newValue instanceof StorageObject) {
                if ((newValue.getSyncStatus() === lib.device.StorageObject.SyncStatus.NOT_IN_SYNC) ||
                    (newValue.getSyncStatus() === lib.device.StorageObject.SyncStatus.SYNC_PENDING))
                {
                    storageObject.setValue(newValue);
                }

                newValue._.setSyncEventInfo(this, attributeName);
            }

            dataMessage.dataItem(attributeName, newValue.getUri());
            break;
        case 'DATETIME':
            if (newValue instanceof Date) {
                dataMessage.dataItem(attributeName, newValue.getTime());
            } else if (newValue instanceof Number) {
                dataMessage.dataItem(attributeName, newValue);
            }

            break;
        default:
            console.log('Unknown attribute type: ' + deviceModelAttribute.getType());
            throw new Error("Unknown attribute type " + deviceModelAttribute.getType());
    }
};

/**
 *
 * @param {Message} message
 * @param {StorageObject} storageObject
 */
lib.device.VirtualDevice.prototype.queueMessage = function(message, storageObject) {
    debug('VirtualDevice.queueMessage called.');
    // @type {Pair<Message,StorageObjectImpl>}
    const pair = new Pair(message, storageObject);
    // @type {Pair<Message, StorageObjectImpl>[]}
    let pairs = new Array();
    pairs.push(pair);

    // @type {string}
    const deviceModelUrn = this.deviceModel.urn;
    const self = this;

    // @type {DevicePolicy}
    this.devicePolicyManager.getPolicy(this.deviceModel.urn, this.endpointId).then(devicePolicy => {
        // Handling of device model level policies here...
        if (devicePolicy && devicePolicy.getPipeline(DevicePolicy.ALL_ATTRIBUTES)) {
            // Some policies are negated by an alert of a given severity
            // (batching policies, for example)
            // @type {AlertMessage.Severity}
            let alertMessageSeverity = null;

            if (message._.internalObject.type === dcl.message.Message.Type.ALERT) {
                // @type {AlertMessage}
                alertMessageSeverity = message.getSeverity();
            }

            // @type {Set<DevicePolicyFunction>}
            const pipeline = devicePolicy.getPipeline(DevicePolicy.ALL_ATTRIBUTES);
            // @type {Set<Map<string, object>>}
            const pipelineData = this.getPipelineData(DevicePolicy.ALL_ATTRIBUTES);

            for (let index = 0, maxIndex = pipeline.size; index < maxIndex; index++) {
                // @type {DevicePolicyFunction}
                const devicePolicyFunction = pipeline.get(index);
                // @type {string}
                const id = devicePolicyFunction.getId();
                // @type {Map<string, object>}
                let parameters = devicePolicyFunction.getParameters();
                // @type {DeviceFunction}
                const deviceFunction = DeviceFunction.getDeviceFunction(id);

                if (!deviceFunction) {
                    continue;
                }

                // @type {boolean}
                let alertOverridesPolicy;

                if (alertMessageSeverity) {
                    // @type {AlertMessage.Severity}
                    let configuredSeverity = dcl.message.Message.Type.ALERT.CRITICAL;
                    // @type {string}
                    const criterion = parameters.get("alertSeverity");

                    if (criterion) {
                        try {
                            configuredSeverity =  AlertMessage.Severity.valueOf(criterion);
                        } catch (error) {
                            configuredSeverity = dcl.message.Message.Type.ALERT.CRITICAL;
                        }
                    }

                    alertOverridesPolicy = configuredSeverity.compareTo(alertMessageSeverity) <= 0;
                } else {
                    alertOverridesPolicy = false;
                }

                // @type {Map<string, object>}
                let functionData;

                if (index < pipelineData.size) {
                    functionData = pipelineData.get(index);
                } else {
                    functionData = new Map();
                    pipelineData.add(functionData);
                }

                if (deviceFunction.apply(this, null, parameters, functionData, pair) ||
                    alertOverridesPolicy)
                {
                    // If the policy was scheduled...
                    // @type {number}
                    const window = DeviceFunction.getWindow(parameters);

                    if (window > 0) {
                        // @type {number}
                        const slide = DeviceFunction.getSlide(parameters, window);
                        // @type {ScheduledPolicyDataKey}
                        const key = new ScheduledPolicyDataKey(window, slide).toString();
                        // @type {ScheduledPolicyData}
                        const scheduledPolicyData = this.scheduledPolicies.get(key);
                        // @type {number}
                        const timeZero = new Date().getTime();

                        if (scheduledPolicyData) {
                            // @type {Set<Pair<VirtualDeviceAttribute<VirtualDevice, Object>, Object>>}
                            const updatedAttributes = new Set();
                            scheduledPolicyData.processExpiredFunction(this, updatedAttributes, timeZero);

                            if (updatedAttributes.size > 0) {
                                this.updateFields(updatedAttributes);
                            }

                            return;
                        }
                    }

                    // @type {Set<Pair>}
                    let value = deviceFunction.get(this, null, parameters, functionData);
                    pairs = value.toArray(new Pair[value.size()]);

                    debug('VirtualDevice: ' + endpointId + ' dispatching ' + pairs.length +
                        ' messages per policy "' + deviceFunction.getDetails(parameters) + '"');
                } else {
                    return;
                }
            }
        }

        try {
            // @type {Message[]}
            let messages = new Array(pairs.length);
            // // @type {MessageDispatcher}
            // let messageDispatcher = new lib.device.util.MessageDispatcher(client);

            for (let n = 0; n < messages.length; n++) {
                messages[n] = pairs[n].getKey();
                // @type {StorageObject}
                let storageObject = pairs[n].getValue();

                if (storageObject) {
                    self.messageDispatcher._.addStorageDependency(storageObject,
                        message._.internalObject.clientId);

                    storageObject.sync();
                }
            }

            messages.forEach(message => {
                debug('VirtualDevice.queueMessage, sending message: ' + util.inspect(message));
                self.messageDispatcher.queue(message);
            });
        } catch (error) {
            console.log('Error: ' + error)
        }
    }).catch(error => {
        console.log('Error getting device policy: ' + error);
    });
};

/**
 * @param {number} slide
 * @param {string} attributeName
 * @param {number} pipelineIndex
 * @param {number} window
 */
lib.device.VirtualDevice.prototype.removeScheduledPolicy = function(slide, attributeName,
                                                                    pipelineIndex, window)
{
    debug('removeScheduledPolicy called.');
    // @type {ScheduledPolicyDataKey}
    const key = new ScheduledPolicyDataKey(window, slide).toString();
    // @type {ScheduledPolicyData}
    const scheduledPolicyData = this.scheduledPolicies.get(key);

    if (scheduledPolicyData) {
        scheduledPolicyData.removeAttribute(attributeName, pipelineIndex);

        if (scheduledPolicyData.isEmpty()) {
            this.scheduledPolicies.delete(key);
            this.timedPolicyThread.removeTimedPolicyData(scheduledPolicyData);
        }
    }
};

/**
 * Set all the attributes in an update batch. Errors are handled in the set call, including calling
 * the on error handler.
 *
 * {@inheritDoc}
 * @param {Set<Pair<VirtualDeviceAttribute, object>>} updatedAttributes
 */
lib.device.VirtualDevice.prototype.updateFields = function(updatedAttributes) {
    debug('VirtualDevice.updateFields called.');
    // @type {Set<string}
    const updatedAttributesToProcess = new Set();
    let updatedAttributesAry = Array.from(updatedAttributes);

    for (let i = updatedAttributesAry.length - 1; i >= 0; i--) {
        const attribute = updatedAttributesAry[i].getKey();
        // @type {string}
        const attributeName = attribute.getDeviceModelAttribute().getName();

        try {
            // Here, we assume:
            // 1. That attribute is not null. If the attribute were not found
            //    an exception would have been thrown from the VirtualDevice
            //    set(String attributeName, T value) method.
            // 2. That the set method validates the value. The call to
            //    update here should not throw an exception because the
            //    value is bad.
            // 3. The author of this code knew what he was doing.
            if (!attribute.update(updatedAttributesAry[i].getValue())) {
                updatedAttributesAry.splice(i, 1);
            } else {
                updatedAttributesToProcess.add(attributeName);
            }
        } catch (error) {
            console.log('Error updating attributes: ' + error);
        }

        DeviceFunction.removeInProcessValue(this.endpointId, this.deviceModel.urn, attributeName);
    }

    // Here is the check to see if the updated attributes will trigger computedMetrics.
    // The returned set is the attributes whose computedMetrics resulted in an
    // attribute.update(value). Those attributes are added to the list of updated attributes
    // so that they are included in the resulting data message.
    // @type {Set<string>}
    const computedMetrics = this.checkComputedMetrics(updatedAttributesToProcess);

    computedMetrics.forEach(attr => {
        // @type {VirtualDeviceAttribute}
        const attribute = this.getAttribute(attr);
        // @type {object}
        const value = attribute.get();
        // @type {Pair<VirtualDeviceAttribute<VirtualDevice, Object>, Object>}
        const pair = new Pair(attribute, value);
        updatedAttributes.add(pair);
    });

    this.processOnChange1(updatedAttributes);
};



//////////////////////////////////////////////////////////////////////////////
// file: library/device/DevicePolicyManager.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */
class DevicePolicyManager {
    // Instance "variables"/properties...see constructor.

    /**
     * Returns the device policy manager for this directly connected device.
     *
     * @param {string} endpointId the endpoint ID of the device this device policy manager is for.
     * @return {DevicePolicyManager} the device policy manager for this endpoint ID.
     */
    static getDevicePolicyManager(endpointId) {
        // @type {PersistenceStorage}
        let persistenceStore = PersistenceStoreManager.get(endpointId);
        // @type {DevicePolicyManager}
        return persistenceStore.getOpaque('DevicePolicyManager', null);
    }

    /**
     *
     * @param {$impl.DirectlyConnectedDevice} directlyConnectedDevice
     */
    constructor(directlyConnectedDevice) {
        // Instance "variables"/properties.
        // @type {Set<ChangeListener>}
        this.changeListeners = new Set();
        this.directlyConnectedDevice = directlyConnectedDevice;
        /**
         * Map a device id to the policies that are available to it.  The key is the device id.  The
         * value is a map of device model URN to policy id. The policy id gets us to the
         * configuration data.
         * @type {Map<string, Map<string, string>>}
         */
        this.policiesByDeviceId = new Map();
        /**
         * Map of policy ID to policies. The key is a policy id. The value is a map of policy
         * attributes and values.
         * @type {Map<String, DevicePolicy>}
         */
        this.policiesByPolicyId = new Map();
        /**
         * @type {Map<string, Map<String, Set<String>>>}
         */
        this.policiesByDeviceModelUrn = new Map();
        // Instance "variables"/properties.
        this.test = false;
    }

    /**
     * Add a listener for receiving notification of policies being assigned or unassigned.
     * Must have a policyAssigned(DevicePolicy devicePolicy, Set<String> assignedDevices) function.
     * Must have a policyUnassigned(DevicePolicy devicePolicy, Set<String> unassignedDevices) function.
     *
     * @param {object} changeListener the ChangeListener to add.
     */
    addChangeListener(changeListener) {
        debug('DevicePolicyManager.addChangeListener called.');

        if (!changeListener ||
            typeof(changeListener.policyAssigned) !== 'function' ||
            typeof(changeListener.policyUnassigned) !== 'function')
        {
            return;
        }

        this.changeListeners.add(changeListener);
    }

    /**
     * @param {string} deviceModelUrn
     * @param {string} policyId
     * @param {string} deviceId
     * @param {number} lastModified
     */
    assignPolicyToDevice(deviceModelUrn, policyId, deviceId, lastModified) {
        // If the device has a policy currently,
        // it needs to be unassigned.
        // @type {string}
        let currentPolicyId;
        // @type {Map<string, string}
        const policies = this.policiesByDeviceId.get(deviceId);

        if (policies) {
            currentPolicyId = policies.get(deviceModelUrn);
        } else {
            currentPolicyId = null;
        }

        // If the current policy is the same as the policy that is being
        // assigned, no need to continue.
        if (policyId === currentPolicyId) {
            return;
        }

        // Make sure we have the policy before assigning the new policy.
        // @type {DevicePolicy}
        let devicePolicy = this.policiesByPolicyId.get(policyId);

        if (!devicePolicy) {
            this.downloadPolicy(deviceModelUrn, policyId).then(devicePolicy => {
                if (devicePolicy) {
                    this.policiesByPolicyId.set(policyId, devicePolicy);
    
                    // replaceAll just fills space where device id should be since
                    // the deviceId here doesn't matter for debug print, but it would
                    // be nice to have the printout line up.
                    debug(deviceId.replace(".", " ") + " : Policy : " + devicePolicy.getId() +
                    '\n' + devicePolicy.toString());

                    assignPolicyToDevice2(devicePolicy);
                }
            });
        } else {
            assignPolicyToDevice2(devicePolicy);
        }
    }

    assignPolicyToDevice2(devicePolicy) {
        if (devicePolicy) {
            // @type {Map<string, string>}
            let devicePolicies = this.policiesByDeviceId.get(deviceId);

            if (!devicePolicies) {
                devicePolicies = new Map();
                this.policiesByDeviceId.set(deviceId, devicePolicies);
            }

            devicePolicies.set(deviceModelUrn, policyId);

            // @type {Map<string, Set<string>>}
            let deviceModelPolicies = policiesByDeviceModelUrn.get(deviceModelUrn);

            if (!deviceModelPolicies) {
                deviceModelPolicies = new Map();
                policiesByDeviceModelUrn.set(deviceModelUrn, deviceModelPolicies);
            }

            // @type {Set<string>}
            let assignedDevices = deviceModelPolicies.get(policyId);

            if (!assignedDevices) {
                assignedDevices = new Set();
                deviceModelPolicies.set(policyId, assignedDevices);
            }

            assignedDevices.add(deviceId);

            if (currentPolicyId) {
                removePersistedAssociation(deviceModelUrn, currentPolicyId, deviceId);
            }

            persistAssociation(deviceModelUrn, policyId, deviceId);
        }
    }

    /**
     * Get the ids of indirectly connected devices that are assigned to the policy.
     * 
     * @param {string} deviceModelUrn the device model urn
     * @param {string} policyId the policy id to query for
     * @param {string} directlyConnectedOwner
     * @return {Promise} that resolves to a Set<string> the set of indirectly connected device IDs
     *          for this policy.
     */
    getIndirectlyConnectedDeviceIdsForPolicy(deviceModelUrn, policyId, directlyConnectedOwner) {
        return new Promise((resolve, reject) => {
            // @type {string}
            let urn;

            try {
                urn = encodeURI(deviceModelUrn);
            } catch (uriError) {
                // UTF-8 is a required encoding.
                // Throw an exception here to make the compiler happy
                console.log('Error encoding device model URN: ' + uriError);
            }

            // @type {string}
            let query;

            try {
                // @type {string}
                let icdFilter = encodeURI('{"directlyConnectedOwner":"' + directlyConnectedOwner +
                    '"}');

                query = "?q=" + icdFilter + "&fields=id";
            } catch (uriError) {
                // UTF-8 is a required encoding.
                // Throw an exception here to make the compiler happy
                console.log('Error encoding ICD filter: ' + uriError);
            }

            let dcd = this.directlyConnectedDevice;

            let options = {
                headers: {
                    'Authorization': dcd._.bearer,
                    'X-EndpointId': dcd._.tam.getEndpointId()
                },
                method: 'GET',
                // GET iot/privateapi/v2/deviceModels/{urn}/devicePolicies/{id}/devices?q={"directlyConnectedOwner" : "GW-endpoint-id"}
                path: $impl.privateRoot + '/deviceModels/' + urn + '/devicePolicies/' + policyId +
                      '/devices' + query,
                tam: dcd._.tam
            };

            debug('path=' + options.path);

            $impl.protocolReq(options, '', function (response, error) {
                let icdIds = new Set();

                if (error) {
                    console.log('Invalid response getting ICDs: ' + error);
                    reject(icdIds);
                } else {
                    debug('DevicePolicyManager.getIndirectlyConnectedDeviceIdsForPolicy response = ' +
                        response);

                    if (!response || !response.items || response.items.length === 0 ||
                        !(response.items[0].id))
                    {
                        return resolve(icdIds);
                    }

                    response.items.forEach(item => {
                        icdIds.add(item.id);
                    });

                    resolve(icdIds);
                }
            }, null, this.directlyConnectedDevice);
        });
    }

    /**
     * Get the {@code DevicePolicy} for the given device model and device ID.
     *
     * @param {string} deviceModelUrn
     * @param {string} deviceId
     * @returns {Promise} a Promise which resolves a DevicePolicy.
     */
    getPolicy(deviceModelUrn, deviceId) {
        return new Promise((resolve, reject) => {
            debug('DevicePolicyManager.getPolicy called.');
            // If we already have the policy for this device model and device, return it.
            // Otherwise, look it up. If there isn't an entry in policiesByDeviceId
            // for the device model urn and device id when this method is called,
            // there will be by the time this method completes.

            // policiesByDeviceId looks like { <device-id> : { <device-model-urn> : <policy-id> }}.
            // @type {Map<string, string>}
            const devicePolicies = this.policiesByDeviceId.get(deviceId);
            debug('DevicePolicyManager.getPolicy devicePolicies = ' + devicePolicies);

            // If devicePolicies is null, we drop through and do the lookup.
            if (devicePolicies) {
                // If the deviceModelUrn is not found in the map, we drop through and do the lookup.
                // There may be a mapping for the device model urn, but the value may be null,
                // which means that there is no policy for the combination of device model and device.
                if (devicePolicies.has(deviceModelUrn)) {
                    // @type {string}
                    const policyId = devicePolicies.get(deviceModelUrn);
                    // @type {DevicePolicy}
                    let devicePolicy;

                    if (policyId) {
                        // Very important that the client has gotten the policy before we get here!
                        devicePolicy = this.policiesByPolicyId.get(policyId);
                    } else {
                        devicePolicy = null;
                    }

                    debug('DevicePolicyManager.getPolicy returning devicePolicy: ' + devicePolicy);
                    return resolve(devicePolicy);
                }
            }

            // Add the mapping so the code doesn't try to fetch a policy for this
            // device again. The only way the device will get a policy after this
            // is from an "assigned" policyChanged, or when the client restarts.
            // @type {Map<string, string>}
            let policies = this.policiesByDeviceId.get(deviceId);
            debug('DevicePolicyManager.getPolicy policies = ' + policies);

            if (!policies) {
                policies = new Map();
                this.policiesByDeviceId.set(deviceId, policies);
            }

            // Stop policyChanged while doing this lookup.
            // If we get to here, then there was no mapping for the deviceId in policiesByDeviceId,
            // or there was a mapping for the deviceId, but not for the device model. So we need
            // to do a lookup and update policiesByDeviceId
            // @type {DevicePolicy}
            this.lookupPolicyForDevice(deviceModelUrn, deviceId).then(devicePolicy => {
                debug('DevicePolicyManager.getPolicy.lookupPolicyForDevice devicePolicy = ' + util.inspect(devicePolicy));
                // Add the mapping so the code doesn't try to fetch a policy for this
                // device again. The only way the device will get a policy after this
                // is from an "assigned" policyChanged, or when the client restarts.
                // @type {Map<string, string>}
                let policies = this.policiesByDeviceId.get(deviceId);

                if (!policies) {
                    // @type {Map<string, string>}
                    policies = new Map();
                    this.policiesByDeviceId.set(deviceId, policies);
                }

                // Note: devicePolicy may be null, but the entry is made anyway.
                // This just means the device has no policy for this device model.
                // Adding null prevents another lookup.
                // @type {string}
                const policyId = devicePolicy != null ? devicePolicy.getId() : null;
                debug('DevicePolicyManager.getPolicy.lookupPolicyForDevice policyId = ' + policyId);
                policies.set(deviceModelUrn, policyId);

                if (devicePolicy) {
                    // @type {Set<string>}
                    const assignedDevices = new Set();
                    assignedDevices.add(deviceId);
                    debug('DevicePolicyManager.getPolicy.lookupPolicyForDevice calling notifyPolicyAssigned.');
                    this.notifyPolicyAssigned(devicePolicy, assignedDevices);
                }

                debug('DevicePolicyManager.getPolicy returning devicePolicy: ' + devicePolicy);
                resolve(devicePolicy);
            }).catch(error => {
                debug('DevicePolicyManager.getPolicy returning null.');
                resolve(null);
            });
        });
    }

    /**
     * GET iot/privateapi/v2/deviceModels/{urn}/devicePolicies/{policyId}.
     * The policiesByPolicyId map is updated, and an entry is made (if necessary) in the
     * policiesByDeviceModelUrn map.
     * 
     * @param {string} deviceModelUrn the device model URN.
     * @param {string} policyId the policy ID.
     * @return {Promise} a Promise which resolves to the DevicePolicy, or null if an error occured.
     */
    downloadPolicy(deviceModelUrn, policyId) {
        return new Promise((resolve, reject) => {
            let tam;
            let bearer;
            let endpointId;

            // We may have one of several DirectlyConnectedDevice's
            if (this.directlyConnectedDevice._.hasOwnProperty('internalDev') &&
                this.directlyConnectedDevice._.internalDev.hasOwnProperty('_') &&
                this.directlyConnectedDevice._.internalDev._.hasOwnProperty('internalDev') &&
                this.directlyConnectedDevice._.internalDev._.internalDev.hasOwnProperty('_')) {
                tam = this.directlyConnectedDevice._.internalDev._.internalDev._.tam;
                bearer = this.directlyConnectedDevice._.internalDev._.internalDev._.bearer;
                endpointId = tam.endpointId;
            } else if (this.directlyConnectedDevice._.hasOwnProperty('internalDev') &&
                this.directlyConnectedDevice._.internalDev.hasOwnProperty('_'))
            {
                tam = this.directlyConnectedDevice._.internalDev._.tam;
                bearer = this.directlyConnectedDevice._.internalDev._.bearer;
                endpointId = tam.endpointId;
            } else {
                tam = this.directlyConnectedDevice._.tam;
                bearer = this.directlyConnectedDevice._.bearer;
                endpointId = tam.endpointId;
            }

            const fields = encodeURI('id,pipelines,enabled,lastModified');
            const query = '?fields=' + fields;

            let options = {
                headers: {
                    'Authorization': bearer,
                    'X-EndpointId': endpointId
                },
                method: 'GET',
                path: $impl.privateRoot + '/deviceModels/' + deviceModelUrn + '/devicePolicies/' +
                      policyId + query,
                tam: tam
            };

            let self = this;

            $impl.protocolReq(options, '', function (response, error) {
                if (error) {
                    console.log('Invalid response getting device policy: ' + error);
                    resolve(null);
                } else {
                    if (!response ||
                        !(response.id || response.items) ||
                        (response.items && !(response.items && (response.items.length === 0) && response.items[0].id)) ||
                            error)
                    {
                        return resolve(null);
                    }

                    let devicePolicyJson = JSON.stringify(response, null, 4);
                    let devicePolicy = DevicePolicy.fromJson(deviceModelUrn, devicePolicyJson);

                    if (devicePolicy) {
                        Object.freeze(devicePolicy);
                        self.policiesByPolicyId.set(policyId, devicePolicy);
                        resolve(devicePolicy);
                    } else {
                        reject('Error retrieving device policy.');
                    }
                }
            }, this.directlyConnectedDevice);
        });
    }

    /**
     * GET iot/privateapi/v2/deviceModels/{urn}/devicePolicies/{policyId}.
     * The policiesByPolicyId map is updated, and an entry is made (if necessary) in the
     * policiesByDeviceModelUrn map.
     * 
     * @param {string} deviceModelUrn the device model URN.
     * @param {string} deviceId the device ID.
     * @return {Promise} a Promise which resolves to the DevicePolicy, or null if an error occured.
     */
    downloadPolicyByDeviceModelDeviceId(deviceModelUrn, deviceId) {
        return new Promise((resolve, reject) => {
            let tam;
            let bearer;
            let endpointId;

        if (this.directlyConnectedDevice._.hasOwnProperty('internalDev') &&
            this.directlyConnectedDevice._.internalDev.hasOwnProperty('_') &&
            this.directlyConnectedDevice._.internalDev._.hasOwnProperty('internalDev') &&
            this.directlyConnectedDevice._.internalDev._.internalDev.hasOwnProperty('_'))
        {
            tam = this.directlyConnectedDevice._.internalDev._.internalDev._.tam;
            bearer = this.directlyConnectedDevice._.internalDev._.internalDev._.bearer;
            endpointId = this.directlyConnectedDevice._.internalDev._.internalDev._.tam.endpointId;
        } else if (this.directlyConnectedDevice._.hasOwnProperty('internalDev')) {
            tam = this.directlyConnectedDevice._.internalDev._.tam;
            bearer = this.directlyConnectedDevice._.internalDev._.bearer;
            endpointId = this.directlyConnectedDevice._.internalDev._.tam.endpointId;
        } else {
            tam = this.directlyConnectedDevice._.tam;
            bearer = this.directlyConnectedDevice._.bearer;
            endpointId = this.directlyConnectedDevice._.tam.endpointId;
        }

            const devicesDotId = encodeURI('{"devices.id":"' + deviceId + '"}');
            const fields = encodeURI('id,pipelines,enabled,lastModified');
            const query = '?q=' + devicesDotId + '&fields=' + fields;

            let options = {
                headers: {
                    'Authorization': bearer,
                    'X-EndpointId': endpointId
                },
                method: 'GET',
                path: $impl.privateRoot + '/deviceModels/' + deviceModelUrn + '/devicePolicies' + query,
                tam: tam
            };

            let self = this;

            $impl.protocolReq(options, '', function (response, error) {
                if (error) {
                    console.log('Invalid response getting device policy: ' + error);
                    return resolve(null);
                }

                debug('response = ' + response);

                if (!response || !response.items || response.items.length === 0 ||
                    !(response.items[0].id) || error)
                {
                    return resolve(null);
                }

                let devicePolicyJson = JSON.stringify(response.items[0], null, 4);

                if (devicePolicyJson) {
                    debug('devicePoliciesJson = ' + devicePolicyJson);
                    // The response is an array of items, get the first one.
                    let devicePolicy = DevicePolicy.fromJson(deviceModelUrn, devicePolicyJson);

                    if (devicePolicy) {
                        Object.freeze(devicePolicy);
                        resolve(devicePolicy);
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            }, this.directlyConnectedDevice);
        });
    }
    
    /**
     * Lookup the policy for the combination of device model and device ID on the server.
     * Should only be called from getPolicy when there is no policy for the device.
     *
     * @param {string} deviceModelUrn the device model urn
     * @param {string} deviceId the device id to query for
     * @return {Promise} a Promise which resolves to the JSON policy, or {@code null} if there is no
     *         policy for the combination of deviceModelUrn and deviceId.
     */
    lookupPolicyForDevice(deviceModelUrn, deviceId) {
        return new Promise((resolve, reject) => {
            // Do we already have the policy?
            // @type {Map<string, Set<string>>}
            let policies = this.policiesByDeviceModelUrn.get(deviceModelUrn);

            if (policies) {
                policies.forEach((deviceIds, policyId) => {
                    if (deviceIds.has(deviceId)) {
                        // @type {DevicePolicy}
                        const devicePolicy = this.policiesByPolicyId.get(policyId);

                        if (devicePolicy) {
                            return resolve(devicePolicy);
                        }
                    }
                });
            }

            this.downloadPolicyByDeviceModelDeviceId(deviceModelUrn, deviceId) .then(devicePolicy => {
                debug('DevicePolicyManager.lookupPolicyForDevice devicePolicy = ' +
                    devicePolicy);

                // If we found a device policy, update our local state
                if (!devicePolicy) {
                    return resolve(null);
                }

                // @type {string}
                const policyId = devicePolicy.getId();

                // Only put the policy in policiesByPolicyId if it isn't there already.
                // This prevents putting a changed policy, which should be processed
                // through policyChanged.
                if (!this.policiesByPolicyId.has(policyId)) {
                    this.policiesByPolicyId.set(policyId, devicePolicy);

                    // replaceAll just fills space where device ID should be since
                    // the device id here doesn't matter for debug print, but it would
                    // be nice to have the printout line up.
                    debug(policyId.replace(".", " ") + ' : Policy : ' +
                        devicePolicy.getId() + '\n' + devicePolicy.toString());
                }

                // Remember this policy maps to this device model.
                // Do not add the device ID to the set of device IDs here.
                // Do that in getPolicy (just to keep all of the device
                // ID state updates in one place).
                policies = this.policiesByDeviceModelUrn.get(deviceModelUrn);

                if (!policies) {
                    // @type {Map<string, Set<string>>}
                    policies = new Map();
                    this.policiesByDeviceModelUrn.set(deviceModelUrn, policies);
                }

                // @type {Set<string>}
                let deviceIds = policies.get(policyId);

                if (!deviceIds) {
                    deviceIds = new Set();
                    policies.set(policyId, deviceIds);
                }

                deviceIds.add(deviceId);
                resolve(devicePolicy);
            });
        });
    }

    /**
     * Invoke {@code policyAssigned} method on change listeners.
     *
     * @param {DevicePolicy} devicePolicy the assigned policy.
     * @param {Set<string>} assignedDevices the devices to which the policy was assigned.
     */
    notifyPolicyAssigned(devicePolicy, assignedDevices) {
        debug('DevicePolicyManager.notifyPolicyAssigned called.');
        if (!devicePolicy || assignedDevices.size === 0) {
            return;
        }

        debug('DevicePolicyManager.notifyPolicyAssigned changeListeners = ' + util.inspect(this.changeListeners));

        this.changeListeners.forEach(changeListener => {
            try {
                debug('DevicePolicyManager.notifyPolicyAssigned calling changeListener.');
                changeListener.policyAssigned(devicePolicy, assignedDevices);
            } catch (error) {
                // The ChangeListener may throw an error.
                console.log(error);
            }
        });
    }

    /**
     * Invoke {@code policyAssigned} method on change listeners.
     *
     * @param {DevicePolicy} devicePolicy the assigned policy.
     * @param {Set<string>} unassignedDevices the devices to which the policy was assigned.
     */
    notifyPolicyUnassigned(devicePolicy, unassignedDevices) {
        if (!devicePolicy || unassignedDevices.size === 0) {
            return;
        }

        this.changeListeners.forEach(changeListener => {
            try {
                changeListener.policyUnassigned(devicePolicy, unassignedDevices);
            } catch (error) {
                // The ChangeListener may throw an error.
                console.log(error);
            }
        });
    }

    /**
     * Handle {@code deviceModels/urn:oracle:iot:dcd:capability:device_policy/policyChanged}
     *
     * @param {DirectlyConnectedDevice} directlyConnectedDevice.
     * @param {RequestMessage} requestMessage the RequestMessage from the server.
     * @return {iotcs.message.Message} a ResponseMessage.
     */
    policyChanged(directlyConnectedDevice, requestMessage) {
        //
        // The server will not send a policyChanged to a device for which the policy is not intended.
        // If this is a DCD, then the policy  is meant for this DCD.
        // If this is a GW, then the policy is meant for one or more of its ICDs.
        //
        // RequestMessage body looks like:
        // [{
        //    "deviceModelUrn": "urn:com:oracle:iot:device:humidity_sensor",
        //    "id": "547B66F3-5DC8-4F60-835F-7B7773C8EE7A",
        //    "lastModified": 1511805927387,
        //    "op": "changed"
        // }]
        //
        // Where op is:
        //   "changed"    - The policy pipeline was changed. The client needs to GET the policy.
        //   "assigned"   - The policy was assigned to device(s). The policy pipeline itself
        //                  has not changed. The server will not send this to the client
        //                  unless the client has the device(s). A gateway client needs to get
        //                  a list of devices the policy applies to, but a directly connected
        //                  device can assume the policy is for it. If necessary, the client
        //                  will GET the policy.
        //   "unassigned" - The policy was unassigned from device(s). The policy pipeline itself
        //                  has not changed. The server will not send this to the client
        //                  unless the client has the device(s). A gateway client needs to get
        //                  a new list of devices the policy applies to, but a directly connected
        //                  device can assume the policy is for it.
        //
        let responseMessage = null;

        // @type {boolean}
        const dcdIsGatewayDevice = true; //directlyConnectedDevice instanceof GatewayDevice;
        // @type {string}
        const endpointId = directlyConnectedDevice.getEndpointId();

        try {
            // @type {object}
            const body = JSON.parse(forge.util.decode64(requestMessage.payload.body));

            for (let n = 0, nMax = body.length; n < nMax; n++) {
                let item = body[n];
                // @type {string}
                const op = item.op !== null ? item.op : 'changed';
                // @type {string}
                const deviceModelUrn = item.deviceModelUrn;
                // @type {string}
                const policyId = item.id;
                // @type {number}
                const lastModified = item.lastModified;

                debug('policyChanged notification received: deviceModelUrn=' + deviceModelUrn +
                    ', operation=' + op + ', policyId=' + policyId + ', lastModified=' +
                    lastModified);

                if ('unassigned' === op) {
                    this.processUnassign(deviceModelUrn, policyId, endpointId, dcdIsGatewayDevice,
                        lastModified);
                } else if ('assigned' === op) {
                    this.processAssign(deviceModelUrn, policyId, endpointId, dcdIsGatewayDevice,
                        lastModified);
                } else if ('changed' === op) {
                    // @type {DevicePolicy}
                    const policyBeforeChange = this.policiesByPolicyId.get(policyId);

                    // If device policy is null, then something is wrong in our mappings.
                    // Remove the references to this device model URN an policy ID.
                    if (!policyBeforeChange) {
                        // @type {Map<string, Set<string>>}
                        const policies = this.policiesByDeviceModelUrn.get(deviceModelUrn);

                        if (policies) {
                            // @type {Set<string>}
                            const assignedDevices = policies.delete(policyId);

                            if (assignedDevices) {
                                assignedDevices.forEach(deviceId => {
                                    // @type {Map<string, string>}
                                    const devicePolicies = this.policiesByDeviceId.get(deviceId);

                                    if (devicePolicies != null) {
                                        devicePolicies.delete(policyId);
                                    }
                                });
                            }
                        }

                        return responseMessage; // continue
                    }

                    // Before updating the policy, notify the devices the policy is unassigned.
                    // This gives the code in VirtualDeviceImpl or MessagingPolicyImpl a chance
                    // to clean up the existing pipeline before the new pipeline comes in.
                    // @type {Set<string>}
                    let assignedDevices;
                    // @type {Map<string, Set<string>>}
                    const policies = this.policiesByDeviceModelUrn.get(deviceModelUrn);

                    if (policies) {
                        assignedDevices = policies.get(policyId);
                    } else {
                        assignedDevices = null;
                    }

                    if (assignedDevices) {
                        if (policyBeforeChange) {
                            this.notifyPolicyUnassigned(policyBeforeChange, assignedDevices);
                        }
                    }

                    this.processPipelineChanged(directlyConnectedDevice, deviceModelUrn, policyId,
                        lastModified).then(() =>
                    {
                        if (assignedDevices) {
                            // @type {DevicePolicy}
                            const policyAfterChange = this.policiesByPolicyId.get(policyId);

                            if (policyAfterChange) {
                                this.notifyPolicyAssigned(policyAfterChange, assignedDevices);
                            }
                        }
                    });
                } else {
                    console.log(requestMessage.payload.url + ' invalid operation: ' + item);
                }
            }
        } catch (error) {
            console.log('Error processing policyChanged notification: ' + error);
            // @type {iotcs.message.Message}
            return lib.message.Message.buildResponseMessage(requestMessage, 400, {}, error, '');
        }

        // @type {iotcs.message.Message}
        return lib.message.Message.buildResponseMessage(requestMessage, 200, {}, '', '');
    }

    /**
     * Process the "assign" operation from policyChanged.
     * The method needs to notify listeners that the policy was assigned,
     * then update data structures and persistence to add the association
     * of the policy to the device.
     *
     * @param {string} deviceModelUrn the device model urn of the policy that is unassigned.
     * @param {string} policyId the ID of the policy that is unassigned.
     * @param {string} endpointId the endpointId of the device that called the policyChanged method.
     * @param {boolean} dcdIsGatewayDevice whether or not that device is a gateway device
     * @param {number} lastModified
     */
    processAssign(deviceModelUrn, policyId, endpointId, dcdIsGatewayDevice, lastModified) {
        return new Promise((resolve, reject) => {
            // Get the set of devices to which this policy is assigned.
            // If the directly connected device is a gateway, then get
            // the assigned devices from the server. Otherwise, the
            // assigned device is the directly connected device with endpointId.
            //
            // Note that if the call to get the ICD ids that are assigned
            // to the policy throws an exception, unassign every device
            // with that device model urn. In such a case, we  remove the
            // mapping from device id the device-model urn from
            // policiesByDeviceId. If there is no mapping, getPolicy
            // will try to create a new mapping by getting the policy
            // for the device from the server.
            // @type {Set<string}
            let assignedDevices = null;

            if (dcdIsGatewayDevice) {
                assignedDevices = this.getIndirectlyConnectedDeviceIdsForPolicy(deviceModelUrn,
                    policyId, endpointId).then((assignedDevices, error) =>
                {
                    this.processAssignCouldNotGetIcds(false, deviceModelUrn, policyId);

                    if (!assignedDevices || assignedDevices.size === 0) {
                        return resolve();
                    }

                    this.processAssignHandleAssignedDevices(assignedDevices, deviceModelUrn,
                        policyId, lastModified);
                }).catch(error => {
                    this.processAssignCouldNotGetIcds(true, deviceModelUrn, policyId);
                    resolve();
                });
            } else {
                // @type {Set<string>}
                assignedDevices = new Set();
                assignedDevices.add(endpointId);

                if (!assignedDevices || assignedDevices.size === 0) {
                    return resolve();
                }

                this.processAssignHandleAssignedDevices(assignedDevices, deviceModelUrn, policyId,
                    lastModified);
            }
        });
    }

    processAssignHandleAssignedDevices(assignedDevices, deviceModelUrn, policyId, lastModified) {
        // Download the policy. The reason we have to download again on assign is that the policy
        // may have been modified while it was not assigned to this device or ICDs.
        // @type {DevicePolicy}
        const newPolicy = this.downloadPolicy(deviceModelUrn, policyId);
        this.policiesByPolicyId.put(policyId, newPolicy);

        // @type {string}
        assignedDevices.forEach(deviceId => {
            this.assignPolicyToDevice(deviceModelUrn, policyId, deviceId, lastModified);
        });

        // @type {DevicePolicy}
        const devicePolicy = this.policiesByPolicyId.get(policyId);

        if (devicePolicy != null) {
            this.notifyPolicyAssigned(devicePolicy, assignedDevices);
        }
    }

    /**
     *
     * @param {boolean} couldNotGetIcds
     * @param {string} deviceModelUrn
     * @param {string} policyId
     */
    processAssignCouldNotGetIcds(couldNotGetIcds, deviceModelUrn, policyId) {
        if (couldNotGetIcds) {
            // Remove the mappings for all devices that reference this policy
            // since we no longer know which policy they refer to. On next call
            // to getPolicy, this should self-correct.
            // @type {Map<string, Set<string>>}
            const deviceModelPolicies = this.policiesByDeviceModelUrn.get(deviceModelUrn);

            if (deviceModelPolicies) {
                // @type {Set<string>}
                const assignedDeviceIds = deviceModelPolicies.delete(policyId);

                if (assignedDeviceIds) {
                    assignedDeviceIds.forEach(deviceId => {
                        // @type {Map<string, string>}
                        const assignedPolicies = this.policiesByDeviceId.get(deviceId);

                        if (assignedPolicies) {
                            assignedPolicies.delete(deviceModelUrn);
                        }

                        //this.removePersistedAssociation(deviceModelUrn, policyId, deviceId);
                    });
                }
            }
        }
    }

    /**
     * Process the "change" operation from policyChanged. The method needs to fetch the policy.
     *
     * @param {DirectlyConnectedDevice} directlyConnectedDevice
     * @param {string} deviceModelUrn the device model URN of the policy that is unassigned.
     * @param {string} policyId the ID of the policy that is unassigned.
     * @param {number} lastModified
     * @return {Promise} a Promise which resolves to nothing.
     */
    processPipelineChanged(directlyConnectedDevice, deviceModelUrn, policyId, lastModified) {
        return new Promise((resolve, reject) => {
            // First, check to see if we have a copy, and if so, whether or not it is more recent.
            // @// @type {}pe {DevicePolicy}
            const currentDevicePolicy = this.policiesByPolicyId.get(policyId);

            if (currentDevicePolicy) {
                if (lastModified < currentDevicePolicy.getLastModified()) {
                    // Our copy is more recent, return.
                    return;
                }
            }

            // Our copy is older, download the policy.
            // Block getPolicy from accessing policiesByDeviceId while the policy is being updated.
            // @type {DevicePolicy}
            this.downloadPolicy(deviceModelUrn, policyId).then(devicePolicy => {
                if (devicePolicy) {
                    debug(directlyConnectedDevice._.internalDev._.tam.endpointId +
                        ' : Policy changed : "' + devicePolicy.toString());
                }

                resolve();
                // Nothing else to do here...
            });
        });
    }

    /**
     * Process the "unassign" operation from policyChanged.
     * The method updates the data structures and persistence to remove the association
     * of the policy to the device.
     *
     * @param {string} deviceModelUrn the device model URN of the policy that is unassigned.
     * @param {string} policyId the ID of the policy that is unassigned.
     * @param {string} endpointId the endpointId of the device that called the policyChanged method.
     * @param {boolean} dcdIsGatewayDevice whether or not that device is a gateway device.
     * @param {number} lastModified is the time the policy was last modified on the server.
     */
    processUnassign(deviceModelUrn, policyId, endpointId, dcdIsGatewayDevice, lastModified) {
        // Get the set of devices to which this policy is assigned.
        // This will be the difference of the set of devices the client
        // says are assigned and the set of devices the server says are
        // assigned (the server doesn't say who was unassigned, we can
        // only ask who is assigned).
        // @type {Set<string>}
        let unassignedDevices;
        // @type {Map<string, Set<string>>}
        const policies = this.policiesByDeviceModelUrn.get(deviceModelUrn);

        if (policies) {
            unassignedDevices = policies.get(policyId);

            if (!unassignedDevices) {
                return;
            }
        } else {
            // The client doesn't have any devices assigned to this policy.
            return;
        }

        // If we aren't a gateway device, then make sure the
        // assigned devices contains the directly connected device
        // endpoint ID, and ensure that the only element of
        // unassignedDevices is the directly connected device
        // endpont ID.
        if (!dcdIsGatewayDevice) {
            if (!unassignedDevices.has(endpointId)) {
                // This endpoint is not currently assigned to the policy.
                return;
            }

            unassignedDevices.clear();
            unassignedDevices.add(endpointId);
        }

        // Now get the set of devices to which this policy is assigned,
        // according to the server. Remove the set of server-assigned
        // devices from the client assigned devices so that
        // unassignedDevices is now the set of devices that have
        // been unassigned from this policy.
        //
        // If the directly connected device is not a gateway, then we
        // know that the subject of the unassign is the directly connected
        // device and there is no need to make a call to the server for
        // the assigned devices.
        //
        // Note that if the call to get the set of ICD ids that are assigned
        // to the policy might fail, throwing an exception. In this case,
        // there is no way to tell what devices belong to the policy or not.
        // To handle this situation, every device on the client that has
        // this policy will be be will unassign from the policy _and_
        // the device's mapping to the device model urn in policiesByDeviceId
        // will be removed. Removing the mapping ensures that getPolicy
        // will fetch the policy anew and the mapping will self correct.
        // The flag "couldNotGetIcds" lets us know that the call failed.
        // @type {boolean}
        let couldNotGetIcds = dcdIsGatewayDevice;

        if (dcdIsGatewayDevice) {
            try {
                // @type {Set<string>}
                const serverAssignedDevices =
                    this.getIndirectlyConnectedDeviceIdsForPolicy(deviceModelUrn, policyId,
                        endpointId);

                // Returned without error...couldNotGetIcds is false.
                couldNotGetIcds = false;
                unassignedDevices.clear(serverAssignedDevices);

                // If unassignedDevices is empty now that we removed
                // all the ICD ids from the server, we should return
                // since there are no devices on the client affected
                // by the change.
                if (unassignedDevices.size === 0) {
                    return;
                }
            } catch (error) {
                // ignored
            }
        }

        // @type {DevicePolicy}
        const devicePolicy = this.policiesByPolicyId.get(policyId);

        if (!devicePolicy) {
            throw new Error('Device policy is null.');
        }

        this.notifyPolicyUnassigned(devicePolicy, unassignedDevices);

        // Now unassignedDevices is the set of device IDs that have been unassigned from this policy.
        unassignedDevices.forEach(deviceId => {
            if (couldNotGetIcds) {
                // unassignPolicyFromDevice takes care of the entry in policiesByDeviceModelUrn
                // and takes care of un-persisting the device to policy association.
                // @type {Map<string, string}
                const devicePolicies = this.policiesByDeviceId.get(deviceId);

                if (devicePolicies != null) {
                    devicePolicies.delete(deviceModelUrn);
                }
            }
        });

        this.unassignPolicyFromDevice(deviceModelUrn, policyId, deviceId, lastModified);
}

    /**
     * Remove a listener from receiving notification of policies being added or removed.
     *
     * @param {object} changeListener the ChangeListener to remove.
     */
    removeChangeListener(changeListener) {
        if (!changeListener) {
            return;
        }

        this.changeListeners.delete(changeListener);
    }

    /**
     *
     * @param {string} deviceModelUrn
     * @param {string} policyId
     * @param {string} deviceId
     */
    removePolicy(deviceModelUrn, policyId, deviceId) {
        this.policiesByDeviceModelUrn.delete(deviceModelUrn);
        this.policiesByPolicyId.delete(policyId);
        this.policiesByDeviceId.delete(deviceId);
    }

    /**
     * Handle the logic for unassigning a policy from a device. The only reason for this
     * method to return false is if the client has a more recent change than what it
     * was told by the server.
     *
     * @param {string} deviceModelUrn the device model urn from which the policy is unassigned
     * @param {string} policyId the policy id of the policy that is unassigned
     * @param {string} deviceId the device from which the policy is unassigned
     * @param {number} lastModified the lastModification time from the change request on the server
     * @return {boolean} whether or not the policy was unassigned.
     */
    unassignPolicyFromDevice(deviceModelUrn, policyId, deviceId, lastModified) {
        // Sanity check... does this device have the unassigned policy?
        // @type {string}
        let currentPolicyId;
        // policiesByDeviceId is { <device-id> : { <device-model-urn> : <policy-id> } }
        // @type {Map<string, string>}
        const policies = this.policiesByDeviceId.get(deviceId);

        if (policies) {
            currentPolicyId = policies.get(deviceModelUrn);
        } else {
            currentPolicyId = null;
        }

        if (!currentPolicyId) {
            // Device doesn't have a policy ID right now, move on.
            return true;
        }

        // If badMapping is set to true, the policiesByDeviceId entry for
        // the device-model URN of this device is removed. On the next
        // call to getPolicy, the map will auto-correct.
        // @type {boolean}
        let badMapping = false;

        if (policyId !== currentPolicyId) {
            // Server is telling me to unassign a policy ID
            // that the client doesn't have assigned. If
            // the policy that is assigned is newer than
            // lastModified, then the client is right and
            // we move on. Otherwise, unassign whatever
            // policy the device has and let the state
            // auto-correct on the next call to getPolicy.
            // @type {DevicePolicy}
            const devicePolicy = this.policiesByPolicyId.get(currentPolicyId);

            if (devicePolicy) {
                if (devicePolicy.getLastModified() > lastModified) {
                    // Client info is newer, move on to the next device ID.
                    return false;
                }

                // Else, server info is newer so indicate that
                // this device has a bad mapping and let the
                // code fall through to continue processing
                // this device ID.
                badMapping = true;
            } else {
                // Oh my. The device maps to some policy that
                // the client doesn't know about. Remove the mapping
                // and policiesByPolicyId will self correct for this
                // device the next time getPolicy is called.
                // Note that since devicePolicy is null, getPolicy
                // will return null for this device and device model anyway,
                // so taking an axe to policiesByPolicyId is okay here.
                //
                // policiesByDeviceId is { <device-id> : { <device-model-urn> : <policy-id> } }
                // @type {Map<string, string>}
                const devicePolicies = this.policiesByDeviceId.get(deviceId);

                if (devicePolicies) {
                    devicePolicies.delete(deviceModelUrn);
                }

                //this.removePersistedAssociation(deviceModelUrn, currentPolicyId, deviceId);
                return true;
            }
        }

        // If the sanity check passes, then we are good to remove
        // the mapping to the device-model-urn from policiesByDeviceId
        // for this device.
        if (policies) {
            if (!badMapping) {
                // If nothing is wrong in our mapping, then
                // set the current policy for this device and
                // device model urn to null. This state causes
                // getPolicy to return null without further lookup.
                policies.set(deviceModelUrn, null);
            } else {
                // if there was something bad in our mapping,
                // the remove the deviceModelUrn entry altogether.
                // On the next call to getPolicy for this device
                // and device model, the map will be corrected.
                policies.delete(deviceModelUrn);
            }
        }

        //this.removePersistedAssociation(deviceModelUrn, policyId, deviceId);
        return true;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/PersistenceStoreManager.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * PersistenceStoreManager
 */
class PersistenceStoreManager {
    /**
     *
     * @param {string} name
     * @return {InMemoryPersistenceStore}
     */
    static get(name) {
        if (!PersistenceStoreManager.persistentStores) {
            /**
             * Map from name to a PersistenceStore instance.
             *
             * @type {Map<string, PersistenceStore>}
             */
            PersistenceStoreManager.persistentStores = new Map();
        }

        let persistentStore = PersistenceStoreManager.persistentStores.get(name);

        if (!persistentStore) {
            persistentStore = new InMemoryPersistenceStore(name);
            PersistenceStoreManager.persistentStores.set(name, persistentStore);
        }

        return persistentStore;
    }

    static has(name) {
        if (!PersistenceStoreManager.persistentStores) {
            /**
             * Map from name to a PersistenceStore instance.
             *
             * @type {Map<string, PersistenceStore>}
             */
            PersistenceStoreManager.persistentStores = new Map();
            return false;
        }

        return PersistenceStoreManager.persistentStores.has(name);
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/PersistenceStoreTransaction.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * Class for modifying values in a PersistenceStore. The PersistenceStore itself is not updated
 * until commit() is called.
 */
class PersistenceStoreTransaction {
    // Instance "variables"/properties...see constructor.

    constructor(inMemoryPersistenceStore) {
        // Instance "variables"/properties.
        this.inMemoryPersistenceStore = inMemoryPersistenceStore;
        /**
         * {Map<string, object>}
         */
        this.transactions = new Map();
        // Instance "variables"/properties.
    }

    /**
     * Mark all values to be removed from the PersistenceStore object.  When commit}is called,
     * values are removed before put methods are processed.
     *
     * @return {PersistenceStoreTransaction} this Transaction object.
     */
    clear() {
        this.transactions.clear();
        return this;
    }

    /**
     * Commit this transaction. This method persists the values to the backing store and
     * replaces the values in the {@code PersistenceStore} object.
     *
     * @return {boolean} true if the values were persisted.
     */
    commit() {
        let self = this;

        this.transactions.forEach((v, k) => {
            self.inMemoryPersistenceStore.items.set(k, v);
        });

        return true;
    }

    /**
     * Set an opaque value for the key, which is written back to the PersistenceStore object when
     * commit() is called.
     *
     * @param {string} key a key to be used to retrieve the value.
     * @param {object} value the value.
     * @return {PersistenceStoreTransaction} this Transaction object.
     */
    putOpaque(key, value) {
        this.transactions.set(key, value);
        return this;
    }

    /**
     * Mark all values to be removed from the PersistenceStore object.  When commit is called,
     * values are removed before put methods are processed.
     *
     * @param {string} key a key whose value is to be removed.
     * @return {PersistenceStoreTransaction} this Transaction object.
     */
    remove(key) {
        this.transactions.delete(key);
        return this;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/ExternalObject.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * ExternalObject represents the value of a URI type in a device model.
 * The application is responsible for uploading/downloading the content referred to by the URI.
 *
 * @param {String} uri - the URI
 *
 * @class
 * @memberOf iotcs
 * @alias ExternalObject
 */
lib.ExternalObject = function (uri) {
    _optionalArg(uri, "string");

    Object.defineProperty(this, '_',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    Object.defineProperty(this._, 'internal',{
        enumerable: false,
        configurable: true,
        writable: false,
        value: {
            uri: uri || null
        }
    });
};

/**
 * Get the URI value.
 *
 * @returns {String} URI
 * @memberof iotcs.ExternalObject.prototype
 * @function getURI
 */
lib.ExternalObject.prototype.getURI = function () {
    return this._.internal.uri;
};


//////////////////////////////////////////////////////////////////////////////
// file: library/device/Stack.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

class Stack {
    // Instance "variables"/properties...see constructor.

    constructor() {
        // Instance "variables"/properties.
        this.count = 0;
        this.items = [];
        // Instance "variables"/properties.
    }

    get(idx) {
        return this.items[idx];
    }

    getLength() {
        return this.count;
    }

    peek() {
        return this.items.slice(-1) [0];
    }

    push(item) {
        this.items.push(item);
        this.count++;
    }

    pop() {
        if (this.count > 0) {
            this.count--;
        }

        return this.items.pop();
    }
}

//////////////////////////////////////////////////////////////////////////////
// file: library/shared/StorageObject.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * StorageObject provides information about content in cloud storage.
 * For creation use {@link iotcs.device.util.DirectlyConnectedDevice#createStorageObject}
 *
 * @param {?String} uri - the full URI of the object in the Storage Cloud
 * @param {?String} name - name of the object used in the Storage Cloud
 * @param {?String} type - type of the object, if <code>null</code> then {@link iotcs.StorageObject.MIME_TYPE}
 * @param {?String} encoding - encoding of the object, or <code>null</code> if none
 * @param {?Date} date - last-modified date of the object
 * @param {number} [length = -1] - length of the object
 *
 * @class
 * @memberOf iotcs
 * @alias StorageObject
 * @extends iotcs.ExternalObject
 */
lib.StorageObject = function (uri, name, type, encoding, date, length) {
    _optionalArg(uri, 'string');
    _optionalArg(name, 'string');
    _optionalArg(type, 'string');
    _optionalArg(encoding, 'string');
    _optionalArg(date, Date);
    _optionalArg(length, 'number');

    lib.ExternalObject.call(this, uri);

    var spec = {
        name: name || null,
        type: type || lib.StorageObject.MIME_TYPE,
        encoding: encoding || null,
        date: date || null,
        length: length || -1
    };
    var self = this;

    Object.defineProperties(this._.internal, {
        name: {
            value: spec.name,
            enumerable: true,
            writable: true
        },
        type: {
            value: spec.type,
            enumerable: true,
            writable: true
        },
        inputStream: {
            value: null,
            enumerable: true,
            writable: true
        },
        outputStream: {
            value: null,
            enumerable: true,
            writable: true
        },
        encoding: {
            value: spec.encoding,
            enumerable: true,
            writable: true
        },
        date: {
            value: spec.date,
            enumerable: true,
            writable: true
        },
        length: {
            value: spec.length,
            enumerable: true,
            writable: true
        },
        progress_state: {
            value: lib.StorageDispatcher.Progress.State.INITIATED,
            enumerable: true,
            writable: true
        }
    });

    Object.defineProperty(this._, 'dcd',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
    });

    Object.defineProperty(this._, 'setDevice',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: function (device) {
            if (device instanceof lib.device.util.DirectlyConnectedDevice) {
                self._.dcd = device;
            } else {
                lib.error("Invalid device type");
            }
        }
    });

    Object.defineProperty(this._, 'setMetadata',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (date, length) {
            self._.internal.date = date;
            self._.internal.length = length;
        }
    });

    Object.defineProperty(this._, 'setURI',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (uri) {
            self._.internal.uri = uri;
        }
    });

    Object.defineProperty(this._, 'setProgressState',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (state) {
            self._.internal.progress_state = state;
        }
    });

    Object.defineProperty(this._, 'isCancelled',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            return (self._.internal.progress_state === lib.StorageDispatcher.Progress.State.CANCELLED);
        }
    });
};

lib.StorageObject.prototype = Object.create(lib.ExternalObject.prototype);
lib.StorageObject.constructor = lib.StorageObject;

/**
 * Set an input stream for content to be uploaded.
 * The implementation allows for either the input stream to be set,
 * or the output stream to be set, but not both.
 * If the input stream parameter is not null, the output stream will be set to null.
 *
 * @param {stream.Readable} stream - readable stream to which the content will be read.
 *
 * @memberof iotcs.StorageObject.prototype
 * @function setInputStream
 */
lib.StorageObject.prototype.setInputStream = function (stream) {
    _mandatoryArg(stream, require('stream').Readable);
    switch (this._.internal.progress_state) {
        case lib.StorageDispatcher.Progress.State.QUEUED:
        case lib.StorageDispatcher.Progress.State.IN_PROGRESS:
            lib.error("Can't set input stream during transfer process.");
            return;
        case lib.StorageDispatcher.Progress.State.COMPLETED:
            this._.internal.progress_state = lib.StorageDispatcher.Progress.INITIATED;
    }
    this._.internal.inputStream = stream;
    this._.internal.outputStream = null;
};

/**
 * Set an output stream for content to be downloaded.
 * The implementation allows for either the output stream to be set,
 * or the input stream to be set, but not both.
 * If the output stream parameter is not null, the input stream will be set to null.
 *
 * @param {stream.Writable} stream - writable stream to which the content will be written.
 *
 * @memberof iotcs.StorageObject.prototype
 * @function setOutputStream
 */
lib.StorageObject.prototype.setOutputStream = function (stream) {
    _mandatoryArg(stream, require('stream').Writable);
    switch (this._.internal.progress_state) {
        case lib.StorageDispatcher.Progress.State.QUEUED:
        case lib.StorageDispatcher.Progress.State.IN_PROGRESS:
            lib.error("Can't set output stream during transfer process.");
            return;
        case lib.StorageDispatcher.Progress.State.COMPLETED:
            this._.internal.progress_state = lib.StorageDispatcher.Progress.INITIATED;
    }
    this._.internal.outputStream = stream;
    this._.internal.inputStream = null;
};

/**
 * Get the the name of this object in the storage cloud.
 * This is name and path of the file that was uploaded to the storage cloud.
 *
 * @returns {String} name
 * @memberof iotcs.StorageObject.prototype
 * @function getName
 */
lib.StorageObject.prototype.getName = function () {
    return this._.internal.name;
};

/**
 * Get the mime-type of the content.
 *
 * @returns {String} type
 * @see {@link http://www.iana.org/assignments/media-types/media-types.xhtml|IANA Media Types}
 * @memberof iotcs.StorageObject.prototype
 * @function getType
 */
lib.StorageObject.prototype.getType = function () {
    return this._.internal.type;
};

/**
 * Get the date and time the content was created or last modified in cloud storage.
 *
 * @returns {?Date} date the content was last modified in cloud storage,
 * or <code>null</code> if the content has not been uploaded
 * @memberof iotcs.StorageObject.prototype
 * @function getDate
 */
lib.StorageObject.prototype.getDate = function () {
    return this._.internal.date;
};

/**
 * Get the length of the content in bytes.
 * This is the number of bytes required to upload or download the content.
 *
 * @returns {number} the length of the content in bytes, or <code>-1</code> if unknown
 * @memberof iotcs.StorageObject.prototype
 * @function getLength
 */
lib.StorageObject.prototype.getLength = function () {
    return this._.internal.length;
};

/**
 * Get the compression scheme of the content.
 *
 * @returns {?String} the compression scheme of the content,
 * or <code>null</code> if the content is not compressed
 * @memberof iotcs.StorageObject.prototype
 * @function getEncoding
 */
lib.StorageObject.prototype.getEncoding = function () {
    return this._.internal.encoding;
};

/**
 * Get the URI value.
 *
 * @returns {?String} URI, or <code>null</code> if unknown
 * @memberof iotcs.StorageObject.prototype
 * @function getURI
 */
lib.StorageObject.prototype.getURI = function () {
    return this._.internal.uri;
};

/**
 * Get the input file path when uploading content.
 *
 * @returns {?stream.Readable} input stream, or <code>null</code> if not set
 * @memberof iotcs.StorageObject.prototype
 * @function getInputStream
 */
lib.StorageObject.prototype.getInputStream = function () {
    return this._.internal.inputStream;
};

/**
 * Get the output file path when downloading content.
 *
 * @returns {?stream.Writable} output stream, or <code>null</code> if not set
 * @memberof iotcs.StorageObject.prototype
 * @function getOutputStream
 */
lib.StorageObject.prototype.getOutputStream = function () {
    return this._.internal.outputStream;
};

/**
 * Synchronize content with the Storage Cloud Service.
 *
 * @param {function(storage, error)} callback - the callback function.
 *
 * @memberof iotcs.StorageObject.prototype
 * @function sync
 */
lib.StorageObject.prototype.sync = function (callback) {
    _mandatoryArg(callback, 'function');
    this._.dcd._.sync_storage(this, callback, callback);
};

/**
 * @constant MIME_TYPE
 * @memberOf iotcs.StorageObject
 * @type {String}
 * @default "application/octet-stream"
 */
Object.defineProperty(lib.StorageObject, 'MIME_TYPE',{
    enumerable: false,
    configurable: false,
    writable: false,
    value: "application/octet-stream"
});


//////////////////////////////////////////////////////////////////////////////
// file: library/device/StorageObject.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * StorageObject provides information about content in cloud storage.
 * For creation use {@link iotcs.device.DirectlyConnectedDevice#createStorageObject}
 *
 * @param {?String} uri - the full URI of the object in the Storage Cloud
 * @param {?String} name - name of the object used in the Storage Cloud
 * @param {?String} type - type of the object, if <code>null</code> then {@link iotcs.StorageObject.MIME_TYPE}
 * @param {?String} encoding - encoding of the object, or <code>null</code> if none
 * @param {?Date} date - last-modified date of the object
 * @param {number} [length = -1] - length of the object
 *
 * @class
 * @memberOf iotcs.device
 * @alias StorageObject
 * @extends iotcs.ExternalObject
 */
lib.device.StorageObject = function (uri, name, type, encoding, date, length) {
    lib.StorageObject.call(this, uri, name, type, encoding, date, length);

    var self = this;
    Object.defineProperty(this._.internal, 'syncStatus',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: lib.device.StorageObject.SyncStatus.NOT_IN_SYNC
    });

    Object.defineProperty(this._.internal, 'inputPath',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
    });

    Object.defineProperty(this._.internal, 'outputPath',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
    });

    Object.defineProperty(this, 'onSync', {
        enumerable: false,
        configurable: false,
        get: function () {
            return self._.onSync;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onDelivery that is not a function!');
                return;
            }
            self._.onSync = newValue;
        }
    });

    this._.onSync = function (arg) {};

    Object.defineProperty(this._.internal, 'syncEvents',{
        enumerable: false,
        configurable: false,
        writable: true,
        value: [null]
    });

    Object.defineProperty(this._, 'addSyncEvent', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (syncEvent) {
            switch (self.getSyncStatus()) {
                case lib.device.StorageObject.SyncStatus.NOT_IN_SYNC:
                case lib.device.StorageObject.SyncStatus.SYNC_PENDING:
                    self._.internal.syncEvents.push(syncEvent);
                    break;
                case lib.device.StorageObject.SyncStatus.IN_SYNC:
                case lib.device.StorageObject.SyncStatus.SYNC_FAILED:
                    self._.onSync(syncEvent);
                    break;
            }
        }
    });

    Object.defineProperty(this._, 'createSyncEvent', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            return new lib.device.StorageObject.SyncEvent(self, self._.nameForSyncEvent, self._.deviceForSync);
        }
    });

    Object.defineProperty(this._, 'deviceForSync', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
    });

    Object.defineProperty(this._, 'nameForSyncEvent', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
    });

    Object.defineProperty(this._, 'setSyncEventInfo', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (name, virtualDevice) {
            self._.nameForSyncEvent = name;
            self._.deviceForSync = virtualDevice;
        }
    });

    Object.defineProperty(this._, 'handleStateChange', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            if (self._.deviceForSync) {
                self._.deviceForSync._.handleStorageObjectStateChange(self);
            }
        }
    });

    Object.defineProperty(this._, 'setDevice',{
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (device) {
            if (device instanceof lib.device.util.DirectlyConnectedDevice) {
                self._.dcd = device;
            } else {
                lib.error("Invalid device type");
            }
        }
    });
};

lib.device.StorageObject.prototype = Object.create(lib.StorageObject.prototype);
lib.device.StorageObject.constructor = lib.device.StorageObject;

/**
 * Set an input file path for content to be uploaded.
 * The implementation allows for either the input path to be set,
 * or the output path to be set, but not both.
 * If the input path parameter is not null, the output path will be set to null.
 *
 * @param {String} path - input file path to which the content will be read.
 *
 * @memberof iotcs.device.StorageObject.prototype
 * @function setInputPath
 */
lib.device.StorageObject.prototype.setInputPath = function (path) {
    _mandatoryArg(path, "string");

    if (this._.internal.syncStatus === lib.device.StorageObject.SyncStatus.SYNC_PENDING) {
        lib.error("Illegal state: sync pending");
        return;
    }

    if (this._.internal.inputPath === null || this._.internal.inputPath !== path) {
        this._.internal.inputPath = path;
        this._.internal.outputPath = null;
        this._.internal.syncStatus = lib.device.StorageObject.SyncStatus.NOT_IN_SYNC;
        lib.StorageObject.prototype.setInputStream.call(this, require("fs").createReadStream(path));
    }
};

/**
 * Set an output file path for content to be downloaded.
 * The implementation allows for either the output path to be set,
 * or the input path to be set, but not both.
 * If the output path parameter is not null, the input path will be set to null.
 *
 * @param {String} path - output file path to which the content will be written.
 *
 * @memberof iotcs.device.StorageObject.prototype
 * @function setOutputPath
 */
lib.device.StorageObject.prototype.setOutputPath = function (path) {
    _mandatoryArg(path, "string");
    if (this._.internal.syncStatus === lib.device.StorageObject.SyncStatus.SYNC_PENDING) {
        lib.error("Illegal state: sync pending");
        return;
    }
    if (this._.internal.outputPath === null || this._.internal.outputPath !== path) {
        this._.internal.outputPath = path;
        this._.internal.inputPath = null;
        this._.internal.syncStatus = lib.device.StorageObject.SyncStatus.NOT_IN_SYNC;
        lib.StorageObject.prototype.setOutputStream.call(this, require("fs").createWriteStream(path));
    }
};

/**
 * Get the the name of this object in the storage cloud.
 * This is name and path of the file that was uploaded to the storage cloud.
 *
 * @returns {String} name
 * @memberof iotcs.device.StorageObject.prototype
 * @function getName
 */
lib.device.StorageObject.prototype.getName = function () {
    return this._.internal.name;
};

/**
 * Get the mime-type of the content.
 *
 * @returns {String} type
 * @see {@link http://www.iana.org/assignments/media-types/media-types.xhtml|IANA Media Types}
 * @memberof iotcs.device.StorageObject.prototype
 * @function getType
 */
lib.device.StorageObject.prototype.getType = function () {
    return this._.internal.type;
};

/**
 * Get the date and time the content was created or last modified in cloud storage.
 *
 * @returns {?Date} date the content was last modified in cloud storage,
 * or <code>null</code> if the content has not been uploaded
 * @memberof iotcs.device.StorageObject.prototype
 * @function getDate
 */
lib.device.StorageObject.prototype.getDate = function () {
    return this._.internal.date;
};

/**
 * Get the length of the content in bytes.
 * This is the number of bytes required to upload or download the content.
 *
 * @returns {number} the length of the content in bytes, or <code>-1</code> if unknown
 * @memberof iotcs.device.StorageObject.prototype
 * @function getLength
 */
lib.device.StorageObject.prototype.getLength = function () {
    return this._.internal.length;
};

/**
 * Get the compression scheme of the content.
 *
 * @returns {?String} the compression scheme of the content,
 * or <code>null</code> if the content is not compressed
 * @memberof iotcs.StorageObject.prototype
 * @function getEncoding
 */
lib.StorageObject.prototype.getEncoding = function () {
    return this._.internal.encoding;
};

/**
 * Get the URI value.
 *
 * @returns {?String} URI, or <code>null</code> if unknown
 * @memberof iotcs.device.StorageObject.prototype
 * @function getURI
 */
lib.device.StorageObject.prototype.getURI = function () {
    return this._.internal.uri;
};

/**
 * Get the input file path when uploading content.
 *
 * @returns {String} input file path
 * @memberof iotcs.device.StorageObject.prototype
 * @function getInputPath
 */
lib.device.StorageObject.prototype.getInputPath = function () {
    return this._.internal.inputPath;
};

/**
 * Get the output file path when downloading content.
 *
 * @returns {String} output file path
 * @memberof iotcs.device.StorageObject.prototype
 * @function getOutputPath
 */
lib.device.StorageObject.prototype.getOutputPath = function () {
    return this._.internal.outputPath;
};

/**
 * Notify the library to sync content with the storage cloud.
 *
 * @memberof iotcs.device.StorageObject.prototype
 * @function sync
 */
lib.device.StorageObject.prototype.sync = function () {
    var syncEvent = this._.createSyncEvent();
    if (this._.internal.syncStatus === lib.device.StorageObject.SyncStatus.NOT_IN_SYNC) {
        if (this._.internal.inputStream || this._.internal.outputStream) {
            this._.internal.syncStatus = lib.device.StorageObject.SyncStatus.SYNC_PENDING;
        } else {
            lib.error("input path or output path must be set");
            return;
        }
        this._.addSyncEvent(syncEvent);
        new lib.device.util.StorageDispatcher(this._.dcd).queue(this);
    } else {
        this._.addSyncEvent(syncEvent);
    }
};

/**
 * Get the status of whether or not the content is in sync with the storage cloud.
 *
 * @see {@link iotcs.device.StorageObject.SyncStatus}
 * @memberof iotcs.device.StorageObject.prototype
 * @function getSyncStatus
 */
lib.device.StorageObject.prototype.getSyncStatus = function () {
    return this._.internal.syncStatus;
};

/**
 * Enumeration of the status of whether or not the content is in sync with the storage cloud.
 *
 * @memberOf iotcs.device.StorageObject
 * @alias SyncStatus
 * @readonly
 * @enum {String}
 */
lib.device.StorageObject.SyncStatus = {
    /**
     * The content is not in sync with the storage cloud
     */
    NOT_IN_SYNC: "NOT_IN_SYNC",
    /**
     * The content is not in sync with the storage cloud, but a
     * sync is pending.
     */
    SYNC_PENDING: "SYNC_PENDING",
    /**
     * The content is in sync with the storage cloud
     */
    IN_SYNC: "IN_SYNC",
    /**
     * The content is not in sync with the storage cloud because the upload or download failed.
     */
    SYNC_FAILED: "SYNC_FAILED"
};

/**
 * An event passed to the onSync callback when content referred to by
 * an attribute value has been successfully synchronized, or has failed to be synchronized
 *
 * @param {iotcs.device.StorageObject} storageObject
 * @param {String} [name]
 * @param {iotcs.device.VirtualDevice} [virtualDevice]
 *
 * @class
 * @memberOf iotcs.device.StorageObject
 * @alias SyncEvent
 */
lib.device.StorageObject.SyncEvent = function (storageObject, name, virtualDevice) {
    _mandatoryArg(storageObject, lib.device.StorageObject);
    _optionalArg(name, "string");
    _optionalArg(virtualDevice, lib.device.VirtualDevice);

    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    Object.defineProperty(this._, 'internal', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {
            storage: storageObject,
            name: name,
            virtualDevice: virtualDevice
        }
    });
};

/**
 * Get the virtual device that is the source of the event.
 *
 * @returns {iotcs.device.VirtualDevice} the virtual device, or <code>null</code> if sync was called independently
 * @memberof iotcs.device.StorageObject.SyncEvent.prototype
 * @function getVirtualDevice
 */
lib.device.StorageObject.SyncEvent.prototype.getVirtualDevice = function () {
    return this._.internal.virtualDevice;
};

/**
 * Get the name of the attribute, action, or format that this event is associated with.
 *
 * @returns {String} the name, or <code>null</code> if sync was called independently
 * @memberof iotcs.device.StorageObject.SyncEvent.prototype
 * @function getName
 */
lib.device.StorageObject.SyncEvent.prototype.getName = function () {
    return this._.internal.name;
};

/**
 * Get the StorageObject that is the source of this event.
 *
 * @returns {iotcs.device.StorageObject} the storage object
 * @memberof iotcs.device.StorageObject.SyncEvent.prototype
 * @function getSource
 */
lib.device.StorageObject.SyncEvent.prototype.getSource = function () {
    return this._.internal.storage;
};


//////////////////////////////////////////////////////////////////////////////
// file: library/shared/StorageDispatcher.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/** @ignore */
lib.StorageDispatcher = function (device) {
    _mandatoryArg(device, "object");
    var self = this;
    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });

    Object.defineProperty(this._, 'device', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: device
    });

    Object.defineProperty(this, 'onProgress', {
        enumerable: false,
        configurable: false,
        get: function () {
            return self._.onProgress;
        },
        set: function (newValue) {
            if (!newValue || (typeof newValue !== 'function')) {
                lib.error('trying to set something to onDelivery that is not a function!');
                return;
            }
            self._.onProgress = newValue;
        }
    });
    this._.onProgress = function (arg, error) {};

    Object.defineProperty(this._, 'queue', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: new $impl.PriorityQueue(lib.oracle.iot.client.maximumStorageObjectsToQueue)
    });

    Object.defineProperty(this._, 'push', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (storage) {
            self._.queue.push(storage);
        }
    });

    Object.defineProperty(this._, 'remove', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (storage) {
            return self._.queue.remove(storage);
        }
    });

    Object.defineProperty(device, 'storageDispatcher', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: this
    });
};

/** @ignore */
lib.StorageDispatcher.prototype.queue = function (storageObject) {
    _mandatoryArg(storageObject, lib.StorageObject);
    if (storageObject._.internal.progress_state === lib.StorageDispatcher.Progress.State.COMPLETED) {
        return;
    }
    if (storageObject._.internal.progress_state === lib.StorageDispatcher.Progress.State.QUEUED ||
        storageObject._.internal.progress_state === lib.StorageDispatcher.Progress.State.IN_PROGRESS) {
        lib.error("Can't queue storage during transfer process.");
        return;
    }
    storageObject._.setProgressState(lib.StorageDispatcher.Progress.State.QUEUED);
    this._.push(storageObject);
    this._.onProgress(new lib.StorageDispatcher.Progress(storageObject));
};

/** @ignore */
lib.StorageDispatcher.prototype.cancel = function (storageObject) {
    _mandatoryArg(storageObject, lib.StorageObject);
    var cancelled = false;
    if (storageObject._.internal.progress_state === lib.StorageDispatcher.Progress.State.QUEUED) {
        cancelled = (this._.remove(storageObject) !== null);
    }
    if (cancelled ||
        storageObject._.internal.progress_state === lib.StorageDispatcher.Progress.State.IN_PROGRESS) {
        storageObject._.setProgressState(lib.StorageDispatcher.Progress.State.CANCELLED);
    }

    if (cancelled) {
        this._.onProgress(new lib.StorageDispatcher.Progress(storageObject));
    }
};

/** @ignore */
lib.StorageDispatcher.Progress = function (storageObject) {
    _mandatoryArg(storageObject, lib.StorageObject);

    Object.defineProperty(this, '_', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this._, 'internal', {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {
            storage: storageObject,
            state: storageObject._.internal.progress_state,
            bytesTransferred: 0
        }
    });

    var self = this;
    Object.defineProperty(this._, 'setBytesTransferred', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (bytes) {
            self._.internal.bytesTransferred = bytes;
        }
    });
};

/** @ignore */
lib.StorageDispatcher.Progress.prototype.getBytesTransferred = function () {
    return this._.internal.bytesTransferred;
};

/** @ignore */
lib.StorageDispatcher.Progress.prototype.getState = function () {
    return this._.internal.state;
};

/** @ignore */
lib.StorageDispatcher.Progress.prototype.getStorageObject = function () {
    return this._.internal.storage;
};

lib.StorageDispatcher.Progress.State = {
    /** Up/download was cancelled before it completed */
    CANCELLED: "CANCELLED",
    /** Up/download completed successfully */
    COMPLETED: "COMPLETED",
    /** Up/download failed without completing */
    FAILED: "FAILED",
    /** Up/download is currently in progress */
    IN_PROGRESS: "IN_PROGRESS",
    /** Initial state */
    INITIATED: "INITIATED",
    /** Up/download is queued and not yet started */
    QUEUED: "QUEUED"
};

//////////////////////////////////////////////////////////////////////////////
// file: library/device/StorageDispatcher.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * The StorageDispatcher queues content for automatic upload to, or download from, the Oracle Storage Cloud Service.
 * <p>
 * There can be only one StorageDispatcher instance per DirectlyConnectedDevice at a time and it is created
 * at first use. To close an instance of a StorageDispatcher the DirectlyConnectedDevice.close method must be used.
 * <p>
 * The onProgress can be used to set handlers that are used for notifying as the transfer progresses:
 * <p>
 * <code>storageDispatcher.onProgress = function (progress, error);</code><br>
 * where {@link iotcs.device.util.StorageDispatcher.Progress} progress is an object represents the transfer progress
 * of storage object
 *
 * @param {iotcs.device.util.DirectlyConnectedDevice} device - the directly
 * connected device (Messaging API) associated with this storage dispatcher
 *
 * @class
 * @memberOf iotcs.device.util
 * @alias StorageDispatcher
 * @extends iotcs.StorageDispatcher
 */
lib.device.util.StorageDispatcher = function (device) {
    _mandatoryArg(device, lib.device.util.DirectlyConnectedDevice);

    if (device.storageDispatcher) {
        return device.storageDispatcher;
    }
    lib.StorageDispatcher.call(this, device);

    var self = this;
    var client = device;
    var poolingInterval = lib.oracle.iot.client.device.defaultMessagePoolingInterval;
    var startPooling = null;

    var processCallback = function (storage, state, bytes) {
        storage._.setProgressState(state);
        var progress = new lib.device.util.StorageDispatcher.Progress(storage);
        progress._.setBytesTransferred(bytes);
        self._.onProgress(progress);
    };

    var deliveryCallback = function (storage, error, bytes) {
        storage._.setProgressState(lib.StorageDispatcher.Progress.State.COMPLETED);
        var progress = new lib.device.util.StorageDispatcher.Progress(storage);
        progress._.setBytesTransferred(bytes);
        self._.onProgress(progress, error);
    };

    var errorCallback = function (storage, error, bytes) {
        storage._.setProgressState(lib.StorageDispatcher.Progress.State.FAILED);
        var progress = new lib.device.util.StorageDispatcher.Progress(storage);
        progress._.setBytesTransferred(bytes);
        self._.onProgress(progress, error);
    };

    var sendMonitor = new $impl.Monitor(function () {
        var currentTime = Date.now();
        if (currentTime >= (startPooling + poolingInterval)) {
            if (!device.isActivated() || device._.internalDev._.activating
                || device._.internalDev._.refreshing || device._.internalDev._.storage_refreshing) {
                startPooling = currentTime;
                return;
            }
            var storage = self._.queue.pop();
            while (storage !== null) {
                storage._.setProgressState(lib.StorageDispatcher.Progress.State.IN_PROGRESS);
                self._.onProgress(new lib.device.util.StorageDispatcher.Progress(storage));
                client._.sync_storage(storage, deliveryCallback, errorCallback, processCallback);
                storage = self._.queue.pop();
            }
            startPooling = currentTime;
        }
    });

    Object.defineProperty(this._, 'stop', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function () {
            sendMonitor.stop();
        }
    });

    startPooling = Date.now();
    sendMonitor.start();
};

lib.device.util.StorageDispatcher.prototype = Object.create(lib.StorageDispatcher);
lib.device.util.StorageDispatcher.constructor = lib.device.util.StorageDispatcher;

/**
 * Add a StorageObject to the queue to upload/download content to/from the Storage Cloud.
 *
 * @param {iotcs.StorageObject} storageObject - The content storageObject to be queued
 *
 * @memberof iotcs.device.util.StorageDispatcher.prototype
 * @function queue
 */
lib.device.util.StorageDispatcher.prototype.queue = function (storageObject) {
    _mandatoryArg(storageObject, lib.StorageObject);
    lib.StorageDispatcher.prototype.queue.call(this, storageObject);
};

/**
 * Cancel the transfer of content to or from storage.
 * This call has no effect if the transfer is completed, already cancelled, has failed, or the storageObject is not queued.
 *
 * @param {iotcs.StorageObject} storageObject - The content storageObject to be cancelled
 *
 * @memberof iotcs.device.util.StorageDispatcher.prototype
 * @function cancel
 */
lib.device.util.StorageDispatcher.prototype.cancel = function (storageObject) {
    _mandatoryArg(storageObject, lib.StorageObject);
    lib.StorageDispatcher.prototype.cancel.call(this, storageObject);
};

/**
 * An object for receiving progress via the ProgressCallback.
 *
 * @param {iotcs.StorageObject} storageObject - the storage object which progress will be tracked
 *
 * @class
 * @memberOf iotcs.device.util.StorageDispatcher
 * @alias Progress
 */
lib.device.util.StorageDispatcher.Progress = function (storageObject) {
    _mandatoryArg(storageObject, lib.StorageObject);
    lib.StorageDispatcher.Progress.call(this, storageObject);
};

lib.device.util.StorageDispatcher.Progress.prototype = Object.create(lib.StorageDispatcher.Progress);
lib.device.util.StorageDispatcher.Progress.constructor = lib.device.util.StorageDispatcher.Progress;

/**
 * Get the number of bytes transferred.
 * This can be compared to the length of content obtained by calling {@link iotcs.StorageObject#getLength}.
 *
 * @returns {number} the number of bytes transferred
 *
 * @memberof iotcs.device.util.StorageDispatcher.Progress.prototype
 * @function getBytesTransferred
 */
lib.device.util.StorageDispatcher.Progress.prototype.getBytesTransferred = function () {
    return lib.StorageDispatcher.Progress.prototype.getBytesTransferred.call(this);
};

/**
 * Get the state of the transfer
 *
 * @returns {iotcs.device.util.StorageDispatcher.Progress.State} the transfer state
 *
 * @memberof iotcs.device.util.StorageDispatcher.Progress.prototype
 * @function getState
 */
lib.device.util.StorageDispatcher.Progress.prototype.getState = function () {
    return lib.StorageDispatcher.Progress.prototype.getState.call(this);
};

/**
* Get the StorageObject that was queued for which this progress event pertains.
*
* @returns {iotcs.StorageObject} a StorageObject
*
* @memberof iotcs.device.util.StorageDispatcher.Progress.prototype
* @function getStorageObject
*/
lib.device.util.StorageDispatcher.Progress.prototype.getStorageObject = function () {
    return lib.StorageDispatcher.Progress.prototype.getStorageObject.call(this);
};

/**
 * Enumeration of progress state
 *
 * @memberOf iotcs.device.util.StorageDispatcher.Progress
 * @alias State
 * @readonly
 * @enum {String}
 */
lib.device.util.StorageDispatcher.Progress.State = {
    /** Up/download was cancelled before it completed */
    CANCELLED: "CANCELLED",
    /** Up/download completed successfully */
    COMPLETED: "COMPLETED",
    /** Up/download failed without completing */
    FAILED: "FAILED",
    /** Up/download is currently in progress */
    IN_PROGRESS: "IN_PROGRESS",
    /** Initial state */
    INITIATED: "INITIATED",
    /** Up/download is queued and not yet started */
    QUEUED: "QUEUED"
};



//////////////////////////////////////////////////////////////////////////////
// file: library/device/MessagingPolicyImpl.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

const util = require('util');

class MessagingPolicyImpl {
    // Instance "variables"/properties...see constructor.

    /**
     *
     * @param {$impl.DirectlyConnectedDevice} directlyConnectedDevice
     */
    constructor(directlyConnectedDevice) {
        // Instance "variables"/properties.
        /**
         * Key is device model urn, value is attribute -> trigger attributes
         * (a trigger attribute is a referenced attribute in a computedMetric formula).
         *
         * @type {Map<String, Map<String, Set<String>>>}
         */
        this.computedMetricTriggers = new Map();
        /**
         * Map from deviceModelUrn -> DeviceAnalog
         * We need more than one DeviceAnalog because the DCD can have more than one device model.
         *
         * @type {Map<String, DeviceAnalog>}
         */
        this.deviceAnalogMap = new Map();
        this.directlyConnectedDevice = directlyConnectedDevice;
        /**
         * {Set<Message>}
         */
        this.messagesFromExpiredPolicies = new Set();
        /**
         * Data pertaining to this virtual device and its attributes for computing policies. The key
         * is attribute name (or null for the device model policies), value is a list. Each element
         * in the list corresponds to a function in the pipeline for the attribute, and the map is
         * used by the function to hold data between calls.  Note that there is a 1:1 correspondence
         * between the pipeline configuration data for the attribute, and the pipeline data for the
         * attribute.
         *
         * @type {Map<String, Set<Map<String, Object>>>}
         */
        this.pipelineDataCache = new Map();
        // Instance "variables"/properties.

        this.deviceFunctionHelper = null;
        let num = 100000;
        let a = 1, b = 0, temp;

        while (num >= 0) {
            temp = a;
            a = a + b;
            b = temp;
            num--;
        }
    }

    // Apply policies that are targeted to an attribute
    /**
     * @param {iotcs.message.Message} dataMessage a data message to apply attribute polices to.
     * @param {number} currentTimeMillis the current time in milliseconds, use for expiring policies.
     * @resolve {iotcs.message.Message} an attribute-processed data message.
     * @return Promise
     */
    applyAttributePolicies(dataMessage, currentTimeMillis) {
        return new Promise((resolve, reject) => {
            debug('applyAttributePolicies called.');
            // A data message format cannot be null or empty (enforced in DataMessage(Builder) constructor.
            let format = dataMessage._.internalObject.payload.format;
            // A data message format cannot be null or empty.
            let deviceModelUrn = format.substring(0, format.length - ":attributes".length);
            // Use var so we can reference it from within the callbacks.
            var messagingPolicyImpl = this;
            var computedMetricTriggersTmp = this.computedMetricTriggers;
            var dataMessageVar = dataMessage;

            this.directlyConnectedDevice.getDeviceModel(deviceModelUrn, function (response, error) {
                debug('applyAttributePolicies getDeviceModel response = ' + response +
                    ', error = ' + error);

                if (error) {
                    console.log('-------------Error getting humidity sensor device model-------------');
                    console.log(error.message);
                    console.log('--------------------------------------------------------------------');
                    return;
                }

                let deviceModelJson = JSON.stringify(response, null, 4);
                let deviceModel = DeviceModelParser.fromJson(deviceModelJson);
                debug('applyAttributePolicies getDeviceModel deviceModel = ' + deviceModel);

                if (!deviceModel) {
                    resolve(dataMessageVar);
                    return;
                }

                let endpointId = dataMessage._.internalObject.source;

                let devicePolicyManager =
                    DevicePolicyManager.getDevicePolicyManager(messagingPolicyImpl.directlyConnectedDevice.getEndpointId());

                if (!devicePolicyManager) {
                    devicePolicyManager =
                        new DevicePolicyManager(messagingPolicyImpl.directlyConnectedDevice);
                }

                devicePolicyManager.getPolicy(deviceModelUrn, endpointId).then(devicePolicy => {
                    debug('applyAttributePolicies.getPolicy devicePolicy = ' + devicePolicy);
                    let deviceAnalog;

                    if (messagingPolicyImpl.deviceAnalogMap.has(endpointId)) {
                        deviceAnalog = messagingPolicyImpl.deviceAnalogMap.get(endpointId);
                    } else {
                        deviceAnalog = new DeviceAnalog(messagingPolicyImpl.directlyConnectedDevice,
                            deviceModel, endpointId);

                        messagingPolicyImpl.deviceAnalogMap.set(endpointId, deviceAnalog);
                    }

                    let triggerMap;

                    if (!computedMetricTriggersTmp.has(deviceModelUrn)) {
                        triggerMap = new Map();
                        computedMetricTriggersTmp.set(deviceModelUrn, triggerMap);
                        // @type {Map<String, DeviceModelAttribute>}
                        let deviceModelAttributeMap = deviceModel.getDeviceModelAttributes();

                        deviceModelAttributeMap.forEach(deviceModelAttribute => {
                            let attributeName = deviceModelAttribute.name;

                            if (!devicePolicy) {
                                return; // continue
                            }

                            // @type {Set<DevicePolicy.Function>}
                            let pipeline = devicePolicy.getPipeline(attributeName);
                            debug('applyAttributePolicies getDeviceModel.getPolicy pipeline = '
                                + pipeline);

                            if (!pipeline || pipeline.size === 0) {
                                return; // continue
                            }

                            // If a computedMetric is the first function in the pipeline,
                            // then see if the formula refers to other attributes. If so,
                            // then try this pipeline after all others.
                            // @type {DevicePolicy.Function}
                            let devicePolicyFunction = pipeline.values().next().value;
                            let deviceFunctionId = devicePolicyFunction.getId();
                            // @type {Map<String, ?>}
                            let parameters = devicePolicyFunction.getParameters();

                            if ('computedMetric' === deviceFunctionId) {
                                let formula = parameters.get('formula');
                                // @type {Set<String>}
                                let triggerAttributes = new Set();
                                let pos = formula.indexOf('$(');

                                while (pos !== -1) {
                                    let end = formula.indexOf(')', pos + 1);

                                    if (pos === 0 || formula.charAt(pos - 1) !== '$') {
                                        let attr = formula.substring(pos + '$('.length, end);

                                        if (attr !== attributeName) {
                                            triggerAttributes.add(attr);
                                        }
                                    }

                                    pos = formula.indexOf('$(', end + 1);
                                }

                                if (triggerAttributes.size > 0) {
                                    triggerMap.set(attributeName, triggerAttributes);
                                }
                            }
                        });

                        debug('MessagingPolicyImpl.applyAttributePolicies about to call applyAttributePolicies2.');

                        let message = messagingPolicyImpl.applyAttributePolicies2(dataMessage,
                            deviceModel, devicePolicy, deviceAnalog, triggerMap, format,
                            messagingPolicyImpl, currentTimeMillis);

                        debug('MessagingPolicyImpl.applyAttributePolicies message = ' +
                            message);

                        resolve(message);
                    } else {
                        triggerMap = computedMetricTriggersTmp.get(deviceModelUrn);

                        let message = messagingPolicyImpl.applyAttributePolicies2(dataMessage,
                            deviceModel, devicePolicy, deviceAnalog, triggerMap, format,
                            messagingPolicyImpl, currentTimeMillis);

                        resolve(message);
                    }
                }).catch(error => {
                    console.log('Error getting device policy: ' + error);
                });
            });
        });
    }

    /**
     *
     * @param dataMessage
     * @param deviceModel
     * @param devicePolicy
     * @param deviceAnalog
     * @param triggerMap
     * @param messagingPolicyImpl
     * @param currentTimeMillis
     * @return {Message} a message.
     */
    applyAttributePolicies2(dataMessage, deviceModel, devicePolicy, deviceAnalog, triggerMap,
                            format, messagingPolicyImpl, currentTimeMillis)
    {
        debug('applyAttributePolicies2 called.');
        // @type {[key] -> value}
        let dataMessageDataItemsKeys = Object.keys(dataMessage._.internalObject.payload.data);

        // DataItems resulting from policies. {Set<DataItem<?>>}
        let policyDataItems = new Set();

        // DataItems that have no policies. {Set<DataItem<?>>}
        let skippedDataItems = new Set();

        // If no policies are found, we will return the original message.
        let noPoliciesFound = true;

        dataMessageDataItemsKeys.forEach(attributeName => {
            debug('applyAttributePolicies2 attributeName = ' + attributeName);
            let attributeValue = dataMessage._.internalObject.payload.data[attributeName];

            if (!attributeName) {
                skippedDataItems.add(attributeName);
                return; // continue
            }

            if (!devicePolicy) {
                deviceAnalog.setAttributeValue(attributeName, attributeValue);
                skippedDataItems.add(new DataItem(attributeName, attributeValue));
                return; // continue
            }

            // @type {List<DevicePolicy.Function>}
            let pipeline = devicePolicy.getPipeline(attributeName);
            debug('applyAttributePolicies2 pipeline = ' + pipeline);

            // No policies for this attribute?  Retain the data item.
            if (!pipeline || pipeline.size === 0) {
                deviceAnalog.setAttributeValue(attributeName, attributeValue);
                skippedDataItems.add(new DataItem(attributeName, attributeValue));
                return; // continue
            }

            noPoliciesFound = false;

            // If this is a computed metric, skip it for now.
            if (triggerMap.has(attributeValue)) {
                return; // continue
            }

            let policyDataItem = messagingPolicyImpl.applyAttributePolicy(deviceAnalog,
                attributeName, attributeValue, pipeline, currentTimeMillis);

            debug('applyAttributePolicies2 policyDataItem from applyAttributePolicy = ' +
                util.inspect(policyDataItem));

            if (policyDataItem) {
                policyDataItems.add(policyDataItem);
            }
        });

        // If no policies were found, return the original message.
        if (noPoliciesFound) {
            return dataMessage;
        }

        // If policies were found, but there are no policyDataItem's and no skipped data items, then return null.
        if (policyDataItems.size === 0 && skippedDataItems.size === 0) {
            return null;
        }

        // This looks like a good place to check for computed metrics too.
        if (policyDataItems.size > 0) {
            messagingPolicyImpl.checkComputedMetrics(policyDataItems, deviceAnalog,
                triggerMap, currentTimeMillis);

                debug('applyAttributePolicies2 after checkComputedMetrics, policyDataItems = ' +
                    util.inspect(policyDataItems));
        }

        let message = new lib.message.Message();

        message
               .format(format)
               .priority(dataMessage._.internalObject.priority)
               .source(dataMessage._.internalObject.source)
               .type(dcl.message.Message.Type.DATA);

        policyDataItems.forEach(dataItem => {
            let dataItemKey = dataItem.getKey();
            let dataItemValue = dataItem.getValue();

            // For Set items, we need to get each value.
            if (dataItemValue instanceof Set) {
                dataItemValue.forEach(value => {
                    message.dataItem(dataItemKey, value);
                });
            } else {
                message.dataItem(dataItemKey, dataItemValue);
            }
        });

        skippedDataItems.forEach(dataItem => {
            let dataItemKey = dataItem.getKey();
            let dataItemValue = dataItem.getValue();

            // For Set items, we need to get each value.
            if (dataItemValue instanceof Set) {
                dataItemValue.forEach(value => {
                    message.dataItem(dataItemKey, value);
                });
            } else {
                message.dataItem(dataItemKey, dataItemValue);
            }
        });

        return message;
    }

    /**
     *
     * @param {DeviceAnalog} deviceAnalog
     * @param {DataItem} dataItem
     * @param {Set<DevicePolicyFunction>} pipeline
     * @param {number} currentTimeMillis
     * @return {DataItem}
     */
    applyAttributePolicy(deviceAnalog, attributeName, attributeValue, pipeline, currentTimeMillis) {
        debug('applyAttributePolicy called, attributeName = ' + attributeName + ', attributeValue = ' + attributeValue);
        let deviceModel = deviceAnalog.getDeviceModel();
        // Get or create the pipeline data for this attribute.
        // @type {Set<Map<String, Object>>}
        let pipelineData = this.pipelineDataCache.get(attributeName);

        if (!pipelineData) {
            // @type {List<Map<String, Object>>}
            pipelineData = new Set();
            this.pipelineDataCache.set(attributeName, pipelineData);
        }

        DeviceFunction.putInProcessValue(deviceAnalog.getEndpointId(), deviceModel.getUrn(),
            attributeName, attributeValue);

        // Convert the pipeline and pipeline data Sets to arrays so we can index from them.
        let pipelineDataAry = Array.from(pipelineData);
        let pipelineAry = Array.from(pipeline);

        // Process each pipeline "function".
        for (let index = 0; index < pipelineAry.length; index++) {
            // @type {DevicePolicyFunction}
            let pipelineFunction = pipelineAry[index];
            // @type {Map<String, Object>}
             let functionData;

            if (index < pipelineDataAry.length) {
                functionData = pipelineDataAry[index];
            } else {
                functionData = new Map();
                pipelineData.add(functionData);
                pipelineDataAry.push(functionData);
            }

            // @type {string}
            let functionId = pipelineFunction.getId();
            // @type {Map<String, ?>}
            let parameters = pipelineFunction.getParameters();
            // @type {DeviceFunction}
            let deviceFunction = DeviceFunction.getDeviceFunction(functionId);

            if (!deviceFunction) {
                continue;
            }

            // @type {boolean}
            let windowExpired;
            // @type {number}
            let window = DeviceFunction.getWindow(parameters);
            debug('MessagingPolicyImpl.applyAttributePolicy window = ' + window);

            if (window > 0) {
                // This could be more succinct, but it makes the key easy to read in the debugger.
                // @type {string}
                let k = deviceModel.getUrn() + ':' + attributeName + ':' + deviceFunction.getId();
                // @type {number}
                let t0 = MessagingPolicyImpl.windowMap.get(k);

                if (!t0) {
                    t0 = currentTimeMillis;
                    MessagingPolicyImpl.windowMap.set(k, t0);
                }

                windowExpired = (t0 + window) <= currentTimeMillis;

                if (windowExpired) {
                    MessagingPolicyImpl.windowMap.set(k, currentTimeMillis);
                }
            } else {
                windowExpired = false;
            }

            debug('applyAttributePolicy applying device function: ' + deviceFunction);

            if (deviceFunction.apply(deviceAnalog, attributeName, parameters, functionData,
                    attributeValue) || windowExpired)
            {
                debug('applyAttributePolicy windowExpired');
                const valueFromPolicy = deviceFunction.get(deviceAnalog, attributeName, parameters,
                    functionData);

                debug('applyAttributePolicy valueFromPolicy = ' + util.inspect(valueFromPolicy));

                if (valueFromPolicy) {
                    debug('applyAttributePolicy in valueFromPolicy.');
                    attributeValue = valueFromPolicy;

                    debug('applyAttributePolicy in valueFromPolicy attributeValue = ' +
                        attributeValue);

                    DeviceFunction.putInProcessValue(deviceAnalog.getEndpointId(),
                        deviceModel.getUrn(), attributeName, attributeValue);
                } else {
                    console.log(attributeName + " got null value from policy" +
                        deviceFunction.getDetails(parameters));

                    break;
                }
            } else {
                // apply returned false.
                attributeValue = null;
                break;
            }
        }

        // After the policy loop, if the attributeValue is null, then the policy
        // either filtered out the attribute, or the policy parameters have not
        // been met (e.g., sampleQuality rate is not met). If it is not null,
        // then create a new DataItem to replace the old in the data message.
        // @type {DataItem}
        let policyDataItem;
        debug('applyAttributePolicy attributeValue = ' + attributeValue);
        if (attributeValue) {
            deviceAnalog.setAttributeValue(attributeName, attributeValue);
            policyDataItem = new DataItem(attributeName, attributeValue);
        } else {
            policyDataItem = null;
        }

        DeviceFunction.removeInProcessValue(deviceAnalog.getEndpointId(), deviceModel.getUrn(),
            attributeName);

        debug('applyAttributePolicy attributeName = ' + attributeName);
        debug('applyAttributePolicy attributeValue = ' + attributeValue);
        debug('applyAttributePolicy returning policyDataItem = ' + policyDataItem);
        return policyDataItem;
    }

    /**
     * Apply policies that are targeted to a device model
     *
     * @param {dcl.message.Message} message
     * @param {number} currentTimeMillis (long)
     * @return {Promise} resolves to dcl.message.Message[]
     */
    applyDevicePolicies(message, currentTimeMillis) {
        return new Promise((resolve, reject) => {
            // A data message or alert format cannot be null or empty
            // (enforced in Data/AlertMessage(Builder) constructor)
            // @type {string}
            let format;
            // @type {string}
            let deviceModelUrn;
            // @type {string}
            const endpointId = message._.internalObject.source;

            if (message._.internalObject.type === dcl.message.Message.Type.DATA) {
                format = message._.internalObject.payload.format;
                deviceModelUrn = format.substring(0, format.length - ":attributes".length);
            } else if (message._.internalObject.type === dcl.message.Message.Type.ALERT) {
                format = message._.internalObject.payload.format;
                deviceModelUrn = format.substring(0, format.lastIndexOf(':'));
            } else {
                resolve([message]);
                return;
            }

            // @type {DeviceAnalog}
            let deviceAnalog = this.deviceAnalogMap.get(endpointId);

            if (!deviceAnalog) {
                this.directlyConnectedDevice.getDeviceModel(deviceModelUrn, deviceModelJson => {
                    if (deviceModelJson) {
                        let deviceModel = DeviceModelParser.fromJson(deviceModelJson);

                        if (deviceModel instanceof DeviceModel) {
                            deviceAnalog = new DeviceAnalog(this.directlyConnectedDevice, deviceModel,
                                endpointId);

                            this.deviceAnalogMap.set(endpointId, deviceAnalog);
                        }

                        // TODO: what to do if deviceAnalog is null?
                        if (!deviceAnalog) {
                            resolve([message]);
                        } else {
                            this.applyDevicePolicies2(message, deviceModelUrn, endpointId,
                                currentTimeMillis, deviceAnalog).then(messages =>
                            {
                                resolve(messages);
                            }).catch(error => {
                                console.log('Error applying device policies: ' + error);
                                reject();
                            });
                        }
                    } else {
                        // TODO: what to do if deviceModel is null?
                        resolve([message]);
                    }
                });
            } else {
                this.applyDevicePolicies2(message, deviceModelUrn, endpointId, currentTimeMillis,
                    deviceAnalog).then(messages =>
                {
                    resolve(messages);
                }).catch(error => {
                    console.log('Error applying device policies: ' + error);
                    reject();
                });
            }
        });
    }

    /**
     * @param {dcl.message.Message} message
     * @param {string} deviceModelUrn
     * @param {string} endpointId
     * @param {number} currentTimeMillis
     * @param {DeviceAnalog} deviceAnalog
     * @return {Promise} (of dcl.message.Message[])
     */
    applyDevicePolicies2(message, deviceModelUrn, endpointId, currentTimeMillis, deviceAnalog) {
        return new Promise((resolve, reject) => {
            // @type {DevicePolicyManager}
            const devicePolicyManager =
                DevicePolicyManager.getDevicePolicyManager(this.directlyConnectedDevice.getEndpointId());

            devicePolicyManager.getPolicy(deviceModelUrn, endpointId).then(devicePolicy => {

                if (!devicePolicy) {
                    resolve([message]);
                    return;
                }

                // @type {Set<DevicePolicy.Function>}
                const pipeline = devicePolicy.getPipeline(DevicePolicy.ALL_ATTRIBUTES);

                // No policies for this device model, retain the data item.
                if (!pipeline || (pipeline.size === 0)) {
                    resolve([message]);
                    return;
                }

                // Create the pipeline data for this device model
                // @type {Set<Map<String, Object>>}
                let pipelineData = this.pipelineDataCache.get(null);

                if (!pipelineData) {
                    pipelineData = new Set();
                    this.pipelineDataCache.set(null, pipelineData);
                }

                // @type {DevicePolicyFunction[]}
                let pipelineAry = Array.from(pipeline);
                let pipelineDataAry = Array.from(pipelineData);

                // Handle pipeline for device policy
                for (let index = 0, maxIndex = pipeline.size; index < maxIndex; index++) {
                    // @type {DevicePolicyFunction}
                    const devicePolicyFunction = pipelineAry[index];
                    // @type {Map<String, Object>}
                    let functionData;

                    if (index < pipelineData.size) {
                        functionData = pipelineDataAry[index];
                    } else {
                        functionData = new Map();
                        pipelineData.add(functionData);
                    }

                    // @type {string}
                    const key = devicePolicyFunction.getId();
                    // @type {Map<string, object>}
                    const parameters = devicePolicyFunction.getParameters();
                    // @type {DeviceFunction}
                    const deviceFunction = DeviceFunction.getDeviceFunction(key);

                    if (!deviceFunction) {
                        continue;
                    }

                    // @type {boolean}
                    let windowExpired;
                    // @type {number}
                    const window = DeviceFunction.getWindow(parameters);
                    debug('MessagingPolicyImpl.applyDevicePolicies2 window = ' + window);

                    if (window > 0) {
                        // @type {string}
                        const k = deviceModelUrn.concat("::".concat(deviceFunction.getId()));
                        // @type {number}
                        let t0 = MessagingPolicyImpl.windowMap.get(k);

                        if (!t0) {
                            t0 = currentTimeMillis;
                            MessagingPolicyImpl.windowMap.set(k, t0);
                        }

                        windowExpired = (t0 + window) <= currentTimeMillis;

                        if (windowExpired) {
                            MessagingPolicyImpl.windowMap.set(k, currentTimeMillis);
                        }
                    } else {
                        windowExpired = false;
                    }

                    // @type {boolean}
                    let alertOverridesPolicy;

                    if (message instanceof lib.message.Message &&
                        message._.internalObject.type === lib.message.Message.Type.ALERT)
                    {
                        // @type {AlertMessage}
                        const alertMessage = message;
                        // @type {AlertMessage.Severity}
                        const alertMessageSeverity = alertMessage.payload.severity;
                        // @type {AlertMessage.Severity}
                        let configuredSeverity = lib.message.Message.AlertMessage.Severity.CRITICAL;
                        // @type {string}
                        const criterion = parameters.get("alertSeverity");

                        if (criterion) {
                            try {
                                configuredSeverity = criterion;
                            } catch (e) {
                                configuredSeverity =
                                    lib.message.Message.AlertMessage.Severity.CRITICAL;
                            }
                        }

                        // TODO: Fix this compareTo
                        alertOverridesPolicy = configuredSeverity.compareTo(alertMessageSeverity) <= 0;
                    } else {
                        alertOverridesPolicy = false;
                    }

                    if (deviceFunction.apply(deviceAnalog, null, parameters, functionData, message)
                        || windowExpired || alertOverridesPolicy) {
                        // @type {object}
                        const valueFromPolicy = deviceFunction.get(
                            deviceAnalog,
                            null,
                            parameters,
                            functionData
                        );

                        if (valueFromPolicy) {
                            // @type {Message[]}
                            resolve(Array.from(valueFromPolicy));
                            return;
                        }
                    }

                    resolve([]);
                    return;
                }

                resolve([]);
            }).catch(error => {
                console.log('Error getting device policy. error=' + error);
                reject();
            });
        });
    }

    /**
     * This is the method that applies whatever policies there may be to the message. The
     * method returns zero or more messages, depending on the policies that have been
     * applied to the message. The caller is responsible for sending or queuing the
     * returned messages. The data items in the returned are messages are possibly modified
     * by some policy; for example, a message with a temperature value goes in, a copy of
     * the same message is returned with the temperature value replaced by the
     * average temperature. A returned message may also be one that is created by a
     * policy function (such as a computedMetric). Or the returned messages may be messages
     * that have been batched. If no policy applies to the message, the message itself
     * is returned.
     *
     * @param {lib.device.util.DirectlyConnectedDevice} dcd
     * @param {iotcs.message.Message} message a message of any kind.
     * @return {Promise} a Promise which will resolve with a {Message[]} of {@link Message}s to be
     *         delivered.
     */
    applyPolicies(message) {
        return new Promise((resolve, reject) => {
            if (!message) {
                resolve(new dcl.message.Message([]));
                return;
            }

            let currentTimeMillis = new Date().getTime();

            if (message._.internalObject.type === dcl.message.Message.Type.DATA) {
                this.applyAttributePolicies(message, currentTimeMillis).then(dataMessage => {
                    // Changes from here to the resolve method must also be made in the else
                    // statement below.
                    // @type {Set<Message>}
                    const messageList = new Set();

                    if (this.messagesFromExpiredPolicies.size > 0) {
                        this.messagesFromExpiredPolicies.forEach(v => messageList.add(v));
                        this.messagesFromExpiredPolicies.clear();
                    }

                    if (dataMessage) {
                        this.applyDevicePolicies(dataMessage, currentTimeMillis).then(messagesFromDevicePolicy => {
                            messagesFromDevicePolicy.forEach(v => messageList.add(v));
                            resolve(Array.from(messageList));
                        }).catch(error => {
                            console.log('Error applying device policies: ' + error);
                            reject();
                        });
                    }
                }).catch(error => {
                    console.log('Error applying attribute policies: ' + error);
                    reject();
                });
            } else {
                // Changes from here to the resolve method must also be made in the if
                // statement above.
                // @type {Set<Message>}
                const messageList = new Set();

                if (this.messagesFromExpiredPolicies.size > 0) {
                    this.messagesFromExpiredPolicies.forEach(v => messageList.add(v));
                    this.messagesFromExpiredPolicies.clear();
                }

                // @type {Message[]}
                this.applyDevicePolicies(message, currentTimeMillis).then(messagesFromDevicePolicy => {
                    resolve(messageList);
                }).catch(error => {
                    console.log('Error applying device policies: ' + error);
                    reject();
                });
            }
        }).catch(error => {
            console.log('Error applying policies: ' + error);
        });
    }

    //      * @return {Promise} which resolves to void.
    /**
     * @param {Set<DataItem<?>>} dataItems
     * @param {DeviceAnalog} deviceAnalog
     * @param {Map<String, Set<String>>} triggerMap
     * @param {number} currentTimeMillis
     */
    checkComputedMetrics(dataItems, deviceAnalog, triggerMap, currentTimeMillis) {
        debug('checkComputeMetrics called.');
        // TODO: This function should return a Promise and call devicePolicyManager.getPolicy.
        // return new Promise((resolve, reject) => {
            if (triggerMap.size === 0 || dataItems.size === 0) {
                // resolve();
                return;
            }

            // @type {Set<String>}
            let updatedAttributes = new Set();

            dataItems.forEach((value, key) => {
                updatedAttributes.add(key);
            });

            let endpointId = deviceAnalog.getEndpointId();
            let deviceModel = deviceAnalog.getDeviceModel();
            // @type {Map<String, DeviceModelAttribute>}
            let deviceModelAttributes = deviceModel.getDeviceModelAttributes();
            let deviceModelUrn = deviceModel.getUrn();

            // @type {<String, Set<String>>}  Map from  attributeName -> triggerAttributes.
            // triggerAttributes is the set of attributes that the formula refers to.
            triggerMap.forEach((triggerAttributes, attributeName) => {
                let updatedAttributesAry = Array.from(updatedAttributes);
                let triggerAttributesAry = Array.from(triggerAttributes);
                // If the set of attributes that the formula refers to is a subset of the updated attributes, then compute
                // the value of the computedMetric.
                //if (updatedAttributes.containsAll(attributeName)) {
                if (updatedAttributesAry.some(r => r.size === triggerAttributesAry.length &&
                        r.every((value, index) => triggerAttributesAry[index] === value)))
                {
                    let deviceModelAttribute = deviceModelAttributes.get(attributeName);
                    let attributeValue = deviceAnalog.getAttributeValue(attributeName);

                    if (!attributeValue) {
                        attributeValue = deviceModelAttribute.defaultValue;
                    }

                    // @type {DataItem}
                    let dataItem;

                    switch (deviceModelAttribute.type) {
                        // TODO: We don't need all of these types in JavaScript.
                        case 'BOOLEAN':
                        case 'NUMBER':
                        case 'STRING':
                        case 'URI': {
                            let dataItem = new DataItem(attribute, value);
                            break;
                        }
                        case 'DATETIME': {
                            let value;

                            if (typeof attributeValue === 'date') {
                                value = attributeValue.getTime();
                            } else {
                                value = attributeValue ? attributeValue : 0;
                            }

                            dataItem = new DataItem(attribute, value);
                            break;
                        }
                        default:
                            console.log('Unknown device model attribute type: ' +
                                deviceModelAttribute.type);

                            return // continue
                    }

                    let devicePolicyManager =
                        DevicePolicyManager.getDevicePolicyManager(this.directlyConnectedDevice.getEndpointId());

                    // This asynchronous call should be used instead of
                    // devicePolicyManager.getPolicy2 below.
                    //
                    // devicePolicyManager.getPolicy(deviceModelUrn, endpointId).then(devicePolicy => {
                    //     if (!devicePolicy) {
                    //         return // continue
                    //     }
                    //
                    //     // @type {Set<DevicePolicy.Function>}
                    //     let pipeline = devicePolicy.getPipeline(attribute);
                    //
                    //     if (!pipeline || pipeline.size === 0) {
                    //         return // continue
                    //     }
                    //
                    //     // @type {DataItem}
                    //     let policyDataItem = this.applyAttributePolicy(deviceAnalog, dataItem,
                    //         pipeline, currentTimeMillis);
                    //
                    //     if (policyDataItem) {
                    //         dataItems.add(policyDataItem);
                    //     }
                    //
                    //     resolve();
                    // }).catch(error => {
                    //     console.log('Error getting device policy: ' + error);
                    //     reject();
                    // });

                    let devicePolicy = devicePolicyManager.getPolicy(deviceModelUrn, endpointId);

                    if (!devicePolicy) {
                        return // continue
                    }

                    // @type {Set<DevicePolicy.Function>}
                    let pipeline = devicePolicy.getPipeline(attribute);

                    if (!pipeline || pipeline.size === 0) {
                        return // continue
                    }

                    // @type {DataItem}
                    let policyDataItem = this.applyAttributePolicy(deviceAnalog, dataItem,
                        pipeline, currentTimeMillis);

                    debug('checkComputedMetrics policyDataItem = ' + policyDataItem);

                    if (policyDataItem) {
                        dataItems.add(policyDataItem);
                    }

                    // resolve();
                }
            });
        // });
    }

    /**
     * @param {DevicePolicy} devicePolicy
     * @return {Set<Message>}
     */
    expirePolicy1(devicePolicy) {
        // @type {Set<Message>}
        const messageList = new Set();

        this.deviceAnalogMap.forEach(deviceAnalog => {
            // @type {Set<Message>}
            const messages = this.expirePolicy3(devicePolicy, deviceAnalog);

            if (messages && (messages.size > 0)) {
                messages.forEach(message => {
                    messageList.add(message);
               });
            }
        });

        return messageList;
    }

    /**
     * @param {DevicePolicy} devicePolicy
     * @param {number} currentTimeMillis
     * @return {Set<Message>}
     */
    expirePolicy2(devicePolicy, currentTimeMillis) {
        // @type {Set<Message>}
        const messageList = this.expirePolicy1(devicePolicy);
        // @type {Set<Message>}
        const consolidatedMessageList = new Set();

        if (messageList.size > 0) {
            // Consolidate messages.
            // @type {Map<string, Set<DataItem>>}
            const dataItemMap = new Map();

            messageList.forEach(message => {
                if (message.type === lib.message.Message.Type.DATA) {
                    // @type {string}
                    const endpointId = message.getSource();
                    // @type {Set<DataItem>}
                    let dataItems = dataItemMap.get(endpointId);

                    if (!dataItems) {
                        dataItems = new Set();
                        dataItemMap.set(endpointId, dataItems);
                    }

                    message.getDataItems.forEach(dataItem => {
                        dataItems.add(dataItem);
                    });
                } else {
                    consolidatedMessageList.add(message);
                }
            });

            dataItemMap.forEach((value, key) => {
                // @type {DeviceAnalog}
                const deviceAnalog = this.deviceAnalogMap.get(key);

                if (!deviceAnalog) {
                    return; // continue
                }

                // @type {Set<DataItem>}
                const dataItems = entry.getValue();
                // @type {string}
                const format = deviceAnalog.getDeviceModel().getUrn();

                if (this.computedMetricTriggers.size > 0) {
                    // @type {Map<string, Set<string>>}
                    let triggerMap = this.computedMetricTriggers.get(format);

                    if (triggerMap && triggerMap.size > 0) {
                        try {
                            this.checkComputedMetrics(dataItems, deviceAnalog, triggerMap,
                                currentTimeMillis);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }

                let message = new iotcs.message.Message();

                message
                    .type(iotcs.message.Message.Type.DATA)
                    .source(deviceAnalog.getEndpointId())
                    .format(deviceAnalog.getDeviceModel().getUrn());

                    dataItems.forEach(dataItem => {
                        message.dataItem(dataItem.getKey(), dataItem.getValue());
                    });

                consolidatedMessageList.add(dataMessage);
            });
        }

        return consolidatedMessageList;
    }


    /**
     * @param {DevicePolicy} devicePolicy
     * @param {DeviceAnalog} deviceAnalog
     * @return {Set<Message>}
     */
    expirePolicy3(devicePolicy, deviceAnalog) {
        // @type {Set<Map<string, Set<DevicePolicyFunction>>>}
        const entries = devicePolicy.getPipelines();
        // @type {Set<Message>}
        const messageList = new Set();

        entries.forEach((v, k) => {
            // @type {Set<Message>}
            const messages = this.expirePolicy4(k, v, deviceAnalog);

            if (messages) {
                messages.forEach(message => {
                    messageList.add(message);
                });
            }
        });

        return messageList;
    }

    /**
     * @param {string} attributeName
     * @param {Set<DevicePolicyFunction>} pipeline
     * @param {DeviceAnalog} deviceAnalog
     * @return {Set<Message>}
     */
    expirePolicy4(attributeName, pipeline, deviceAnalog) {
        if (!pipeline || pipeline.size === 0) {
            return null;
        }

        // attributeName may be null.
        // Note that we are _removing_ the pipeline data cache for this attribute (which may be
        // null).
        // @type {Set<Map<string, object>>}
        const pipelineData = this.pipelineDataCache.get(attributeName);
        this.pipelineDataCache.delete(attributeName);

        if (!pipelineData) {
            return null;
        }

        // @type {DevicePolicyFunction[]}
        let pipelineAry = Array.from(pipeline);
        // @type {Map<string, object>[]}
        let pipelineDataAry = Array.from(pipelineData);

        for (let index = 0, maxIndex = pipelineAry.length; index < maxIndex; index++) {
            // @type {DevicePipelineFunction}
            let devicePolicyFunction = pipelineAry[index];

            if (!devicePolicyFunction) {
                continue;
            }

            // @type {DeviceFunction}
            let deviceFunction = DeviceFunction.getDeviceFunction(devicePolicyFunction.getId());

            if (!deviceFunction) {
                return null;
            }

            // Looking for the first policy function in the pipeline that has a "window".
            // If there isn't one, we'll drop out of the loop and return null.
            // If there is one, we process the remaining pipeline from there.
            // @type {number}
            const window = DeviceFunction.getWindow(devicePolicyFunction.getParameters());

            if (window === -1) {
                continue;
            }

            // @type {Map<string, object>}
            let functionData = index < pipelineDataAry.length ? pipelineDataAry[index] : null;

            if (!functionData) {
                // There is no data for this function, so return.
                return null;
            }

            // @type {object}
            let valueFromPolicy = deviceFunction.get(deviceAnalog, attributeName,
                devicePolicyFunction.getParameters(), functionData);

            if (!valueFromPolicy) {
                return null;
            }

            for (let next = index + 1; next < maxIndex; next++) {
                devicePolicyFunction = pipelineAry[next];

                if (!deviceFunction) {
                    return null;
                }

                deviceFunction = DeviceFunction.getDeviceFunction(devicePolicyFunction.getId());

                if (!deviceFunction) {
                    return null;
                }

                functionData = next < pipelineDataAry.length ? pipelineDataAry[next] : null;

                if (deviceFunction.apply(deviceAnalog, attributeName,
                        devicePolicyFunction.getParameters(), functionData, valueFromPolicy))
                {
                    valueFromPolicy = deviceFunction.get(
                        deviceAnalog,
                        attributeName,
                        devicePolicyFunction.getParameters(),
                        functionData
                    );

                    if (!valueFromPolicy) {
                        return null;
                    }
                } else {
                    return null;
                }

            }

            // If we get here, valueFromPolicy is not null.
            if (valueFromPolicy instanceof Set) {
                return valueFromPolicy;
            }

            // @type {DeviceModel}
            const deviceModel = deviceAnalog.getDeviceModel();
            const message = new lib.message.Message();

            message
                .source(deviceAnalog.getEndpointId())
                .format(deviceModel.getUrn())
                .dataItem(attributeName, valueFromPolicy);

            // @type {Set<Message>}
            let messages = new Set();
            messages.add(message);

            return messages;
        }

        return null;
    }

    /**
     * Get the DeviceModel for the device model URN. This method may return {@code null} if there is no device model for
     * the URN. {@code null} may also be returned if the device model is a &quot;draft&quot; and the property
     * {@code com.oracle.iot.client.device.allow_draft_device_models} is set to {@code false}, which is the default.
     *
     * @param {string} deviceModelUrn the URN of the device model.
     * @return {DeviceModel} a representation of the device model or {@code null} if it does not exist.
     */
    getDeviceModel(deviceModelUrn) {
        /**
         * The high level DirectlyConnectedDevice class has no trusted
         * assets manager and this class gives no access to the one it has,
         * so this method is here.
         * TODO: Find a high level class for this method
         */
        return DeviceModelFactory.getDeviceModel(secureConnection, deviceModel);
    }


    /**
     * @param {DevicePolicy} devicePolicy
     * @param {Set<string>} assignedDevices
     */
    policyAssigned(devicePolicy, assignedDevices) {
        // Do nothing.
    }

    /**
     * @param {DevicePolicy} devicePolicy
     * @param {Set<string>} unassignedDevices
     */
    policyUnassigned(devicePolicy, unassignedDevices) {
        // @type {number}
        const currentTimeMillis = new Date().getTime();
        // @type {Set<Message>}
        const messages = this.expirePolicy2(devicePolicy, currentTimeMillis);

        if (messages && messages.size > 0) {
            messages.forEach(message => {
                this.messagesFromExpiredPolicies.add(message);
            });
        }

        unassignedDevices.forEach(unassignedDevice => {
            let devicePolicyManager = DevicePolicyManager.getDevicePolicyManager(unassignedDevice);

            if (devicePolicyManager) {
                devicePolicyManager.removePolicy(devicePolicy.deviceModelUrn, devicePolicy.getId(),
                    unassignedDevice);
            }
        });

        // TODO:  Need to figure out how to handle accumulated values.
        //        For now, just clear out the various maps, which
        //        effectively means "start from scratch"
        this.deviceAnalogMap.clear();
        this.pipelineDataCache.clear();
        this.computedMetricTriggers.clear();
        MessagingPolicyImpl.windowMap.clear();
    }
}

/**
 * deviceModelUrn:attribute:deviceFunctionId -> start time of last window For a window policy, this maps the
 * policy target plus the function to when the window started. When the attribute for a timed function is in
 * the message, we can compare this start time to the elapsed time to determine if the window has expired. If
 * the window has expired, the value computed by the function is passed to the remaining functions in the
 * pipeline.
 *
 * @type {Map<string, number>}
 */
MessagingPolicyImpl.windowMap = new Map();


//////////////////////////////////////////////////////////////////////////////
// file: library/device/Bucket.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * Slide is how much the window moves after the window expires. If there is a window of 5 seconds
 * with a slide of 2 seconds, then at the end of 5 seconds, the window slides over by two seconds.
 * That means that the next window's worth of data would include 3 seconds of data from the previous
 * window, and 2 seconds of new data.
 *
 * To handle this, we divide up the window into buckets. Each bucket represents a period of time,
 * such that the time period is the greatest common factor between the window and the slide. For
 * example, if the window is 60 seconds and the slide is 90 seconds, a bucket would span 30 seconds,
 * and there would be three buckets.
 *
 * When the window expires and the get method is called, the return value of the mean policy
 * function will include the value and number of terms of bucket[0] through bucket[n]. Then the
 * buckets that don't contribute to the next window are emptied (so to speak) and the cycle
 * continues.
 *
 * Best case is that the slide equal to the window. In this case, there is only ever one bucket. The
 * worst case is when greatest common factor between slide and window is small. In this case, you
 * end up with a lot of buckets, potentially one bucket per slide time unit (e.g., 90 seconds, 90
 * buckets). But this is no worse (memory wise) than keeping an array of values and timestamps.
 */
class Bucket {
    // Instance "variables"/properties...see constructor.

    constructor(initialValue) {
        // Instance "variables"/properties.
        this.value = initialValue;
        this.terms = 0;
        // Instance "variables"/properties.
    }

    /**
     * @return {string} this Bucket represented as a string.
     */
    toString() {
        return '{"value" : ' + value + ', "terms" : ' + terms + '}';
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceModelAction.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * DeviceModelAction
 */
class DeviceModelAction {
    /**
     *
     * @param {string} name
     * @param {string} description
     * @param {DeviceModelAttribute.Type} type
     * @param {number} lowerBound
     * @param {number} upperBound
     * @param {string} alias
     */
    constructor(name, description, type, lowerBound, upperBound, alias) {
        // @type {string}
        this.alias = alias;
        // @type {DeviceModelAttributeType}
        this.argType = type;
        // @type {string}
        this.description = description;
        // @type {string}
        this.name = name;

        // @type {number}
        this.lowerBound = null;
        // @type {number}
        this.upperBound = null;

        if (this.argType === DeviceModelAttribute.Type.INTEGER ||
            this.argType === DeviceModelAttribute.Type.NUMBER)
        {
            this.lowerBound = lowerBound;
            this.upperBound = upperBound;
        }

        this.alias = alias;
    }


    /**
     *
     * @return {string}
     */
    getAlias() {
        return this.alias;
    }

    /**
     * @return {string} ({DeviceModelAttribute.Type})
     */
    getArgType() {
        return this.argType;
    }

    /**
     * @return {string}
     */
    getDescription() {
        return this.description;
    }

    /**
     * @return {number}
     */
    getLowerBound() {
        return this.lowerBound;
    }

    /**
     * @return {string} name
     */
    getName() {
        return this.name;
    }

    /**
     * @return {number}
     */
    getUpperBound() {
        return this.upperBound;
    }

    /**
     *
     * @return {string}
     */
    toString() {
        return 'name = ' + this.name +
            ', description = ' + this.description +
            ', type = ' + this.argType +
            ', lowerBound = ' + this.lowerBound +
            ', upperBound = ' + this.upperBound +
            ', alias = ' + this.alias;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/DeviceModelAttribute.js

/**
 * Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * DeviceModelAttribute is the model of an attribute in a {@link DeviceModel}.
 */
class DeviceModelAttribute {
    // Instance "variables"/properties...see constructor.
    /**
     *
     * @param {string} urn
     * @param {string} name
     * @param {string} description
     * @param {Type} type
     * @param {number} lowerBound
     * @param {number} upperBound
     * @param {Access} access
     * @param {string} alias
     * @param {object} defaultValue
     * @constructor
     */
    constructor(urn, name, description, type, lowerBound, upperBound, access, alias, defaultValue) {
        // Instance "variables"/properties.
        /**
         *
         *
         * @type {Access}
         */
        this.access = access;
        /**
         * The attribute's name.
         *
         * @type {string}
         * @deprecated
         */
        this.alias = alias;
        /**
         * The attribute's default value.
         *
         * @type {object}
         */
        this.defaultValue = defaultValue;
        /**
         * The attribute's description.
         *
         * @type {string}
         */
        this.description = description;
        /**
         * The name of the attribute
         *
         * @type {string}
         */
        this.name = name;
        /**
         * The attribute's lower bound.
         *
         * @type {number}
         */
        this.lowerBound = lowerBound;
        /**
         * The attribute type.
         *
         * @type {Type}
         */
        this.type = type;
        /**
         * The URN of the attribute.
         *
         * @type {string}
         */
        this.urn = urn;
        /**
         * The attribute's upper bound.
         *
         * @type {number}
         */
        this.upperBound = upperBound;
    }

    /**
     * Return the access rules for the attribute. The default is READ-ONLY
     *
     * @return {Access} the access rule for the attribute
     */
    getAccess() {
        return this.access;
    }

    /**
     * Get the attribute name.
     *
     * @return {string} an alternative name for the attribute.
     * @deprecated Use {@link #getName()}
     */
    getAlias() {
        return this.alias;
    }

    /**
     * Get the default value of the attribute as defined by the device model. If there is no
     * {@code defaultValue} for the attribute in the device model, then this method will return
     * {@code null}. The value {@code null} is <em>not</em> a default value.
     *
     * @return {object} the default value of the attribute, or {@code null} if no default is
     *         defined.
     */
    getDefaultValue() {
        return this.defaultValue;
    }

    /**
     * A human friendly description of the attribute. If the model does not
     * contain a description, this method will return an empty String.
     *
     * @return {string} the attribute description, or an empty string.
     */
    getDescription() {
        return this.description;
    }

    /**
     * Get the URN of the device type model this attribute comes from.
     *
     * @return {string} the URN of the device type model.
     */
    getModel() {
        return this.urn;
    }

    /**
     * Get the attribute name.
     *
     * @return {string} the attribute name from the device model.
     */
    getName() {
        return this.name;
    }

    /**
     * The data type of the attribute. If the access type of the attribute is
     * executable, this method will return null.
     *
     * @return {Type} the attribute's data type, or null.
     */
    getType() {
        return this.type;
    }

    /**
     * For {@link Type#NUMBER} only, give the lower bound of the
     * acceptable range of values. Null is always returned for attributes
     * other than {@code NUMBER} type.
     *
     * @return {number} a Number, or null if no lower bound has been set.
     */
    getLowerBound() {
        return this.lowerBound;
    }

    /**
     * For {@link Type#NUMBER} only, give the upper bound of the
     * acceptable range of values. Null is always returned for attributes
     * other than {@code NUMBER} type.
     *
     * @return {number} a Number, or null if no upper bound has been set
     */
    getUpperBound() {
        return this.upperBound;
    }
}

DeviceModelAttribute.Access = {
    EXECUTABLE: 'EXECUTABLE',
    READ_ONLY: 'READ_ONLY',
    READ_WRITE: 'READ_WRITE',
    WRITE_ONLY: 'WRITE_ONLY'
};

DeviceModelAttribute.Type = {
    BOOLEAN: 'BOOLEAN',
    DATETIME: 'DATETIME',
    INTEGER: 'INTEGER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    URI: 'URI'
};

//////////////////////////////////////////////////////////////////////////////
// file: library/device/NetworkCost.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/**
 * DeviceFunction is an abstraction of a policy device function.
 */
class NetworkCost {
    /**
     * Get the cost of the NetworkCost given by the string value. The "property" parameter is just
     * used for logging. The defaultValue is the value returned if the value is null or not a valid
     * NetworkCost.
     *
     * @param {string} value
     * @param {string} property
     * @param {string} defaultValue @type {NetworkCost.Type}
     * @return {number}
     */
    static getCost(value, property, defaultValue) {
        // @type {NetworkCost}
        let networkCost = null;

        if (value) {
            try {
                // @type {string}
                let upperValue = value.toUpperCase();
                upperValue = upperValue.replace('\\(.*', '');
                networkCost = upperValue.valueOf();
            } catch (error) {
                console.log('Invalid "' + property + '", value: "' + value + '"');
            }
        }

        if (!networkCost) {
            // Not given or illegal value.
            networkCost = defaultValue;
            console.log('Defaulting "' + property + '" to: "' + networkCost + '"');
        }

        return NetworkCost.ordinal(networkCost);
    }

    /**
     * Returns the ordinal value of the given type in the list of NetworkCost.Type's.
     *
     * @param {string} type the NetworkCost.Type.
     * @return {number} the ordinal value of the type in the NetworkCost.Type list.
     */
    static ordinal(type) {
        switch(type) {
            case NetworkCost.Type.ETHERNET:
                return 1;
            case NetworkCost.Type.CELLULAR:
                return 2;
            case NetworkCost.Type.SATELLITE:
                return 3;
            default:
                throw new Error(type + ' is not one of NetworkCost.Type.');
        }
    }
}

/**
 * The order of these is in increasing network cost.  For example, the cost of data over ethernet is
 * much lower then the cost of data over satellite.
 *
 * Note: The order of these is important - DO NOT CHANGE THE ORDER.  If you do changed the order,
 * also updte the getTypeOrdinal function.
 *
 * @type {{ETHERNET: string, CELLULAR: string, SATELLITE: string}}
 */
NetworkCost.Type = {
    ETHERNET: 'ETHERNET',
    CELLULAR: 'CELLULAR',
    SATELLITE: 'SATELLITE'
};

//////////////////////////////////////////////////////////////////////////////
// file: library/device/Pair.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * A convenience class to represent name-value pairs.
 */
class Pair{
    // Instance "variables"/properties...see constructor.

    /**
     * Creates a new pair
     *
     * @param {object} key The key for this pair.
     * @param {object} value The value to use for this pair.
     */
    constructor(key, value) {
        // Instance "variables"/properties.
        /**
         * Name of this Pair.
         */
        this.key = key;
        /**
         * Value of this this Pair.
         */
        this.value = value;
        // Instance "variables"/properties.
    }

    /**
     * Gets the key for this pair.
     *
     * @return {object} key for this pair
     */
    getKey() {
        return this.key;
    }

    /**
     * Gets the value for this pair.
     *
     * @return {object} value for this pair
     */
    getValue() {
        return this.value;
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/ScheduledPolicyData.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

class ScheduledPolicyData {
    // Instance "variables"/properties...see constructor.

    /**
     *
     * @param {number} window
     * @param {number} slide
     * @param {number} timeZero
     */
    constructor(window, slide, timeZero) {
        // Instance "variables"/properties.
        // Initial expiry is window milliseconds past time zero.
        // Tenth of a millisecond resolution helps group
        // intersecting slide values (10 second and 20 second,
        // for example).
        this.expiry = ((window + timeZero) / 10) * 10;
        this.slide = slide;
        this.window = window;
        // { attributeName : pipelineIndex }
        // @type {Map<string, number>}
        this.pipelineIndices = new Map();
        // Instance "variables"/properties.
    }

    /**
     *
     * @param {string} attributeName
     * @param {number} pipelineIndex
     */
    addAttribute(attributeName, pipelineIndex) {
        this.pipelineIndices.set(attributeName, pipelineIndex);
    }

    /**
     *
     * @param {object} o
     * @return {boolean}
     */
    equals(o) {
        if (this === o) {return true;}
        if (!o) {return false;}
        return (this.window === o.window) && (this.slide === o.slide);
    }


    /**
     * @return {number}
     */
    hashCode() {
        return ((this.window ^ (this.window >>> 32)) + (this.slide ^ (this.slide >>> 32)));
    }

/**
     *
     * @param {number} now
     * @return {number}
     */
    getDelay(now) {
        // @type {number}
        const delay = this.expiry - now;
        return (delay > 0) ? delay : 0;
    }

    /**
     * @param {VirtualDevice} virtualDevice
     * @param {Set<Pair<VirtualDeviceAttribute<VirtualDevice, object>, object>>} updatedAttributes
     */
    handleExpiredFunction1(virtualDevice, updatedAttributes) {
        return new Promise((resolve, reject) => {
            debug('ScheduledPolicyData.handleExpiredFunction1 called.');
            // @type {DevicePolicy}
            virtualDevice.devicePolicyManager.getPolicy(virtualDevice.deviceModel.urn,
                virtualDevice.endpointId).then(devicePolicy =>
            {
                debug('ScheduledPolicyData.handleExpiredFunction1 devicePolicy = ' + devicePolicy);

                if (!devicePolicy) {
                    // TODO: better log message here
                    console.log('Could not find ' + virtualDevice.deviceModel.urn +
                        ' in policy configuration.');

                    return;
                }

                // @type {Map<string, number}
                const pipelineIndicesCopy = new Map(this.pipelineIndices);

                this.handleExpiredFunction2(virtualDevice, updatedAttributes, devicePolicy,
                    pipelineIndicesCopy).then(() => {
                        debug('ScheduledPolicyData.handleExpiredFunction1 updatedAttributes = ' +
                            util.inspect(updatedAttributes));
                        resolve();
                    });
            });
        });
    }


    /**
     *
     * @param {VirtualDevice} virtualDevice
     * @param {Set<Pair<VirtualDeviceAttribute<VirtualDevice, Object>, Object>>} updatedAttributes
     * @param {DevicePolicy} devicePolicy
     * @param {Map<string, number>} pipelineIndicesTmp
     */
    handleExpiredFunction2(virtualDevice, updatedAttributes, devicePolicy, pipelineIndicesTmp) {
        debug('ScheduledPolicyData.handleExpiredFunction2 called, pipelineIndices = ' +
            util.inspect(pipelineIndicesTmp));

        let pipelineIndicesTmpAry = Array.from(pipelineIndicesTmp);

        let requests = pipelineIndicesTmpAry.map(entry => {
            debug('ScheduledPolicyData.handleExpiredFunction2 calling handleExpiredFunction3.');

            return new Promise((resolve, reject) => {
                this.handleExpiredFunction3(virtualDevice, updatedAttributes, devicePolicy,
                    entry[0], entry[1]).then(() =>
                {
                    debug('ScheduledPolicyData.handleExpiredFunction2 updatedAttributes = ' +
                        util.inspect(updatedAttributes));

                    resolve();
                });
            });
        });

        return Promise.all(requests).then(() => {
            debug('ScheduledPolicyData.handleExpiredFunction2 after Promise.all, updatedAttributes = ' +
                util.inspect(updatedAttributes));
        });
    }

    /**
     * @param {VirtualDevice} virtualDevice
     * @param {Set<Pair<VirtualDeviceAttribute<VirtualDevice, Object>, Object>>} updatedAttributes
     * @param {DevicePolicy} devicePolicy
     * @param {string} attributeName
     * @param {number} pipelineIndex
     */
    handleExpiredFunction3(virtualDevice, updatedAttributes, devicePolicy, attributeName,
                           pipelineIndex)
    {
        return new Promise((resolve, reject) => {
            debug('ScheduledPolicyData.handleExpiredFunction3 called, attributeName = ' +
                attributeName);

            // @type {Set<DevicePolicyFunction}
            const pipeline = devicePolicy.getPipeline(attributeName);
            debug('ScheduledPolicyData.handleExpiredFunction3 pipeline = ' +
                util.inspect(pipeline));

            if (!pipeline || pipeline.size === 0) {
                return;
            }

            if (pipeline.size <= pipelineIndex) {
                // TODO: better log message here
                console.log('Pipeline does not match configuration.');
                return;
            }

            debug('ScheduledPolicyData.handleExpiredFunction3 calling virtualDevice.getPipelineData.');

            // @type {Set<Map<string, object>>}
            virtualDevice.getPipelineData(attributeName, function(pipelineData) {
                if (pipelineData.size <= pipelineIndex) {
                    // TODO: better log message here
                    console.log('Pipeline data does not match configuration.');
                    return;
                }

                // @type {Set<DevicePolicyFunction}
                const remainingPipelineConfigs =
                    new Set(Array.from(pipeline).slice(pipelineIndex, pipeline.size));

                // @type {Set<Map<string, object>>}
                const remainingPipelineData =
                    new Set(Array.from(pipelineData).slice(pipelineIndex, pipelineData.size));

                if (!(DevicePolicy.ALL_ATTRIBUTES === attributeName)) {
                    virtualDevice.processExpiredFunction2(updatedAttributes, attributeName,
                        remainingPipelineConfigs, remainingPipelineData);

                    debug('ScheduledPolicyData.handleExpiredFunction3 updatedAttributes = ' +
                        util.inspect(updatedAttributes));

                    resolve();
                } else {
                    virtualDevice.processExpiredFunction1(remainingPipelineConfigs,
                            remainingPipelineData);

                    resolve();
                }
            });
        }).catch(error => {
            console.log('Error handling expired function: ' + error);
        });
    }

    /**
     *
     * @returns {boolean}
     */
    isEmpty() {
        return this.pipelineIndices.size === 0;
    }

    /**
     * @param {VirtualDevice} virtualDevice
     * @param {Set<Pair<VirtualDeviceAttribute<VirtualDevice, Object>, Object>>} updatedAttributes
     * @param {number} timeZero
     */
    processExpiredFunction(virtualDevice, updatedAttributes, timeZero) {
        return new Promise((resolve, reject) => {
            debug('ScheduledPolicyData.processExpiredFunction called.');
            this.handleExpiredFunction1(virtualDevice, updatedAttributes).then(() => {
                debug('ScheduledPolicyData.processExpiredFunction updatedAttributes = ' +
                    util.inspect(updatedAttributes));

                // Ensure expiry is reset. 1/10th of a millisecond resolution.
                this.expiry = ((this.slide + timeZero) / 10) * 10;
                resolve();
            }).catch(error => {
                // Ensure expiry is reset. 1/10th of a millisecond resolution.
                this.expiry = ((this.slide + timeZero) / 10) * 10;
            });
        });
    }

    /**
     *
     * @param {string} attributeName
     * @param {number} pipelineIndex
     */
    removeAttribute(attributeName, pipelineIndex) {
        this.pipelineIndices.delete(attributeName);
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/ScheduledPolicyDataKey.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

class ScheduledPolicyDataKey {
    // Instance "variables"/properties...see constructor.

    /**
     *
     * @param {number} window
     * @param {number} slide
     */
    constructor(window, slide) {
        // Instance "variables"/properties.
        this.window = window;
        this.slide = slide;
        // Instance "variables"/properties.
    }

    toString() {
        return 'ScheduledPolicyDataKey[{"window": ' + this.window + ', "slide": ' + this.slide + '}]';
    }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/TimedPolicyThread.js

/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

// TODO: can we have only one of these threads for all virtual devices?
class TimedPolicyThread {
    // Instance "variables"/properties...see constructor.

    constructor(virtualDevice) {
        // Instance "variables"/properties.
        this.virtualDevice = virtualDevice;
        this.canceled = false;
        // Timer interval.
        this.interval = 1000;
        // @type {ScheduledPolicyData[]}
        this.scheduledPolicyData = [];
        // Instance "variables"/properties.

        this.interval = 1000;
        this.i = 0;
        let self = this;

        /**
         *
         */
        this.run = function() {
            debug('TimedPolicyThread.run called.');
            self.timer = null;

            // @type {number}
            const now = new Date().getTime();
            // @type {Set<Pair<VirtualDeviceAttribute, object>>}
            const updatedAttributes = new Set();
            debug('TimedPolicyThread.run scheduledPolicyData = ' + util.inspect(self.scheduledPolicyData));

            // self.scheduledPolicyData.forEach(policyData => {
            //     debug('TimedPolicyThread.run scheduledPolicyData delay = '+  policyData.getDelay(now));

            //     // Run through all the timed function data
            //     if (policyData.getDelay(now) <= 0) {
            //         debug('TimedPolicyThread.run scheduledPolicyData calling processExpiredFunction, updatedAttributes = ' + util.inspect(updatedAttributes));
            //         policyData.processExpiredFunction(self.virtualDevice, updatedAttributes,
            //             now);
            //         debug('TimedPolicyThread.run scheduledPolicyData after calling processExpiredFunction, updatedAttributes = ' + util.inspect(updatedAttributes));
            //     }
            // });

            // debug('TimedPolicyThread.run scheduledPolicyData updatedAttributes = ' + util.inspect(updatedAttributes));

            // if (updatedAttributes.size > 0) {
            //     // Call updateFields to ensure the computed metrics get run,
            //     // and will put all attributes into one data message.
            //     self.virtualDevice.updateFields(updatedAttributes);
            // }

            // self.start(now);
            if (self.scheduledPolicyData) {
                const scheduledPolicyDataAry = Array.from(self.scheduledPolicyData);

                let requests = scheduledPolicyDataAry.map(policyData => {
                    debug('TimedPolicyThread.run scheduledPolicyData delay = '+
                        policyData.getDelay(now));

                    // Run through all the timed function data
                    if (policyData.getDelay(now) <= 0) {
                        debug('TimedPolicyThread.run scheduledPolicyData calling processExpiredFunction, updatedAttributes = ' + util.inspect(updatedAttributes));

                        policyData.processExpiredFunction(self.virtualDevice, updatedAttributes,
                            now);

                        debug('TimedPolicyThread.run scheduledPolicyData after calling processExpiredFunction, updatedAttributes = ' + util.inspect(updatedAttributes));
                    }
                });

                self.start(now);

                return Promise.all(requests).then(() => {
                    debug('TimedPolicyThread.run after Promise.all, updatedAttributes = ' +
                        util.inspect(updatedAttributes));

                    if (updatedAttributes.size > 0) {
                        // Call updateFields to ensure the computed metrics get run,
                        // and will put all attributes into one data message.
                        self.virtualDevice.updateFields(updatedAttributes);
                    }
                });
            }
        }
    }

    /**
     *
     * @param {ScheduledPolicyData} data
     */
    addTimedPolicyData(data) {
        debug('TimedPolicyThread.addTimedPolicyData called, data = ' + data.window);
        // @type {number}
        let index = this.scheduledPolicyData.findIndex(function(element) {
            return element.equals(data);
        });

        if (index === -1) {
            this.scheduledPolicyData.push(data);
        } else {
            this.scheduledPolicyData.splice(index, 0, data);
        }

        // @type {number}
        const now = new Date().getTime();

        // Sort the set by delay time.
        this.scheduledPolicyData.sort(function(o1, o2) {
            // @type {number}
            const x = o1.getDelay(now);
            // @type {number}
            const y = o2.getDelay(now);
            return (x < y) ? -1 : ((x === y) ? 0 : 1);
        });

        // Is the one we're adding the first in the list?  If yes, cancel and re-start.
        // @type {number}
        index = this.scheduledPolicyData.findIndex(function(element) {
            return element.equals(data);
        });

        if (index === 0) {
            this.cancel();
            this.start(now);
        }
    }

    // TODO: never used. Do we need cancelled and cancel()?
    /**
     *
     */
    cancel() {
        debug('TimedPolicyThread.cancel called.');
        this.cancelled = true;

        if (this.timer) {
            clearInterval(this.timer.id);
        }
    }

    /**
     * @return {boolean} {@code true} if the timer is alive.
     */
    isAlive() {
        if (this.timer) {
            return true;
        }

        return false;
    }

    /**
     *
     * @return {boolean}
     */
    isCancelled() {
        return this.cancelled;
    }


    /**
     *
     * @param {ScheduledPolicyData} data
     */
    removeTimedPolicyData(data) {
        debug('TimedPolicyThread.removeTimedPolicyData called, data = ' + data.window);

        // TODO: Optimize this.
        for (let i = 0; i < this.scheduledPolicyData.length; i++) {
            debug('TimedPolicyThread.removeTimedPolicyData checking item #' + i + ' for removal.');
            if (data.toString() === this.scheduledPolicyData[i].toString()) {
                debug('TimedPolicyThread.removeTimedPolicyData removing item #' + i);
                this.scheduledPolicyData.splice(i, 1);
            }
        }

        this.cancel();
        this.start(new Date().getTime());
    }

    /**
     *
     * @param {number} now
     */
    start(now) {
        debug('TimedPolicyThread.start called.');
        // Sort the timers by time.
        if (this.scheduledPolicyData.length > 0) {
            const interval = this.scheduledPolicyData[0].getDelay(now);
            this.timer = setTimeout(this.run, interval);
        }
    }
}

// @type {number}
TimedPolicyThread.timed_policy_thread_count = 0;


//////////////////////////////////////////////////////////////////////////////
// file: library/device/VirtualDeviceAttribute.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * VirtualDeviceAttribute is an attribute in the device model.
 */
class VirtualDeviceAttribute {
    // Instance "variables"/properties...see constructor.
    /**
     *
     * @param {VirtualDevice} virtualDevice
     * @param {DeviceModelAttribute} deviceModelAttribute
     */
    constructor(virtualDevice, deviceModelAttribute) {
        // Instance "variables"/properties.
        this.virtualDevice = virtualDevice;
        this.deviceModelAttribute = deviceModelAttribute;
        this.lastKnownValue;
        // Instance "variables"/properties.
    }

    /**
     *
     * @returns {DeviceModelAttribute}
     */
    getDeviceModelAttribute() {
        return this.deviceModelAttribute;
    }

    /**
     *
     * @returns {string}
     */
    getName() {
        return this.name;
    }

    /**
     * @return {boolean}
     */
    isSettable() {
        // An attribute is always settable on the device-client side
        return true;
    }

    /**
     * @param {object} value
     * @return {boolean} 
     */
    update(value) {
        // Validate throws an Error if value is not valid.
        this.validate(this.deviceModelAttribute, value);

        debug('\nVirtualDevice: ' + this.virtualDevice.toString() +
            '\n\t attributeName ' + this.deviceModelAttribute.getName() +
            // '\n\t attributeValue ' + this.deviceModelAttribute.value +
            '\n\t newValue ' + value +
            '\n'
        );

        this.lastKnownValue = this.value = value;
        return true;
    }

    /**
     * TODO: implement.
     * @param {DeviceModelAttribute} deviceModelAttribute
     * @param {object} value
     * @throws Error if the value is not valid for the attribute.
     */ 
    validate(attribute, value) {
        // if (!value) {
        //     return;
        // }

        // final DeviceModelAttribute.Type type = attribute.getType();

        // // block assumes value is not null
        // switch (type) {
        //     case INTEGER:
        //         if (!(value instanceof Integer)) {
        //             throw new IllegalArgumentException("value is not INTEGER");
        //         }
        //         break;
        //     case NUMBER:
        //         if (!(value instanceof Number)) {
        //             throw new IllegalArgumentException("value is not NUMBER");
        //         }
        //         break;
        //     case STRING:
        //         if (!(value instanceof String)) {
        //             throw new IllegalArgumentException("value is not STRING");
        //         }
        //         break;
        //     case BOOLEAN:
        //         if (!(value instanceof Boolean)) {
        //             throw new IllegalArgumentException("value is not BOOLEAN");
        //         }
        //         break;
        //     case DATETIME:
        //         if (!(value instanceof Date) && !(value instanceof Long)) {
        //             throw new IllegalArgumentException("value is not DATETIME");
        //         }
        //         break;
        //     case URI:
        //         if (!(value instanceof oracle.iot.client.ExternalObject)) {
        //             throw new IllegalArgumentException("value is not an ExternalObject");
        //         }
        //         break;
        // }

        // if (((type == DeviceModelAttribute.Type.INTEGER) || (type == DeviceModelAttribute.Type.NUMBER))) {
        //     // Assumption here is that lowerBound <= upperBound
        //     final double val = ((Number) value).doubleValue();
        //     if (attribute.getUpperBound() != null) {
        //         final double upper = attribute.getUpperBound().doubleValue();
        //         if (Double.compare(val, upper) > 0) {
        //             throw new IllegalArgumentException(val + " > " + upper);
        //         }
        //     }
        //     if (attribute.getLowerBound() != null) {
        //         final double lower = attribute.getLowerBound().doubleValue();
        //         if(Double.compare(val, lower) < 0) {
        //             throw new IllegalArgumentException(val + " < " + lower);
        //         }
        //     }
        // }
    }


// /** {@inheritDoc} */
// @Override
// public void set(T value) {
//
//     // validate throws IllegalArgumentException if value is not valid
//     validate(model, value);
//
//     if (getLogger().isLoggable(Level.FINEST)) {
//         getLogger().log(Level.FINEST,
//             "\nVirtualDevice: " + virtualDevice.toString() +
//             "\n\t attributeName " + getDeviceModelAttribute().getName() +
//             "\n\t attributeValue " + this.value +
//             "\n\t newValue " + value  +
//             "\n"
//         );
//     }
//
//     this.lastKnownValue = this.value = value;
//
//     // This may set up an infinite loop!
//     ((VirtualDeviceImpl) virtualDevice).processOnChange(this, this.value);
// }
//
// @Override
// public boolean equals(Object obj) {
//     if (obj == null) return false;
//     if (this == obj) return true;
//     if (obj.getClass() != this.getClass()) return false;
//     VirtualDeviceAttributeImpl other = (VirtualDeviceAttributeImpl)obj;
//
//     if (this.value != null ? !this.value.equals(other.value) : other.value != null) return false;
//     return this.getDeviceModelAttribute().equals(((VirtualDeviceAttributeImpl) obj).getDeviceModelAttribute());
// }
//
// @Override
// public int hashCode() {
//     int hash = 37;
//     hash = 37 * hash + (this.value != null ? this.value.hashCode() : 0);
//     hash = 37 *  this.getDeviceModelAttribute().hashCode();
//     return hash;
// }
}


//////////////////////////////////////////////////////////////////////////////
// file: library/device/WritableValue.js

/*
 * Copyright (c) 2018, Oracle and/or its affiliates.  All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL).  See the LICENSE file in the root
 * directory for license terms.  You may choose either license, or both.
 */

/**
 * WritableValue is a wrapper around a value that can be read or written.
 */
class WritableValue {

    constructor() {
        this.value;
    }

    /**
     * Get the value.
     *
     * @return {object} the value.
     */
    getValue() {
        return this.value;
    }

    /**
     * Set the value
     *
     * @param {object} value the value.
     */
    setValue(value) {
        this.value = value;
    }
}



//END/////////////////////////////////////////////////////////////////////////
    lib.log(lib.description+' v'+ lib.version+' loaded!');
    return lib;
}
//////////////////////////////////////////////////////////////////////////////
// module initialization
if ((typeof module === 'object') && (module.exports)) {
    //((typeof exports !== 'undefined') && (this.exports !== exports))
    // node.js
    module.exports = function iotcs (lib) {
        return init(lib);
    };
    module.exports(module.exports);
}
})();
