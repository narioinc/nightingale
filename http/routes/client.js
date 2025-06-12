var express = require('express');
var router = express.Router();
var getAdapters = require('webbluetooth').getAdapters;


/* GET home page. */
router.get('/adapters', async function(req, res, next) {
  const adapters = await getAdapters();
  console.log(adapters);
  if (!adapters || adapters.length === 0) {
    return res.status(404).json({"error": "No Bluetooth adapters found"});
  }
  res.json({"res": adapters});
});

module.exports = router;