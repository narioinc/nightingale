var express = require('express');
var router = express.Router();
const webbluetooth = require('webbluetooth')
const { v4: uuidv4 } = require('uuid');

var connectionMap = {};
var gattServerMap = {};

/* GET home page. */
router.get('/', async function (req, res, next) {
  const scanTime = req.body.scanTime ? req.body.scanTime / 1000 : 0.5; // Default scan time is 5000ms if not provided
  const bluetooth = new webbluetooth.Bluetooth({ scanTime });

  const devices = await bluetooth.getDevices();
  console.log(devices);
  if (!devices || devices.length === 0) {
    return res.status(404).json({ "error": "No Bluetooth devices found" });
  }
  res.json({ "res": devices });

});

router.get('/request', async function (req, res, next) {
  const scanTime = req.body.scanTime ? req.body.scanTime / 1000 : 0.5; // Default scan time is 5000ms if not provided
  const bleRequest = req.body.bleRequest ? req.body.bleRequest : { acceptAllDevices: true }; // Default empty filter

  const bluetooth = new webbluetooth.Bluetooth({ scanTime });
  var device
  try {
    device = await bluetooth.requestDevice(bleRequest);
    if (!device || device.length === 0) {
      return res.status(404).json({ "error": "No Bluetooth devices found for the given ble request" });
    }
  } catch (error) {
    console.error(`Failed to request device: ${error}`);
    return res.status(404).json({ "error": "No Bluetooth devices found for the given ble request" });
  }

  var gattserver = await device.gatt.connect();
  if(!gattserver) {
    return res.status(500).json({ "error": "Failed to connect to the Bluetooth device" });
  }

  connectionId = uuidv4();
  connectionMap[connectionId] = device.id;
  gattServerMap[device.id] = gattserver

  res.json({ "res": { sessionId: connectionId } });

});

router.get("/gattserver/:sessionId/services", async function (req, res, next) {
  const sessionId = req.params.sessionId;
  if (!connectionMap[sessionId]) {
    return res.status(404).json({ "error": "Session not found" });
  }
  const deviceId = connectionMap[sessionId];
  const server = gattServerMap[deviceId];
  try {
    var services = await server.getPrimaryServices();
    console.log(services)
    var result = [];
    for (const service of services) {
      console.log(`Service: ${service.uuid}`);
      result.push({ uuid: service.uuid });
    }
    res.json({ "res": result });
  } catch (error) {
    console.error(`Failed to connect to device: ${error}`);
    return res.status(500).json({ "error": "Failed to connect to the Bluetooth device" });
  }
});

router.get("/gattserver/:sessionId/service/:serviceId/characteristics", async function (req, res, next) {
  const sessionId = req.params.sessionId;
  const serviceId = req.params.serviceId;
  if (!connectionMap[sessionId]) {
    return res.status(404).json({ "error": "Session not found" });
  }
  const deviceId = connectionMap[sessionId];
  const server = gattServerMap[deviceId];

  try {
    var service = await server.getPrimaryService(serviceId);
    var characteristics = await service.getCharacteristics();
    console.log(characteristics)
    var result = [];
    for (const characteristic of characteristics) {
      console.log(`Characteristic: ${characteristic.uuid}`);
      result.push({ uuid: characteristic.uuid });
    }
    res.json({ "res": result });
  } catch (error) {
    console.error(`Failed to connect to device or get service: ${error}`);
    return res.status(500).json({ "error": "Failed to connect to the Bluetooth device or get service" });
  }
});

module.exports = router;