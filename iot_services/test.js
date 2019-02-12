//output = lista.find(function(obj) { return obj.id == 2; });
/*    for (var i = 0; i < lista.length; i++) { 
     if (lista[i].id == 2) {
      output = lista[i];
     } 
    }
*/
//t = listatareas.findIndex(tarea => tarea.ciclo === dd);
var Data_Services = require('./data_services');

var data_services = new Data_Services();
data_services.cancelado(callback);
data_services.cancelarPedido();
console.log("cancelado");
data_services.cancelado(callback);

function callback(respuesta) { 
    console.log(respuesta);
    }

