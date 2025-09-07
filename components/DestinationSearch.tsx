'use client';

import { useState, useEffect } from 'react';
import CountryMap from './CountryMap';
import WeatherChart from './WeatherChart';
import RiskRadarChart from './RiskRadarChart';
import WeatherAlerts from './WeatherAlerts';

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
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setShowHistory(false)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter a city or country"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                  autoComplete="off"
                  spellCheck="false"
                />
                
                {/* City Suggestions Dropdown */}
                {showSuggestions && citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border-2 border-yellow-500/30 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {citySuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleCitySelect(suggestion)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
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
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={secondDestination}
                    onChange={handleSecondInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSecondSearch()}
                    onFocus={() => setShowSecondSuggestions(false)}
                    onBlur={() => setTimeout(() => setShowSecondSuggestions(false), 200)}
                    placeholder="Enter a city or country"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  
                  {/* Second City Suggestions Dropdown */}
                  {showSecondSuggestions && secondCitySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border-2 border-blue-500/30 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {secondCitySuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSecondCitySelect(suggestion)}
                          className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium flex items-center">
                                {suggestion.city}
                                {suggestion.isCapital && (
                                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">Capital</span>
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
        coordinates={results?.coordinates}
        secondCoordinates={compareMode && secondResults ? secondResults.coordinates : undefined}
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
            
            {/* Basic Country Information - Only for City Searches */}
            {!isCountrySearch(results) && (
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-green-400">🏛️ Basic Country Information</h4>
                  <button
                    onClick={() => setIsCountryInfoExpanded(!isCountryInfoExpanded)}
                    className="text-green-400 hover:text-green-300 transition-colors duration-200 flex items-center space-x-2"
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
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Country:</span>
                  <p className="text-white font-semibold">{results.supabaseData?.country}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Population:</span>
                    <p className="text-white font-semibold">{results.supabaseData?.population_mio} million</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">GDP Per Capita:</span>
                    <p className="text-white font-semibold">${results.supabaseData?.gdp_per_capita_usd?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Life Expectancy:</span>
                    <p className="text-white font-semibold">{results.supabaseData?.life_expectancy} years</p>
                </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Electricity Access:</span>
                    <p className="text-white font-semibold">{results.supabaseData?.population_electricity}%</p>
              </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Risk Class:</span>
                    <p className="text-white font-semibold">{results.supabaseData?.risk_class}</p>
            </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Global Risk Rank:</span>
                    <p className="text-white font-semibold">#{results.supabaseData?.global_rank}</p>
                    <p className="text-gray-400 text-xs mt-1">Higher rank = less risky</p>
                    {results.comparisonData?.globalRankAbove && results.comparisonData.globalRankAbove.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Similar: {results.comparisonData.globalRankAbove.slice(0, 1).map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Peace Index Rank:</span>
                    <p className="text-white font-semibold">#{results.supabaseData?.global_peace_rank}</p>
                    <p className="text-gray-400 text-xs mt-1">Higher rank = more peaceful</p>
                    {results.comparisonData?.peaceRankAbove && results.comparisonData.peaceRankAbove.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Similar: {results.comparisonData.peaceRankAbove.slice(0, 1).map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>
            )}

            {/* Globaltrot-Bot Summary */}
            {results.chatgptSummary && (
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-blue-400">🤖 Globetrot-Bot Summary</h4>
                  <button
                    onClick={() => setIsGlobetrotBotExpanded(!isGlobetrotBotExpanded)}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center space-x-2"
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
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="text-white leading-relaxed whitespace-pre-line">
                      {results.chatgptSummary.split('\n').map((line, index) => {
                        // Remove any markdown formatting that might slip through
                        const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
                        
                        if (cleanLine.startsWith('# ')) {
                          return <h1 key={index} className="text-xl font-bold text-blue-300 mb-3 mt-4">{cleanLine.substring(2)}</h1>;
                        } else if (cleanLine.startsWith('## ')) {
                          return <h2 key={index} className="text-lg font-semibold text-blue-200 mb-2 mt-3">{cleanLine.substring(3)}</h2>;
                        } else if (cleanLine.startsWith('- ')) {
                          return <div key={index} className="ml-4 mb-1">• {cleanLine.substring(2)}</div>;
                        } else if (cleanLine.trim() === '') {
                          return <br key={index} />;
                        } else {
                          return <p key={index} className="mb-2">{cleanLine}</p>;
                        }
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Not really important, but still good to know */}
            {results.fun_fact && (
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-purple-400 mb-4">🎭 Not really important, but still good to know</h4>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-white font-medium italic">"{results.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}"</p>
                </div>
              </div>
            )}

            {/* Economic Data - Only for Country Searches */}
            {isCountrySearch(results) && (
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
                  <span className="text-gray-300 text-sm">Average Hotel Price:</span>
                  <p className="text-white font-semibold">${Math.floor(Math.random() * 200 + 50)}/night</p>
                </div>
              </div>
            </div>
            )}

            {/* Risk Assessment with Comparisons - Only for Country Searches */}
            {isCountrySearch(results) && (
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
                  {results.comparisonData?.informSimilar && results.comparisonData.informSimilar.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Similar: {results.comparisonData.informSimilar.map(c => `${c.country} (${c.value})`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Global Risk Rank:</span>
                  <p className="text-white font-semibold">#{results.supabaseData?.global_rank}</p>
                  {results.comparisonData?.globalRankAbove && results.comparisonData.globalRankAbove.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Above: {results.comparisonData.globalRankAbove.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                  {results.comparisonData?.globalRankBelow && results.comparisonData.globalRankBelow.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Below: {results.comparisonData.globalRankBelow.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Peace Index Rank:</span>
                  <p className="text-white font-semibold">#{results.supabaseData?.global_peace_rank}</p>
                  {results.comparisonData?.peaceRankAbove && results.comparisonData.peaceRankAbove.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Above: {results.comparisonData.peaceRankAbove.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                  {results.comparisonData?.peaceRankBelow && results.comparisonData.peaceRankBelow.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Below: {results.comparisonData.peaceRankBelow.map(c => `${c.country} (#${c.rank})`).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* Natural Hazards Spider Chart - For All Queries */}
            {results.supabaseData && (
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-orange-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-orange-400 mb-4">🌪️ Natural Hazards (0-10 Scale)</h4>
                <div className="mb-4">
                  <p className="text-gray-300 text-sm">
                    National-level natural hazard risks for {results.supabaseData.country}
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
                  firstDestination={results.supabaseData.country}
                />
                </div>
            )}

            {/* Weather & Climate Data */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-cyan-500/30 shadow-lg">
              <h4 className="text-lg font-semibold text-cyan-400 mb-4">🌤️ Weather & Climate</h4>
              
              {results.realWeatherData ? (
                <div className="space-y-6">
                  {/* Current Weather */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-300 text-sm">Current Temperature:</span>
                      <p className="text-white font-semibold text-xl">{results.realWeatherData.current.temperature}°C</p>
                      <p className="text-gray-400 text-xs">Feels like {results.realWeatherData.current.apparent_temperature}°C</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 text-sm">Weather:</span>
                      <p className="text-white font-semibold">{results.realWeatherData.current.weather_description}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 text-sm">Wind:</span>
                      <p className="text-white font-semibold">{results.realWeatherData.current.wind_speed} km/h</p>
                      <p className="text-gray-400 text-xs">{results.realWeatherData.current.wind_description}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 text-sm">Humidity:</span>
                      <p className="text-white font-semibold">{results.realWeatherData.current.humidity}%</p>
              </div>
            </div>

                  {/* 24h Forecast */}
                <div className="p-4 bg-gray-700 rounded-lg">
                    <h5 className="text-cyan-300 font-semibold mb-3">Next 24 Hours</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-gray-300 text-sm">Max Temp:</span>
                        <p className="text-white font-semibold">{results.realWeatherData.forecast.next_24h.max_temp}°C</p>
                </div>
                      <div>
                        <span className="text-gray-300 text-sm">Min Temp:</span>
                        <p className="text-white font-semibold">{results.realWeatherData.forecast.next_24h.min_temp}°C</p>
                </div>
                      <div>
                        <span className="text-gray-300 text-sm">Precipitation:</span>
                        <p className="text-white font-semibold">{results.realWeatherData.forecast.next_24h.total_precipitation}mm</p>
                </div>
                      <div>
                        <span className="text-gray-300 text-sm">Avg Wind:</span>
                        <p className="text-white font-semibold">{results.realWeatherData.forecast.next_24h.avg_wind_speed} km/h</p>
                </div>
              </div>
            </div>

                  {/* 16-Day Forecast Chart */}
                <div className="p-4 bg-gray-700 rounded-lg">
                    <WeatherChart 
                      forecast={results.realWeatherData.forecast.next_16_days} 
                      location={results.realWeatherData.location}
                    />
                </div>

                  {/* Weather Alerts */}
                  <WeatherAlerts 
                    alerts={results.weatherAlerts} 
                    title="⚠️ Weather Alerts"
                  />

                  {/* Air Quality */}
                  {results.realWeatherData.air_quality && (
                <div className="p-4 bg-gray-700 rounded-lg">
                      <h5 className="text-cyan-300 font-semibold mb-3">Air Quality</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <span className="text-gray-300 text-sm">PM2.5:</span>
                          <p className="text-white font-semibold">{results.realWeatherData.air_quality.pm2_5} μg/m³</p>
                          <p className="text-gray-400 text-sm leading-relaxed">{results.realWeatherData.air_quality.pm2_5_description}</p>
                </div>
                        <div className="col-span-2">
                          <span className="text-gray-300 text-sm">PM10:</span>
                          <p className="text-white font-semibold">{results.realWeatherData.air_quality.pm10} μg/m³</p>
                          <p className="text-gray-400 text-sm leading-relaxed">{results.realWeatherData.air_quality.pm10_description}</p>
                </div>
                        <div className="col-span-2">
                          <span className="text-gray-300 text-sm">UV Index:</span>
                          <p className="text-white font-semibold">{results.realWeatherData.air_quality.uv_index}</p>
                          <p className="text-gray-400 text-sm leading-relaxed">{results.realWeatherData.air_quality.uv_index_description}</p>
                </div>
                        <div className="col-span-2">
                          <span className="text-gray-300 text-sm">Ozone:</span>
                          <p className="text-white font-semibold">{results.realWeatherData.air_quality.ozone} μg/m³</p>
                          <p className="text-gray-400 text-sm leading-relaxed">{results.realWeatherData.air_quality.ozone_description}</p>
              </div>
            </div>
                    </div>
                  )}
                </div>
              ) : (
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
              )}
            </div>

          </div>

          {/* Second Destination Results */}
          {secondResults && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-blue-400 text-center mb-6">
                {secondResults.destination} - Country Data
              </h3>
              
              {/* Basic Country Information - Only for City Searches */}
              {!isCountrySearch(secondResults) && (
                <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500/30 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-green-400">🏛️ Basic Country Information</h4>
                    <button
                      onClick={() => setIsSecondCountryInfoExpanded(!isSecondCountryInfoExpanded)}
                      className="text-green-400 hover:text-green-300 transition-colors duration-200 flex items-center space-x-2"
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
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Country:</span>
                    <p className="text-white font-semibold">{secondResults.supabaseData?.country}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 text-sm">Population:</span>
                      <p className="text-white font-semibold">{secondResults.supabaseData?.population_mio} million</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 text-sm">GDP Per Capita:</span>
                      <p className="text-white font-semibold">${secondResults.supabaseData?.gdp_per_capita_usd?.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Life Expectancy:</span>
                      <p className="text-white font-semibold">{secondResults.supabaseData?.life_expectancy} years</p>
                  </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 text-sm">Electricity Access:</span>
                      <p className="text-white font-semibold">{secondResults.supabaseData?.population_electricity}%</p>
                </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 text-sm">Risk Class:</span>
                      <p className="text-white font-semibold">{secondResults.supabaseData?.risk_class}</p>
              </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 text-sm">Global Risk Rank:</span>
                      <p className="text-white font-semibold">#{secondResults.supabaseData?.global_rank}</p>
                      <p className="text-gray-400 text-xs mt-1">Higher rank = less risky</p>
                      {secondResults.comparisonData?.globalRankAbove && secondResults.comparisonData.globalRankAbove.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          Similar: {secondResults.comparisonData.globalRankAbove.slice(0, 1).map(c => `${c.country} (#${c.rank})`).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 text-sm">Peace Index Rank:</span>
                      <p className="text-white font-semibold">#{secondResults.supabaseData?.global_peace_rank}</p>
                      <p className="text-gray-400 text-xs mt-1">Higher rank = more peaceful</p>
                      {secondResults.comparisonData?.peaceRankAbove && secondResults.comparisonData.peaceRankAbove.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          Similar: {secondResults.comparisonData.peaceRankAbove.slice(0, 1).map(c => `${c.country} (#${c.rank})`).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

              {/* Globaltrot-Bot Summary */}
              {secondResults.chatgptSummary && (
                <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-blue-400">🤖 Globetrot-Bot Summary</h4>
                    <button
                      onClick={() => setIsSecondGlobetrotBotExpanded(!isSecondGlobetrotBotExpanded)}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center space-x-2"
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
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <div className="text-white leading-relaxed whitespace-pre-line">
                        {secondResults.chatgptSummary.split('\n').map((line, index) => {
                          // Remove any markdown formatting that might slip through
                          const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
                          
                          if (cleanLine.startsWith('# ')) {
                            return <h1 key={index} className="text-xl font-bold text-blue-300 mb-3 mt-4">{cleanLine.substring(2)}</h1>;
                          } else if (cleanLine.startsWith('## ')) {
                            return <h2 key={index} className="text-lg font-semibold text-blue-200 mb-2 mt-3">{cleanLine.substring(3)}</h2>;
                          } else if (cleanLine.startsWith('- ')) {
                            return <div key={index} className="ml-4 mb-1">• {cleanLine.substring(2)}</div>;
                          } else if (cleanLine.trim() === '') {
                            return <br key={index} />;
                          } else {
                            return <p key={index} className="mb-2">{cleanLine}</p>;
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Not really important, but still good to know */}
              {secondResults.fun_fact && (
                <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500/30 shadow-lg">
                  <h4 className="text-lg font-semibold text-purple-400 mb-4">🎭 Not really important, but still good to know</h4>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-white font-medium italic">"{secondResults.fun_fact?.replace(/^"|"$/g, '') || 'No fun fact available'}"</p>
                  </div>
                </div>
              )}

              {/* Economic Data - Only for Country Searches */}
              {isCountrySearch(secondResults) && (
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
                    <span className="text-gray-300 text-sm">Average Hotel Price:</span>
                    <p className="text-white font-semibold">${Math.floor(Math.random() * 200 + 50)}/night</p>
                  </div>
                </div>
              </div>
              )}

              {/* Risk Assessment with Comparisons - Only for Country Searches */}
              {isCountrySearch(secondResults) && (
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
                    {secondResults.comparisonData?.informSimilar && secondResults.comparisonData.informSimilar.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Similar: {secondResults.comparisonData.informSimilar.map(c => `${c.country} (${c.value})`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Global Risk Rank:</span>
                    <p className="text-white font-semibold">#{secondResults.supabaseData?.global_rank}</p>
                    {secondResults.comparisonData?.globalRankAbove && secondResults.comparisonData.globalRankAbove.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Above: {secondResults.comparisonData.globalRankAbove.map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                    {secondResults.comparisonData?.globalRankBelow && secondResults.comparisonData.globalRankBelow.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Below: {secondResults.comparisonData.globalRankBelow.map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Peace Index Rank:</span>
                    <p className="text-white font-semibold">#{secondResults.supabaseData?.global_peace_rank}</p>
                    {secondResults.comparisonData?.peaceRankAbove && secondResults.comparisonData.peaceRankAbove.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Above: {secondResults.comparisonData.peaceRankAbove.map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                    {secondResults.comparisonData?.peaceRankBelow && secondResults.comparisonData.peaceRankBelow.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Below: {secondResults.comparisonData.peaceRankBelow.map(c => `${c.country} (#${c.rank})`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}

              {/* Natural Hazards Spider Chart - For All Queries */}
              {secondResults.supabaseData && (
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-orange-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-orange-400 mb-4">🌪️ Natural Hazards (0-10 Scale)</h4>
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm">
                      National-level natural hazard risks for {secondResults.supabaseData.country}
                    </p>
                  </div>
                  <RiskRadarChart
                    hazardIndicators={{
                      earthquake: secondResults.supabaseData.earthquake,
                      river_flood: secondResults.supabaseData.river_flood,
                      tsunami: secondResults.supabaseData.tsunami,
                      tropical_storm: secondResults.supabaseData.tropical_storm,
                      coastal_flood: secondResults.supabaseData.coastal_flood,
                      drought: secondResults.supabaseData.drought,
                      epidemic: secondResults.supabaseData.epidemic,
                      projected_conflict: secondResults.supabaseData.projected_conflict,
                      current_conflict: secondResults.supabaseData.current_conflict
                    }}
                    firstDestination={secondResults.supabaseData.country}
                  />
                  </div>
              )}

              {/* Weather & Climate Data */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-cyan-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-cyan-400 mb-4">🌤️ Weather & Climate</h4>
                
                {secondResults.realWeatherData ? (
                  <div className="space-y-6">
                    {/* Current Weather */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-300 text-sm">Current Temperature:</span>
                        <p className="text-white font-semibold text-xl">{secondResults.realWeatherData.current.temperature}°C</p>
                        <p className="text-gray-400 text-xs">Feels like {secondResults.realWeatherData.current.apparent_temperature}°C</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                        <span className="text-gray-300 text-sm">Weather:</span>
                        <p className="text-white font-semibold">{secondResults.realWeatherData.current.weather_description}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                        <span className="text-gray-300 text-sm">Wind:</span>
                        <p className="text-white font-semibold">{secondResults.realWeatherData.current.wind_speed} km/h</p>
                        <p className="text-gray-400 text-xs">{secondResults.realWeatherData.current.wind_description}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                        <span className="text-gray-300 text-sm">Humidity:</span>
                        <p className="text-white font-semibold">{secondResults.realWeatherData.current.humidity}%</p>
                </div>
              </div>

                    {/* 24h Forecast */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                      <h5 className="text-cyan-300 font-semibold mb-3">Next 24 Hours</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-gray-300 text-sm">Max Temp:</span>
                          <p className="text-white font-semibold">{secondResults.realWeatherData.forecast.next_24h.max_temp}°C</p>
                  </div>
                        <div>
                          <span className="text-gray-300 text-sm">Min Temp:</span>
                          <p className="text-white font-semibold">{secondResults.realWeatherData.forecast.next_24h.min_temp}°C</p>
                  </div>
                        <div>
                          <span className="text-gray-300 text-sm">Precipitation:</span>
                          <p className="text-white font-semibold">{secondResults.realWeatherData.forecast.next_24h.total_precipitation}mm</p>
                  </div>
                        <div>
                          <span className="text-gray-300 text-sm">Avg Wind:</span>
                          <p className="text-white font-semibold">{secondResults.realWeatherData.forecast.next_24h.avg_wind_speed} km/h</p>
                  </div>
                </div>
              </div>

                    {/* 16-Day Forecast Chart */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                      <WeatherChart 
                        forecast={secondResults.realWeatherData.forecast.next_16_days} 
                        location={secondResults.realWeatherData.location}
                      />
                  </div>

                    {/* Weather Alerts */}
                    <WeatherAlerts 
                      alerts={secondResults.weatherAlerts} 
                      title="⚠️ Weather Alerts"
                    />

                    {/* Air Quality */}
                    {secondResults.realWeatherData.air_quality && (
                  <div className="p-4 bg-gray-700 rounded-lg">
                        <h5 className="text-cyan-300 font-semibold mb-3">Air Quality</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="col-span-2">
                            <span className="text-gray-300 text-sm">PM2.5:</span>
                            <p className="text-white font-semibold">{secondResults.realWeatherData.air_quality.pm2_5} μg/m³</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{secondResults.realWeatherData.air_quality.pm2_5_description}</p>
                  </div>
                          <div className="col-span-2">
                            <span className="text-gray-300 text-sm">PM10:</span>
                            <p className="text-white font-semibold">{secondResults.realWeatherData.air_quality.pm10} μg/m³</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{secondResults.realWeatherData.air_quality.pm10_description}</p>
                  </div>
                          <div className="col-span-2">
                            <span className="text-gray-300 text-sm">UV Index:</span>
                            <p className="text-white font-semibold">{secondResults.realWeatherData.air_quality.uv_index}</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{secondResults.realWeatherData.air_quality.uv_index_description}</p>
                  </div>
                          <div className="col-span-2">
                            <span className="text-gray-300 text-sm">Ozone:</span>
                            <p className="text-white font-semibold">{secondResults.realWeatherData.air_quality.ozone} μg/m³</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{secondResults.realWeatherData.air_quality.ozone_description}</p>
                </div>
              </div>
                      </div>
                    )}
                  </div>
                ) : (
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
          )}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
