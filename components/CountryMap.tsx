'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Map } from 'leaflet';

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
// const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false });

// Import Leaflet and fix default markers
let L: any = null;
if (typeof window !== 'undefined') {
  import('leaflet').then((leaflet) => {
    L = leaflet.default;
    
    // Fix for default markers in react-leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  });
}

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
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');
  const mapRef = useRef<Map | null>(null);

  // Set client state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for Leaflet availability
  useEffect(() => {
    if (isClient) {
      let retryCount = 0;
      const maxRetries = 50; // 5 seconds max
      
      const checkLeaflet = () => {
        if (typeof window !== 'undefined' && (window.L || L)) {
          console.log('Leaflet is ready!');
          setIsLeafletReady(true);
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Leaflet not ready yet, retrying... (${retryCount}/${maxRetries})`);
          setTimeout(checkLeaflet, 100);
        } else {
          console.error('Leaflet failed to load after maximum retries');
          // Still set ready to true to show error state
          setIsLeafletReady(true);
        }
      };
      checkLeaflet();
    }
  }, [isClient]);

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


  // Update coordinates when search query changes (only if coordinates prop is not provided)
  useEffect(() => {
    const updateCoords = async () => {
      if (searchQuery.trim() && !coordinates) {
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
  }, [searchQuery, coordinates]);

  // Update second coordinates when second destination changes (only if secondCoordinates prop is not provided)
  useEffect(() => {
    const updateSecondCoords = async () => {
      if (secondDestination && secondDestination.trim() && !secondCoordinates) {
        const result = await fetchCoords(secondDestination);
        if (result) {
          setSecondCoords([result.lat, result.lon]);
          setSecondLocationName(result.name);
        }
      }
    };
    updateSecondCoords();
  }, [secondDestination, secondCoordinates]);

  // Update map view when coordinates change (with debounce to prevent rapid updates)
  useEffect(() => {
    if (mapRef.current && (coords || secondCoords)) {
      const map = mapRef.current;
      const center = getMapCenter();
      const zoom = getMapZoom();
      
      // Debounce map updates to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        // Use flyTo for smooth transition
        map.flyTo(center, zoom, {
          duration: 1.5,
          easeLinearity: 0.1
        });
      }, 100); // 100ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [coords, secondCoords]);

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
      // Calculate distance between two points using Haversine formula for more accurate distance
      const R = 6371; // Earth's radius in km
      const dLat = (secondCoords[0] - coords[0]) * Math.PI / 180;
      const dLon = (secondCoords[1] - coords[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(coords[0] * Math.PI / 180) * Math.cos(secondCoords[0] * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in km
      
      // Add buffer to ensure both cities are visible with padding (multiply by 1.5 for extra space)
      const bufferedDistance = distance * 1.5;
      
      // Zoom levels based on buffered distance to ensure both cities are visible with padding
      if (bufferedDistance > 15000) return 1;      // Very far apart (different continents) - world view
      if (bufferedDistance > 7500) return 1;       // Far apart (different countries/regions) - world view
      if (bufferedDistance > 3000) return 2;       // Medium distance (different states/provinces) - continental view
      if (bufferedDistance > 1500) return 3;       // Close distance (same region) - regional view
      if (bufferedDistance > 750) return 4;        // Very close (same metropolitan area) - country view
      if (bufferedDistance > 150) return 5;        // Same city area - state view
      return 6;                                    // Very close cities - regional view
    }
    
    // Single city zoom - zoom in closer to show city details
    if (coords) {
      return 12; // Good zoom level for city view
    }
    
    return 2; // Default world view
  };

  if (!isClient || !isLeafletReady) {
    return (
      <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-2 text-gray-600">
            {!isClient ? 'Initializing...' : 'Loading map...'}
          </span>
        </div>
      </div>
    );
  }

  // Additional safety check - ensure Leaflet is actually available
  if (typeof window === 'undefined' || (!window.L && !L)) {
    return (
      <div className="bg-white rounded-lg p-6 border-2 border-red-500 shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold mb-2">Map Error</p>
            <p className="text-sm">Leaflet not available</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering map with coords:', coords, 'secondCoords:', secondCoords);

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">Location Map</h3>
          <div className="flex items-center space-x-4">
            {/* Map Layer Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMapLayer('street')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 border ${
                  mapLayer === 'street'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                Cool view
              </button>
              <button
                onClick={() => setMapLayer('satellite')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 border ${
                  mapLayer === 'satellite'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                Satellite
              </button>
            </div>
            
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative h-64 w-full bg-white rounded-lg overflow-hidden border-2 border-black">
          {(() => {
            try {
              return (
                <MapContainer
                  center={getMapCenter()}
                  zoom={getMapZoom()}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                  className="z-10"
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
                      icon={(window.L || L) ? (window.L || L).divIcon({
                        className: 'custom-pin-primary',
                        html: '<div style="background-color: #F59E0B; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; border: 3px solid white; box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); transform: rotate(-45deg);"></div>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 24]
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
                      icon={(window.L || L) ? (window.L || L).divIcon({
                        className: 'custom-pin-secondary',
                        html: '<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; border: 3px solid white; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); transform: rotate(-45deg);"></div>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 24]
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
              );
            } catch (error) {
              console.error('MapContainer error:', error);
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="text-red-600 text-center">
                    <p className="text-lg font-semibold mb-2">Map Error</p>
                    <p className="text-sm">Failed to render map</p>
                  </div>
                </div>
              );
            }
          })()}
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-white/95 text-black px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm border-2 border-black shadow-lg">
            {coords 
              ? `📍 ${locationName || searchQuery}` 
              : 'Search for a location'
            }
            {secondCoords && (
              <div className="mt-1 text-blue-600">
                🔵 {secondLocationName || secondDestination}
              </div>
            )}
          </div>
        </div>
      </div>
        <p className="text-sm text-gray-600 mt-4 text-center">
          {coords 
            ? `Showing location for: ${searchQuery}`
            : 'Search for a city or country to see it highlighted on the map'
          }
        </p>
      </div>
    );
}
