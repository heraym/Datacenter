var xhttp = new XMLHttpRequest();
xhttp.open("POST", 'http://localhost:7000/bcsgw/rest/v1/transaction/query', true);
xhttp.setRequestHeader("Content-Type","application/json");
xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
var datos = { 
	"channel": "monopolyorderer",
	"chaincode": "monopoly",
	"chaincodeVer":"v4",
	"method":"queryAllWallets",
	"args":[""]
      };
xhttp.send(JSON.stringify(datos));
xhttp.onreadystatechange = function() {
    	  if (xhttp.readyState === 4) { console.log(xhttp.response); 
       }
 }