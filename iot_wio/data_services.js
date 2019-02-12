var moduleName = 'Data_Services';
var fs = require('fs'); 
var Promise = require("bluebird");
var http = require('https');

var host =  "oicteco-gse00014621.uscom-east-1.oraclecloud.com";
var port = 443;
var autorizacion = "Basic aGVybmFuLmVucmlxdWUuYXltYXJkQG9yYWNsZS5jb206VG9tR29uLjExMDc=";

var Data_Services = function () {
};

Data_Services.prototype.actualizarSensor = function(sensor, callback) {
  buscarSensor(sensor, callbackActualizar);
  function callbackActualizar(sensorOriginal, sensor) {
  if (sensor == null) { 
      console.log("cargar");
      cargarDatosSensor(sensorOriginal, callback2);
     }
    else {
      console.log("actualizar " + sensor);
      actualizarDatosSensor(sensorOriginal, callback2);
    } 
  } 
  function callback2 (info) { //console.log(info);
  } 

}
function cargarDatosSensor(sensor, callback) {

var post_data = sensor;

var string_post = JSON.stringify(post_data);    
var options  = {
           host : host,
           port : port,
           path : '/ic/builder/design/IOTDemo/1.0/resources/data/Sensor', // the rest of the url with parameters if needed
           method : 'POST', 
           headers: {
             "Content-Type": 'application/json',
             "Authorization": autorizacion
           }};   

        var datos = "";
        var req = http.request(options, function(res) {

          res.on('data', function(d) {
              datos += d;
                });

          res.on('end', function(d) {
           callback(datos);
                 });
      
          res.on('error', function(e) {
                 console.info('ERROR:\n');
           console.info(e);
                });

        });     
        req.write(string_post);
        req.end();
}

function actualizarDatosSensor(sensor, callback) {

var post_data = sensor;

var string_post = JSON.stringify(post_data);    
var options  = {
           host : host,
           port : port,
           path : '/ic/builder/design/IOTDemo/1.0/resources/data/Sensor/' + sensor.id, // the rest of the url with parameters if needed
           method : 'PATCH', 
           headers: {
             "Content-Type": 'application/json',
             "Authorization": autorizacion
           }};   

        var datos = "";
        var req = http.request(options, function(res) {

          res.on('data', function(d) {
              datos += d;
                });

          res.on('end', function(d) {
          callback(datos);
                 });
      
          res.on('error', function(e) {
                 console.info('ERROR:\n');
           console.info(e);
                });

        });     
        req.write(string_post);
        req.end();
}


function buscarSensor(sensor, callback) {
           
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
        var req = http.request(options, function(res) {

          res.on('data', function(d) {
              datos += d;
                });

          res.on('end', function(d) {
             //console.log(datos);
             sensores = JSON.parse(datos);

             if (sensores.items.length > 0) {
               iSensor = sensores.items.find(item => item.deviceID === sensor.deviceID);           
               if (iSensor != null) { 
                   sensor.id = iSensor.id;
                   callback(sensor, iSensor);
               } else { callback(sensor, null);} 
             } else { callback(sensor, null);}
             
             
         });
      
          res.on('error', function(e) {
                 console.info('ERROR:\n');
           console.info(e);
                });

        });     
        req.end();

        
}
/*
function obtenerInfoSensor(sensor, callback) {
// Busco datos del sensor en iSensor
         var options  = {
           host : host,
           port : port,
           path : '/ic/builder/design/IOTDemo/1.0/resources/data/Sensor/' + sensor.id,
           method : 'GET', 
           headers: {
             "Content-Type": 'application/json',
             "Authorization": autorizacion
           }};   

        var datos = "";
         
          var req = http.request(options, function(res) {

          res.on('data', function(d) {
              datos += d;
                });

          res.on('end', function(d) {
              
             callback(JSON.parse(datos), sensor); 
          
         });
      
          res.on('error', function(e) {
                 console.info('ERROR:\n');
           console.info(e);
                });

        });     
        req.end();
}        

*/
Data_Services.prototype.cargarHistorialSensor = function (historial, callback) {

var post_data = historial;

var string_post = JSON.stringify(post_data);    
var options  = {
           host : host,
           port : port,
           path : '/ic/builder/design/IOTDemo/1.0/resources/data/HistorialSensores', // the rest of the url with parameters if needed
           method : 'POST', 
           headers: {
             "Content-Type": 'application/json',
             "Authorization": autorizacion
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
        req.write(string_post);
        req.end();
}


module.exports = Data_Services;
