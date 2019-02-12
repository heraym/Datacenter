var moduleName = 'Data_Services';
var fs = require('fs'); 
var Promise = require("bluebird");
var http = require('http');
var https = require('https');
var cozmo_host = "10.157.220.195";
var cozmo_port = 4100;

var listaPedidos = [];
var nropedido = 0;
var cancelar = false;

/* Variable IOT */
var host =  "oicteco-gse00014621.uscom-east-1.oraclecloud.com";
var port = 443;
var autorizacion = "Basic aGVybmFuLmVucmlxdWUuYXltYXJkQG9yYWNsZS5jb206VG9tR29uLjExMDc=";


var Data_Services = function () {
};


Data_Services.prototype.cancelado = function (callback) {
	if (cancelar == true) 
		{ 
			cancelar = false;
                        callback("OK");
	    } else {
	    	 callback("ERROR");
	    }
}
Data_Services.prototype.despachar = function (callback) {
	if (listaPedidos.length > 0) 
		{ 
			 listaPedidos.pop();
			 callback("OK");
	    } else {
	    	 callback("ERROR");
	    }
}
Data_Services.prototype.cancelarPedido = function (callback) {
	cancelar = true;
}
Data_Services.prototype.hacerPedido = function (callback) {
	nropedido = nropedido + 1;
    listaPedidos.push(nropedido);	
/*
var post_data = { "variable": "nada"};

var string_post = JSON.stringify(post_data);    
var options  = {
           host : cozmo_host,
           port : cozmo_port,
       path : '/cgi-bin/hacerPedido', // the rest of the url with parameters if needed
         method : 'GET', 
           headers: {
             "Content-Type": 'application/json',
           }};   

        var datos = "";
        var req = http.request(options, function(res) {

          res.on('data', function(d) {
              datos += d;
                });

          res.on('end', function(d) {
          console.log(datos);
          callback(datos);
                 });
      
          res.on('error', function(e) {
                 console.info('ERROR:\n');
           console.info(e);
                });

        });     
        //req.write(string_post);
        req.end();
*/
}

Data_Services.prototype.pedidos = function (callback) {
          callback(listaPedidos); 
}


/* IOT */


 

Data_Services.prototype.buscarSensor = function (nombre, callback) {
           
           var sensores = {};
           var iSensor = 0;
           var options  = {
             host : host,
             port : port,
             path : '/ic/builder/design/IOTDemo/1.0/resources/data/Sensor', // the rest of the url with parameters if needed
             method : 'GET', 
             headers: {
               "Content-Type": 'application/json',
               "Authorization": autorizacion
             }};   

        var datos = "";
        var req = https.request(options, function(res) {

          res.on('data', function(d) {
              datos += d;
                });

          res.on('end', function(d) {
           
             
             sensores = JSON.parse(datos);

             if (sensores.items.length > 0) {
               iSensor = sensores.items.find(item => item.nombre === nombre);           
               if (iSensor != null) { 
                  historialSensor(iSensor, callback);
               } else { callback(null);} 
             } else { callback(null);}
             
             
         });
      
          res.on('error', function(e) {
                 console.info('ERROR:\n');
           console.info(e);
                });

        });     
        req.end();

        
}


function historialSensor(sensor, callback) {
           
           var sensores = {};
           var iSensor = 0;
           var options  = {
             host : host,
             port : port,
             path : '/ic/builder/design/IOTDemo/1.0/resources/data/HistorialSensores', // the rest of the url with parameters if needed
             method : 'GET', 
             headers: {
               "Content-Type": 'application/json',
               "Authorization": autorizacion
             }};   

        var datos = "";
        var req = https.request(options, function(res) {

          res.on('data', function(d) {
              datos += d;
                });

          res.on('end', function(d) {
           
             
             sensores = JSON.parse(datos);
               
             if (sensores.items.length > 0) {
               var historial = sensores.items;
               for (i = 0; i < historial.length; i++) { 
                if (historial[i].sensor != sensor.nombre) { 
                   historial.splice(i,1);}
                }              
               sensor.historial = historial;
               callback(sensor);  
             } else { callback(null);}
             
             
         });
      
          res.on('error', function(e) {
                 console.info('ERROR:\n');
           console.info(e);
                });

        });     
        req.end();

        
}


module.exports = Data_Services;
