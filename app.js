'use strict';

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8080 });
var limit = require('./limiter');

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    var ip = ws.upgradeReq.headers['x-forwarded-for'] || ws.upgradeReq.connection.remoteAddress;
    if (!limit.isLimited(ip)) {
      return ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'To many request! Only'}));
    }

      // Start handling the request and parse the message
      var clientData;
      try {
        clientData = JSON.parse(message);
      } catch(e) {
        return ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You must send valid JSON'}));
      }

      // check if key is valid
      if (clientData.key !== 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd') {
          return ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You must send a valid key'}));
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
        ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You must send at least property type, data and username'}));
      }
    });
    ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You are connected!' }));
  });

setInterval(function() {
  //console.log('Set intervall');
  if(wss.clients && wss.clients.length > 0) {
    //console.log('heartbeat');
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify({username: 'The Server', type: 'heartbeat', data: '' }));
      });
  }
}, 40000);
