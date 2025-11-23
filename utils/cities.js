// Ethiopian Cities with coordinates (latitude, longitude)
// Coordinates are approximate and based on common mapping services
const cities = {
  'Addis Ababa': { lat: 9.1450, lon: 38.7667, name: 'Addis Ababa' },
  'Dire Dawa': { lat: 9.6009, lon: 41.8501, name: 'Dire Dawa' },
  'Mekelle': { lat: 13.4969, lon: 39.4753, name: 'Mekelle' },
  'Adama': { lat: 8.5500, lon: 39.2667, name: 'Adama' },
  'Awassa': { lat: 7.0500, lon: 38.4667, name: 'Awassa' },
  'Bahir Dar': { lat: 11.6000, lon: 37.3833, name: 'Bahir Dar' },
  'Gonder': { lat: 12.6000, lon: 37.4667, name: 'Gonder' },
  'Dessie': { lat: 11.1333, lon: 39.6333, name: 'Dessie' },
  'Jimma': { lat: 7.6667, lon: 36.8333, name: 'Jimma' },
  'Jijiga': { lat: 9.3500, lon: 42.8000, name: 'Jijiga' },
  'Shashamane': { lat: 7.2000, lon: 38.6000, name: 'Shashamane' },
  'Bishoftu': { lat: 8.7500, lon: 38.9833, name: 'Bishoftu' },
  'Sodo': { lat: 6.8667, lon: 37.7667, name: 'Sodo' },
  'Arba Minch': { lat: 6.0333, lon: 37.5500, name: 'Arba Minch' },
  'Hosaena': { lat: 7.5500, lon: 37.8500, name: 'Hosaena' },
  'Harar': { lat: 9.3167, lon: 42.1167, name: 'Harar' },
  'Dilla': { lat: 6.4167, lon: 38.3167, name: 'Dilla' },
  'Nekemte': { lat: 9.0833, lon: 36.5500, name: 'Nekemte' },
  'Debre Birhan': { lat: 9.6833, lon: 39.5333, name: 'Debre Birhan' },
  'Asella': { lat: 7.9500, lon: 39.1167, name: 'Asella' },
  'Debre Mark\'os': { lat: 10.3500, lon: 37.7333, name: 'Debre Mark\'os' },
  'Kombolcha': { lat: 11.0833, lon: 39.7333, name: 'Kombolcha' },
  'Debre Tabor': { lat: 11.8500, lon: 38.0167, name: 'Debre Tabor' },
  'Adigrat': { lat: 14.2833, lon: 39.4667, name: 'Adigrat' },
  'Areka': { lat: 7.0667, lon: 37.7000, name: 'Areka' },
  'Weldiya': { lat: 11.8167, lon: 39.6000, name: 'Weldiya' },
  'Sebeta': { lat: 8.9167, lon: 38.6167, name: 'Sebeta' },
  'Burayu': { lat: 9.0833, lon: 38.6667, name: 'Burayu' },
  'Shire': { lat: 14.1000, lon: 38.2833, name: 'Shire' },
  'Ambo': { lat: 8.9833, lon: 37.8500, name: 'Ambo' },
  'Arsi Negele': { lat: 7.3333, lon: 38.9167, name: 'Arsi Negele' },
  'Aksum': { lat: 14.1167, lon: 38.7167, name: 'Aksum' },
  'Gambela': { lat: 8.2500, lon: 34.5833, name: 'Gambela' },
  'Bale Robe': { lat: 7.1333, lon: 40.0000, name: 'Bale Robe' },
  'Butajira': { lat: 8.1167, lon: 38.3667, name: 'Butajira' },
  'Batu': { lat: 8.0167, lon: 38.3000, name: 'Batu' },
  'Boditi': { lat: 6.9667, lon: 37.8667, name: 'Boditi' },
  'Adwa': { lat: 14.1667, lon: 38.9000, name: 'Adwa' },
  'Yirgalem': { lat: 6.7500, lon: 38.4167, name: 'Yirgalem' },
  'Waliso': { lat: 8.5333, lon: 37.9667, name: 'Waliso' },
  'Welkite': { lat: 8.2833, lon: 37.7833, name: 'Welkite' },
  'Gode': { lat: 5.9500, lon: 43.4500, name: 'Gode' },
  'Meki': { lat: 8.3000, lon: 38.8833, name: 'Meki' },
  'Negele Borana': { lat: 5.3333, lon: 39.5833, name: 'Negele Borana' },
  'Alaba Kulito': { lat: 7.0500, lon: 38.0833, name: 'Alaba Kulito' },
  'Alamata': { lat: 12.4333, lon: 39.5500, name: 'Alamata' },
  'Chiro': { lat: 8.7833, lon: 40.7000, name: 'Chiro' },
  'Tepi': { lat: 7.2000, lon: 35.4333, name: 'Tepi' },
  'Durame': { lat: 6.9833, lon: 37.7000, name: 'Durame' },
  'Goba': { lat: 7.0167, lon: 39.9833, name: 'Goba' },
  'Assosa': { lat: 10.0667, lon: 34.5333, name: 'Assosa' },
  'Gimbi': { lat: 9.1667, lon: 35.8333, name: 'Gimbi' },
  'Wukro': { lat: 13.7833, lon: 39.6000, name: 'Wukro' },
  'Haramaya': { lat: 9.4167, lon: 42.0000, name: 'Haramaya' },
  'Mizan Teferi': { lat: 6.9833, lon: 35.5833, name: 'Mizan Teferi' },
  'Sawla': { lat: 6.2833, lon: 36.8167, name: 'Sawla' },
  'Mojo': { lat: 8.5833, lon: 39.1167, name: 'Mojo' },
  'Dembi Dolo': { lat: 8.5333, lon: 34.8000, name: 'Dembi Dolo' },
  'Aleta Wendo': { lat: 6.6000, lon: 38.4167, name: 'Aleta Wendo' },
  'Metu': { lat: 8.3000, lon: 35.5833, name: 'Metu' },
  'Mota': { lat: 11.0833, lon: 37.8667, name: 'Mota' },
  'Fiche': { lat: 9.8000, lon: 38.7333, name: 'Fiche' },
  'Finote Selam': { lat: 10.7000, lon: 37.2667, name: 'Finote Selam' },
  'Bule Hora Town': { lat: 5.7500, lon: 38.2500, name: 'Bule Hora Town' },
  'Bonga': { lat: 7.2667, lon: 36.2333, name: 'Bonga' },
  'Kobo': { lat: 12.1500, lon: 39.6333, name: 'Kobo' },
  'Jinka': { lat: 5.6500, lon: 36.6500, name: 'Jinka' },
  'Dangila': { lat: 11.2667, lon: 36.8333, name: 'Dangila' },
  'Degehabur': { lat: 8.2167, lon: 43.5667, name: 'Degehabur' },
  'Bedessa': { lat: 8.9000, lon: 40.7833, name: 'Bedessa' },
  'Agaro': { lat: 7.8500, lon: 36.6500, name: 'Agaro' }
};

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance); // Round to nearest kilometer
}

// Get distance between two cities
function getDistance(city1, city2) {
  const city1Data = cities[city1];
  const city2Data = cities[city2];
  
  if (!city1Data || !city2Data) {
    return null; // City not found
  }
  
  if (city1 === city2) {
    return 0;
  }
  
  return calculateDistance(
    city1Data.lat,
    city1Data.lon,
    city2Data.lat,
    city2Data.lon
  );
}

// Get all cities as an array
function getAllCities() {
  return Object.keys(cities).sort();
}

// Check if city exists
function cityExists(cityName) {
  return cities.hasOwnProperty(cityName);
}

// Get city data
function getCityData(cityName) {
  return cities[cityName] || null;
}

module.exports = {
  cities,
  getDistance,
  getAllCities,
  cityExists,
  getCityData,
  calculateDistance
};

