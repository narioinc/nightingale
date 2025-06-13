const webbluetooth = require('webbluetooth')
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class BLENotifyEmitter extends EventEmitter {}


// saves the connection map of all active sessions requested by users
var connectionMap = {};

//saves the gatt server map against a unique device id
var gattServerMap = {};

var deviceController = {}

deviceController.getDevice = async function(req) {
    const scanTime = req.body.scanTime ? req.body.scanTime / 1000 : 0.5; // Default scan time is 5000ms if not provided
    const bluetooth = new webbluetooth.Bluetooth({ scanTime });
    
      const devices = await bluetooth.getDevices();
      console.log(devices);
      if (!devices || devices.length === 0) {
        return { "status": "404", "error": "No Bluetooth devices found" };
      }
      return { "status": 200, "res": devices };
}

deviceController.requestDevice = async function(req) {
    const scanTime = req.body.scanTime ? req.body.scanTime / 1000 : 0.5; // Default scan time is 5000ms if not provided
    const bleRequest = req.body.bleRequest ? req.body.bleRequest : { acceptAllDevices: true }; // Default empty filter

    const bluetooth = new webbluetooth.Bluetooth({ scanTime });
    var device;
    try {
        device = await bluetooth.requestDevice(bleRequest);
        if (!device || device.length === 0) {
            return { "status": 404, "error": "No Bluetooth devices found for the given ble request" };
        }
    } catch (error) {
        console.error(`Failed to request device: ${error}`);
        return { "status": 404, "error": "No Bluetooth devices found for the given ble request" };
    }

    var gattserver = await device.gatt.connect();
    if (!gattserver) {
        return { "status": 500, "error": "Failed to connect to the Bluetooth device" };
    }

    const connectionId = uuidv4();
    connectionMap[connectionId] = device.id;
    gattServerMap[device.id] = gattserver;

    return { "status": 200, "res": { sessionId: connectionId } };
}


/************************************
 * GATT services
 ************************************/

deviceController.getGattServerServices = async function(req) {
    const sessionId = req.params.sessionId;
    if (!connectionMap[sessionId]) {
        return { "status": 404, "error": "Session not found" };
    }
    const deviceId = connectionMap[sessionId];
    const server = gattServerMap[deviceId];
    try {
        var services = await server.getPrimaryServices();
        console.log(services);
        var result = [];
        for (const service of services) {
            console.log(`Service: ${service.uuid}`);
            result.push({ uuid: service.uuid, isPrimary: service.isPrimary });
        }
        return { "status": 200, "res": result };
    } catch (error) {
        console.error(`Failed to connect to device: ${error}`);
        return { "status": 500, "error": "Failed to connect to the Bluetooth device" };
    }
}

/****************************************
 * GATT Characteristics
 ****************************************/
 
deviceController.getGattServerServiceCharacteristics = async function(req) {
    const sessionId = req.params.sessionId;
    const serviceId = req.params.serviceId;
    if (!connectionMap[sessionId]) {
        return { "status": 404, "error": "Session not found" };
    }
    const deviceId = connectionMap[sessionId];
    const server = gattServerMap[deviceId];

    try {
        var service = await server.getPrimaryService(serviceId);
        var characteristics = await service.getCharacteristics();
        console.log(characteristics);
        var result = [];
        for (const characteristic of characteristics) {
            console.log(`Characteristic: ${characteristic.uuid}`);
            result.push({ uuid: characteristic.uuid, properties: characteristic.properties });
        }
        return { "status": 200, "res": result };
    } catch (error) {
        console.error(`Failed to connect to device or get service: ${error}`);
        return { "status": 500, "error": "Failed to connect to the Bluetooth device or get service" };
    }
}

deviceController.getGattServerCharacteristicValue = async function(req) { 
    const sessionId = req.params.sessionId;
    const serviceId = req.params.serviceId;
    const characteristicId = req.params.characteristicId;

    console.log(`Session ID: ${sessionId}, Service ID: ${serviceId}, Characteristic ID: ${characteristicId}`);

    if (!connectionMap[sessionId]) {
        return { "status": 404, "error": "Session not found" };
    }
    const deviceId = connectionMap[sessionId];
    const server = gattServerMap[deviceId];

    try {
        var service = await server.getPrimaryService(serviceId);
        var characteristic = await service.getCharacteristic(characteristicId);
        var datavalue = await characteristic.readValue();
        const decoder = new TextDecoder();
        const value = decoder.decode(datavalue);
        return { "status": 200, "res": value };
    } catch (error) {
        console.error(`Failed to connect to device or get service/characteristic: ${error}`);
        return { "status": 500, "error": "Failed to connect to the Bluetooth device or get service/characteristic" };
    }
}

deviceController.writeGattServerCharacteristicValue = async function(req) {
    const sessionId = req.params.sessionId;
    const serviceId = req.params.serviceId;
    const characteristicId = req.params.characteristicId;
    const value = req.body.value; // Expecting a Uint8Array or similar

    if (!connectionMap[sessionId]) {
        return { "status": 404, "error": "Session not found" };
    }
    const deviceId = connectionMap[sessionId];
    const server = gattServerMap[deviceId];

    try {
        var service = await server.getPrimaryService(serviceId);
        var characteristic = await service.getCharacteristic(characteristicId);
        if(!characteristic.properties.write) {
            return { "status": 400, "error": "Characteristic does not support writing" };
        }
        await characteristic.writeValue(value);
        console.log(`Characteristic Value Written: ${value}`);
        return { "status": 200, "res": "Value written successfully" };
    } catch (error) {
        console.error(`Failed to connect to device or write value: ${error}`);
        return { "status": 500, "error": "Failed to connect to the Bluetooth device or write value" };
    }
}


/*************************************
 * GATT Characteristic Descriptors
 * ***********************************/
 
deviceController.getGattServerCharacteristicDescriptors = async function(req) {
    const sessionId = req.params.sessionId;
    const serviceId = req.params.serviceId;
    const characteristicId = req.params.characteristicId;
    if (!connectionMap[sessionId]) {
        return { "status": 404, "error": "Session not found" };
    }
    const deviceId = connectionMap[sessionId];
    const server = gattServerMap[deviceId];

    try {
        var service = await server.getPrimaryService(serviceId);
        var characteristic = await service.getCharacteristic(characteristicId);
        var descriptors = await characteristic.getDescriptors();
        console.log(descriptors);
        var result = [];
        for (const descriptor of descriptors) {
            console.log(`Descriptor: ${descriptor.uuid}`);
            result.push({ uuid: descriptor.uuid, "cachedValue": descriptor.value });
        }
        return { "status": 200, "res": result };
    } catch (error) {
        console.error(`Failed to connect to device or get service/characteristic: ${error}`);
        return { "status": 500, "error": "Failed to connect to the Bluetooth device or get service/characteristic" };
    }
}

     

deviceController.getGattServerCharacteristicDescriptorValue = async function(req) {
    const sessionId = req.params.sessionId;
    const serviceId = req.params.serviceId;
    const characteristicId = req.params.characteristicId;
    const descriptorId = req.params.descriptorId;
    if (!connectionMap[sessionId]) {
        return { "status": 404, "error": "Session not found" };
    }
    const deviceId = connectionMap[sessionId];
    const server = gattServerMap[deviceId];

    try {
        var service = await server.getPrimaryService(serviceId);
        var characteristic = await service.getCharacteristic(characteristicId);
        var descriptor = await characteristic.getDescriptor(descriptorId);
        var value = await descriptor.readValue();
        console.log(`Descriptor Value: ${value}`);
        return { "status": 200, "res": value };
    } catch (error) {
        console.error(`Failed to connect to device or get service/characteristic/descriptor: ${error}`);
        return { "status": 500, "error": "Failed to connect to the Bluetooth device or get service/characteristic/descriptor" };
    }
}

deviceController.writeGattServerCharacteristicDescriptorValue = async function(req) {
    const sessionId = req.params.sessionId;
    const serviceId = req.params.serviceId;
    const characteristicId = req.params.characteristicId;       
    const descriptorId = req.params.descriptorId;
    const value = req.body.value; // Expecting a Uint8Array or similar
    if (!connectionMap[sessionId]) {
        return { "status": 404, "error": "Session not found" };
    }
    const deviceId = connectionMap[sessionId];
    const server = gattServerMap[deviceId];

    try {
        var service = await server.getPrimaryService(serviceId);
        var characteristic = await service.getCharacteristic(characteristicId);
        var descriptor = await characteristic.getDescriptor(descriptorId);
        await descriptor.writeValue(value);
        console.log(`Descriptor Value Written: ${value}`);
        return { "status": 200, "res": "Value written successfully" };
    } catch (error) {
        console.error(`Failed to connect to device or write value: ${error}`);
        return { "status": 500, "error": "Failed to connect to the Bluetooth device or write value" };
    }
}

deviceController.registerCharacteristicsNotifier =  async function(req) {
    const sessionId = req.params.sessionId;
    const serviceId = req.params.serviceId;
    const characteristicId = req.params.characteristicId;

    if (!connectionMap[sessionId]) {
        return { "status": 404, "error": "Session not found" };
    }
    const deviceId = connectionMap[sessionId];
    const server = gattServerMap[deviceId];
    const eventId = serviceId + "_" + characteristicId;

    try {
        var service = await server.getPrimaryService(serviceId);
        var characteristic = await service.getCharacteristic(characteristicId);

        if(characteristic.properties.notify === false) {
            return { "status": 400, "error": "Characteristic does not support notifications" };
        }else{
            console.log(`Registering notifier for characteristic: ${characteristic.uuid}`);
        }
        
        // Create a new emitter for notifications
        const notifyEmitter = req.app.get('bleNotifyEmitter');
        
        // Start listening for notifications
        characteristic.startNotifications().then(() => {
            characteristic.addEventListener('characteristicvaluechanged', (event) => {
                notifyEmitter.emit(eventId, event.value);
            });
        });

    } catch (error) {
        console.error(`Failed to connect to device or get service/characteristic: ${error}`);
        return { "status": 500, "error": "Failed to connect to the Bluetooth device or get service/characteristic" };
    }
}

module.exports = deviceController;