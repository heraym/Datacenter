/*
 * This sample changes a message attribute on a virtual device and triggers a message to the Cloud
 * Service with the updated attribute value.
 *
 * The client is a directly connected device using the Virtual Device API.
 */

dcl = require('device-library.node');

class HelloWorldSample {
    constructor() {
        let dcd = new dcl.device.DirectlyConnectedDevice();

        if (dcd.isActivated()) {
            this.getDeviceModel(dcd);
        } else {
            dcd.activate(['urn:test:helloworld'], device => {
                dcd = device;

                if (dcd.isActivated()) {
                    this.getDeviceModel(dcd);
                }
            });
        }
    }

    /**
     * Retrieves the hello world device model from the IoT CS.
     *
     * @param {iotcs.device.VirtualDevice} device the VirtualDevice.
     */
    getDeviceModel(device) {
        let self = this;

        device.getDeviceModel('urn:test:helloworld', response => {
            self.startVirtualDevice(device, device.getEndpointId(), response);
        });
    }

    /**
     * Quits this application.
     */
    quit() {
        process.exit(0);
    }

    /**
     * Starts the VirtualDevice and sends a message.
     *
     * @param {iotcs.device.VirtualDevice} the VirtualDevice.
     * @param {string} id the device Endpoint ID.
     * @param {Object} deviceModel the device's device model.
     */
    startVirtualDevice(device, id, deviceModel) {
        let virtualDevice = device.createVirtualDevice(id, deviceModel);
        virtualDevice.update({"message": "Hello World!"});
        virtualDevice.close();
        console.log('Send Hello World! message.');
        // Give the update some time to process.
        setTimeout(this.quit, 3000);
    }
}

dcl.oracle.iot.tam.store = (process.argv[2]);
dcl.oracle.iot.tam.storePassword = (process.argv[3]);
new HelloWorldSample();
