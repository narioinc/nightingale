var express = require('express');
var router = express.Router();
const webbluetooth = require('webbluetooth')


/* GET home page. */
router.get('/', async function (req, res, next) {
  const scanTime = req.body.scanTime ? req.body.scanTime/1000 : 0.5; // Default scan time is 5000ms if not provided
  const bluetooth = new webbluetooth.Bluetooth({ scanTime });

  const devices = await bluetooth.getDevices();
  console.log(devices);
  if (!devices || devices.length === 0) {
    return res.status(404).json({ "error": "No Bluetooth devices found" });
  }
  res.json({ "res": devices });

});

router.get('/request', async function (req, res, next) {
  const scanTime = req.body.scanTime ? req.body.scanTime/1000 : 0.5; // Default scan time is 5000ms if not provided
  const bleRequest = req.body.ble_request ? req.body.ble_request/1000 : { acceptAllDevices: true}; // Default empty filter
  
  const bluetooth = new webbluetooth.Bluetooth({ scanTime });
  const devices = await bluetooth.requestDevice(bleRequest);
  console.log(devices);
  if (!devices || devices.length === 0) {
    return res.status(404).json({ "error": "No Bluetooth devices found for the given ble request" });
  }
  res.json({ "res": devices });

});

module.exports = router;