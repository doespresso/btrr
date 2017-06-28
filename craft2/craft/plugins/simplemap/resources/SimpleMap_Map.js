;(function (window) {
	
	/**
	 * SimpleMap Class
	 *
	 * @param {string} key - Google Maps API key
	 * @param {string} mapId - Map field ID
	 * @param {object} settings - The map seetings object
	 * @param {string} locale - The entries locale
	 * @constructor
	 */
	var SimpleMap = function (key, mapId, settings, locale) {
		if (!key) {
			SimpleMap.Fail('Missing API Key!');
			return;
		}
		
		// Vars
		this.setup = false;
		this.updateByAddress = false;
		this.settings = settings;
		this.mapEl = document.getElementById(mapId);
		this.address = document.getElementById(mapId + '-address');
		this.inputs = {
			lat: document.getElementById(mapId + '-input-lat'),
			lng: document.getElementById(mapId + '-input-lng'),
			zoom: document.getElementById(mapId + '-input-zoom'),
			address: document.getElementById(mapId + '-input-address'),
		};
		
		// Setup settings
		this.settings = {
			height: this.settings.height,
			lat: parseFloat(this.settings.lat),
			lng: parseFloat(this.settings.lng),
			zoom: parseInt(this.settings.zoom),
			hideMap: this.settings.hideMap,
			hideLatLng: this.settings.hideLatLng,
			
			country: this.settings.country,
			type: this.settings.type,
			boundary: this.settings.boundary,
			
			locale: locale,
		};
		
		// Stop submission on address field enter
		this.address.addEventListener('keydown', function (e) {
			if (e.keyCode === 13) e.preventDefault();
		});
		
		if (this.settings.hideMap) {
			this.AutoCompleteOnly(key);
			return;
		}
		
		// Check we have everything we need
		if (
			!this.mapEl ||
			!this.address ||
			!this.inputs.lat ||
			!this.inputs.lng
		) {
			SimpleMap.Fail('Map inputs with id ' + mapId + ' not found!');
			return;
		}
		
		var self = this;
		
		// Load Google APIs if they aren't already
		if (typeof google === "undefined") {
			if (!window.simpleMapsLoadingGoogle)
				SimpleMap.LoadGoogleAPI(key, locale);
		} else if (!google.maps || !google.maps.places) {
			// Load Google Maps APIs if the aren't already
			if (!window.simpleMapsLoadingGoogle)
				SimpleMap.LoadGoogleAPI.LoadMapsApi(key, locale);
		} else {
			if (!self.setup)
				self.setupMap();
		}
		
		document.addEventListener('SimpleMapsGAPILoaded', function () {
			if (!self.setup)
				self.setupMap();
		});
		
		// Bind Lat / Lng input events
		if (!this.settings.hideLatLng) {
			this.inputs.lat.addEventListener('input', this.onLatLngChange.bind(this));
			this.inputs.lat.addEventListener('change', this.onLatLngChange.bind(this));
			
			this.inputs.lng.addEventListener('input', this.onLatLngChange.bind(this));
			this.inputs.lng.addEventListener('change', this.onLatLngChange.bind(this));
		}
		
		// Re-draw map on tab change
		if (document.getElementById('tabs')) {
			[].slice.call(
				document.getElementById('tabs').getElementsByTagName('a')
			).map(function (el) {
				el.addEventListener('click', function () {
					var x = self.map.getZoom(),
						c = self.map.getCenter();
					
					setTimeout(function () {
						google.maps.event.trigger(self.map, 'resize');
						self.map.setZoom(x);
						self.map.setCenter(c);
					}, 1);
				});
			});
		}
	};
	
	/**
	 * Setup only the auto-complete
	 *
	 * @param {string} key - Google Maps API key
	 */
	SimpleMap.prototype.AutoCompleteOnly = function (key) {
		var self = this;
		
		// Load Google APIs if they aren't already
		if (typeof google === "undefined") {
			if (!window.simpleMapsLoadingGoogle)
				SimpleMap.LoadGoogleAPI(key, this.settings.locale);
		} else if (!google.maps || !google.maps.places) {
			// Load Google Maps APIs if the aren't already
			if (!window.simpleMapsLoadingGoogle)
				SimpleMap.LoadGoogleAPI.LoadMapsApi(key, this.settings.locale);
		} else {
			if (!self.setup)
				self.setupAutoComplete();
		}
		
		document.addEventListener('SimpleMapsGAPILoaded', function () {
			if (!self.setup)
				self.setupAutoComplete();
		});
	};
	
	/**
	 * Log an error message to the console and screen
	 *
	 * @param {string} message - The error message
	 * @static
	 */
	SimpleMap.Fail = function (message) {
		Craft.cp.displayError('<strong>SimpleMap:</strong> ' + message);
		if (window.console) {
			console.error.apply(console, [
				'%cSimpleMap: %c' + message,
				'font-weight:bold;',
				'font-weight:normal;'
			]);
		}
	};
	
	/**
	 * Load the google API into the dom
	 *
	 * @param {string} key - Google Maps API key
	 * @param {string} locale - The locale
	 * @static
	 */
	SimpleMap.LoadGoogleAPI = function (key, locale) {
		window.simpleMapsLoadingGoogle = true;
		
		var gmjs = document.createElement('script');
		gmjs.type = 'text/javascript';
		gmjs.src = 'https://www.google.com/jsapi?key=' + key;
		gmjs.onreadystatechange = function () {
			SimpleMap.LoadGoogleAPI.LoadMapsApi(key, locale);
		};
		gmjs.onload = function () {
			SimpleMap.LoadGoogleAPI.LoadMapsApi(key, locale);
		};
		document.body.appendChild(gmjs);
	};
	
	/**
	 * Load the google maps API into the dom
	 *
	 * @param {string} key - Google Maps API key
	 * @param {string} locale - The locale
	 * @static
	 */
	SimpleMap.LoadGoogleAPI.LoadMapsApi = function (key, locale) {
		google.load('maps', '3', {
			other_params: 'libraries=places&key=' + key +
			'&language=' + locale.replace('_', '-') +
			'&region=' + locale,
			callback: function () {
				document.dispatchEvent(new Event('SimpleMapsGAPILoaded'));
			}
		});
	};
	
	/**
	 * Formats the map boundary from two sets of LatLnds
	 */
	SimpleMap.prototype.formatBoundary = function () {
		if (this.settings.boundary !== '') {
			var ne = new google.maps.LatLng(
					this.settings.boundary.ne.lat,
					this.settings.boundary.ne.lng
				),
				sw = new google.maps.LatLng(
					this.settings.boundary.sw.lat,
					this.settings.boundary.sw.lng
				);
			this.settings.boundary = new google.maps.LatLngBounds(ne, sw);
		}
	};
	
	/**
	 * Setup the Map!
	 */
	SimpleMap.prototype.setupMap = function () {
		this.setup = true;
		var self = this;
		
		this.formatBoundary();
		
		// Geocoder (for address search)
		this.geocoder = new google.maps.Geocoder();
		
		// Set Map Height
		this.mapEl.style.height = this.settings.height + 'px';
		
		// Create Map
		this.map = new google.maps.Map(this.mapEl, {
			zoom:		 this.settings.zoom,
			scrollwheel: false,
			center:		 new google.maps.LatLng(
						 	 this.settings.lat,
							 this.settings.lng
						 ),
			mapTypeId:	 google.maps.MapTypeId.ROADMAP
		});
		
		this.setupAutoComplete();
		
		// Add marker
		this.map.marker = new google.maps.Marker({
			draggable: true,
			raiseOnDrag: true,
			map: this.map
		});
		
		// Get the initial lat/lng/zoom,
		// falling back to defaults if we don't have one
		var lat = this.inputs.lat.value   || this.settings.lat,
			lng = this.inputs.lng.value   || this.settings.lng,
			zoom = this.inputs.zoom.value || this.settings.zoom;
		
		// Update the marker location & center the map
		this.update(lat, lng, false, true).center();
		
		// Update map to saved zoom
		this.map.setZoom(parseInt(zoom));
		
		// When the marker is dropped
		google.maps.event.addListener(this.map.marker, 'dragend', function () {
			self.sync(true);
		});
		
		// When map is clicked
		google.maps.event.addListener(this.map, 'click', function (e) {
			
			var lat = e.latLng.lat(),
				lng = e.latLng.lng();
			
			self.update(lat, lng).sync();
		});
		
		// When the zoom is changed
		google.maps.event.addListener(this.map, 'zoom_changed', function () {
			var zoom = this.getZoom();
			
			self.updateZoom(zoom).center();
		});
	};
	
	/**
	 * Setup the auto-complete!
	 */
	SimpleMap.prototype.setupAutoComplete = function () {
		if (!this.setup) {
			this.setup = true;
			this.formatBoundary();
		}
		if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
		var self = this;
		
		// Setup address search
		var opts = {};
		
		if (this.settings.country !== '')
			opts.componentRestrictions = {country: this.settings.country};
		
		if (this.settings.type !== '')
			opts.types = [this.settings.type];
		
		if (this.settings.boundary !== '')
			opts.bounds = this.settings.boundary;
		
		var autocomplete =
			new google.maps.places.Autocomplete(this.address, opts);
		
		if (!this.settings.hideMap) {
			autocomplete.map = this.map;
			autocomplete.bindTo('bounds', this.map);
		}
		
		// Update map on paste
		this.address.addEventListener('paste', function () {
			setTimeout(function () {
				google.maps.event.trigger(autocomplete, 'place_changed');
			}, 1);
		});
		
		this.address.addEventListener('input', function () {
			if (this.value === '') self.clear();
		});
		
		// When the auto-complete place changes
		google.maps.event.addListener(autocomplete, 'place_changed', function () {
			var address = self.address.value, lat, lng;
			
			self.updateByAddress = true;
			
			// If we have a place
			var place = this.getPlace();
			
			if (place && place.geometry) {
				lat = place.geometry.location.lat();
				lng = place.geometry.location.lng();
				
				self.update(lat, lng).sync().center();
				
				return;
			}
			
			// If the client hit enter, search
			self.geo(address, function (loc) {
				var lat = loc.geometry.location.lat(),
					lng = loc.geometry.location.lng();
				
				self.update(lat, lng).sync().center();
			});
			
		});
	};
	
	/**
	 * Updates the maps location when the Lat/Lng fields change
	 */
	SimpleMap.prototype.onLatLngChange = function () {
		var lat = this.inputs.lat.value,
			lng = this.inputs.lng.value;
		
		this.update(lat, lng, false, true);
		this.center();
	};
	
	/**
	 * Update the map location
	 *
	 * @param {float|Number} lat - Latitude
	 * @param {float|Number} lng - Longitude
	 * @param {boolean=} leaveMarker - Leave the marker in it's old position
	 * @param {boolean=} leaveFields - Leave the lat/lng fields with their old
	 *     values
	 *
	 * @return {SimpleMap}
	 */
	SimpleMap.prototype.update = function (lat, lng, leaveMarker, leaveFields) {
		var latLng = new google.maps.LatLng(lat, lng);
		
		if (!leaveFields) {
			this.inputs.lat.value = lat;
			this.inputs.lng.value = lng;
		}
		
		if (!leaveMarker && !this.settings.hideMap) {
			this.map.marker.setPosition(latLng);
			this.map.marker.setVisible(true);
		}
		
		return this;
	};
	
	/**
	 * Update the zoom input
	 *
	 * @param {number} zoom - Zoom level
	 * @return {SimpleMap}
	 */
	SimpleMap.prototype.updateZoom = function (zoom) {
		this.inputs.zoom.value = zoom;
		
		return this;
	};
	
	/**
	 * Center the map around the marker
	 *
	 * @return {SimpleMap}
	 */
	SimpleMap.prototype.center = function () {
		if (this.settings.hideMap) return this;
		
		this.map.setCenter(this.map.marker.getPosition());
		
		return this;
	};
	
	/**
	 * Sync the hidden fields to the maps location
	 *
	 * @param {boolean=} update - Update the map
	 * @return {SimpleMap}
	 */
	SimpleMap.prototype.sync = function (update) {
		var self = this,
			pos = this.settings.hideMap
				? new google.maps.LatLng(this.inputs.lat.value, this.inputs.lng.value)
				: this.map.marker.getPosition();
		
		if (!this.updateByAddress) {
			// Update address / lat / lng based off marker location
			this.geo(pos, function (loc) {
				// if loc, set address to formatted_location, else to position
				var address =
					loc ? loc.formatted_address : pos.lat() + ", " + pos.lng();
				
				// update address value
				self.address.value = address;
			});
		}
		
		this.updateByAddress = false;
		
		if (update) return this.update(pos.lat(), pos.lng(), true);
		return this;
	};
	
	/**
	 * Get GeoCode data from a LatLng
	 *
	 * @param {google.maps.LatLng|string} latLng - The location to search
	 * @param {SimpleMap~geoCallback} callback
	 * @param {number=} tryNumber
	 */
	SimpleMap.prototype.geo = function (latLng, callback, tryNumber) {
		if (typeof tryNumber === typeof undefined)
			tryNumber = 0;
		
		var attr = {'latLng': latLng},
			self = this;
		if (!latLng.lat) attr = {'address': latLng};
		
		this.geocoder.geocode(attr, function (results, status) {
			var loc;
			
			// if location available, set loc to first result
			if (status === google.maps.GeocoderStatus.OK) {
				loc = results[0];
				
				// if zero_results, set loc to false
			} else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
				loc = false;
				
				// if over_query_limit, wait and try again
			} else if (
				status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT &&
				tryNumber <= 5
			) {
				setTimeout(function () {
					self.geo(latLng, callback, tryNumber + 1);
				}, 1000);
				
				// else return error message
			} else {
				SimpleMap.Fail('Geocoder failed as a result of ' + status);
				return;
			}
			
			callback(loc);
		});
	};
	
	/**
	 * Clears the map
	 */
	SimpleMap.prototype.clear = function () {
		this.inputs.lat.value = '';
		this.inputs.lng.value = '';
		this.inputs.zoom.value = '';
		this.address.value = '';
	};
	
	/**
	 * The SimpleMap.prototype.geo callback
	 *
	 * @callback SimpleMap~geoCallback
	 * @param {object|boolean} loc - The found location
	 */
	
	window.SimpleMap = SimpleMap;
})(window);