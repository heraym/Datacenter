"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var Data_Services = require('../data_services'); 

module.exports =
    {
        metadata: () => ({
            "name": "iot.datosSensor",
            "properties": {
                "nombre": {"type": "string", "required": true},
                "atributo": {"type": "string", "required": true},
                "variable": {"type": "string", "required": true} 
            },
            "supportedActions": []
        }),
        invoke: (conversation, done) => {
             
            var nomvariable = conversation.properties().variable;
            var nombre = conversation.properties().nombre;
            var atributo = conversation.properties().atributo;
            var userId = "";                
             if (conversation.channelType() == "facebook") {
                       userId = conversation.payload().sender.id;
              }
              else {
                 userId = conversation.payload().userId;
              }
             
             var data_services = new Data_Services();
             data_services.buscarSensor(nombre, callback);
             
             
             function callback(sensor) {
             //conversation.reply({text: "El pedido sera enviado en breve!" });
              var dato = 0;
              if (atributo === "temperatura") { dato = sensor.temperature;}
              if (atributo === "humedad") { dato = sensor.humidity;}
              if (atributo === "luminosidad") { dato = sensor.luminance;}
              if (atributo === "polvo") { dato = sensor.dust;}
              if (atributo === "ir") { dato = sensor.approach;}
               
              conversation.variable(nomvariable, dato);
              conversation.transition();
              conversation.keepTurn(true);
              done();
            }
          }
    };
