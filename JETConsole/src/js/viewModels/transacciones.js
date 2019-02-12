/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your incidents ViewModel code goes here
 */
define(['jquery', 'appController','ojs/ojcore', 'knockout', 'utils', 'data/data', 'ojs/ojrouter', 'ojs/ojknockout', 'promise', 'ojs/ojlistview', 'ojs/ojtimeline'],
 function($, app, oj, ko, utils, data) {
  
    function TransaccionesViewModel() {
      var self = this;
      // Below are a subset of the ViewModel methods invoked by the ojModule binding
      // Please reference the ojModule jsDoc for additionaly available methods.
      var items = ko.observableArray([]);
      self.timelineSeries =  ko.computed(function () {
        return [{id: 's1', emptyText: 'No Data.', label:'Transacciones en el Juego', items: items()}]
      });
      
      var currentDate = new Date().toISOString();
      var hoy = new Date();
      self.fechaDesde = ko.observable(hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + (hoy.getDate() - 2 ) + "T00:00:00Z");
      self.fechaHasta = ko.observable(hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + (hoy.getDate() + 1) + "T23:59:59Z");
       
      self.referenceObjects = [{value: currentDate}];
      self.data = ko.observableArray(); 
      self.transacciones = ko.observableArray([]);		
      self.transaccionLayoutType = ko.observable("transaccionListLayout");		
      data.fetchData(app.core_services_url + 'transacciones').then(function (trx) {
                self.transacciones(trx);
                var trxseries = [];  
                for (var i = 0; i < trx.length; i++) {
                  var fecha = self.getFecha(trx[i].dia, trx[i].hora);
                  trxseries.push({id: "e" + i, title: trx[i].descripcion, start: fecha.toISOString(), description: fecha.toISOString()});
                }
                items(trxseries);
          }).fail(function (error) {
                    console.log('Error in getting data: ' + error.message);
          });

      self.listViewDataSource = ko.computed(function () {
          return new oj.ArrayTableDataSource(self.transacciones(), {idAttribute: 'partnombre_1'});
      });

      self.getFecha = function (fecha, hora) {
        var ardia = fecha.split("/");
        var arhora = hora.split(":");
        return new Date(ardia[2],ardia[1] -1, ardia[0] -1, arhora[0], arhora[1], arhora[2]);
      }
       
      self.getPhoto = function (id) {
                 var imagen = "";
          if (id == "Player 1") { imagen = "Azul";}
          if (id == "Player 2") { imagen = "Rojo";}
          if (id == "Player 3") { imagen = "Rosa";}
          if (id == "Player 4") { imagen = "Celeste";}
                    var src = '';
                    src = 'css/images/usuarios/' + imagen + '.png';
                    return src;
           };

      self.getPais = function (pais) {
                    var src = '';
                    src = 'css/images/propiedades/' + pais + '.png';
                    return src;
                };

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
      self.reinicializar = function(e) {
        data.fetchData(app.core_services_url + 'inicializar').then(function (p) {
      
        });
       }

    }

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constrcuted
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    return new TransaccionesViewModel();
  }
);
