'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
// const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false });

interface CountryMapProps {
  searchQuery: string;
  secondDestination?: string;
  coordinates?: { lat: number; lng: number; cityName?: string };
  secondCoordinates?: { lat: number; lng: number; cityName?: string };
  onCountrySelect?: (country: string) => void;
}

export default function CountryMap({ searchQuery, secondDestination, coordinates, secondCoordinates, onCountrySelect }: CountryMapProps) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [secondCoords, setSecondCoords] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [secondLocationName, setSecondLocationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');
  const mapRef = useRef(null);

  // Set client state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use provided coordinates when available
  useEffect(() => {
    if (coordinates) {
      setCoords([coordinates.lat, coordinates.lng]);
      setLocationName(coordinates.cityName || searchQuery);
    }
  }, [coordinates, searchQuery]);

  useEffect(() => {
    if (secondCoordinates) {
      setSecondCoords([secondCoordinates.lat, secondCoordinates.lng]);
      setSecondLocationName(secondCoordinates.cityName || secondDestination || '');
    }
  }, [secondCoordinates, secondDestination]);

  // Fetch coordinates for search query
  const fetchCoords = async (query: string) => {
    if (!query.trim()) return null;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          name: data[0].display_name.split(',')[0]
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };


  // Update coordinates when search query changes
  useEffect(() => {
    const updateCoords = async () => {
      if (searchQuery.trim()) {
        setIsLoading(true);
        const result = await fetchCoords(searchQuery);
        if (result) {
          setCoords([result.lat, result.lon]);
          setLocationName(result.name);
        }
        setIsLoading(false);
      }
    };
    updateCoords();
  }, [searchQuery]);

  // Update second coordinates when second destination changes
  useEffect(() => {
    const updateSecondCoords = async () => {
      if (secondDestination && secondDestination.trim()) {
        const result = await fetchCoords(secondDestination);
        if (result) {
          setSecondCoords([result.lat, result.lon]);
          setSecondLocationName(result.name);
        }
      }
    };
    updateSecondCoords();
  }, [secondDestination]);

  // Calculate map center and zoom for locations
  const getMapCenter = () => {
    if (coords && secondCoords) {
      // Center between two locations
      return [
        (coords[0] + secondCoords[0]) / 2,
        (coords[1] + secondCoords[1]) / 2
      ] as [number, number];
    }
    
    // Single location - center on that location
    if (coords) {
      return coords;
    }
    
    // Default world center
    return [20, 0] as [number, number];
  };

  const getMapZoom = () => {
    if (coords && secondCoords) {
      // Calculate distance between two points
      const latDiff = Math.abs(coords[0] - secondCoords[0]);
      const lonDiff = Math.abs(coords[1] - secondCoords[1]);
      const maxDiff = Math.max(latDiff, lonDiff);
      
      // More granular zoom levels for two-city comparison
      if (maxDiff > 100) return 2;      // Very far apart (different continents)
      if (maxDiff > 50) return 3;       // Far apart (different countries/regions)
      if (maxDiff > 20) return 4;       // Medium distance (different states/provinces)
      if (maxDiff > 10) return 5;       // Close distance (same region)
      if (maxDiff > 5) return 6;        // Very close (same metropolitan area)
      return 7;                         // Same city area
    }
    
    // Single city zoom - zoom in closer to show city details
    if (coords) {
      return 12; // Good zoom level for city view
    }
    
    return 2; // Default world view
  };

  if (!isClient) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-yellow-400">Location Map</h3>
        <div className="flex items-center space-x-4">
          {/* Map Layer Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMapLayer('street')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                mapLayer === 'street'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Toner Lite
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                mapLayer === 'satellite'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Satellite
            </button>
          </div>
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative h-64 w-full bg-gray-700 rounded-lg overflow-hidden border border-gray-600">

        <MapContainer
          center={getMapCenter()}
          zoom={getMapZoom()}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          className="z-10"
          key={`${coords?.[0]}-${coords?.[1]}-${secondCoords?.[0]}-${secondCoords?.[1]}`}
        >
          {/* Street Map Layer - Stamen Toner Lite */}
          {mapLayer === 'street' && (
            <TileLayer
              url="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
              maxZoom={20}
            />
          )}
          
          {/* Satellite Map Layer */}
          {mapLayer === 'satellite' && (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          
          {/* First Location Marker */}
          {coords && (
            <Marker 
              position={coords}
              icon={typeof window !== 'undefined' && window.L ? window.L.divIcon({
                className: 'custom-pin',
                html: '<div style="background-color: #F59E0B; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              }) : undefined}
            >
              <Popup className="text-white">
                <div className="text-center text-white">
                  <strong className="text-white">{locationName}</strong>
                  <br />
                  <span className="text-white">{searchQuery}</span>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Second Location Marker */}
          {secondCoords && (
            <Marker 
              position={secondCoords}
              icon={typeof window !== 'undefined' && window.L ? window.L.divIcon({
                className: 'custom-pin-second',
                html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              }) : undefined}
            >
              <Popup className="text-white">
                <div className="text-center text-white">
                  <strong className="text-white">{secondLocationName}</strong>
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
            {coords 
              ? `📍 ${locationName || searchQuery}` 
              : 'Search for a location'
            }
            {secondCoords && (
              <div className="mt-1 text-blue-400">
                🔵 {secondLocationName || secondDestination}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4 text-center">
        {coords 
          ? `Showing location for: ${searchQuery}`
          : 'Search for a city or country to see it highlighted on the map'
        }
      </p>
    </div>
  );
}
