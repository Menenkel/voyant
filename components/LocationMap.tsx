'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  countryName: string;
  lat: number;
  lon: number;
}

export default function LocationMap({ countryName, lat, lon }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current).setView([lat, lon], 6);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker
    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<b>${countryName}</b><br>${lat.toFixed(4)}, ${lon.toFixed(4)}`);

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, countryName]);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg">
        <h3 className="text-lg font-semibold text-black mb-4 text-center">
          📍 Location: {countryName}
        </h3>
        
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg"
          style={{ zIndex: 1 }}
        />
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Coordinates: {lat.toFixed(4)}, {lon.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
