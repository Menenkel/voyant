'use client';

import { useState, useEffect } from 'react';
import CountryMap from './CountryMap';
import WeatherChart from './WeatherChart';
import RiskRadarChart from './RiskRadarChart';
import WeatherAlerts from './WeatherAlerts';
import AirQuality from './AirQuality';
import CityNews from './CityNews';

interface SearchHistory {
  destination: string;
  timestamp: number;
}

interface SearchResult {
  destination: string;
  fun_fact?: string;
  chatgptSummary?: string;
  coordinates?: { lat: number; lng: number; cityName?: string };
  comparisonData?: {
    informSimilar: { country: string; value: number }[];
    globalRankAbove: { country: string; rank: number }[];
    globalRankBelow: { country: string; rank: number }[];
    peaceRankAbove: { country: string; rank: number }[];
    peaceRankBelow: { country: string; rank: number }[];
    globalRankSimilar: { country: string; rank: number }[];
    peaceRankSimilar: { country: string; rank: number }[];
  };
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
    human_dev_index: number;
    fun_fact: string;
    area_km2?: number;
    area_sq_miles?: number;
    similar_size_country?: string;
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
  realWeatherData?: any;
  weatherAlerts?: any;
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
  const [citySuggestions, setCitySuggestions] = useState<Array<{
    city: string;
    country: string;
    iso3: string;
    population: number;
    display: string;
    isCapital: boolean;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [secondCitySuggestions, setSecondCitySuggestions] = useState<Array<{
    city: string;
    country: string;
    iso3: string;
    population: number;
    display: string;
    isCapital: boolean;
  }>>([]);
  const [showSecondSuggestions, setShowSecondSuggestions] = useState(false);
  const [isGlobetrotBotExpanded, setIsGlobetrotBotExpanded] = useState(true);
  const [isSecondGlobetrotBotExpanded, setIsSecondGlobetrotBotExpanded] = useState(true);
  const [isCountryInfoExpanded, setIsCountryInfoExpanded] = useState(false);
  const [isSecondCountryInfoExpanded, setIsSecondCountryInfoExpanded] = useState(false);
  const [useImperialUnits, setUseImperialUnits] = useState(false);

  // Unit conversion functions
  const convertTemperature = (celsius: number): number => {
    return useImperialUnits ? Math.round((celsius * 9/5 + 32) * 10) / 10 : Math.round(celsius * 10) / 10;
  };

  const convertWindSpeed = (kmh: number): number => {
    return useImperialUnits ? Math.round((kmh * 0.621371) * 10) / 10 : Math.round(kmh * 10) / 10;
  };

  const getTemperatureUnit = (): string => {
    return useImperialUnits ? '°F' : '°C';
  };

  const getWindSpeedUnit = (): string => {
    return useImperialUnits ? 'mph' : 'km/h';
  };

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
    
    if (!searchTerm.trim()) {
      return;
    }

    setIsSearching(true);
    setError('');
    setResults(null);
    setShowHistory(false);

    try {
      const response = await fetch(`/api/search?destination=${encodeURIComponent(searchTerm)}&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data);
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
      e.preventDefault();
      handleSearch();
    }
  };

  // City search suggestions
  const searchCitySuggestions = async (query: string) => {
    if (query.length < 2) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      console.log('Fetching city suggestions for:', query);
      const response = await fetch(`/api/city-search?q=${encodeURIComponent(query)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        console.log('City suggestions received:', data.suggestions);
        setCitySuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('City search error:', error);
    }
  };

  const searchSecondCitySuggestions = async (query: string) => {
    if (query.length < 2) {
      setSecondCitySuggestions([]);
      setShowSecondSuggestions(false);
      return;
    }

    try {
      console.log('Fetching second city suggestions for:', query);
      const response = await fetch(`/api/city-search?q=${encodeURIComponent(query)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        console.log('Second city suggestions received:', data.suggestions);
        setSecondCitySuggestions(data.suggestions || []);
        setShowSecondSuggestions(true);
      }
    } catch (error) {
      console.error('Second city search error:', error);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSecondInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSecondDestination(value);
  };

  // Debounced city search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCitySuggestions(searchQuery);
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Debounced city search effect for second destination
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (secondDestination.length >= 2) {
        searchSecondCitySuggestions(secondDestination);
      } else {
        setSecondCitySuggestions([]);
        setShowSecondSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [secondDestination]);

  // Handle city suggestion selection
  const handleCitySelect = (suggestion: any) => {
    setSearchQuery(suggestion.display);
    setShowSuggestions(false);
    setCitySuggestions([]);
    handleSearch(suggestion.display);
  };

  const handleSecondCitySelect = (suggestion: any) => {
    setSecondDestination(suggestion.display);
    setShowSecondSuggestions(false);
    setSecondCitySuggestions([]);
    handleSecondSearch(suggestion.display);
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
  const handleSecondSearch = async (query?: string) => {
    const searchTerm = query || secondDestination;
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`/api/search?destination=${encodeURIComponent(searchTerm)}&t=${Date.now()}`, {
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
      saveToHistory(searchTerm.trim());
      
      // Generate comparison summary if we have both results
      if (results && data) {
        try {
          const comparisonResponse = await fetch('/api/compare', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstDestination: results.destination,
              secondDestination: data.destination
            })
          });
          
          if (comparisonResponse.ok) {
            const comparisonData = await comparisonResponse.json();
          }
        } catch (error) {
          console.error('Comparison summary error:', error);
        }
      }
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

  // Helper function to determine if search is for a country or city
  const isCountrySearch = (result: SearchResult | null) => {
    return result?.coordinates === undefined || result?.coordinates === null;
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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 bg-white">
      {/* Search Section */}
      <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg mb-8">
        
        {/* Search Animation */}
        {isSearching && (
          <div className="mb-6 text-center animate-fade-in">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
              <span className="text-black font-medium">Searching for location...</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Analyzing risk data and gathering insights
            </div>
          </div>
        )}
        
        {/* Comparison Toggle */}
        <div className="mb-6 text-center">
          <button
            onClick={toggleCompareMode}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 comparison-toggle border-2 ${
              compareMode 
                ? 'bg-black text-white hover:bg-gray-800 border-black' 
                : 'bg-white text-black hover:bg-gray-100 border-gray-300'
            }`}
          >
            {compareMode ? '🔄 Single Search' : '⚖️ Compare Destinations'}
          </button>
          
          {compareMode && (
            <div className="mt-4 p-4 bg-gray-100 border-2 border-black rounded-lg">
              <p className="text-black text-sm">
                💡 <strong>Comparison Mode:</strong> Search for two destinations to see them side by side with different colored markers on the map.
              </p>
              {results && secondResults && (
                <div className="mt-2 flex items-center justify-center space-x-4 text-sm">
                  <span className="text-black">📍 {results.destination}</span>
                  <span className="text-blue-600">🔵 {secondResults.destination}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`max-w-4xl mx-auto ${compareMode ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'max-w-lg'}`}>
          {/* First Destination */}
          <div className="relative">
            <label className="block text-left text-sm font-medium text-black mb-2">
              {compareMode ? 'First Destination' : 'Search for any city or country'}
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setShowHistory(false)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter a city or country"
                  className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-black/20 transition-all duration-200"
                  autoComplete="off"
                  spellCheck="false"
                />
                
                {/* City Suggestions Dropdown */}
                {showSuggestions && citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {citySuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleCitySelect(suggestion)}
                        className="w-full px-4 py-3 text-left text-black hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium flex items-center">
                              {suggestion.city}
                              {suggestion.isCapital && (
                                <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">Capital</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">{suggestion.country}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {suggestion.population > 0 ? `${(suggestion.population / 1000000).toFixed(1)}M` : 'N/A'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
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
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={secondDestination}
                    onChange={handleSecondInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSecondSearch()}
                    onFocus={() => setShowSecondSuggestions(false)}
                    onBlur={() => setTimeout(() => setShowSecondSuggestions(false), 200)}
                    placeholder="Enter a city or country"
                    className="w-full px-4 py-3 bg-white border-2 border-blue-500 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  
                  {/* Second City Suggestions Dropdown */}
                  {showSecondSuggestions && secondCitySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-500 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {secondCitySuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSecondCitySelect(suggestion)}
                          className="w-full px-4 py-3 text-left text-black hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium flex items-center">
                                {suggestion.city}
                                {suggestion.isCapital && (
                                  <span className="ml-2 text-xs bg-black text-white px-2 py-1 rounded">Capital</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-400">{suggestion.country}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {suggestion.population > 0 ? `${(suggestion.population / 1000000).toFixed(1)}M` : 'N/A'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSecondSearch()}
                  disabled={isSearching || !secondDestination.trim()}
                  className="px-4 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
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
        coordinates={results?.coordinates}
        secondCoordinates={compareMode && secondResults ? secondResults.coordinates : undefined}
        onCountrySelect={handleCountrySelect}
      />

      {/* Basic Country Information - Right after map, collapsed by default */}
      {results && !isCountrySearch(results) && (
        <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-black">Basic Country Information</h4>
            <button
              onClick={() => setIsCountryInfoExpanded(!isCountryInfoExpanded)}
              className="text-black hover:text-gray-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <span className="text-sm">
                {isCountryInfoExpanded ? 'Show Less' : 'Show More'}
              </span>
              <span className={`transform transition-transform duration-200 ${isCountryInfoExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
          {isCountryInfoExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Country:</span>
                <p className="text-black font-semibold">{results.supabaseData?.country}</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Population:</span>
                <p className="text-black font-semibold">{results.supabaseData?.population_mio} million</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">GDP Per Capita:</span>
                <p className="text-black font-semibold">${results.supabaseData?.gdp_per_capita_usd?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Life Expectancy:</span>
                <p className="text-black font-semibold">{results.supabaseData?.life_expectancy} years</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Global Risk Rank:</span>
                <p className="text-black font-semibold">#{results.supabaseData?.global_rank}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers = safer countries
                </p>
                {results.comparisonData?.globalRankSimilar && results.comparisonData.globalRankSimilar.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Similar: {results.comparisonData.globalRankSimilar.map(c => `${c.country} (#${c.rank})`).join(', ')}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Peace Index Rank:</span>
                <p className="text-black font-semibold">#{results.supabaseData?.global_peace_rank}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers = more peaceful countries
                </p>
                {results.comparisonData?.peaceRankSimilar && results.comparisonData.peaceRankSimilar.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Similar: {results.comparisonData.peaceRankSimilar.map(c => `${c.country} (#${c.rank})`).join(', ')}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Electricity Access:</span>
                <p className="text-black font-semibold">{results.supabaseData?.population_electricity}%</p>
              </div>
              {results.supabaseData?.area_km2 && (
                <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                  <span className="text-gray-600 text-sm">Country Size:</span>
                  <p className="text-black font-semibold">{results.supabaseData.area_km2.toLocaleString()} km²</p>
                  <p className="text-black font-semibold">{results.supabaseData.area_sq_miles?.toLocaleString()} sq miles</p>
                  {results.supabaseData.similar_size_country && (
                    <p className="text-gray-500 text-xs mt-1">
                      Similar size: {results.supabaseData.similar_size_country}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Basic Country Information for Second Destination - Right after map, collapsed by default */}
      {secondResults && !isCountrySearch(secondResults) && (
        <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-black">Basic Country Information</h4>
            <button
              onClick={() => setIsSecondCountryInfoExpanded(!isSecondCountryInfoExpanded)}
              className="text-black hover:text-gray-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <span className="text-sm">
                {isSecondCountryInfoExpanded ? 'Show Less' : 'Show More'}
              </span>
              <span className={`transform transition-transform duration-200 ${isSecondCountryInfoExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
          {isSecondCountryInfoExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Country:</span>
                <p className="text-black font-semibold">{secondResults.supabaseData?.country}</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Population:</span>
                <p className="text-black font-semibold">{secondResults.supabaseData?.population_mio} million</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">GDP Per Capita:</span>
                <p className="text-black font-semibold">${secondResults.supabaseData?.gdp_per_capita_usd?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Life Expectancy:</span>
                <p className="text-black font-semibold">{secondResults.supabaseData?.life_expectancy} years</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Global Risk Rank:</span>
                <p className="text-black font-semibold">#{secondResults.supabaseData?.global_rank}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers = safer countries
                </p>
                {secondResults.comparisonData?.globalRankSimilar && secondResults.comparisonData.globalRankSimilar.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Similar: {secondResults.comparisonData.globalRankSimilar.map(c => `${c.country} (#${c.rank})`).join(', ')}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Peace Index Rank:</span>
                <p className="text-black font-semibold">#{secondResults.supabaseData?.global_peace_rank}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers = more peaceful countries
                </p>
                {secondResults.comparisonData?.peaceRankSimilar && secondResults.comparisonData.peaceRankSimilar.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Similar: {secondResults.comparisonData.peaceRankSimilar.map(c => `${c.country} (#${c.rank})`).join(', ')}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                <span className="text-gray-600 text-sm">Electricity Access:</span>
                <p className="text-black font-semibold">{secondResults.supabaseData?.population_electricity}%</p>
              </div>
              {secondResults.supabaseData?.area_km2 && (
                <div className="p-4 bg-gray-100 rounded-lg border-2 border-black">
                  <span className="text-gray-600 text-sm">Country Size:</span>
                  <p className="text-black font-semibold">{secondResults.supabaseData.area_km2.toLocaleString()} km²</p>
                  <p className="text-black font-semibold">{secondResults.supabaseData.area_sq_miles?.toLocaleString()} sq miles</p>
                  {secondResults.supabaseData.similar_size_country && (
                    <p className="text-gray-500 text-xs mt-1">
                      Similar size: {secondResults.supabaseData.similar_size_country}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className={`space-y-6 ${compareMode && secondResults ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''}`}>
          {/* First Destination Results */}
          <div className="space-y-6">
            

            {/* Globaltrot-Bot Summary */}
            {results.chatgptSummary && (
              <div className="bg-white rounded-lg p-6 border-2 border-green-600 shadow-lg mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-green-600">Globetrot-Bot Summary</h4>
                  <button
                    onClick={() => setIsGlobetrotBotExpanded(!isGlobetrotBotExpanded)}
                    className="text-green-600 hover:text-green-500 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span className="text-sm">
                      {isGlobetrotBotExpanded ? 'Show Less' : 'Show More'}
                    </span>
                    <span className={`transform transition-transform duration-200 ${isGlobetrotBotExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>
                {isGlobetrotBotExpanded && (
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="text-black leading-relaxed whitespace-pre-line">
                      {results.chatgptSummary.split('\n').map((line, index) => {
                        // Remove any markdown formatting that might slip through
                        const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
                        
                        if (cleanLine.startsWith('# ')) {
                          return <h1 key={index} className="text-xl font-bold text-green-600 mb-3 mt-4">{cleanLine.substring(2)}</h1>;
                        } else if (cleanLine.startsWith('## ')) {
                          return <h2 key={index} className="text-lg font-semibold text-green-500 mb-2 mt-3">{cleanLine.substring(3)}</h2>;
                        } else if (cleanLine.startsWith('- ')) {
                          return <div key={index} className="ml-4 mb-1 text-black">• {cleanLine.substring(2)}</div>;
                        } else if (cleanLine.trim() === '') {
                          return <br key={index} />;
                        } else {
                          return <p key={index} className="mb-2 text-black">{cleanLine}</p>;
                        }
                      })}
                </div>
                  </div>
                )}
              </div>
            )}

            {/* Not really important, but still good to know */}
            {results.fun_fact && (
              <div className="bg-white rounded-lg p-6 border-2 border-blue-800 shadow-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-4">Not really important, but still good to know</h4>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-black font-medium italic">"{results.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}"</p>
                </div>
              </div>
            )}

            {/* Economic Data - Only for Country Searches */}
            {isCountrySearch(results) && (
            <div className="bg-white rounded-lg p-6 border-2 border-green-500 shadow-lg">
              <h4 className="text-lg font-semibold text-green-600 mb-4">Economic Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">GDP Per Capita:</span>
                  <p className="text-black font-semibold">${results.supabaseData?.gdp_per_capita_usd?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Human Development Index:</span>
                  <p className="text-black font-semibold">{results.supabaseData?.human_dev_index}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Electricity Access:</span>
                  <p className="text-black font-semibold">{results.supabaseData?.population_electricity}%</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Average Hotel Price:</span>
                  <p className="text-black font-semibold">${Math.floor(Math.random() * 200 + 50)}/night</p>
                </div>
              </div>
            </div>
            )}

            {/* Risk Assessment with Comparisons - Only for Country Searches */}
            {isCountrySearch(results) && (
            <div className="bg-white rounded-lg p-6 border-2 border-red-500 shadow-lg">
              <h4 className="text-lg font-semibold text-red-600 mb-4">Risk Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Risk Class:</span>
                  <p className="text-black font-semibold">{results.supabaseData?.risk_class}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">INFORM Index:</span>
                  <p className="text-black font-semibold">{results.supabaseData?.inform_index}</p>
                  {results.comparisonData?.informSimilar && results.comparisonData.informSimilar.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Similar: {results.comparisonData.informSimilar.map(c => `${c.country} (${c.value})`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Global Risk Rank:</span>
                  <p className="text-black font-semibold">#{results.supabaseData?.global_rank}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers = safer countries
                  </p>
                  {results.comparisonData?.globalRankSimilar && results.comparisonData.globalRankSimilar.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Similar: {results.comparisonData.globalRankSimilar.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                  {results.comparisonData?.globalRankAbove && results.comparisonData.globalRankAbove.length > 0 && (
                    <div className="mt-1 text-xs text-green-600">
                      Safer: {results.comparisonData.globalRankAbove.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                  {results.comparisonData?.globalRankBelow && results.comparisonData.globalRankBelow.length > 0 && (
                    <div className="mt-1 text-xs text-red-600">
                      Riskier: {results.comparisonData.globalRankBelow.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Peace Index Rank:</span>
                  <p className="text-black font-semibold">#{results.supabaseData?.global_peace_rank}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers = more peaceful countries
                  </p>
                  {results.comparisonData?.peaceRankSimilar && results.comparisonData.peaceRankSimilar.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Similar: {results.comparisonData.peaceRankSimilar.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                  {results.comparisonData?.peaceRankAbove && results.comparisonData.peaceRankAbove.length > 0 && (
                    <div className="mt-1 text-xs text-green-600">
                      More peaceful: {results.comparisonData.peaceRankAbove.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                  {results.comparisonData?.peaceRankBelow && results.comparisonData.peaceRankBelow.length > 0 && (
                    <div className="mt-1 text-xs text-red-600">
                      Less peaceful: {results.comparisonData.peaceRankBelow.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* Natural Hazards Spider Chart - For All Queries */}
            {results.supabaseData && (
            <div className="bg-white rounded-lg p-6 border-2 border-orange-500 shadow-lg">
              <h4 className="text-lg font-semibold text-orange-600 mb-4">Natural Hazards (0-10 Scale)</h4>
                <div className="mb-4">
                  <p className="text-gray-600 text-sm">
                    National-level natural hazard risks for {results.supabaseData.country}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    <strong>Higher values = Higher risk</strong> • Scale: 0 (no risk) to 10 (extreme risk)
                  </p>
                </div>
                <RiskRadarChart
                  hazardIndicators={{
                    earthquake: results.supabaseData.earthquake,
                    river_flood: results.supabaseData.river_flood,
                    tsunami: results.supabaseData.tsunami,
                    tropical_storm: results.supabaseData.tropical_storm,
                    coastal_flood: results.supabaseData.coastal_flood,
                    drought: results.supabaseData.drought,
                    epidemic: results.supabaseData.epidemic,
                    projected_conflict: results.supabaseData.projected_conflict,
                    current_conflict: results.supabaseData.current_conflict
                  }}
                  secondHazardIndicators={compareMode && secondResults?.supabaseData ? {
                    earthquake: secondResults.supabaseData.earthquake,
                    river_flood: secondResults.supabaseData.river_flood,
                    tsunami: secondResults.supabaseData.tsunami,
                    tropical_storm: secondResults.supabaseData.tropical_storm,
                    coastal_flood: secondResults.supabaseData.coastal_flood,
                    drought: secondResults.supabaseData.drought,
                    epidemic: secondResults.supabaseData.epidemic,
                    projected_conflict: secondResults.supabaseData.projected_conflict,
                    current_conflict: secondResults.supabaseData.current_conflict
                  } : undefined}
                  firstDestination={results.supabaseData.country}
                  secondDestination={compareMode && secondResults?.supabaseData ? secondResults.supabaseData.country : undefined}
                />
                </div>
            )}

            {/* Weather & Climate Data */}
            <div className="bg-white rounded-lg p-6 border-2 border-blue-500 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-blue-600">🌤️ Weather & Climate</h4>
                
                {/* Units Switch */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Units:</span>
                  <button
                    onClick={() => setUseImperialUnits(!useImperialUnits)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                      useImperialUnits 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {useImperialUnits ? '°F / mph' : '°C / km/h'}
                  </button>
                </div>
              </div>
              
              {results.realWeatherData ? (
                <div className="space-y-6">
                  {/* Current Weather */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Current Temperature:</span>
                      <p className="text-black font-semibold text-xl">{convertTemperature(results.realWeatherData.current.temperature)}{getTemperatureUnit()}</p>
                      <p className="text-gray-500 text-xs">Feels like {convertTemperature(results.realWeatherData.current.apparent_temperature)}{getTemperatureUnit()}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                      <span className="text-gray-600 text-sm">Weather:</span>
                      <p className="text-black font-semibold">{results.realWeatherData.current.weather_description}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                      <span className="text-gray-600 text-sm">Wind:</span>
                      <p className="text-black font-semibold">{convertWindSpeed(results.realWeatherData.current.wind_speed)} {getWindSpeedUnit()}</p>
                      <p className="text-gray-500 text-xs">{results.realWeatherData.current.wind_description}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                      <span className="text-gray-600 text-sm">Humidity:</span>
                      <p className="text-black font-semibold">{results.realWeatherData.current.humidity}%</p>
              </div>
            </div>

                  {/* 24h Forecast */}
                <div className="p-4 bg-gray-100 rounded-lg">
                    <h5 className="text-blue-600 font-semibold mb-3">Next 24 Hours</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-gray-600 text-sm">Max Temp:</span>
                        <p className="text-black font-semibold">{results.realWeatherData.forecast.next_24h.max_temp}°C</p>
                </div>
                      <div>
                        <span className="text-gray-600 text-sm">Min Temp:</span>
                        <p className="text-black font-semibold">{results.realWeatherData.forecast.next_24h.min_temp}°C</p>
                </div>
                      <div>
                        <span className="text-gray-600 text-sm">Precipitation:</span>
                        <p className="text-black font-semibold">{results.realWeatherData.forecast.next_24h.total_precipitation}mm</p>
                </div>
                      <div>
                        <span className="text-gray-600 text-sm">Avg Wind:</span>
                        <p className="text-black font-semibold">{convertWindSpeed(results.realWeatherData.forecast.next_24h.avg_wind_speed)} {getWindSpeedUnit()}</p>
                </div>
              </div>
            </div>

                  {/* 16-Day Forecast Chart */}
                <div className="p-4 bg-gray-100 rounded-lg">
                    <WeatherChart 
                      forecast={results.realWeatherData.forecast.next_16_days} 
                      location={results.realWeatherData.location}
                      useImperialUnits={useImperialUnits}
                    />
                </div>

                  {/* Weather Alerts */}
                 <WeatherAlerts 
                   alerts={results.weatherAlerts} 
                   title="Weather Alerts"
                 />

                  {/* Air Quality */}
                  <AirQuality 
                    airQuality={results.realWeatherData.air_quality} 
                    title="Air Quality"
                  />

                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Current Temperature:</span>
                  <p className="text-black font-semibold">{results.weatherData?.temperature ? convertTemperature(results.weatherData.temperature) + getTemperatureUnit() : 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Precipitation:</span>
                  <p className="text-black font-semibold">{results.weatherData?.precipitation || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Outlook:</span>
                  <p className="text-black font-semibold">{results.weatherData?.outlook || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 text-sm">Forecast Date:</span>
                  <p className="text-black font-semibold">{results.weatherData?.forecast_date || 'N/A'}</p>
                </div>
              </div>
              )}
            </div>

            {/* City News - Always rendered */}
            <CityNews 
              city={results.destination} 
              title="Latest News"
            />

          </div>

          {/* Second Destination Results */}
          {secondResults && (
            <div className="space-y-6">
              

              {/* Globaltrot-Bot Summary */}
              {secondResults.chatgptSummary && (
              <div className="bg-white rounded-lg p-6 border-2 border-green-600 shadow-lg mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-green-600">Globetrot-Bot Summary</h4>
                    <button
                      onClick={() => setIsSecondGlobetrotBotExpanded(!isSecondGlobetrotBotExpanded)}
                      className="text-green-600 hover:text-green-500 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <span className="text-sm">
                        {isSecondGlobetrotBotExpanded ? 'Show Less' : 'Show More'}
                      </span>
                      <span className={`transform transition-transform duration-200 ${isSecondGlobetrotBotExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                  </div>
                  {isSecondGlobetrotBotExpanded && (
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="text-black leading-relaxed whitespace-pre-line">
                        {secondResults.chatgptSummary.split('\n').map((line, index) => {
                          // Remove any markdown formatting that might slip through
                          const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
                          
                          if (cleanLine.startsWith('# ')) {
                            return <h1 key={index} className="text-xl font-bold text-green-600 mb-3 mt-4">{cleanLine.substring(2)}</h1>;
                          } else if (cleanLine.startsWith('## ')) {
                            return <h2 key={index} className="text-lg font-semibold text-green-500 mb-2 mt-3">{cleanLine.substring(3)}</h2>;
                          } else if (cleanLine.startsWith('- ')) {
                            return <div key={index} className="ml-4 mb-1 text-black">• {cleanLine.substring(2)}</div>;
                          } else if (cleanLine.trim() === '') {
                            return <br key={index} />;
                          } else {
                            return <p key={index} className="mb-2 text-black">{cleanLine}</p>;
                          }
                        })}
                  </div>
                </div>
                  )}
                </div>
              )}

              {/* Not really important, but still good to know */}
              {secondResults.fun_fact && (
                <div className="bg-white rounded-lg p-6 border-2 border-purple-500 shadow-lg">
                  <h4 className="text-lg font-semibold text-purple-600 mb-4">🎭 Not really important, but still good to know</h4>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-black font-medium italic">"{secondResults.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}"</p>
                  </div>
                </div>
              )}

              {/* Economic Data - Only for Country Searches */}
              {isCountrySearch(secondResults) && (
              <div className="bg-white rounded-lg p-6 border-2 border-green-500 shadow-lg">
                <h4 className="text-lg font-semibold text-green-600 mb-4">Economic Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">GDP Per Capita:</span>
                    <p className="text-black font-semibold">${secondResults.supabaseData?.gdp_per_capita_usd?.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Human Development Index:</span>
                    <p className="text-black font-semibold">{secondResults.supabaseData?.human_dev_index}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Electricity Access:</span>
                    <p className="text-black font-semibold">{secondResults.supabaseData?.population_electricity}%</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Average Hotel Price:</span>
                    <p className="text-black font-semibold">${Math.floor(Math.random() * 200 + 50)}/night</p>
                  </div>
                </div>
              </div>
              )}

              {/* Risk Assessment with Comparisons - Only for Country Searches */}
              {isCountrySearch(secondResults) && (
              <div className="bg-white rounded-lg p-6 border-2 border-red-500 shadow-lg">
                <h4 className="text-lg font-semibold text-red-600 mb-4">Risk Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Risk Class:</span>
                    <p className="text-black font-semibold">{secondResults.supabaseData?.risk_class}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">INFORM Index:</span>
                    <p className="text-black font-semibold">{secondResults.supabaseData?.inform_index}</p>
                    {secondResults.comparisonData?.informSimilar && secondResults.comparisonData.informSimilar.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Similar: {secondResults.comparisonData.informSimilar.map(c => `${c.country} (${c.value})`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Global Risk Rank:</span>
                    <p className="text-black font-semibold">#{secondResults.supabaseData?.global_rank}</p>
                    {secondResults.comparisonData?.globalRankAbove && secondResults.comparisonData.globalRankAbove.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Above: {secondResults.comparisonData.globalRankAbove.map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                    {secondResults.comparisonData?.globalRankBelow && secondResults.comparisonData.globalRankBelow.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Below: {secondResults.comparisonData.globalRankBelow.map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Peace Index Rank:</span>
                    <p className="text-black font-semibold">#{secondResults.supabaseData?.global_peace_rank}</p>
                    {secondResults.comparisonData?.peaceRankAbove && secondResults.comparisonData.peaceRankAbove.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Above: {secondResults.comparisonData.peaceRankAbove.map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                    {secondResults.comparisonData?.peaceRankBelow && secondResults.comparisonData.peaceRankBelow.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Below: {secondResults.comparisonData.peaceRankBelow.map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}


              {/* Weather & Climate Data */}
              <div className="bg-white rounded-lg p-6 border-2 border-blue-500 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-blue-600">Weather & Climate</h4>
                  
                  {/* Units Switch */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Units:</span>
                    <button
                      onClick={() => setUseImperialUnits(!useImperialUnits)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                        useImperialUnits 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {useImperialUnits ? '°F / mph' : '°C / km/h'}
                    </button>
                  </div>
                </div>
                
                {secondResults.realWeatherData ? (
                  <div className="space-y-6">
                    {/* Current Weather */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Current Temperature:</span>
                        <p className="text-black font-semibold text-xl">{convertTemperature(secondResults.realWeatherData.current.temperature)}{getTemperatureUnit()}</p>
                        <p className="text-gray-500 text-xs">Feels like {convertTemperature(secondResults.realWeatherData.current.apparent_temperature)}{getTemperatureUnit()}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                        <span className="text-gray-600 text-sm">Weather:</span>
                        <p className="text-black font-semibold">{secondResults.realWeatherData.current.weather_description}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                        <span className="text-gray-600 text-sm">Wind:</span>
                        <p className="text-black font-semibold">{convertWindSpeed(secondResults.realWeatherData.current.wind_speed)} {getWindSpeedUnit()}</p>
                        <p className="text-gray-500 text-xs">{secondResults.realWeatherData.current.wind_description}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                        <span className="text-gray-600 text-sm">Humidity:</span>
                        <p className="text-black font-semibold">{secondResults.realWeatherData.current.humidity}%</p>
                </div>
              </div>

                    {/* 24h Forecast */}
                  <div className="p-4 bg-gray-100 rounded-lg">
                      <h5 className="text-blue-600 font-semibold mb-3">Next 24 Hours</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-gray-600 text-sm">Max Temp:</span>
                          <p className="text-black font-semibold">{secondResults.realWeatherData.forecast.next_24h.max_temp}°C</p>
                  </div>
                        <div>
                          <span className="text-gray-600 text-sm">Min Temp:</span>
                          <p className="text-black font-semibold">{secondResults.realWeatherData.forecast.next_24h.min_temp}°C</p>
                  </div>
                        <div>
                    <span className="text-gray-600 text-sm">Precipitation:</span>
                          <p className="text-black font-semibold">{secondResults.realWeatherData.forecast.next_24h.total_precipitation}mm</p>
                  </div>
                        <div>
                          <span className="text-gray-600 text-sm">Avg Wind:</span>
                          <p className="text-black font-semibold">{convertWindSpeed(secondResults.realWeatherData.forecast.next_24h.avg_wind_speed)} {getWindSpeedUnit()}</p>
                  </div>
                </div>
              </div>

                    {/* 16-Day Forecast Chart */}
                  <div className="p-4 bg-gray-100 rounded-lg">
                      <WeatherChart 
                        forecast={secondResults.realWeatherData.forecast.next_16_days} 
                        location={secondResults.realWeatherData.location}
                        useImperialUnits={useImperialUnits}
                      />
                  </div>

                    {/* Weather Alerts */}
                    <WeatherAlerts 
                      alerts={secondResults.weatherAlerts} 
                      title="Weather Alerts"
                    />

                    {/* Air Quality */}
                    <AirQuality 
                      airQuality={secondResults.realWeatherData.air_quality} 
                      title="Air Quality"
                    />

                    {/* City News */}
                    <CityNews 
                      city={secondResults.destination} 
                      title="Latest News"
                    />
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Current Temperature:</span>
                    <p className="text-black font-semibold">{secondResults.weatherData?.temperature ? convertTemperature(secondResults.weatherData.temperature) + getTemperatureUnit() : 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Precipitation:</span>
                    <p className="text-black font-semibold">{secondResults.weatherData?.precipitation || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Outlook:</span>
                    <p className="text-black font-semibold">{secondResults.weatherData?.outlook || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-gray-600 text-sm">Forecast Date:</span>
                    <p className="text-black font-semibold">{secondResults.weatherData?.forecast_date || 'N/A'}</p>
                  </div>
                </div>
          )}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
