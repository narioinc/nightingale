var express = require('express');
var router = express.Router();

/* GET server liveness page. */
router.get('/live', function(req, res, next) {
  res.json({});
});

// get server readiness 
router.get('/ready', function(req, res, next) {
  res.json({});
});

module.exports = router;
