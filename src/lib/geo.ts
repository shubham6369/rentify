/**
 * Geolocation and Distance Utilities for Rentify
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CityCoordinate {
  name: string;
  latitude: number;
  longitude: number;
}

export const KNOWN_CITIES: CityCoordinate[] = [
  { name: 'Jaunpur', latitude: 25.7464, longitude: 82.6837 },
  { name: 'Varanasi', latitude: 25.3176, longitude: 82.9739 },
  { name: 'Lucknow', latitude: 26.8467, longitude: 80.9462 },
  { name: 'Mariyahu', latitude: 25.6021, longitude: 82.6105 },
  { name: 'Prayagraj', latitude: 25.4358, longitude: 81.8463 },
  { name: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
  { name: 'Bangalore', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Pune', latitude: 18.5204, longitude: 73.8567 }
];

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Finds the closest city among known locations given a coordinate
 */
export function findClosestCity(lat: number, lon: number): { city: CityCoordinate; distanceKm: number } {
  let closest = KNOWN_CITIES[0];
  let minDistance = calculateDistanceKm(lat, lon, closest.latitude, closest.longitude);

  for (let i = 1; i < KNOWN_CITIES.length; i++) {
    const dist = calculateDistanceKm(lat, lon, KNOWN_CITIES[i].latitude, KNOWN_CITIES[i].longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = KNOWN_CITIES[i];
    }
  }

  return { city: closest, distanceKm: minDistance };
}
