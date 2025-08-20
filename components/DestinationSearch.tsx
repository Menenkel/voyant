'use client';

import { useState, useEffect } from 'react';
import CountryMap from './CountryMap';

interface SearchHistory {
  destination: string;
  timestamp: number;
}

interface SearchResult {
  destination: string;
  supabaseData?: {
    country: string;
    ISO3: string;
    population_mio: number;
    global_peace_rank: number;
    population_electricity: number;
    inform_index: number;
    risk_class: string;
    global_rank: number;
    earthquake: number;
    river_flood: number;
    tsunami: number;
    tropical_storm: number;
    coastal_flood: number;
    drought: number;
    epidemic: number;
    projected_conflict: number;
    current_conflict: number;
    life_expectancy: number;
    gdp_per_capita_usd: number;
    number_of_earths: number;
    human_dev_index: number;
  };
  weatherData?: {
    location: string;
    forecast_date: string;
    temperature: number;
    precipitation: string;
    outlook: string;
  };
  seasonalClimate?: {
    period: string;
    temperature: {
      trend: string;
      average: number;
      min: number;
      max: number;
    };
    precipitation: {
      trend: string;
      average: number;
      days: number;
    };
  };
  waterQuality?: {
    safety_level: string;
    drinking_advice: string;
  };
  airQuality?: {
    aqi: number;
    status: string;
  };
}

export default function DestinationSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [secondDestination, setSecondDestination] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [secondResults, setSecondResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('travelRiskSearchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // Debug: Monitor results state changes
  useEffect(() => {
    console.log('Results state changed:', results);
    if (results) {
      console.log('Results destination:', results.destination);
      console.log('Results supabase data:', results.supabaseData);
    }
  }, [results]);

  const saveToHistory = (destination: string) => {
    const newHistory = [
      { destination, timestamp: Date.now() },
      ...searchHistory.filter(item => item.destination !== destination)
    ].slice(0, 10);
    
    setSearchHistory(newHistory);
    localStorage.setItem('travelRiskSearchHistory', JSON.stringify(newHistory));
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    console.log('handleSearch called with:', searchTerm);
    
    if (!searchTerm.trim()) {
      console.log('Search term is empty, returning');
      return;
    }

    console.log('Starting search for:', searchTerm);
    setIsSearching(true);
    setError('');
    setResults(null);
    setShowHistory(false);

    try {
      console.log('Making API call to:', `/api/search?destination=${encodeURIComponent(searchTerm)}`);
      const response = await fetch(`/api/search?destination=${encodeURIComponent(searchTerm)}&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      console.log('API response data:', JSON.stringify(data, null, 2));
      console.log('Setting results with:', data);
      setResults(data);
      console.log('Results state should now be updated');
      saveToHistory(searchTerm.trim());
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search destination. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleHistoryClick = (destination: string) => {
    setSearchQuery(destination);
    handleSearch(destination);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('travelRiskSearchHistory');
  };

  // Handle country selection from map
  const handleCountrySelect = (countryName: string) => {
    setSearchQuery(countryName);
    handleSearch(countryName);
  };

  // Handle second destination search
  const handleSecondSearch = async () => {
    if (!secondDestination.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`/api/search?destination=${encodeURIComponent(secondDestination)}&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSecondResults(data);
      saveToHistory(secondDestination.trim());
    } catch (err) {
      setError('Failed to search second destination. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Color coding for hazard values
  const getHazardColor = (value: number | undefined) => {
    if (value === undefined || value === null) return 'bg-gray-700';
    if (value <= 3) return 'bg-green-600/20 border border-green-500/30';
    if (value <= 6) return 'bg-orange-600/20 border border-orange-500/30';
    return 'bg-red-600/20 border border-red-500/30';
  };

  // Toggle comparison mode
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (compareMode) {
      setSecondResults(null);
      setSecondDestination('');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Search Section */}
      <div className="bg-gray-900 rounded-lg p-6 border-2 border-yellow-500/30 shadow-lg mb-8">
        
        {/* Search Animation */}
        {isSearching && (
          <div className="mb-6 text-center animate-fade-in">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
              <span className="text-yellow-400 font-medium">Searching for location...</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Analyzing risk data and gathering insights
            </div>
          </div>
        )}
        
        {/* Comparison Toggle */}
        <div className="mb-6 text-center">
          <button
            onClick={toggleCompareMode}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 comparison-toggle ${
              compareMode 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {compareMode ? '🔄 Single Search' : '⚖️ Compare Destinations'}
          </button>
          
          {compareMode && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 <strong>Comparison Mode:</strong> Search for two destinations to see them side by side with different colored markers on the map.
              </p>
              {results && secondResults && (
                <div className="mt-2 flex items-center justify-center space-x-4 text-sm">
                  <span className="text-yellow-400">📍 {results.destination}</span>
                  <span className="text-blue-400">🔵 {secondResults.destination}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`max-w-4xl mx-auto ${compareMode ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'max-w-lg'}`}>
          {/* First Destination */}
          <div className="relative">
            <label className="block text-left text-sm font-medium text-yellow-400 mb-2">
              {compareMode ? 'First Destination' : 'Search for any city or country'}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowHistory(true)}
                placeholder="Enter a city or country"
                className="flex-1 px-4 py-3 bg-gray-800 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
              />
              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-3 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </div>

          {/* Second Destination (Comparison Mode) */}
          {compareMode && (
            <div className="relative">
              <label className="block text-left text-sm font-medium text-blue-400 mb-2">
                Second Destination
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={secondDestination}
                  onChange={(e) => setSecondDestination(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSecondSearch()}
                  placeholder="Enter a city or country"
                  className="flex-1 px-4 py-3 bg-gray-800 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                />
                <button
                  onClick={() => handleSecondSearch()}
                  disabled={isSearching || !secondDestination.trim()}
                  className="px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Search
                </button>
              </div>
            </div>
          )}
        </div>
          
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Map Section */}
      <CountryMap 
        searchQuery={results?.destination || ''} 
        secondDestination={compareMode && secondResults ? secondResults.destination : undefined}
        onCountrySelect={handleCountrySelect}
      />

      {/* Results Display */}
      {results && (
        <div className={`space-y-6 ${compareMode && secondResults ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''}`}>
          {/* First Destination Results */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-yellow-400 text-center mb-6">
              {compareMode ? `${results.destination} - Country Data` : 'Country Data'}
            </h3>
            
            {/* Basic Information */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-yellow-400 mb-4">📋 Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Country:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.country}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">ISO Code:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.ISO3}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Population:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.population_mio?.toFixed(1)} million</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Life Expectancy:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.life_expectancy?.toFixed(1)} years</p>
                </div>
              </div>
            </div>

            {/* Economic Data */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-green-400 mb-4">💰 Economic Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">GDP Per Capita:</span>
                  <p className="text-white font-semibold">${results.supabaseData?.gdp_per_capita_usd?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Human Development Index:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.human_dev_index}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Electricity Access:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.population_electricity}%</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Ecological Footprint:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.number_of_earths} Earths</p>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-red-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-red-400 mb-4">⚠️ Risk Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Risk Class:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.risk_class}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">INFORM Index:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.inform_index}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Global Rank:</span>
                  <p className="text-white font-semibold">#{results.supabaseData?.global_rank}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Peace Index Rank:</span>
                  <p className="text-white font-semibold">#{results.supabaseData?.global_peace_rank}</p>
                </div>
              </div>
            </div>

            {/* Natural Hazards */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-orange-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-orange-400 mb-4">🌪️ Natural Hazards (0-10 Scale)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${getHazardColor(results.supabaseData?.earthquake)}`}>
                  <span className="text-gray-300 text-sm">Earthquake:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.earthquake}</p>
                </div>
                <div className={`p-4 rounded-lg ${getHazardColor(results.supabaseData?.river_flood)}`}>
                  <span className="text-gray-300 text-sm">River Flood:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.river_flood}</p>
                </div>
                <div className={`p-4 rounded-lg ${getHazardColor(results.supabaseData?.tsunami)}`}>
                  <span className="text-gray-300 text-sm">Tsunami:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.tsunami}</p>
                </div>
                <div className={`p-4 rounded-lg ${getHazardColor(results.supabaseData?.tropical_storm)}`}>
                  <span className="text-gray-300 text-sm">Tropical Storm:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.tropical_storm}</p>
                </div>
                <div className={`p-4 rounded-lg ${getHazardColor(results.supabaseData?.coastal_flood)}`}>
                  <span className="text-gray-300 text-sm">Coastal Flood:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.coastal_flood}</p>
                </div>
                <div className={`p-4 rounded-lg ${getHazardColor(results.supabaseData?.drought)}`}>
                  <span className="text-gray-300 text-sm">Drought:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.drought}</p>
                </div>
                <div className={`p-4 rounded-lg ${getHazardColor(results.supabaseData?.epidemic)}`}>
                  <span className="text-gray-300 text-sm">Epidemic:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.epidemic}</p>
                </div>
                <div className={`p-4 rounded-lg ${getHazardColor(results.supabaseData?.projected_conflict)}`}>
                  <span className="text-gray-300 text-sm">Projected Conflict:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.projected_conflict}</p>
                </div>
              </div>
            </div>

            {/* Weather & Climate Data */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-cyan-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-cyan-400 mb-4">🌤️ Weather & Climate</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Current Temperature:</span>
                  <p className="text-white font-semibold">{results.weatherData?.temperature || 'N/A'}°C</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Precipitation:</span>
                  <p className="text-white font-semibold">{results.weatherData?.precipitation || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Outlook:</span>
                  <p className="text-white font-semibold">{results.weatherData?.outlook || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Forecast Date:</span>
                  <p className="text-white font-semibold">{results.weatherData?.forecast_date || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Seasonal Climate */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">🌡️ Seasonal Climate</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Period:</span>
                  <p className="text-white font-semibold">{results.seasonalClimate?.period || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Temperature Trend:</span>
                  <p className="text-white font-semibold">{results.seasonalClimate?.temperature?.trend || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Average Temperature:</span>
                  <p className="text-white font-semibold">{results.seasonalClimate?.temperature?.average || 'N/A'}°C</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Precipitation Trend:</span>
                  <p className="text-white font-semibold">{results.seasonalClimate?.precipitation?.trend || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Water & Air Quality */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-teal-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-teal-400 mb-4">💧 Water & Air Quality</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Water Safety Level:</span>
                  <p className="text-white font-semibold">{results.waterQuality?.safety_level || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Air Quality Index:</span>
                  <p className="text-white font-semibold">{results.airQuality?.aqi || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Drinking Water:</span>
                  <p className="text-white font-semibold">{results.waterQuality?.drinking_advice || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Air Quality Status:</span>
                  <p className="text-white font-semibold">{results.airQuality?.status || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-blue-400 mb-4">🛡️ Security Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Current Conflict Level:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.current_conflict}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Projected Conflict Risk:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.projected_conflict}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Second Destination Results */}
          {secondResults && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-blue-400 text-center mb-6">
                {secondResults.destination} - Country Data
              </h3>
              
              {/* Basic Information */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-blue-400 mb-4">📋 Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Country:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.country}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">ISO Code:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.ISO3}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Population:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.population_mio?.toFixed(1)} million</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Life Expectancy:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.life_expectancy?.toFixed(1)} years</p>
                  </div>
                </div>
              </div>

              {/* Economic Data */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-green-400 mb-4">💰 Economic Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">GDP Per Capita:</span>
                    <p className="text-white font-semibold">${secondResults.supabaseData?.gdp_per_capita_usd?.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Human Development Index:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.human_dev_index}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Electricity Access:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.population_electricity}%</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Ecological Footprint:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.number_of_earths} Earths</p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-red-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-red-400 mb-4">⚠️ Risk Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Risk Class:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.risk_class}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">INFORM Index:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.inform_index}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Global Rank:</span>
                    <p className="text-white font-semibold">#{secondResults.supabaseData?.global_rank}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Peace Index Rank:</span>
                    <p className="text-white font-semibold">#{secondResults.supabaseData?.global_peace_rank}</p>
                  </div>
                </div>
              </div>

              {/* Natural Hazards */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-orange-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-orange-400 mb-4">🌪️ Natural Hazards (0-10 Scale)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${getHazardColor(secondResults.supabaseData?.earthquake)}`}>
                    <span className="text-gray-300 text-sm">Earthquake:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.earthquake}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${getHazardColor(secondResults.supabaseData?.river_flood)}`}>
                    <span className="text-gray-300 text-sm">River Flood:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.river_flood}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${getHazardColor(secondResults.supabaseData?.tsunami)}`}>
                    <span className="text-gray-300 text-sm">Tsunami:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.tsunami}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${getHazardColor(secondResults.supabaseData?.tropical_storm)}`}>
                    <span className="text-gray-300 text-sm">Tropical Storm:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.tropical_storm}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${getHazardColor(secondResults.supabaseData?.coastal_flood)}`}>
                    <span className="text-gray-300 text-sm">Coastal Flood:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.coastal_flood}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${getHazardColor(secondResults.supabaseData?.drought)}`}>
                    <span className="text-gray-300 text-sm">Drought:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.drought}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${getHazardColor(secondResults.supabaseData?.epidemic)}`}>
                    <span className="text-gray-300 text-sm">Epidemic:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.epidemic}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${getHazardColor(secondResults.supabaseData?.projected_conflict)}`}>
                    <span className="text-gray-300 text-sm">Projected Conflict:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.projected_conflict}</p>
                  </div>
                </div>
              </div>

              {/* Weather & Climate Data */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-cyan-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-cyan-400 mb-4">🌤️ Weather & Climate</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Current Temperature:</span>
                    <p className="text-white font-semibold">{secondResults.weatherData?.temperature || 'N/A'}°C</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Precipitation:</span>
                    <p className="text-white font-semibold">{secondResults.weatherData?.precipitation || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Outlook:</span>
                    <p className="text-white font-semibold">{secondResults.weatherData?.outlook || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Forecast Date:</span>
                    <p className="text-white font-semibold">{secondResults.weatherData?.forecast_date || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Seasonal Climate */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-purple-400 mb-4">🌡️ Seasonal Climate</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Period:</span>
                    <p className="text-white font-semibold">{secondResults.seasonalClimate?.period || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Temperature Trend:</span>
                    <p className="text-white font-semibold">{secondResults.seasonalClimate?.temperature?.trend || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Average Temperature:</span>
                    <p className="text-white font-semibold">{secondResults.seasonalClimate?.temperature?.average || 'N/A'}°C</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Precipitation Trend:</span>
                    <p className="text-white font-semibold">{secondResults.seasonalClimate?.precipitation?.trend || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Water & Air Quality */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-teal-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-teal-400 mb-4">💧 Water & Air Quality</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Water Safety Level:</span>
                    <p className="text-white font-semibold">{secondResults.waterQuality?.safety_level || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Air Quality Index:</span>
                    <p className="text-white font-semibold">{secondResults.airQuality?.aqi || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Drinking Water:</span>
                    <p className="text-white font-semibold">{secondResults.waterQuality?.drinking_advice || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Air Quality Status:</span>
                    <p className="text-white font-semibold">{secondResults.airQuality?.status || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-blue-400 mb-4">🛡️ Security Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Current Conflict Level:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.current_conflict}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Projected Conflict Risk:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.projected_conflict}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
