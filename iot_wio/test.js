var Data_Services = require('./data_services');

var data_services = new Data_Services();
var sensor = { "nombre": "n1", "deviceID": "d5", "luminance": 33, "temperature": 10, "dust": 50, "humidity": 55};
var historial = { "sensor": "n1", "deviceID": "d1", "luminance": 10, "temperature": 10 , "dust": 10, "humidity": 10};
data_services.actualizarSensor(sensor);
//data_services.cargarHistorialSensor(historial, callback);

