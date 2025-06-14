var express = require('express');
var router = express.Router();
var getAdapters = require('webbluetooth').getAdapters;
var clientController = require('../controller/client');

/* GET home page. */
router.get('/adapters', async function(req, res, next) {
  var result = await clientController.getAdapter(req);
  if (result) {
    res.status(result.status || 200).json(result);
  } else {
    res.status(500).json({ "error": "Couldn't process request at this moment. Please retry later" });
  }
});

module.exports = router;