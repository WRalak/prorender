const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxDirections = require('@mapbox/mapbox-sdk/services/directions');
const mbxStatic = require('@mapbox/mapbox-sdk/services/static');

// Initialize Mapbox client
const mapboxClient = mbxGeocoding({ accessToken: process.env.MAPBOX_ACCESS_TOKEN });

// Geocoding - Convert address to coordinates
const geocodeAddress = async (address) => {
  try {
    const response = await mapboxClient.forwardGeocode({
      query: address,
      limit: 1,
      countries: ['us', 'ca'], // Limit to US and Canada
      types: ['address']
    }).send();

    if (response.body && response.body.features && response.body.features.length > 0) {
      const feature = response.body.features[0];
      return {
        success: true,
        coordinates: feature.center,
        address: feature.place_name,
        confidence: feature.relevance,
        context: feature.context
      };
    }

    return {
      success: false,
      message: 'Address not found'
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      message: 'Geocoding service unavailable'
    };
  }
};

// Reverse geocoding - Convert coordinates to address
const reverseGeocode = async (longitude, latitude) => {
  try {
    const response = await mapboxClient.reverseGeocode({
      query: [longitude, latitude],
      limit: 1,
      types: ['address']
    }).send();

    if (response.body && response.body.features && response.body.features.length > 0) {
      const feature = response.body.features[0];
      return {
        success: true,
        address: feature.place_name,
        coordinates: feature.center,
        context: feature.context
      };
    }

    return {
      success: false,
      message: 'Address not found for these coordinates'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      message: 'Reverse geocoding service unavailable'
    };
  }
};

// Get directions between two points
const getDirections = async (origin, destination, options = {}) => {
  try {
    const {
      profile = 'driving',
      alternatives = false,
      steps = false,
      geometries = 'geojson',
      overview = 'simplified'
    } = options;

    const response = await mbxDirections.getDirections({
      profile,
      waypoints: [
        { coordinates: origin },
        { coordinates: destination }
      ],
      alternatives,
      steps,
      geometries,
      overview,
      access_token: process.env.MAPBOX_ACCESS_TOKEN
    }).send();

    if (response.body && response.body.routes && response.body.routes.length > 0) {
      const route = response.body.routes[0];
      return {
        success: true,
        route: {
          distance: route.distance, // in meters
          duration: route.duration, // in seconds
          geometry: route.geometry,
          legs: route.legs
        }
      };
    }

    return {
      success: false,
      message: 'No route found between these locations'
    };
  } catch (error) {
    console.error('Directions error:', error);
    return {
      success: false,
      message: 'Directions service unavailable'
    };
  }
};

// Search for places
const searchPlaces = async (query, options = {}) => {
  try {
    const {
      proximity = null,
      bbox = null,
      country = 'us',
      types = null,
      limit = 10
    } = options;

    const searchParams = {
      query,
      limit,
      countries: [country]
    };

    if (proximity) {
      searchParams.proximity = proximity;
    }

    if (bbox) {
      searchParams.bbox = bbox;
    }

    if (types) {
      searchParams.types = types;
    }

    const response = await mapboxClient.forwardGeocode(searchParams).send();

    if (response.body && response.body.features) {
      return {
        success: true,
        places: response.body.features.map(feature => ({
          id: feature.id,
          name: feature.text,
          place_name: feature.place_name,
          coordinates: feature.center,
          relevance: feature.relevance,
          type: feature.place_type[0],
          context: feature.context
        }))
      };
    }

    return {
      success: false,
      places: [],
      message: 'No places found'
    };
  } catch (error) {
    console.error('Place search error:', error);
    return {
      success: false,
      places: [],
      message: 'Place search service unavailable'
    };
  }
};

// Generate static map image
const generateStaticMap = async (options) => {
  try {
    const {
      coordinates = [0, 0],
      zoom = 12,
      width = 600,
      height = 400,
      style = 'mapbox/streets-v11',
      markers = [],
      layers = [],
      overlay = null,
      pitch = 0,
      bearing = 0
    } = options;

    const staticParams = {
      ownerId: 'mapbox',
      styleId: style,
      width,
      height,
      position: `${coordinates[0]},${coordinates[1]}`,
      zoom,
      pitch,
      bearing,
      access_token: process.env.MAPBOX_ACCESS_TOKEN
    };

    // Add markers
    if (markers.length > 0) {
      staticParams.markers = markers.map(marker => {
        const markerStr = [];
        if (marker.coordinates) {
          markerStr.push(marker.coordinates.join(','));
        }
        if (marker.size) markerStr.push(marker.size);
        if (marker.color) markerStr.push(marker.color);
        if (marker.symbol) markerStr.push(marker.symbol);
        return markerStr.join(',');
      }).join('|');
    }

    // Add layers
    if (layers.length > 0) {
      staticParams.layers = layers.join('|');
    }

    // Add overlay
    if (overlay) {
      staticParams.overlay = overlay;
    }

    const response = await mbxStatic.getStaticImage(staticParams).send();

    return {
      success: true,
      imageUrl: response.url,
      options: staticParams
    };
  } catch (error) {
    console.error('Static map generation error:', error);
    return {
      success: false,
      message: 'Static map generation failed'
    };
  }
};

// Calculate distance between two coordinates
const calculateDistance = (coord1, coord2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1[1] * Math.PI / 180;
  const φ2 = coord2[1] * Math.PI / 180;
  const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180;
  const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Find nearby properties within radius
const findNearbyProperties = async (centerCoordinates, radiusKm, properties) => {
  try {
    const nearbyProperties = properties.filter(property => {
      if (!property.coordinates || !property.coordinates.length) {
        return false;
      }

      const distance = calculateDistance(
        centerCoordinates,
        property.coordinates
      );

      // Convert meters to kilometers
      const distanceKm = distance / 1000;
      return distanceKm <= radiusKm;
    });

    // Sort by distance
    nearbyProperties.sort((a, b) => {
      const distanceA = calculateDistance(centerCoordinates, a.coordinates);
      const distanceB = calculateDistance(centerCoordinates, b.coordinates);
      return distanceA - distanceB;
    });

    return {
      success: true,
      properties: nearbyProperties.map(property => ({
        ...property.toObject(),
        distance: calculateDistance(centerCoordinates, property.coordinates),
        distanceKm: calculateDistance(centerCoordinates, property.coordinates) / 1000
      }))
    };
  } catch (error) {
    console.error('Nearby properties search error:', error);
    return {
      success: false,
      properties: [],
      message: 'Failed to find nearby properties'
    };
  }
};

// Validate Mapbox configuration
const validateConfig = () => {
  if (!process.env.MAPBOX_ACCESS_TOKEN) {
    return {
      valid: false,
      message: 'MAPBOX_ACCESS_TOKEN environment variable is required'
    };
  }

  return { valid: true };
};

// Get map style URL
const getMapStyleUrl = (style = 'streets') => {
  const styles = {
    streets: 'mapbox/streets-v11',
    light: 'mapbox/light-v10',
    dark: 'mapbox/dark-v10',
    satellite: 'mapbox/satellite-v9',
    outdoors: 'mapbox/outdoors-v11'
  };

  return styles[style] || styles.streets;
};

// Format address from Mapbox context
const formatAddress = (context) => {
  if (!context || !Array.isArray(context)) {
    return '';
  }

  const addressParts = [];
  let street = '';
  let city = '';
  let state = '';
  let zip = '';
  let country = '';

  context.forEach(item => {
    if (item.id.startsWith('address')) {
      street = item.text;
    } else if (item.id.startsWith('place')) {
      city = item.text;
    } else if (item.id.startsWith('region')) {
      state = item.text;
    } else if (item.id.startsWith('postcode')) {
      zip = item.text;
    } else if (item.id.startsWith('country')) {
      country = item.text;
    }
  });

  if (street) addressParts.push(street);
  if (city) addressParts.push(city);
  if (state) addressParts.push(state);
  if (zip) addressParts.push(zip);

  return addressParts.join(', ');
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  getDirections,
  searchPlaces,
  generateStaticMap,
  calculateDistance,
  findNearbyProperties,
  validateConfig,
  getMapStyleUrl,
  formatAddress
};