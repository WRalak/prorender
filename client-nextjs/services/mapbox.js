class MapboxService {
  constructor() {
    this.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || '';
    this.baseURL = 'https://api.mapbox.com';
  }

  // Initialize Mapbox GL JS
  async initializeMap(container, options = {}) {
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    // Load Mapbox GL JS dynamically
    if (!window.mapboxgl) {
      await this.loadMapboxScript();
    }

    const map = new window.mapboxgl.Map({
      container,
      accessToken: this.accessToken,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40], // Default center (New York)
      zoom: 10,
      ...options,
    });

    return map;
  }

  // Load Mapbox GL JS script
  loadMapboxScript() {
    return new Promise((resolve, reject) => {
      if (window.mapboxgl) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;

      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';

      script.onload = () => {
        window.mapboxgl.accessToken = this.accessToken;
        resolve();
      };

      script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));

      document.head.appendChild(link);
      document.head.appendChild(script);
    });
  }

  // Geocoding - Convert address to coordinates
  async geocode(address, limit = 5) {
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    try {
      const response = await fetch(
        `${this.baseURL}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.accessToken}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      return data.features.map(feature => ({
        address: feature.place_name,
        coordinates: feature.center,
        placeType: feature.place_type[0],
        relevance: feature.relevance,
        context: feature.context || [],
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  // Reverse geocoding - Convert coordinates to address
  async reverseGeocode(coordinates) {
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    try {
      const [lng, lat] = coordinates;
      const response = await fetch(
        `${this.baseURL}/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const data = await response.json();
      
      if (data.features.length === 0) {
        return null;
      }

      const feature = data.features[0];
      return {
        address: feature.place_name,
        coordinates: feature.center,
        placeType: feature.place_type[0],
        context: feature.context || [],
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  // Search places
  async searchPlaces(query, proximity = null, types = null, limit = 10) {
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    const params = new URLSearchParams({
      access_token: this.accessToken,
      limit: limit.toString(),
    });

    if (proximity) {
      params.append('proximity', proximity.join(','));
    }

    if (types) {
      params.append('types', Array.isArray(types) ? types.join(',') : types);
    }

    try {
      const response = await fetch(
        `${this.baseURL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
      );

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();
      
      return data.features.map(feature => ({
        id: feature.id,
        address: feature.place_name,
        coordinates: feature.center,
        placeType: feature.place_type[0],
        relevance: feature.relevance,
        context: feature.context || [],
        bbox: feature.bbox,
      }));
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Get directions between two points
  async getDirections(origin, destination, profile = 'mapbox/driving', alternatives = false) {
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    const params = new URLSearchParams({
      access_token: this.accessToken,
      alternatives: alternatives.toString(),
      geometries: 'geojson',
      overview: 'full',
    });

    try {
      const response = await fetch(
        `${this.baseURL}/directions/v5/mapbox/${profile}/${origin.join(',')};${destination.join(',')}?${params}`
      );

      if (!response.ok) {
        throw new Error('Directions request failed');
      }

      const data = await response.json();
      
      return data.routes.map(route => ({
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        steps: route.legs[0].steps,
      }));
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
  }

  // Get isochrone (travel time area)
  async getIsochrone(coordinates, profile = 'mapbox/driving', minutes = 15, maxMinutes = 60) {
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    const params = new URLSearchParams({
      access_token: this.accessToken,
      contours_minutes: minutes.toString(),
      polygons: 'true',
    });

    try {
      const response = await fetch(
        `${this.baseURL}/isochrone/v1/mapbox/${profile}/${coordinates.join(',')}?${params}`
      );

      if (!response.ok) {
        throw new Error('Isochrone request failed');
      }

      const data = await response.json();
      
      return {
        type: 'FeatureCollection',
        features: data.features,
      };
    } catch (error) {
      console.error('Isochrone error:', error);
      throw error;
    }
  }

  // Get static map image
  getStaticMapUrl(options = {}) {
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    const {
      width = 600,
      height = 400,
      center = [-74.5, 40],
      zoom = 10,
      style = 'mapbox://styles/mapbox/streets-v12',
      markers = [],
      layers = [],
    } = options;

    let url = `${this.baseURL}/styles/v1/${style.replace('mapbox://styles/', '')}/static/`;
    
    // Add markers
    if (markers.length > 0) {
      const markerString = markers.map(marker => {
        const { coordinates, color = 'ff0000', size = 'm' } = marker;
        return `pin-${size}-${color}(${coordinates.join(',')})`;
      }).join(',');
      url += markerString;
    } else {
      url += center.join(',');
    }

    url += `/${zoom},0,${width}x${height}`;

    const params = new URLSearchParams({
      access_token: this.accessToken,
    });

    // Add layers
    if (layers.length > 0) {
      params.append('layers', layers.join(','));
    }

    return `${url}?${params.toString()}`;
  }

  // Calculate distance between two points
  calculateDistance(point1, point2, units = 'miles') {
    const R = units === 'kilometers' ? 6371 : 3959; // Earth radius in km or miles
    const dLat = this.toRadians(point2[1] - point1[1]);
    const dLon = this.toRadians(point2[0] - point1[0]);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1[1])) * Math.cos(this.toRadians(point2[1])) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      value: distance,
      unit: units,
      formatted: `${distance.toFixed(2)} ${units}`,
    };
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Format coordinates
  formatCoordinates(coordinates, precision = 6) {
    return coordinates.map(coord => Number(coord.toFixed(precision)));
  }

  // Validate coordinates
  validateCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return false;
    }

    const [lng, lat] = coordinates;
    return (
      typeof lng === 'number' && 
      typeof lat === 'number' && 
      lng >= -180 && 
      lng <= 180 && 
      lat >= -90 && 
      lat <= 90
    );
  }

  // Get bounds from coordinates
  getBounds(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return null;
    }

    const lngs = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);

    return [
      [Math.min(...lngs), Math.min(...lats)], // Southwest
      [Math.max(...lngs), Math.max(...lats)], // Northeast
    ];
  }

  // Check if point is within bounds
  isPointInBounds(point, bounds) {
    if (!bounds || bounds.length !== 2) {
      return false;
    }

    const [lng, lat] = point;
    const [[swLng, swLat], [neLng, neLat]] = bounds;

    return lng >= swLng && lng <= neLng && lat >= swLat && lat <= neLat;
  }

  // Get map style URL
  getStyleUrl(style = 'streets') {
    const styles = {
      streets: 'mapbox://styles/mapbox/streets-v12',
      outdoors: 'mapbox://styles/mapbox/outdoors-v12',
      light: 'mapbox://styles/mapbox/light-v11',
      dark: 'mapbox://styles/mapbox/dark-v11',
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
    };

    return styles[style] || styles.streets;
  }

  // Add marker to map
  addMarker(map, coordinates, options = {}) {
    if (!window.mapboxgl) {
      throw new Error('Mapbox GL JS not loaded');
    }

    const marker = new window.mapboxgl.Marker(options)
      .setLngLat(coordinates)
      .addTo(map);

    return marker;
  }

  // Add popup to map
  addPopup(map, coordinates, content, options = {}) {
    if (!window.mapboxgl) {
      throw new Error('Mapbox GL JS not loaded');
    }

    const popup = new window.mapboxgl.Popup(options)
      .setLngLat(coordinates)
      .setHTML(content)
      .addTo(map);

    return popup;
  }

  // Draw circle on map
  drawCircle(map, center, radiusInMeters, options = {}) {
    if (!window.mapboxgl) {
      throw new Error('Mapbox GL JS not loaded');
    }

    const coordinates = [];
    const numPoints = 64;
    const distancePerPoint = (2 * Math.PI) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const angle = i * distancePerPoint;
      const lat = center[1] + (radiusInMeters / 111320) * Math.cos(angle);
      const lng = center[0] + (radiusInMeters / (111320 * Math.cos(center[1] * Math.PI / 180))) * Math.sin(angle);
      coordinates.push([lng, lat]);
    }

    coordinates.push(coordinates[0]); // Close the circle

    if (map.getSource('circle-source')) {
      map.getSource('circle-source').setData({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      });
    } else {
      map.addSource('circle-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
        },
      });

      map.addLayer({
        id: 'circle-layer',
        type: 'fill',
        source: 'circle-source',
        layout: {},
        paint: {
          'fill-color': options.color || '#3b82f6',
          'fill-opacity': options.opacity || 0.3,
        },
      });
    }
  }
}

export default new MapboxService();