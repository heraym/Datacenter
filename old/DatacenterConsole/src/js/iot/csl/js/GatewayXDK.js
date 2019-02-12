/**
 * Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 *
 * This software is dual-licensed to you under the MIT License (MIT) and
 * the Universal Permissive License (UPL). See the LICENSE file in the root
 * directory for license terms. You may choose either license, or both.
 *
 */

/*
 * This sample presents two sensors (humidity sensor and temperature sensor) to the IoT server.
 *
 * It uses the humidity and temperature device models on two indirectly connected devices
 * registered by the same client (a gateway).
 *
 * It uses the virtual device API to update attributes, raise alerts,
 * handle attribute updates and action requests from the server.
 *
 * The sensors are polled every 3 seconds and the humidity and temperature is updated
 * on the server and alerts are raised if the alert condition is met.
 *
 * Also the temperature sensor can be powered on or off and the min and max temperature
 * can handle a reset.
 *
 * The client is a gateway device using the virtual device API.
 */

dcl = require("./device-library.node.js");
dcl = dcl({debug: true});

var temperatureIcdId = '_Sample_TS';
var humidityIcdId = '_Sample_HS';

function genICDDetails(hardwareId){
    return {
        manufacturer: 'Oracle Argentina',
        modelNumber: 'MN-'+hardwareId,
        serialNumber: 'SN-'+hardwareId
    };
}

var storeFile = (process.argv[2]);
var storePassword = (process.argv[3]);

var temperatureModel;
var humidityModel;

/**
 * This sample can be used with policies, or without policies. By default, the sample does not use
 * policies. Set the 'com_oracle_iot_sample_use_policy' environment variable to 'true' (without
 * quotes) to use policies.
 */
var usePolicy = (process.env['com_oracle_iot_sample_use_policy'] || null);
usePolicy = true;

function showUsage() {
    //console.log(EOL + "Usage:");
    //console.log(" run-device-node-sample.[sh,bat] GatewayDeviceSample.js <trusted assets file> <trusted assets password>" + EOL);
    console.log("To run the sample using device policies, supply the true parameter at the end:")
 //   console.log(" run-device-node-sample.[sh,bat] GatewayDeviceSample.js <trusted assets file> <trusted assets password> <optional_true>" + EOL);
}

function startVirtualTemperature(gateway, id) {
    var virtualDev = gateway.createVirtualDevice(id, temperatureModel);

    var sensor = {
        temp: 0,
        minTemp: 0,
        maxTemp: 0,
        unit: 'Cel',
        startTime: 0
    };

    var sendWithDevicePolicy = function () {
        /* min threshold = - 20; max threshold = 80 */
        sensor.temp = Math.floor(Math.random() * 100 - 20);
        virtualDev.offer("temp", sensor.temp);
    };

    var sendWithoutDevicePolicy = function () {
        /* min threshold = - 20; max threshold = 80 */
        sensor.temp = Math.floor(Math.random() * 100 - 20);

        if ((virtualDev.maxThreshold.value !== null) && (sensor.temp > virtualDev.maxThreshold.value)) {
            var tooHotAlert = virtualDev.createAlert('urn:com:oracle:iot:device:temperature_sensor:too_hot');
            tooHotAlert.fields.temp = sensor.temp;
            tooHotAlert.fields.maxThreshold = virtualDev.maxThreshold.value;
            tooHotAlert.fields.unit = sensor.unit;
            tooHotAlert.raise();
            console.log("temperature TOO HOT: " + sensor.temp + " higher than max " + virtualDev.maxThreshold.value);
        }

        if ((virtualDev.minThreshold.value !== null) && (sensor.temp < virtualDev.minThreshold.value)) {
            var tooColdAlert = virtualDev.createAlert('urn:com:oracle:iot:device:temperature_sensor:too_cold');
            tooColdAlert.fields.temp = sensor.temp;
            tooColdAlert.fields.minThreshold = virtualDev.minThreshold.value;
            tooColdAlert.fields.unit = sensor.unit;
            tooColdAlert.raise();
            console.log("temperature TOO COLD: " + sensor.temp + " lower than min " + virtualDev.minThreshold.value);
        }

        if (sensor.temp < sensor.minTemp) {
            sensor.minTemp = sensor.temp;
        }
        if (sensor.temp > sensor.maxTemp) {
            sensor.maxTemp = sensor.temp;
        }

        virtualDev.update(sensor);
    };

    sensor.startTime = Date.now();
    let timer;

    if (usePolicy && (usePolicy === 'true')) {
        console.log('Using device policies.');
        timer = setInterval(sendWithDevicePolicy, 3000);
    } else {
        timer = setInterval(sendWithoutDevicePolicy, 3000);
    }

    virtualDev.onChange = function (tupples) {
        tupples.forEach( function (tupple) {
            var show = {
                name: tupple.attribute.id,
                lastUpdate: tupple.attribute.lastUpdate,
                oldValue: tupple.oldValue,
                newValue: tupple.newValue
            };
            console.log('------------------ON CHANGE TEMPERATURE---------------------');
            console.log(JSON.stringify(show, null, 4));
            console.log('------------------------------------------------------------');
            sensor[tupple.attribute.id] = tupple.newValue;
        });
    };

    virtualDev.onError = function (tupple) {
        var show = {
            newValues: tupple.newValues,
            tryValues: tupple.tryValues,
            errorResponse: tupple.errorResponse
        };
        console.log('------------------ON ERROR TEMPERATURE---------------------');
        console.log(JSON.stringify(show,null,4));
        console.log('-----------------------------------------------------------');
        for (var key in tupple.newValues) {
            sensor[key] = tupple.newValues[key];
        }
    };

    virtualDev.reset.onExecute = function () {
        console.log('---------------ON EXECUTE RESET-----------------');
        console.log(JSON.stringify({value: 'none'},null,4));
        console.log('------------------------------------------------');
        sensor.minTemp = sensor.temp;
        sensor.maxTemp = sensor.temp;
        sensor.startTime = Date.now();
    };

    virtualDev.power.onExecute = function (arg) {
        console.log('---------------ON EXECUTE POWER-----------------');
        console.log(JSON.stringify({value: arg},null,4));
        console.log('------------------------------------------------');

        if (arg) {
            sensor.startTime = Date.now();
            if (usePolicy && (usePolicy === 'true')) {
                console.log('Using device policies.');
                timer = setInterval(sendWithDevicePolicy, 3000);
            } else {
                timer = setInterval(sendWithoutDevicePolicy, 3000);
            }
        } else {
            clearInterval(timer);
        }
    };
}

function startVirtualHumidity(gateway, id) {
    var virtualDev = gateway.createVirtualDevice(id, humidityModel);

    var sensor = {
        humidity: 0
    };

    var sendWithDevicePolicy = function () {
        /* min threshold = 0; max threshold = 100 */
        sensor.humidity = Math.floor(Math.random() * 100);
        virtualDev.offer("humidity", sensor.humidity);
    };

    var sendWithoutDevicePolicy = function () {
        /* min threshold = 0; max threshold = 100 */
        sensor.humidity = Math.floor(Math.random() * 100);

        if ((virtualDev.maxThreshold.value !== null) && (sensor.humidity > virtualDev.maxThreshold.value)) {
            var alert = virtualDev.createAlert('urn:com:oracle:iot:device:humidity_sensor:too_humid');
            alert.fields.humidity = sensor.humidity;
            alert.raise();
            console.log("humidity ALERT: " + sensor.humidity + " higher than max " + virtualDev.maxThreshold.value);
        }
        virtualDev.update(sensor);
    };

    if (usePolicy && (usePolicy === 'true')) {
        console.log('Using device policies.');
        setInterval(sendWithDevicePolicy, 3000);
    } else {
        setInterval(sendWithoutDevicePolicy, 3000);
    }

    virtualDev.onChange = function (tupples) {
        tupples.forEach( function (tupple) {
            var show = {
                name: tupple.attribute.id,
                lastUpdate: tupple.attribute.lastUpdate,
                oldValue: tupple.oldValue,
                newValue: tupple.newValue
            };
            console.log('------------------ON CHANGE HUMIDITY---------------------');
            console.log(JSON.stringify(show, null, 4));
            console.log('---------------------------------------------------------');
            sensor[tupple.attribute.id] = tupple.newValue;
        });
    };

    virtualDev.onError = function (tupple) {
        var show = {
            newValues: tupple.newValues,
            tryValues: tupple.tryValues,
            errorResponse: tupple.errorResponse
        };
        console.log('------------------ON ERROR HUMIDITY---------------------');
        console.log(JSON.stringify(show,null,4));
        console.log('--------------------------------------------------------');
        for (var key in tupple.newValues) {
            sensor[key] = tupple.newValues[key];
        }
    };
}

function enrollDevices(gateway) {
    // If the user gave a hardware id for the temperature sensor,
    // then - for the purposes of this sample - the device is
    // considered to be controlled roaming. This allows the sample
    // to be run and implicitly register an ICD and have that ICD
    // be able to roam to other GatewayDeviceSamples - provided the
    // ICD has been provisioned to the gateway device's trusted assets.
    // Please refer to the documentation for registerDevice for
    // more information.

    // If the user gave a hardware id for the temperature sensor,
    // then restrict the sensor to this gateway. This means that
    // the sensor cannot be connected through other gateways.
    var temperatureSensorRestricted = process.argv.length > 4;
    var temperatureSensorHardwareId = temperatureSensorRestricted ? process.argv[4] : gateway.getEndpointId() + temperatureIcdId;

    gateway.registerDevice(temperatureSensorRestricted, temperatureSensorHardwareId, genICDDetails(temperatureSensorHardwareId),
        ['urn:com:oracle:iot:device:temperature_sensor'], function (id, error) {
        if (error) {
            console.log('----------------ERROR ON DEVICE REGISTRATION----------------');
            console.log(error.message);
            console.log('------------------------------------------------------------');
            return;
        }
        if (id) {
            console.log('------------------TEMPERATURE DEVICE------------------');
            console.log(id);
            console.log('------------------------------------------------------');
            startVirtualTemperature(gateway, id);
        }
    });

    // If the user gave a hardware id for the humidity sensor,
    // then restrict the sensor to this gateways. This means that
    // the sensor cannot be connected through other gateways.
    var humiditySensorRestricted = process.argv.length > 5;
    var humiditySensorHardwareId = humiditySensorRestricted ? process.argv[5] : gateway.getEndpointId() + humidityIcdId;

    gateway.registerDevice(humiditySensorRestricted, humiditySensorHardwareId, genICDDetails(humiditySensorHardwareId),
        ['urn:com:oracle:iot:device:humidity_sensor'], function (id, error) {
        if (error) {
            console.log('----------------ERROR ON DEVICE REGISTRATION----------------');
            console.log(error.message);
            console.log('------------------------------------------------------------');
            return;
        }
        if (id) {
            console.log('------------------HUMIDITY DEVICE---------------------');
            console.log(id);
            console.log('------------------------------------------------------');
            startVirtualHumidity(gateway, id);
        }
    });

}

function getModelHumidity(gateway){
    gateway.getDeviceModel('urn:com:oracle:iot:device:humidity_sensor', function (response, error) {
        if (error) {
            console.log('-------------ERROR ON GET HUMIDITY DEVICE MODEL-------------');
            console.log(error.message);
            console.log('------------------------------------------------------------');
            return;
        }

        console.log('-----------------HUMIDITY DEVICE MODEL----------------------');
        console.log(JSON.stringify(response,null,4));
        console.log('------------------------------------------------------------');
        humidityModel = response;
        getModelTemperature(gateway);
    });
}

function getModelTemperature(gateway){
    gateway.getDeviceModel('urn:com:oracle:iot:device:temperature_sensor', function (response, error) {
        if (error) {
            console.log('-------------ERROR ON GET TEMPERATURE DEVICE MODEL----------');
            console.log(error.message);
            console.log('------------------------------------------------------------');
            return;
        }

        console.log('-----------------TEMPERATURE DEVICE MODEL-------------------');
        console.log(JSON.stringify(response,null,4));
        console.log('------------------------------------------------------------');
        temperatureModel = response;
        enrollDevices(gateway);
    });
}

var gateway = new dcl.device.GatewayDevice(storeFile, storePassword);

if (gateway.isActivated()) {
    getModelHumidity(gateway);
} else {
    gateway.activate([], function (device, error) {
        if (error) {
            console.log('-----------------ERROR ON ACTIVATION------------------------');
            console.log(error.message);
            console.log('------------------------------------------------------------');
            showUsage();
            process.exit(1);
        }

        gateway = device;
        console.log(gateway.isActivated());

        if (gateway.isActivated()) {
            getModelHumidity(gateway);
        }
    });
}
