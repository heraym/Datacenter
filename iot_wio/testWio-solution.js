var WioNode = require("./wio.js");
var wioConfig1 = require("./sensor-config.js").wio_iot1;
var wioConfig2 = require("./sensor-config.js").wio_iot2;

// construct a Wio board
var board1 = new WioNode({
    "debug": true,
    "token": wioConfig1.access_token,
    "location": wioConfig1.location
});
var board2 = new WioNode({
    "debug": true,
    "token": wioConfig2.access_token,
    "location": wioConfig2.location
});


// continuous reading, once every 1 seconds
board1.stream('GroveLuminanceA0', 'luminance', 1000, function(data, error){
    if( data != null ) {
        // console.log(data);

        if( data['luminance'] < 500 ) {
            // write once to buzzer/speaker, to make a sound
            board.write(null, 'GroveSpeakerD0', 'sound_ms', '4500', '100');     
			board.write(null, 'GroveSpeakerD0', 'sound_ms', '5500', '100'); 		
			board.write(null, 'GroveSpeakerD0', 'sound_ms', '2500', '100');			
        }
    }
});

// continuous reading, once every 1 seconds
board1.stream('GroveIRDistanceInterrupterD0', 'approach', 500, function(data, error){
    if( data != null ) {
        // console.log(data);

        if( data['approach'] < 1 ) {
            // write once to buzzer/speaker, to make a sound
            console.log('<---¡¡PUERTA ABIERTA!!--->');
			console.log('<---¡¡PUERTA ABIERTA!!--->'); 			
		}
        
    }
 });
// continuous reading, once every 1 seconds
board2.stream('GroveTempHumD1', 'temperature', 2000, function(data, error){
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
    board.stopStream('GroveLuminanceA0', 'luminance');
}, 22000);


