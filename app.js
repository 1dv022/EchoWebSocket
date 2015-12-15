'use strict';

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8080 });

//var RateLimiter = require('limiter').RateLimiter;
// allow 60 messages per minute
//var limiter = new RateLimiter(60, 'min', true);
var limit = require('./limiter');
var express = require('express');
var app = express();
var expressWs = require('express-ws')(app); //app = express app

//app.ws('/socket', function(ws, req) {
//  console.log("Hit!")
  //handleWS(ws, limit.isLimited(req));
//});


//function handleWS(ws, isLimitOK) {
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      // Notify client if he/she makes to many request
    //  console.log(ws.upgradeReq);
      if (!limit.isLimited(ws.upgradeReq)) {
        return ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'To many request! Only 60 req / min' }));
      }

      // Start handling the request and parse the message
      var clientData;
      try {
        clientData = JSON.parse(message);
      } catch(e) {
        return ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You must send valid JSON!' }));
      }

      // check if key is valid
      if (clientData.key !== 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd') {
          return ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You must send a valid key!' }));
      }
      else {
        delete clientData.key;
      }

      // validate the message format
      if(clientData.hasOwnProperty('type') && clientData.hasOwnProperty('data') && clientData.hasOwnProperty('username')) {
        // send to all clients
        wss.clients.forEach(function each(client) {
          client.send(JSON.stringify(clientData));
        });
      }
      else {
        ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You must send at least properties type, data and username' }));
      }
    });
    ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You are connected!' }));
  });
//}




setInterval(function() {
  console.log('Set intervall');
  if(wss.clients && wss.clients.length > 0) {
    console.log('heartbeat');
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify({username: 'The Server', type: 'heartbeat', data: '' }));
      });
  }
}, 40000);



/*
{
”type”: ”message”,
”data” : ”Mitt fina meddelande. Kanske base64-encodat?”
”username”: ”Kalle Kula”
”channel” : ”upg3”
}
*/
