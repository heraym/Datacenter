var WioNode = require("./wio.js");
var wioConfig = require("./sensor-config.js").wio_iot2;

// construct a Wio board
var board = new WioNode({
    "debug": true,
    "token": wioConfig.access_token,
    "location": wioConfig.location
});


// continuous reading, once every 1 seconds
board.stream('GroveTempHumD1', 'temperature', 2000, function(data, error){
    if( data != null ) {
         console.log(data);

        if( data['temperature'] > 25 ) {
            // write once to buzzer/speaker, to make a sound
            console.log('<---CALOR--->');
			console.log('<---CALOR--->');            
        }
    }
});

// stop continuous reading after 22 seconds
setTimeout(function(){
    board.stopStream('GroveTempHumD1', 'temperature');
}, 22000);


