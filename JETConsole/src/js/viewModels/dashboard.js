/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your dashboard ViewModel code goes here
 */
 define(['ojs/ojcore', 'knockout', 'jquery', 'data/data', 'ojs/ojchart'],
        function(oj, ko, $, data) {

/* Variable IOT */
var host =  "howtoservice-gse00014621.uscom-east-1.oraclecloud.com";
var port = 443;
var url = 'https://' + host + '/sensor/n1';
var autorizacion = "Basic aGVybmFuLmVucmlxdWUuYXltYXJkQG9yYWNsZS5jb206VG9tR29uLjExMDc=";
 
  var colorHandler = new oj.ColorAttributeGroupHandler();
var shapeHandler = new oj.ShapeAttributeGroupHandler();
shapeHandler.getValue();

    function DashboardViewModel() {
      var self = this;
	
	/* toggle button variables */
        self.stackValue = ko.observable('off');
        self.orientationValue = ko.observable('vertical');
        
        /* chart data */
        var areaSeries = [{ name: "Temperatura", items: temperaturas},{name: "Humedad", items: [0]},{name: "Luminosidad", items: [0]}];
    
        var areaGroups = ["Temperatura", "Humedad", "Luminosidad"];
   
        
        self.areaSeriesValue = ko.observableArray(areaSeries);
        self.areaGroupsValue = ko.observableArray(areaGroups);      
     
        buscarSensor();
		function generarGrafico (result) {
			
			
			var temperaturas = result.dataT.splice(0, result.dataT.length - 4);
			var humedades = result.dataH.splice(0, result.dataT.length - 4);
			var luminosidades = result.dataL.splice(0, result.dataT.length - 4);
			
			self.areaSeriesValue([{ name: "Temperatura", items: temperaturas},{name: "Humedad", items: humedades},{name: "Luminosidad", items: luminosidades}]); 
			$("#grafico").ojChart('refresh');			
		}
   
   // Below are a subset of the ViewModel methods invoked by the ojModule binding
      // Please reference the ojModule jsDoc for additionaly available methods.
     
       /**
       * Optional ViewModel method invoked when this ViewModel is about to be
       * used for the View transition.  The application can put data fetch logic
       * here that can return a Promise which will delay the handleAttached function
       * call below until the Promise is resolved.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       * @return {Promise|undefined} - If the callback returns a Promise, the next phase (attaching DOM) will be delayed until
       * the promise is resolved
       */
      self.handleActivated = function(info) {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       * @param {boolean} info.fromCache - A boolean indicating whether the module was retrieved from cache.
       */
      self.handleAttached = function(info) {
        // Implement if needed
      };


      /**
       * Optional ViewModel method invoked after the bindings are applied on this View. 
       * If the current View is retrieved from cache, the bindings will not be re-applied
       * and this callback will not be invoked.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       */
      self.handleBindingsApplied = function(info) {
        // Implement if needed
      };

      /*
       * Optional ViewModel method invoked after the View is removed from the
       * document DOM.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       * @param {Array} info.cachedNodes - An Array containing cached nodes for the View if the cache is enabled.
       */
      self.handleDetached = function(info) {
        // Implement if needed
      };
	  

	   function buscarSensor() {
	
        $.ajax({
          url: url,
          type: 'GET',
          dataType: 'json',
		  crossDomain: true,
          success: function(result) { generarGrafico(result); },
          error: function() { alert('boo!'); },
          beforeSend: setHeader
        });
		
		function setHeader(xhr) {
        xhr.setRequestHeader('Authorization', autorizacion); 
		xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        }
		
	   } 
  
      }		  
    

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constrcuted
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    

     
    return new DashboardViewModel();
  }
);
