const app = angular.module('BibliocacheApp', ['ui.router', 'ngMessages']).run(function ($rootScope, $state, $stateParams) {
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;
});

/* Routes */
const routes = require('./routes');

app.config($stateProvider => {
	for (let i = 0; i < routes.length; i++) {
		$stateProvider.state(routes[i]);
	}
});

/* Controllers */
const controllers = [
	require('./controllers/registration'),
	require('./controllers/login'),
	require('./controllers/newSession'),
	require('./controllers/map'),
	require('./controllers/endSession'),
	
];

for (let i = 0; i < controllers.length; i++) {
	app.controller(controllers[i].name, controllers[i].func);
}

/* Components */
const components = [
	require('./components/registration'),
	require('./components/login'),
	require('./components/newSession'),
	require('./components/map'),
	require('./components/endSession'),
	require('./components/header'),
	require('./components/footer'),
];

for (let i = 0; i < components.length; i++) {
	app.component(components[i].name, components[i].func);
}

/* Services */
const services = [
	require('./services/user-service'),
	require('./services/book-service'),
	require('./services/location-service'),
];

for (let i = 0; i < services.length; i++) {
	app.factory(services[i].name, services[i].func);
}