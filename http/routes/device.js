var express = require('express');
var router = express.Router();
const webbluetooth = require('webbluetooth')
const { v4: uuidv4 } = require('uuid');
const deviceController = require('../controller/device');


/* GET home page. */
router.get('/', async function (req, res, next) {
  var result = await deviceController.getDevice(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }

});

router.get('/request', async function (req, res, next) {
  var result = await deviceController.requestDevice(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }
});

/******************************************
 * GATT Services
 ******************************************/

router.get("/gattserver/:sessionId/services", async function (req, res, next) {
  var result = await deviceController.getGattServerServices(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }
});


//******************************************
// GATT Characteristics
//******************************************/

router.get("/gattserver/:sessionId/service/:serviceId/characteristics", async function (req, res, next) {
  var result = await deviceController.getGattServerServiceCharacteristics(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }
});

router.get("/gattserver/:sessionId/service/:serviceId/characteristic/:characteristicId", async function (req, res, next) {
  var result = await deviceController.getGattServerCharacteristicValue(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }
});

router.put("/gattserver/:sessionId/service/:serviceId/characteristic/:characteristicId", async function (req, res, next) {
  var result = await deviceController.writeGattServerCharacteristicValue(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }
});

router.get("/gattserver/:sessionId/service/:serviceId/characteristic/:characteristicId/notify", async function (req, res, next) {
  var result = await deviceController.registerCharacteristicsNotifier(req);

  if(result.status === 400){
    res.status(result.status).json(result);
    return;
  }
  const serviceId = req.params.serviceId;
  const characteristicId = req.params.characteristicId;
  var eventId = serviceId + "_" + characteristicId;

  // Set headers to keep the connection alive and tell the client we're sending event-stream data
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send an initial message
  res.write(`data: Subscribed to characteristic `+ characteristicId +`:\n\n`);

  bleNotifyEmitter = req.app.get('bleNotifyEmitter');
  bleNotifyEmitter.on(eventId, (data) => {
    // Write the event stream format
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  );

  // When client closes connection, stop sending events
  req.on('close', () => {
    //clearInterval(intervalId);
    console.log("Client closed connection for characteristic: " + eventId);
    res.end();
  })

});


//******************************************
// GATT Descriptors
//******************************************/
router.get("//gattserver/:sessionId/service/:serviceId/characteristic/:characteristicId/descriptors", async function (req, res, next) {
  var result = await deviceController.getGattServerCharacteristicDescriptor(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }
});

router.get("//gattserver/:sessionId/service/:serviceId/characteristic/:characteristicId/descriptor/:descriptorId", async function (req, res, next) {
  var result = await deviceController.getGattServerCharacteristicDescriptorValue(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }
});

router.put("//gattserver/:sessionId/service/:serviceId/characteristic/:characteristicId/descriptor/:descriptorId", async function (req, res, next) {
  var result = await deviceController.writeGattServerCharacteristicDescriptor(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }
});

router.get('/events', (req, res) => {
  // Set headers to keep the connection alive and tell the client we're sending event-stream data
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send an initial message
  res.write(`data: Connected to server\n\n`);

  // Simulate sending updates from the server
  let counter = 0;
  const intervalId = setInterval(() => {
    counter++;
    // Write the event stream format
    res.write(`data: Message ${counter}\n\n`);
  }, 2000);

  // When client closes connection, stop sending events
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

module.exports = router;