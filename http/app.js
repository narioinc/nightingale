var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const EventEmitter = require('events');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hello World',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);

class BLENotifyEmitter extends EventEmitter {}
const bleNotifyEmitter = new BLENotifyEmitter();

var healthRouter = require('./routes/health');
var clientRouter = require('./routes/client');
var deviceRouter = require('./routes/device');
const bluetooth = require('webbluetooth').bluetooth;

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/health', healthRouter);
app.use('/client', clientRouter);
app.use('/device', deviceRouter);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.set('ble', bluetooth);
app.set('bleNotifyEmitter', bleNotifyEmitter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({'error': err});
});

module.exports = app;
