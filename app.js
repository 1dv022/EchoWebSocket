'use strict';

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8888 });

var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(60, 'min', true);



wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    limiter.removeTokens(1, function(err, remainingRequests) {
    //  console.log(err);
      if (remainingRequests < 0) {
        return ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'To many request! Only 60 req / min' }));

      }
      var clientData;
        try {
          clientData = JSON.parse(message);
        } catch(e) {
          return ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You must send valid JSON!' }));
        }

        if (clientData.key !== 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd') {
            return ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You must send a valid key!' }));
        }
        else {
          delete clientData.key;
        }
        console.log(clientData);
        if(clientData.hasOwnProperty('type') && clientData.hasOwnProperty('data') && clientData.hasOwnProperty('username')) {
          wss.clients.forEach(function each(client) {
            client.send(JSON.stringify(clientData));
          });
        }
        else {
          ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You must send at least properties type, data and username' }));
        }
      });

  });
  ws.send(JSON.stringify({username: 'The Server', type: 'notification', data: 'You are connected!' }));
});

/*
{
”type”: ”message”,
”data” : ”Mitt fina meddelande. Kanske base64-encodat?”
”username”: ”Kalle Kula”
”channel” : ”upg3”
}
*/
