'use client';

import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

interface LocationMapProps {
  countryName: string;
  lat: number;
  lon: number;
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function LocationMap({ countryName, lat, lon }: LocationMapProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-gray-900 rounded-lg p-6 border-2 border-yellow-500/30 shadow-lg">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4 text-center">
          📍 Location: {countryName}
        </h3>
        
        <div className="relative">
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 200,
              center: [lon, lat]
            }}
            className="w-full h-96"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1F2937"
                    stroke="#4B5563"
                    strokeWidth={1}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#374151', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
            
            {/* Enhanced marker with better visibility */}
            <Marker coordinates={[lon, lat]}>
              <g>
                {/* Outer glow */}
                <circle r={8} fill="rgba(251, 191, 36, 0.3)" />
                {/* Main marker */}
                <circle r={6} fill="#FBBF24" stroke="#000" strokeWidth={2} />
                {/* Inner highlight */}
                <circle r={3} fill="#FCD34D" />
              </g>
            </Marker>
          </ComposableMap>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">
            Coordinates: {lat.toFixed(4)}, {lon.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
