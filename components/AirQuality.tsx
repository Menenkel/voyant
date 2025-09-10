'use client';

import React from 'react';

interface AirQualityData {
  pm10: number;
  pm2_5: number;
  carbon_monoxide: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  ozone: number;
  dust: number;
  uv_index: number;
  pm2_5_description: string;
  pm10_description: string;
  uv_index_description: string;
  ozone_description: string;
}

interface AirQualityProps {
  airQuality: AirQualityData | null;
  title?: string;
}

export default function AirQuality({ airQuality, title = "🌬️ Air Quality" }: AirQualityProps) {
  if (!airQuality) {
    return (
      <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg animate-fade-in">
        <h4 className="text-lg font-semibold text-black mb-4">{title}</h4>
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">❓</span>
            <div>
              <p className="text-black font-medium">Air Quality Data Unavailable</p>
              <p className="text-gray-600 text-sm">
                Air quality information is not available for this location.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getQualityColor = (value: number, type: string) => {
    if (type === 'pm2_5') {
      if (value <= 10) return 'text-green-600 bg-green-50 border-green-200';
      if (value <= 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      if (value <= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
      if (value <= 75) return 'text-red-600 bg-red-50 border-red-200';
      return 'text-purple-600 bg-purple-50 border-purple-200';
    }
    
    if (type === 'pm10') {
      if (value <= 20) return 'text-green-600 bg-green-50 border-green-200';
      if (value <= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      if (value <= 100) return 'text-orange-600 bg-orange-50 border-orange-200';
      if (value <= 150) return 'text-red-600 bg-red-50 border-red-200';
      return 'text-purple-600 bg-purple-50 border-purple-200';
    }
    
    if (type === 'uv_index') {
      if (value <= 2) return 'text-green-600 bg-green-50 border-green-200';
      if (value <= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      if (value <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
      if (value <= 10) return 'text-red-600 bg-red-50 border-red-200';
      return 'text-purple-600 bg-purple-50 border-purple-200';
    }
    
    if (type === 'ozone') {
      if (value <= 50) return 'text-green-600 bg-green-50 border-green-200';
      if (value <= 100) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      if (value <= 150) return 'text-orange-600 bg-orange-50 border-orange-200';
      if (value <= 200) return 'text-red-600 bg-red-50 border-red-200';
      return 'text-purple-600 bg-purple-50 border-purple-200';
    }
    
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getQualityIcon = (type: string) => {
    switch (type) {
      case 'pm2_5':
      case 'pm10':
        return '🌫️';
      case 'uv_index':
        return '☀️';
      case 'ozone':
        return '🌍';
      case 'carbon_monoxide':
        return '💨';
      case 'nitrogen_dioxide':
        return '🏭';
      case 'sulphur_dioxide':
        return '⚗️';
      case 'dust':
        return '🏜️';
      default:
        return '🌬️';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg animate-fade-in hover:shadow-xl transition-all duration-300">
      <h4 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
        <span className="animate-pulse">🌬️</span>
        <span>{title}</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PM2.5 */}
        <div 
          className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 cursor-help relative group ${getQualityColor(airQuality.pm2_5, 'pm2_5')}`}
          title="PM2.5 - Fine particles smaller than 2.5 micrometers. Normal: 0-10 μg/m³. Can penetrate deep into lungs and bloodstream, causing respiratory and cardiovascular problems."
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getQualityIcon('pm2_5')}</span>
            <span className="text-sm font-medium">PM2.5</span>
          </div>
          <p className="text-lg font-bold">{airQuality.pm2_5} μg/m³</p>
          <p className="text-xs leading-relaxed mt-1">{airQuality.pm2_5_description}</p>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
            <div className="font-semibold mb-1">PM2.5 (Fine Particles)</div>
            <div className="mb-1">Normal: 0-10 μg/m³</div>
            <div className="text-gray-300">Particles smaller than 2.5 micrometers. Can penetrate deep into lungs and bloodstream, causing respiratory and cardiovascular problems.</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* PM10 */}
        <div 
          className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 cursor-help relative group ${getQualityColor(airQuality.pm10, 'pm10')}`}
          title="PM10 - Coarse particles smaller than 10 micrometers. Normal: 0-20 μg/m³. Can irritate eyes, nose, and throat, and worsen respiratory conditions."
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getQualityIcon('pm10')}</span>
            <span className="text-sm font-medium">PM10</span>
          </div>
          <p className="text-lg font-bold">{airQuality.pm10} μg/m³</p>
          <p className="text-xs leading-relaxed mt-1">{airQuality.pm10_description}</p>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
            <div className="font-semibold mb-1">PM10 (Coarse Particles)</div>
            <div className="mb-1">Normal: 0-20 μg/m³</div>
            <div className="text-gray-300">Particles smaller than 10 micrometers. Can irritate eyes, nose, and throat, and worsen respiratory conditions like asthma.</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* UV Index */}
        <div 
          className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 cursor-help relative group ${getQualityColor(airQuality.uv_index, 'uv_index')}`}
          title="UV Index - Measures ultraviolet radiation from the sun. Normal: 0-2 (Low), 3-5 (Moderate), 6-7 (High), 8-10 (Very High), 11+ (Extreme). Higher values increase skin cancer risk."
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getQualityIcon('uv_index')}</span>
            <span className="text-sm font-medium">UV Index</span>
          </div>
          <p className="text-lg font-bold">{airQuality.uv_index}</p>
          <p className="text-xs leading-relaxed mt-1">{airQuality.uv_index_description}</p>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
            <div className="font-semibold mb-1">UV Index (Ultraviolet Radiation)</div>
            <div className="mb-1">Scale: 0-2 (Low), 3-5 (Moderate), 6-7 (High), 8-10 (Very High), 11+ (Extreme)</div>
            <div className="text-gray-300">Measures UV radiation from the sun. Higher values increase risk of skin cancer and sunburn. Use sunscreen and protective clothing.</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* Ozone */}
        <div 
          className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 cursor-help relative group ${getQualityColor(airQuality.ozone, 'ozone')}`}
          title="Ozone (O₃) - Ground-level ozone from vehicle emissions and industrial processes. Normal: 0-50 μg/m³. Can cause breathing problems and worsen asthma."
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getQualityIcon('ozone')}</span>
            <span className="text-sm font-medium">Ozone</span>
          </div>
          <p className="text-lg font-bold">{airQuality.ozone} μg/m³</p>
          <p className="text-xs leading-relaxed mt-1">{airQuality.ozone_description}</p>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
            <div className="font-semibold mb-1">Ozone (O₃)</div>
            <div className="mb-1">Normal: 0-50 μg/m³</div>
            <div className="text-gray-300">Ground-level ozone from vehicle emissions and industry. Can cause breathing problems, chest pain, and worsen asthma and other respiratory conditions.</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Additional Air Quality Metrics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div 
          className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-help relative group"
          title="Carbon Monoxide (CO) - Normal: 0-4 mg/m³ (0-4000 μg/m³). This colorless, odorless gas comes from incomplete combustion. High levels can cause headaches, dizziness, and in severe cases, death."
        >
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-sm">{getQualityIcon('carbon_monoxide')}</span>
            <span className="text-xs font-medium">CO</span>
          </div>
          <p className="text-sm font-bold">{airQuality.carbon_monoxide} μg/m³</p>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
            <div className="font-semibold mb-1">Carbon Monoxide (CO)</div>
            <div className="mb-1">Normal: 0-4 mg/m³ (0-4000 μg/m³)</div>
            <div className="text-gray-300">Colorless, odorless gas from incomplete combustion. High levels cause headaches, dizziness, and can be fatal.</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        <div 
          className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-help relative group"
          title="Nitrogen Dioxide (NO₂) - Normal: 0-40 μg/m³. A reddish-brown gas from vehicle emissions and industrial processes. Can irritate airways and worsen respiratory conditions."
        >
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-sm">{getQualityIcon('nitrogen_dioxide')}</span>
            <span className="text-xs font-medium">NO₂</span>
          </div>
          <p className="text-sm font-bold">{airQuality.nitrogen_dioxide} μg/m³</p>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
            <div className="font-semibold mb-1">Nitrogen Dioxide (NO₂)</div>
            <div className="mb-1">Normal: 0-40 μg/m³</div>
            <div className="text-gray-300">Reddish-brown gas from vehicles and industry. Irritates airways and worsens respiratory conditions like asthma.</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        <div 
          className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-help relative group"
          title="Sulfur Dioxide (SO₂) - Normal: 0-20 μg/m³. A colorless gas with a sharp smell from burning fossil fuels. Can cause breathing problems and acid rain."
        >
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-sm">{getQualityIcon('sulphur_dioxide')}</span>
            <span className="text-xs font-medium">SO₂</span>
          </div>
          <p className="text-sm font-bold">{airQuality.sulphur_dioxide} μg/m³</p>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
            <div className="font-semibold mb-1">Sulfur Dioxide (SO₂)</div>
            <div className="mb-1">Normal: 0-20 μg/m³</div>
            <div className="text-gray-300">Colorless gas with sharp smell from burning fossil fuels. Causes breathing problems and contributes to acid rain.</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        <div 
          className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-help relative group"
          title="Dust Particles - Normal: 0-50 μg/m³. Fine particles from soil, construction, and natural sources. Can penetrate deep into lungs and cause respiratory issues."
        >
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-sm">{getQualityIcon('dust')}</span>
            <span className="text-xs font-medium">Dust</span>
          </div>
          <p className="text-sm font-bold">{airQuality.dust} μg/m³</p>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
            <div className="font-semibold mb-1">Dust Particles</div>
            <div className="mb-1">Normal: 0-50 μg/m³</div>
            <div className="text-gray-300">Fine particles from soil, construction, and natural sources. Can penetrate deep into lungs and cause respiratory issues.</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Air Quality Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
        <p className="text-xs text-blue-800">
          <span className="font-medium">ℹ️ Air Quality Information:</span> These measurements are based on real-time data and may vary throughout the day. 
          For health-sensitive individuals, consider checking local air quality services for the most current information.
        </p>
      </div>
    </div>
  );
}
