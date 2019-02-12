define([], 
function(https) {
	
	function ControllerViewModel() {
/* Variable IOT */
var host =  "oicteco-gse00014621.uscom-east-1.oraclecloud.com";
var port = 443;
var autorizacion = "Basic aGVybmFuLmVucmlxdWUuYXltYXJkQG9yYWNsZS5jb206VG9tR29uLjExMDc=";


	}
/* IOT */


function buscarSensor(nombre, callback) {
           
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

return new ControllerViewModel();
  
}
);