'use client';

import { useState, useEffect } from 'react';
import CountryMap from './CountryMap';

interface SearchHistory {
  destination: string;
  timestamp: number;
}

interface SearchResult {
  destination: string;
  fun_fact?: string;
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
    console.log('=== RESULTS STATE CHANGE ===');
    console.log('Results state changed:', results);
    if (results) {
      console.log('Results destination:', results.destination);
      console.log('Results supabase data:', results.supabaseData);
      console.log('Results supabase data type:', typeof results.supabaseData);
      console.log('Results supabase data keys:', results.supabaseData ? Object.keys(results.supabaseData) : 'null');
      console.log('Results has data:', !!results.supabaseData);
    } else {
      console.log('Results is null/undefined');
    }
    console.log('=== RESULTS STATE CHANGE END ===');
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
    console.log('=== SEARCH DEBUG START ===');
    console.log('handleSearch called with:', searchTerm);
    console.log('searchQuery state:', searchQuery);
    console.log('searchTerm.trim():', searchTerm.trim());
    console.log('searchTerm.trim().length:', searchTerm.trim().length);
    
    if (!searchTerm.trim()) {
      console.log('Search term is empty, returning');
      console.log('=== SEARCH DEBUG END ===');
      return;
    }

    console.log('Starting search for:', searchTerm);
    setIsSearching(true);
    setError('');
    setResults(null);
    setShowHistory(false);

    try {
      console.log('Making API call to:', `/api/search?destination=${encodeURIComponent(searchTerm)}`);
      console.log('About to make fetch request...');
      const response = await fetch(`/api/search?destination=${encodeURIComponent(searchTerm)}&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('API response received');
      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);
      
      if (!response.ok) {
        console.log('API response not ok, throwing error');
        throw new Error('Search failed');
      }
      
      console.log('API response is ok, parsing JSON...');
      const data = await response.json();
      console.log('JSON parsed successfully');
      console.log('API response data:', JSON.stringify(data, null, 2));
      console.log('Setting results with:', data);
      console.log('Results destination:', data.destination);
      console.log('Results supabaseData:', data.supabaseData);
      console.log('Results supabaseData type:', typeof data.supabaseData);
      console.log('Results supabaseData keys:', data.supabaseData ? Object.keys(data.supabaseData) : 'null');
      setResults(data);
      console.log('Results state should now be updated');
      saveToHistory(searchTerm.trim());
      console.log('=== SEARCH DEBUG END ===');
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

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Input changed to:', value);
    setSearchQuery(value);
  };

  // Debounced city search effect
  useEffect(() => {
    console.log('Debounced search effect triggered for:', searchQuery);
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        console.log('Searching city suggestions for:', searchQuery);
        searchCitySuggestions(searchQuery);
      } else {
        console.log('Clearing city suggestions');
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle city suggestion selection
  const handleCitySelect = (suggestion: any) => {
    console.log('City suggestion selected:', suggestion);
    setSearchQuery(suggestion.display);
    setShowSuggestions(false);
    setCitySuggestions([]);
    handleSearch(suggestion.display);
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
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setShowHistory(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter a city or country"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
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
                onClick={() => {
                  console.log('=== SEARCH BUTTON CLICKED ===');
                  console.log('Search button clicked');
                  console.log('searchQuery:', searchQuery);
                  console.log('searchQuery.trim():', searchQuery.trim());
                  console.log('searchQuery.trim().length:', searchQuery.trim().length);
                  console.log('isSearching:', isSearching);
                  console.log('Button disabled:', isSearching || !searchQuery.trim());
                  handleSearch();
                  console.log('=== SEARCH BUTTON CLICKED END ===');
                }}
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
                    onChange={(e) => setSecondDestination(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSecondSearch()}
                    placeholder="Enter a city or country"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  />
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
        onCountrySelect={handleCountrySelect}
      />

      {/* Results Display */}
      {console.log('=== RENDERING RESULTS ===', results)}
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

            {/* Fun Fact */}
            {results.fun_fact && (
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500/30 shadow-lg">
                <h4 className="text-lg font-semibold text-purple-400 mb-4">💡 Fun Fact</h4>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-white font-medium italic">"{results.fun_fact}"</p>
                </div>
              </div>
            )}

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
                  <span className="text-gray-300 text-sm">Average Hotel Price:</span>
                  <p className="text-white font-semibold">${Math.floor(Math.random() * 200 + 50)}/night</p>
                </div>
              </div>
            </div>

            {/* Risk Assessment with Comparisons */}
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

              {/* Fun Fact */}
              {secondResults.fun_fact && (
                <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500/30 shadow-lg">
                  <h4 className="text-lg font-semibold text-purple-400 mb-4">💡 Fun Fact</h4>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-white font-medium italic">"{secondResults.fun_fact}"</p>
                  </div>
                </div>
              )}

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
                    <span className="text-gray-300 text-sm">Average Hotel Price:</span>
                    <p className="text-white font-semibold">${Math.floor(Math.random() * 200 + 50)}/night</p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment with Comparisons */}
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
