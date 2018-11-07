var WioNode = require("./wio.js");
var wioConfig = require("./sensor-config.js").wio_iot;

// construct a Wio board
var board = new WioNode({
    "debug": true,
    "token": wioConfig.access_token,
    "location": wioConfig.location
});


// continuous reading, once every 1 seconds
board.stream('GroveLuminanceA0', 'luminance', 500, function(data, error){
    if( data != null ) {
        // console.log(data);

        if( data['luminance'] < 500 ) {
            // write once to buzzer/speaker, to make a sound
            console.log('<---¡¡POCA LUZ!!--->');
			console.log('<---¡¡POCA LUZ!!--->'); 			
		}
        
    }
 });

// stop continuous reading after 22 seconds
setTimeout(function(){
    board.stopStream('GroveLuminanceA0', 'luminance');
}, 20000);


