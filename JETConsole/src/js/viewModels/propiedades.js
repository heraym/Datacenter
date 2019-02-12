/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
define(['jquery', 'appController', 'ojs/ojcore', 'knockout', 'utils', 'data/data', 'ojs/ojrouter', 'ojs/ojknockout', 'promise', 'ojs/ojlistview', 'ojs/ojmodel', 'ojs/ojpagingcontrol', 'ojs/ojpagingcontrol-model'],
        function ($, app, oj, ko, utils, data)
        {
            function PropiedadesViewModel() {
                var self = this;
                var defaultLayout = utils.readCookie('peopleLayout');
                if (defaultLayout) {
                    self.peopleLayoutType = ko.observable(defaultLayout);
                } else {
                    self.peopleLayoutType = ko.observable('peopleCardLayout');
                }
                self.allPeople = ko.observableArray([]);
                self.propiedades = ko.observableArray([]);
                self.ready = ko.observable(false);
                self.data = ko.observableArray();
		
		data.fetchData(app.core_services_url + 'propiedades').then(function (p) {
                  self.propiedades(p);
                }).fail(function (error) {
                    console.log('Error in getting Propiedades data: ' + error.message);
                });

            	data.fetchData(app.core_services_url + 'participantes/Negro').then(function (people) {
                   var vProps = [];
                   
                   for (var i=0; i < people.propiedades.length; i++) {
                     var listaProps = self.propiedades();
                     var output = listaProps.findIndex(obj => obj.nombre == people.propiedades[i]);
                     
                     vProps.push({nombre: people.propiedades[i], pais: listaProps[output].pais, 
                          costo: listaProps[output].costo});
                    }
                  self.allPeople(vProps);
                }).fail(function (error) {
                    console.log('Error in getting People data: ' + error.message);
                });
                
	         self.parsePeople = function (response) {
                    return response['propiedades'];
                };

                self.model = oj.Model.extend({
                    idAttribute: 'id'
                });

                self.nameSearch = ko.observable('');

                self.filteredAllPeople = ko.computed(function () {
                    var peopleFilter = new Array();

                    if (self.allPeople().length !== 0) {
                        if (self.nameSearch().length === 0)
                        {
                            peopleFilter = self.allPeople();
                        } else {
                            ko.utils.arrayFilter(self.allPeople(),
                                    function (r) {
                                        var token = self.nameSearch().toLowerCase();
                                        if (r.nombre.toLowerCase().indexOf(token) === 0) {
                                            peopleFilter.push(r);
                                        }
                                    });
                        }
                    }

                    self.ready(true);
                    return peopleFilter;
                });

                self.listViewDataSource = ko.computed(function () {
                    return new oj.ArrayTableDataSource(self.filteredAllPeople(), {idAttribute: 'nombre'});
                });

                self.cardViewPagingDataSource = ko.computed(function () {
                    return new oj.ArrayPagingDataSource((self.filteredAllPeople()));
                });

                self.cardViewDataSource = ko.computed(function () {
                    return self.cardViewPagingDataSource().getWindowObservable();
                });

                self.getPhoto = function (id) {
                    var src = '';
                     src = 'css/images/propiedades/' + id + '.png';
                    return src;
                };

                
                self.getFacetime = function (emp) {
                    return "#";
                };

                self.getChat = function (emp) {
                    return "#";
                };

                self.getOrg = function (org, event) {
                    alert('This will take you to the employee page and highlight the team infotile');
                };

                

                self.cardLayoutHandler = function () {
                    utils.createCookie('peopleLayout', 'peopleCardLayout');
                    self.peopleLayoutType('peopleCardLayout');
                };

                self.listLayoutHandler = function () {
                    utils.createCookie('peopleLayout', 'peopleListLayout');
                    self.peopleLayoutType('peopleListLayout');
                };

                self.loadPersonPage = function (emp) {
                    if (emp.id) {
                        // Temporary code until go('person/' + emp.id); is checked in 1.1.2
                        history.pushState(null, '', 'index.html?root=person&emp=' + emp.id);
                        oj.Router.sync();
                    } else {
                        // Default id for person is 100 so no need to specify.
                        oj.Router.rootInstance.go('person');
                    }
                };

                self.onEnter = function(data, event){
                    if(event.keyCode === 13){
                        var emp = {};
                        emp.id = data.id;
                        self.loadPersonPage(emp);
                    }
                    return true;
                };
                
                self.changeHandler = function (page, event) {
                    if (event.option === 'selection') {
                        if (event.value[0]) {
                            var emp = {};
                            emp.id = event.value[0];
                            self.loadPersonPage(emp);
                        }
                    }
                };

            }

            return PropiedadesViewModel;
        });
