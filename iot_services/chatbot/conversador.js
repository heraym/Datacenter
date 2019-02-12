"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();

var opciones = [ {"clave": "saludo", "respuestas": ["Hola, como estas? Me alegra escucharte", "Que haces amigo? Todo bien?", "Hola. Como puedo ayudarte?", "Que puedo hacer por vos?", "Hola. Que necesitas de mi?"]},
                 {"clave": "nombre", "respuestas": ["Llamame Porota querido", "Mi nombre es Matilde pero podes llamarme Porota", "Hola, soy un bot, da lo mismo como me llame", "Para que queres saber mi nombre? Quieres invitarme a salir?"]},
				 {"clave": "equipo", "respuestas": ["Obviamente del puntero", "De la Academia, y no tiro piedras", "Nunca del rojo", "De la Gloriosa Academia"]},
				 {"clave": "pedirFactura", "respuestas": ["Hola, como estas?. Necesitaria algunos datos para mostrarte tu factura.", "Hola! Por supuesto que puedo mostrarte cualquier factura.", "Voy a tener que molestarte pidiendote algunos datos."]},
                 {"clave": "algomas", "respuestas": ["Espero que haya sido util. Puedo ayudarte con algo mas?", "Necesitas algo mas ${nombre.value}?", "Hay algo mas en lo que pueda ayudarte?"]}];
module.exports =
    {
        metadata: () => ({
            "name": "ar.conversador",
            "properties": {
                "clave": {"type": "string", "required": true} 
            },
            "supportedActions": []
        }),
        invoke: (conversation, done) => {
             
            var clave = conversation.properties().clave;
            var userId = "";                
             if (conversation.channelType() == "facebook") {
                       userId = conversation.payload().sender.id;
              }
              else {
                 userId = conversation.payload().userId;
              }
             var i = opciones.findIndex(obj => obj.clave == clave);
			 var nombre = conversation.variable("nombre");
			 
             var aleatorio = Math.floor(Math.random() * opciones[i].respuestas.length);
             var texto = opciones[i].respuestas[aleatorio];
             texto = texto.replace("{nombre}",nombre);
			 conversation.reply({text: texto });
             conversation.keepTurn(true);
             conversation.transition();
             done();
            }
    };
