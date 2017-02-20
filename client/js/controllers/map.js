module.exports = {
	name: 'MapController',
	func($scope, $state, LocationService) {
		/*
		 * Get required data to render map (from location service)
		 * User is not directed to map view until all data is received and updated in service
		 */
		let userPos = LocationService.getUserLocation();
		let endPos = LocationService.getDestination();

		if (userPos.length === 0) {
			$state.go('new-session');
		}

		let Map, Street;
		let currentPos = { // convert 'userPos' array to 'currentPos' object
			lat: userPos[0],
			lng: userPos[1],
		};
		let destination = { // convert 'endPos' array to 'destination' object
			lat: endPos[0],
			lng: endPos[1],
		};
		let destRange;
		let destRadius = 50; // in meters

		let geo = navigator.geolocation;


		/* Initiate map canvas */
		function initMap() {

			let styledMapType = new google.maps.StyledMapType(
				[{ "stylers": [{ "hue": "#16A085" }, { "saturation": 0 }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "lightness": 100 }, { "visibility": "simplified" }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "off" }] }],
				{ name: 'Styled Map' }
			);

			Map = new google.maps.Map(document.querySelector('#sessionMap'), {
				zoom: 15,
				center: currentPos,
				disableDefaultUI: true,
				zoomControl: true,
				zoomControlOptions: {
					style: google.maps.ZoomControlStyle.LARGE 
				},
			});

			Map.mapTypes.set('styled_map', styledMapType);
			Map.setMapTypeId('styled_map');

			// Display directions
			let rendererOptions = {
				map: Map,
				suppressMarkers: true,
			};
			const directionsService = new google.maps.DirectionsService;
			const directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

			directionsDisplay.setMap(Map);
			directionsDisplay.setPanel(document.querySelector('#directions'));
			directionsDisplay.setOptions({
				polylineOptions: {
					strokeColor: '#581845',
				}
			});

			function createMarker(position, icon) {
				let marker = new google.maps.Marker({
					position: position,
					map: Map,
					icon: icon,
				});
			}

			function calculateAndDisplayRoute(directionsService, directionsDisplay) {
				directionsService.route({
					origin: currentPos,
					destination: destination,
					travelMode: 'WALKING',
				}, (response, status) => {
					if (status === 'OK') {
						let route = response.routes[0].legs[0];
						createMarker(route.start_location, 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
						createMarker(route.end_location, 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
						directionsDisplay.setDirections(response);
					} else {
						window.alert('Directions request failed due to ' + status);
					}
				});
			};
			calculateAndDisplayRoute(directionsService, directionsDisplay);

			// Set marker and radius on user's current location
			let userMarker = new google.maps.Marker({
				position: currentPos,
				map: Map,
				icon: "assets/user.png",
			});

			let userRadius = new google.maps.Circle({
				strokeColor: '#581845',
				strokeOpacity: 1,
				strokeWeight: 0.8,
				fillColor: '#581845',
				fillOpacity: 0.4,
				map: Map,
				center: currentPos,
				radius: 50,
			});
			
			destRange = new google.maps.Circle({
				strokeColor: 'black',
				strokeOpacity: 1,
				fillColor: 'black',
				fillOpacity: 0,
				map: Map,
				center: destination,
				radius: destRadius,
			});

		};
		initMap();
		
		/* Watch for changes in user location */
		function watchUserPos() {

			function watch_success(pos) {
				console.log(`new position: ${pos.coords.latitude}, ${pos.coords.longitude}`);
				
				/*google.maps.Circle.prototype.contains = function(latLng) {
					return this.getBounds().contains(latLng) && google.maps.geometry.spherical.computeDistanceBetween(this.getCenter(), latLng) <= this.getRadius();
				}*/
				
				let destBounds = destRange.getBounds();
				console.log(destBounds);
				const current = {
					lat: pos.coords.latitude,
					long: pos.coords.longitude,
				};
				
				let userInRange = google.maps.geometry.spherical.computeDistanceBetween(destination, current) <= destRadius;
				console.log('is user in range?');
				console.log(userInRange);
				
				/*if (destRange.contains(pos.coords)) {
					geo.clearWatch(watch_id);
					alert('you win!!!!!!');
				}*/
			};

			function watch_error(err) {
				console.warn('ERROR(' + err.code + '): ' + err.message);
			}

			let watch_options = {
				enableHighAccuracy: true,
				maximumAge: 3000, // time between readings, in ms
				timeout: 10000,
			};

			// Start watching user position
			if (navigator.geolocation) {
				let watch_id = geo.watchPosition(watch_success, watch_error, watch_options);
			} else {
				console.log('error');
			}

		};


		/* Check if user gives permission to share location */
		if ("geolocation" in navigator) {
			watchUserPos();
		} else {
			alert("Geolocation services are not supported by your browser.");
		}

	},
};