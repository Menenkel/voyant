'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });
const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false });

interface CountryMapProps {
  searchQuery: string;
  secondDestination?: string;
  onCountrySelect: (country: string) => void;
}

export default function CountryMap({ searchQuery, secondDestination, onCountrySelect }: CountryMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);
  const [countryGeoJSON, setCountryGeoJSON] = useState<any>(null);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const mapRef = useRef<any>(null);

  // Country mapping with coordinates and boundary data
  const countryMapping: { [key: string]: { 
    iso: string; 
    coords: [number, number]; 
    region: string;
    name: string;
    boundaries: number[][][];
  } } = {
    'tokyo': { 
      iso: 'JPN', 
      coords: [35.6762, 139.6503], 
      region: 'japan', 
      name: 'Japan',
      boundaries: [[
        [129.0, 30.0], [146.0, 30.0], [146.0, 46.0], [129.0, 46.0], [129.0, 30.0]
      ]]
    },
    'japan': { 
      iso: 'JPN', 
      coords: [35.6762, 139.6503], 
      region: 'japan', 
      name: 'Japan',
      boundaries: [[
        [129.0, 30.0], [146.0, 30.0], [146.0, 46.0], [129.0, 46.0], [129.0, 30.0]
      ]]
    },
    'new york': { 
      iso: 'USA', 
      coords: [40.7128, -74.0060], 
      region: 'usa', 
      name: 'United States',
      boundaries: [[
        [-125.0, 25.0], [-65.0, 25.0], [-65.0, 50.0], [-125.0, 50.0], [-125.0, 25.0]
      ]]
    },
    'usa': { 
      iso: 'USA', 
      coords: [39.8283, -98.5795], 
      region: 'usa', 
      name: 'United States',
      boundaries: [[
        [-125.0, 25.0], [-65.0, 25.0], [-65.0, 50.0], [-125.0, 50.0], [-125.0, 25.0]
      ]]
    },
    'united states': { 
      iso: 'USA', 
      coords: [39.8283, -98.5795], 
      region: 'usa', 
      name: 'United States',
      boundaries: [[
        [-125.0, 25.0], [-65.0, 25.0], [-65.0, 50.0], [-125.0, 50.0], [-125.0, 25.0]
      ]]
    },
    'london': { 
      iso: 'GBR', 
      coords: [51.5074, -0.1278], 
      region: 'uk', 
      name: 'United Kingdom',
      boundaries: [[
        [-8.0, 49.0], [2.0, 49.0], [2.0, 61.0], [-8.0, 61.0], [-8.0, 49.0]
      ]]
    },
    'uk': { 
      iso: 'GBR', 
      coords: [51.5074, -0.1278], 
      region: 'uk', 
      name: 'United Kingdom',
      boundaries: [[
        [-8.0, 49.0], [2.0, 49.0], [2.0, 61.0], [-8.0, 61.0], [-8.0, 49.0]
      ]]
    },
    'united kingdom': { 
      iso: 'GBR', 
      coords: [51.5074, -0.1278], 
      region: 'uk', 
      name: 'United Kingdom',
      boundaries: [[
        [-8.0, 49.0], [2.0, 49.0], [2.0, 61.0], [-8.0, 61.0], [-8.0, 49.0]
      ]]
    },
    'paris': { 
      iso: 'FRA', 
      coords: [48.8566, 2.3522], 
      region: 'france', 
      name: 'France',
      boundaries: [[
        [-5.0, 41.0], [10.0, 41.0], [10.0, 51.0], [-5.0, 51.0], [-5.0, 41.0]
      ]]
    },
    'france': { 
      iso: 'FRA', 
      coords: [48.8566, 2.3522], 
      region: 'france', 
      name: 'France',
      boundaries: [[
        [-5.0, 41.0], [10.0, 41.0], [10.0, 51.0], [-5.0, 51.0], [-5.0, 41.0]
      ]]
    },
    'berlin': { 
      iso: 'DEU', 
      coords: [52.5200, 13.4050], 
      region: 'germany', 
      name: 'Germany',
      boundaries: [[
        [6.0, 47.0], [15.0, 47.0], [15.0, 55.0], [6.0, 55.0], [6.0, 47.0]
      ]]
    },
    'germany': { 
      iso: 'DEU', 
      coords: [52.5200, 13.4050], 
      region: 'germany', 
      name: 'Germany',
      boundaries: [[
        [6.0, 47.0], [15.0, 47.0], [15.0, 55.0], [6.0, 55.0], [6.0, 47.0]
      ]]
    },
    'rome': { 
      iso: 'ITA', 
      coords: [41.9028, 12.4964], 
      region: 'italy', 
      name: 'Italy',
      boundaries: [[
        [6.0, 36.0], [18.0, 36.0], [18.0, 47.0], [6.0, 47.0], [6.0, 36.0]
      ]]
    },
    'italy': { 
      iso: 'ITA', 
      coords: [41.9028, 12.4964], 
      region: 'italy', 
      name: 'Italy',
      boundaries: [[
        [6.0, 36.0], [18.0, 36.0], [18.0, 47.0], [6.0, 47.0], [6.0, 36.0]
      ]]
    },
    'madrid': { 
      iso: 'ESP', 
      coords: [40.4168, -3.7038], 
      region: 'spain', 
      name: 'Spain',
      boundaries: [[
        [-10.0, 36.0], [5.0, 36.0], [5.0, 44.0], [-10.0, 44.0], [-10.0, 36.0]
      ]]
    },
    'spain': { 
      iso: 'ESP', 
      coords: [40.4168, -3.7038], 
      region: 'spain', 
      name: 'Spain',
      boundaries: [[
        [-10.0, 36.0], [5.0, 36.0], [5.0, 44.0], [-10.0, 44.0], [-10.0, 36.0]
      ]]
    },
    'moscow': { 
      iso: 'RUS', 
      coords: [55.7558, 37.6176], 
      region: 'russia', 
      name: 'Russia',
      boundaries: [[
        [20.0, 41.0], [190.0, 41.0], [190.0, 82.0], [20.0, 82.0], [20.0, 41.0]
      ]]
    },
    'russia': { 
      iso: 'RUS', 
      coords: [55.7558, 37.6176], 
      region: 'russia', 
      name: 'Russia',
      boundaries: [[
        [20.0, 41.0], [190.0, 41.0], [190.0, 82.0], [20.0, 82.0], [20.0, 41.0]
      ]]
    },
    'beijing': { 
      iso: 'CHN', 
      coords: [39.9042, 116.4074], 
      region: 'china', 
      name: 'China',
      boundaries: [[
        [73.0, 18.0], [135.0, 18.0], [135.0, 54.0], [73.0, 54.0], [73.0, 18.0]
      ]]
    },
    'china': { 
      iso: 'CHN', 
      coords: [39.9042, 116.4074], 
      region: 'china', 
      name: 'China',
      boundaries: [[
        [73.0, 18.0], [135.0, 18.0], [135.0, 54.0], [73.0, 54.0], [73.0, 18.0]
      ]]
    },
    'seoul': { 
      iso: 'KOR', 
      coords: [37.5665, 126.9780], 
      region: 'south-korea', 
      name: 'South Korea',
      boundaries: [[
        [124.0, 33.0], [132.0, 33.0], [132.0, 39.0], [124.0, 39.0], [124.0, 33.0]
      ]]
    },
    'south korea': { 
      iso: 'KOR', 
      coords: [37.5665, 126.9780], 
      region: 'south-korea', 
      name: 'South Korea',
      boundaries: [[
        [124.0, 33.0], [132.0, 33.0], [132.0, 39.0], [124.0, 39.0], [124.0, 33.0]
      ]]
    },
    'korea': { 
      iso: 'KOR', 
      coords: [37.5665, 126.9780], 
      region: 'south-korea', 
      name: 'South Korea',
      boundaries: [[
        [124.0, 33.0], [132.0, 33.0], [132.0, 39.0], [124.0, 39.0], [124.0, 33.0]
      ]]
    },
    'sydney': { 
      iso: 'AUS', 
      coords: [-33.8688, 151.2093], 
      region: 'australia', 
      name: 'Australia',
      boundaries: [[
        [113.0, -44.0], [154.0, -44.0], [154.0, -10.0], [113.0, -10.0], [113.0, -44.0]
      ]]
    },
    'australia': { 
      iso: 'AUS', 
      coords: [-33.8688, 151.2093], 
      region: 'australia', 
      name: 'Australia',
      boundaries: [[
        [113.0, -44.0], [154.0, -44.0], [154.0, -10.0], [113.0, -10.0], [113.0, -44.0]
      ]]
    },
    'toronto': { 
      iso: 'CAN', 
      coords: [43.6532, -79.3832], 
      region: 'canada', 
      name: 'Canada',
      boundaries: [[
        [-141.0, 42.0], [-52.0, 42.0], [-52.0, 84.0], [-141.0, 84.0], [-141.0, 42.0]
      ]]
    },
    'canada': { 
      iso: 'CAN', 
      coords: [43.6532, -79.3832], 
      region: 'canada', 
      name: 'Canada',
      boundaries: [[
        [-141.0, 42.0], [-52.0, 42.0], [-52.0, 84.0], [-141.0, 84.0], [-141.0, 42.0]
      ]]
    },
    'mexico city': { 
      iso: 'MEX', 
      coords: [19.4326, -99.1332], 
      region: 'mexico', 
      name: 'Mexico',
      boundaries: [[
        [-118.0, 14.0], [-86.0, 14.0], [-86.0, 33.0], [-118.0, 33.0], [-118.0, 14.0]
      ]]
    },
    'mexico': { 
      iso: 'MEX', 
      coords: [19.4326, -99.1332], 
      region: 'mexico', 
      name: 'Mexico',
      boundaries: [[
        [-118.0, 14.0], [-86.0, 14.0], [-86.0, 33.0], [-118.0, 33.0], [-118.0, 14.0]
      ]]
    },
    'rio de janeiro': { 
      iso: 'BRA', 
      coords: [-22.9068, -43.1729], 
      region: 'brazil', 
      name: 'Brazil',
      boundaries: [[
        [-74.0, -34.0], [-34.0, -34.0], [-34.0, 6.0], [-74.0, 6.0], [-74.0, -34.0]
      ]]
    },
    'brazil': { 
      iso: 'BRA', 
      coords: [-22.9068, -43.1729], 
      region: 'brazil', 
      name: 'Brazil',
      boundaries: [[
        [-74.0, -34.0], [-34.0, -34.0], [-34.0, 6.0], [-74.0, 6.0], [-74.0, -34.0]
      ]]
    },
    'mumbai': { 
      iso: 'IND', 
      coords: [19.0760, 72.8777], 
      region: 'india', 
      name: 'India',
      boundaries: [[
        [68.0, 8.0], [97.0, 8.0], [97.0, 37.0], [68.0, 37.0], [68.0, 8.0]
      ]]
    },
    'india': { 
      iso: 'IND', 
      coords: [19.0760, 72.8777], 
      region: 'india', 
      name: 'India',
      boundaries: [[
        [68.0, 8.0], [97.0, 8.0], [97.0, 37.0], [68.0, 37.0], [68.0, 8.0]
      ]]
    },
    'cairo': { 
      iso: 'EGY', 
      coords: [30.0444, 31.2357], 
      region: 'egypt', 
      name: 'Egypt',
      boundaries: [[
        [25.0, 22.0], [37.0, 22.0], [37.0, 32.0], [25.0, 32.0], [25.0, 22.0]
      ]]
    },
    'egypt': { 
      iso: 'EGY', 
      coords: [30.0444, 31.2357], 
      region: 'egypt', 
      name: 'Egypt',
      boundaries: [[
        [25.0, 22.0], [37.0, 22.0], [37.0, 32.0], [25.0, 32.0], [25.0, 22.0]
      ]]
    },
    'istanbul': { 
      iso: 'TUR', 
      coords: [41.0082, 28.9784], 
      region: 'turkey', 
      name: 'Turkey',
      boundaries: [[
        [26.0, 36.0], [45.0, 36.0], [45.0, 42.0], [26.0, 42.0], [26.0, 36.0]
      ]]
    },
    'turkey': { 
      iso: 'TUR', 
      coords: [41.0082, 28.9784], 
      region: 'turkey', 
      name: 'Turkey',
      boundaries: [[
        [26.0, 36.0], [45.0, 36.0], [45.0, 42.0], [26.0, 42.0], [26.0, 36.0]
      ]]
    },
    'singapore': { 
      iso: 'SGP', 
      coords: [1.3521, 103.8198], 
      region: 'singapore', 
      name: 'Singapore',
      boundaries: [[
        [103.6, 1.2], [104.0, 1.2], [104.0, 1.5], [103.6, 1.5], [103.6, 1.2]
      ]]
    },
    'dubai': { 
      iso: 'ARE', 
      coords: [25.2048, 55.2708], 
      region: 'uae', 
      name: 'United Arab Emirates',
      boundaries: [[
        [51.0, 22.0], [57.0, 22.0], [57.0, 27.0], [51.0, 27.0], [51.0, 22.0]
      ]]
    },
    'uae': { 
      iso: 'ARE', 
      coords: [25.2048, 55.2708], 
      region: 'uae', 
      name: 'United Arab Emirates',
      boundaries: [[
        [51.0, 22.0], [57.0, 22.0], [57.0, 27.0], [51.0, 27.0], [51.0, 22.0]
      ]]
    },
    'bangkok': { 
      iso: 'THA', 
      coords: [13.7563, 100.5018], 
      region: 'thailand', 
      name: 'Thailand',
      boundaries: [[
        [97.0, 6.0], [106.0, 6.0], [106.0, 21.0], [97.0, 21.0], [97.0, 6.0]
      ]]
    },
    'thailand': { 
      iso: 'THA', 
      coords: [13.7563, 100.5018], 
      region: 'thailand', 
      name: 'Thailand',
      boundaries: [[
        [97.0, 6.0], [106.0, 6.0], [106.0, 21.0], [97.0, 21.0], [97.0, 6.0]
      ]]
    },
    'amsterdam': { 
      iso: 'NLD', 
      coords: [52.3676, 4.9041], 
      region: 'netherlands', 
      name: 'Netherlands',
      boundaries: [[
        [3.0, 50.0], [8.0, 50.0], [8.0, 54.0], [3.0, 54.0], [3.0, 50.0]
      ]]
    },
    'netherlands': { 
      iso: 'NLD', 
      coords: [52.3676, 4.9041], 
      region: 'netherlands', 
      name: 'Netherlands',
      boundaries: [[
        [3.0, 50.0], [8.0, 50.0], [8.0, 54.0], [3.0, 54.0], [3.0, 50.0]
      ]]
    },
    'bogota': { 
      iso: 'COL', 
      coords: [4.7110, -74.0721], 
      region: 'colombia', 
      name: 'Colombia',
      boundaries: [[
        [-79.0, -5.0], [-66.0, -5.0], [-66.0, 14.0], [-79.0, 14.0], [-79.0, -5.0]
      ]]
    },
    'colombia': { 
      iso: 'COL', 
      coords: [4.7110, -74.0721], 
      region: 'colombia', 
      name: 'Colombia',
      boundaries: [[
        [-79.0, -5.0], [-66.0, -5.0], [-66.0, 14.0], [-79.0, 14.0], [-79.0, -5.0]
      ]]
    },
    'nairobi': { 
      iso: 'KEN', 
      coords: [-1.2921, 36.8219], 
      region: 'kenya', 
      name: 'Kenya',
      boundaries: [[
        [34.0, -5.0], [42.0, -5.0], [42.0, 5.0], [34.0, 5.0], [34.0, -5.0]
      ]]
    },
    'kenya': { 
      iso: 'KEN', 
      coords: [-1.2921, 36.8219], 
      region: 'kenya', 
      name: 'Kenya',
      boundaries: [[
        [34.0, -5.0], [42.0, -5.0], [42.0, 5.0], [34.0, 5.0], [34.0, -5.0]
      ]]
    },
    'lagos': { 
      iso: 'NGA', 
      coords: [6.5244, 3.3792], 
      region: 'nigeria', 
      name: 'Nigeria',
      boundaries: [[
        [3.0, 4.0], [15.0, 4.0], [15.0, 14.0], [3.0, 14.0], [3.0, 4.0]
      ]]
    },
    'nigeria': { 
      iso: 'NGA', 
      coords: [6.5244, 3.3792], 
      region: 'nigeria', 
      name: 'Nigeria',
      boundaries: [[
        [3.0, 4.0], [15.0, 4.0], [15.0, 14.0], [3.0, 14.0], [3.0, 4.0]
      ]]
    },
    'johannesburg': { 
      iso: 'ZAF', 
      coords: [-26.2041, 28.0473], 
      region: 'south-africa', 
      name: 'South Africa',
      boundaries: [[
        [16.0, -35.0], [33.0, -35.0], [33.0, -22.0], [16.0, -22.0], [16.0, -35.0]
      ]]
    },
    'south africa': { 
      iso: 'ZAF', 
      coords: [-26.2041, 28.0473], 
      region: 'south-africa', 
      name: 'South Africa',
      boundaries: [[
        [16.0, -35.0], [33.0, -35.0], [33.0, -22.0], [16.0, -22.0], [16.0, -35.0]
      ]]
    }
  };

  // Handle search query changes
  useEffect(() => {
    if (!searchQuery) {
      setHighlightedCountry(null);
      setCountryGeoJSON(null);
      return;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const countryData = countryMapping[normalizedQuery];

    console.log('Search query:', searchQuery);
    console.log('Normalized query:', normalizedQuery);
    console.log('Available countries:', Object.keys(countryMapping));
    console.log('Found country data:', countryData);

    if (countryData) {
      console.log('Found country data:', countryData);
      setHighlightedCountry(countryData.region);
      // No need to create GeoJSON since we're only showing a pin
      setCountryGeoJSON(null);
    } else {
      console.log('No country data found for:', searchQuery);
      setHighlightedCountry(null);
      setCountryGeoJSON(null);
    }
  }, [searchQuery]);

  // Set map as loaded after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mapLoaded) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-500/30 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-yellow-400">Location Map</h3>
        
        {/* Map Type Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white">Map Type:</span>
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setMapType('street')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                mapType === 'street'
                  ? 'bg-blue-500 text-white'
                  : 'text-white hover:text-yellow-400'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                mapType === 'satellite'
                  ? 'bg-blue-500 text-white'
                  : 'text-white hover:text-yellow-400'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative h-64 w-full bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          className="z-10"
        >
          {/* Street Map Layer */}
          {mapType === 'street' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          )}
          
          {/* Satellite Imagery Layer */}
          {mapType === 'satellite' && (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          
          {/* Location Markers */}
          {searchQuery && countryMapping[searchQuery.toLowerCase().trim()] && (
            <Marker 
              position={countryMapping[searchQuery.toLowerCase().trim()].coords}
              icon={L.divIcon({
                className: 'custom-pin',
                html: '<div style="background-color: #F59E0B; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup className="text-white">
                <div className="text-center text-white">
                  <strong className="text-white">{countryMapping[searchQuery.toLowerCase().trim()].name}</strong>
                  <br />
                  <span className="text-white">{searchQuery}</span>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Second Location Marker */}
          {secondDestination && countryMapping[secondDestination.toLowerCase().trim()] && (
            <Marker 
              position={countryMapping[secondDestination.toLowerCase().trim()].coords}
              icon={L.divIcon({
                className: 'custom-pin-second',
                html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup className="text-white">
                <div className="text-center text-white">
                  <strong className="text-white">{countryMapping[secondDestination.toLowerCase().trim()].name}</strong>
                  <br />
                  <span className="text-white">{secondDestination}</span>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/30 shadow-lg">
            {searchQuery 
              ? `📍 ${countryMapping[searchQuery.toLowerCase().trim()]?.name || searchQuery}` 
              : 'Search for a location'
            }
            {secondDestination && (
              <div className="mt-1 text-blue-400">
                🔵 {countryMapping[secondDestination.toLowerCase().trim()]?.name || secondDestination}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4 text-center">
        {searchQuery 
          ? `Showing location for: ${searchQuery}`
          : 'Search for a city or country to see it highlighted on the map'
        }
      </p>
    </div>
  );
}
