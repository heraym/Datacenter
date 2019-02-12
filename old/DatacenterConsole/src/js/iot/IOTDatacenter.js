/**
 * This NodeJS client acts as the main loop for Wio Node or Wio Link board with Grove sensors.
 * Using a sensor-config.js file to setup the type of sensors and corresponding PIN of 
 * your device project, this code runs in loop by itself to detect sensor value changes 
 * and push to IoTCS.
 *
 * This client is a directly connected device using IoTCS csl virtual device API.
 * To invoke:  node wio-iotcs-client.js <provision-file> <file-password>
 *
 * 12/26/2017  yuhua.xie@oracle.com
 */

"use strict";

// To disable TLS certificate check?
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';



// TODO: please supply the device model associated with your device
// For example:  const DEVICE_MODEL_URN = 'urn:com:oracle:iot:wionode:mydevicemodel';
const DEVICE_MODEL_URN = 'urn:com:oracle:code:iotws:wio';


// Setup IoT Device Client Lib
// IoTCS device library in NodeJS
var dcl = require("./device-client-lib/device-library.node");
dcl = dcl({debug: true});
var storeFile = (process.argv[2]);
var storePassword = (process.argv[3]);
var device;
var virtualDev;

// Current Sensor Values - collected from "sensor-config.js" file and populated at run-time


/*
For example, after gathering of sensor data:
var currentData = {
    humidity: 12.4,
    temperature: 68.5,
    light: 345
};
*/

var IOT_Services = function () {
};

IOT_Services.prototype.inicializar = function () {
// const device = new dcl.device.DirectlyConnectedDevice();
device = new dcl.device.DirectlyConnectedDevice(storeFile, storePassword);

// Virtual Device toward IoTCS side
virtualDev = new iotcs.device.VirtualDevice("endpointId", DEVICE_MODEL_URN, device);
}

IOT_Services.getValores = function (callback) {
    var currentData = { "temperature" : virtualDev.temperature.value,
             "humidity" : virtualDev.humidity.value,
             "dust": virtualDev.dust.value, 
             "luminance": virtualDev.luminance.value,
             "approach": virtualDev.approach.value
             };
   callback(currentData);
}

module.exports = IOT_Services;
