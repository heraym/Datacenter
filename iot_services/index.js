"use strict";

var Components = require('./core_services.js');

// Create a server instance
var server = Components('/components');

//set parameters as appropriate
var port = Number(process.env.PORT || 8080);
 

// Start the server listening..
console.log("Escuchando en puerto " + port);
server.listen(port);
