/* jslint node: true */
'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/views', express.static(process.cwd() + '/views'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

var stocks = [];

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('addStock', function(newStock) {
    console.log(newStock);
    if (stocks.indexOf(newStock) !== -1 || newStock === '') {
      io.emit('updatesStockList', stocks);
    } else {
      stocks.push(newStock);
      io.emit('updatesStockList', stocks);
    }
    console.log(stocks);
  });
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

http.listen(8080, function() {
  console.log('listening on 8080');
});
