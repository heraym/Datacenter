//
// An sample config file looks like below, please take only the sensors that you are using,
// also make sure the attribute name (attr) and initial value (val) are properly set for your case.
// If you have other type of sensor, you can add an entry in this config file, and extend corresponding
// client.js code
//

var exports = module.exports = {};

// For Wio Node and sensors
// {
//   "type": "INPUT",           -- type: INPUT or OUTPUT
//   "pin": "GroveLuminanceA0", -- which connector. Find it from Wio App - "View API" page 
//   "property": "humidity",    -- type of property / action, when calling to Wio virtualization server. See "View API" page
//   "attr": "humidity",        -- device model attribute, as defined in IoTCS backend
//   "val": 0                   -- default value for a model attribute
// }
exports.wio_node = [


  {
    // Light Sensor
    "board": 0,
    "type": "INPUT",
    "pin": "GroveLuminanceA0",
    "property": "luminance",
    "attr": "light",
    "val": 0
  },

  {
    // IR
    "board": 0,
    "type": "INPUT",  
    "pin": "GroveIRDistanceInterrupterD0",
    "property": "approach",
    "attr": "approach",
    "val": 0
  },
    {
    // Temperature sensor
    "board": 0,
    "type": "INPUT",
    "pin": "GroveTempHumD1",
    "property": "temperature",
    "attr": "temperature",
    "val": 0
  },
    {
    // Humidity sensor
    "board": 0,
    "type": "INPUT",
    "pin": "GroveTempHumD1",
    "property": "humidity",
    "attr": "humidity",
    "val": 0
  },
   {
    // Dust sensor
    "board": 0,
    "type": "INPUT",
    "pin": "GroveDustD0",
    "property": "dust",
    "attr": "dust",
    "val": 0
  },
   {
    // Led sensor
    "board": 0,
    "type": "OUTPUT",
    "pin": "GroveLEDBarUART0",
    "property": "level",
    "attr": "level",
    "val": 0
  },
   {
    // Led sensor
    "board": 0,
    "type": "OUTPUT",
    "pin": "GroveLEDBarUART0",
    "property": "bits",
    "attr": "bits",
    "val": 0
  }
];

// customize Wio server
exports.wio_iot = [{
  "location": "https://us.wio.seeed.io/",
  "access_token": "d7ed6f3814f6c029e052d27681510371"
},{
  "location": "https://us.wio.seeed.io/",
  "access_token": "12530e8cc9fe14d5a852cd9d5e2044fe"
},{
  "location": "https://us.wio.seeed.io/",
  "access_token": "763e65621d3a000a49444db1553d793c"
}];

// customize Wio server
//exports.wio_iot = {
//  "location": "http://129.150.86.239:8080",
//  "access_token": "a343d3418d69e21bef87453e8d538d1b"
//};

// wio-link
// exports.wio_iot = {
//   "location": "us",
//   "access_token": "6285cad2c451e2da8d3e0b054c9127aa"
// };

// wio-node
// exports.wio_iot = {
//   "location": "us",
//  "access_token": "ed7fbdb429e48050d8d953997aa59f55"
// };

