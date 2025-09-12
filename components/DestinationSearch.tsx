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
    gdpSimilar: { country: string; gdp: number }[];
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
    languages?: string;
    currency?: string;
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
    temperature: { trend: string; average: number; min: number; max: number };
    precipitation: { trend: string; average: number; days: number };
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

export default function DestinationSearchNew() {
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
  
  // Tab-based navigation for organized information display
  const [activeTab, setActiveTab] = useState('summary');
  const [secondActiveTab, setSecondActiveTab] = useState('summary');
  
  const [useImperialUnits, setUseImperialUnits] = useState(false);

  // Unit conversion functions
  const convertTemperature = (celsius: number): number => {
    return useImperialUnits ? Math.round((celsius * 9/5) + 32) : Math.round(celsius);
  };

  const convertWindSpeed = (kmh: number): number => {
    return useImperialUnits ? Math.round(kmh * 0.621371) : Math.round(kmh);
  };

  const getTemperatureUnit = (): string => {
    return useImperialUnits ? '°F' : '°C';
  };

  const getWindSpeedUnit = (): string => {
    return useImperialUnits ? ' mph' : ' km/h';
  };

  const isCountrySearch = (result: SearchResult): boolean => {
    return !result.coordinates || !result.coordinates.cityName;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');
    
    try {
      const response = await fetch(`/api/search?destination=${encodeURIComponent(searchQuery)}&t=${Date.now()}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
      setResults(data);
        setSearchHistory(prev => [
          { destination: searchQuery, timestamp: Date.now() },
          ...prev.filter(h => h.destination !== searchQuery).slice(0, 9)
        ]);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSecondSearch = async () => {
    if (!secondDestination.trim()) return;
    
    try {
      const response = await fetch(`/api/search?destination=${encodeURIComponent(secondDestination)}&t=${Date.now()}`);
        const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSecondResults(data);
      }
    } catch (err) {
      setError('Failed to fetch second destination data. Please try again.');
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (compareMode) {
      setSecondResults(null);
      setSecondDestination('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 2) {
      fetchCitySuggestions(value);
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
  };

  const handleSecondInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSecondDestination(value);
    
    if (value.length > 2) {
      fetchSecondCitySuggestions(value);
      } else {
        setSecondCitySuggestions([]);
        setShowSecondSuggestions(false);
      }
  };

  const fetchCitySuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/city-search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      setCitySuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Failed to fetch city suggestions:', err);
    }
  };

  const fetchSecondCitySuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/city-search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      setSecondCitySuggestions(data.suggestions || []);
      setShowSecondSuggestions(true);
    } catch (err) {
      console.error('Failed to fetch city suggestions:', err);
    }
  };

  const handleCitySelect = (suggestion: any) => {
    setSearchQuery(suggestion.display);
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const handleSecondCitySelect = (suggestion: any) => {
    setSecondDestination(suggestion.display);
    setSecondCitySuggestions([]);
    setShowSecondSuggestions(false);
  };

  const handleHistorySelect = (destination: string) => {
    setSearchQuery(destination);
    setShowHistory(false);
  };

  const TabContent = ({ result, tabId, setTabId }: { result: SearchResult; tabId: string; setTabId: (tab: string) => void }) => (
    <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'summary', label: '30 Second Summary', color: 'blue' },
          { id: 'stats', label: 'Quick Stats', color: 'green' },
          { id: 'weather', label: 'Weather', color: 'sky' },
          { id: 'airquality', label: 'Air Quality', color: 'teal' },
          { id: 'safety', label: 'Safety', color: 'red' },
          { id: 'funfact', label: 'Good to know?', color: 'amber' },
          { id: 'news', label: 'News', color: 'purple' }
        ].map((tab) => {
          const isActive = tabId === tab.id;
          const colorClasses = {
            blue: isActive ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
            green: isActive ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50',
            sky: isActive ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50' : 'text-sky-600 hover:text-sky-800 hover:bg-sky-50',
            teal: isActive ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' : 'text-teal-600 hover:text-teal-800 hover:bg-teal-50',
            red: isActive ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-red-600 hover:text-red-800 hover:bg-red-50',
            amber: isActive ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50' : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50',
            purple: isActive ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
          };
          
          return (
            <button
              key={tab.id}
              onClick={() => setTabId(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${colorClasses[tab.color as keyof typeof colorClasses]}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabId === 'summary' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">30 Second Summary</h3>
            
            {/* Summary */}
            {result.chatgptSummary && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <div className="text-black leading-relaxed whitespace-pre-line">
                  {result.chatgptSummary.split('\n').map((line, index) => {
                    const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
                    
                    if (cleanLine.startsWith('# ')) {
                      return <h1 key={index} className="text-xl font-bold text-blue-600 mb-3 mt-4">{cleanLine.substring(2)}</h1>;
                    } else if (cleanLine.startsWith('## ')) {
                      return <h2 key={index} className="text-lg font-semibold text-blue-500 mb-2 mt-3">{cleanLine.substring(3)}</h2>;
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
            {!result.chatgptSummary && (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <p>AI summary not available for this destination</p>
              </div>
            )}
          </div>
        )}

        {tabId === 'stats' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            
            {/* Primary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">{result.supabaseData?.country}</div>
                <div className="text-xs text-gray-600">Country</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">{result.supabaseData?.population_mio}M</div>
                <div className="text-xs text-gray-600">Population</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-semibold text-orange-600">{result.supabaseData?.area_km2?.toLocaleString()} km²</div>
                <div className="text-xs text-gray-600">Country Size</div>
                {result.supabaseData?.similar_size_country && (
                  <div className="text-xs text-gray-500 mt-1">
                    Similar: {result.supabaseData.similar_size_country}
                  </div>
                )}
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-600">${result.supabaseData?.gdp_per_capita_usd?.toLocaleString()}</div>
                <div className="text-xs text-gray-600">GDP Per Capita</div>
                {result.comparisonData?.gdpSimilar && result.comparisonData.gdpSimilar.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Similar: {result.comparisonData.gdpSimilar[0]?.country}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Stats */}
            {result.supabaseData && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">Additional Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-600">{result.supabaseData.life_expectancy} years</div>
                    <div className="text-xs text-gray-600">Life Expectancy</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-600">{result.supabaseData.population_electricity}%</div>
                    <div className="text-xs text-gray-600">Electricity Access</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-600">{result.supabaseData.languages || 'N/A'}</div>
                    <div className="text-xs text-gray-600">Spoken Languages</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-600">{result.supabaseData.currency || 'N/A'}</div>
                    <div className="text-xs text-gray-600">Currency</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tabId === 'weather' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Weather & Climate</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Units:</span>
                <button
                  onClick={() => setUseImperialUnits(!useImperialUnits)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    useImperialUnits 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {useImperialUnits ? '°F / mph' : '°C / km/h'}
                </button>
              </div>
            </div>
            {result.realWeatherData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">{convertTemperature(result.realWeatherData.current.temperature)}{getTemperatureUnit()}</div>
                    <div className="text-xs text-gray-600">Current</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">{result.realWeatherData.current.precipitation}mm</div>
                    <div className="text-xs text-gray-600">Precipitation</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-semibold text-orange-600">{convertWindSpeed(result.realWeatherData.current.wind_speed)}{getWindSpeedUnit()}</div>
                    <div className="text-xs text-gray-600">Wind</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">{result.realWeatherData.current.relative_humidity}%</div>
                    <div className="text-xs text-gray-600">Humidity</div>
                  </div>
                </div>
                <WeatherChart 
                  forecast={result.realWeatherData.forecast?.next_16_days} 
                  location={result.realWeatherData.location}
                  useImperialUnits={useImperialUnits} 
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Weather data not available</div>
            )}
          </div>
        )}

        {tabId === 'airquality' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Air Quality</h3>
            {result.realWeatherData?.air_quality ? (
              <AirQuality airQuality={result.realWeatherData.air_quality} title="" />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌬️</span>
                </div>
                <p>Air quality data not available</p>
              </div>
            )}
          </div>
        )}

        {tabId === 'safety' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Safety & Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-lg font-semibold text-red-600">{result.supabaseData?.risk_class}</div>
                <div className="text-xs text-gray-600 mb-2">Risk Class</div>
                <div className="text-xs text-gray-700">
                  {result.supabaseData?.risk_class === 'Very Low' && 'Very safe, stable place.'}
                  {result.supabaseData?.risk_class === 'Low' && 'Mostly safe, some minor risks.'}
                  {result.supabaseData?.risk_class === 'Medium' && 'Some safety or disaster concerns — be prepared.'}
                  {result.supabaseData?.risk_class === 'High' && 'Big risks from disasters or instability — caution needed.'}
                  {result.supabaseData?.risk_class === 'Very High' && 'Very unsafe, serious disaster or conflict risks — avoid travel.'}
                </div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-semibold text-yellow-600">#{result.supabaseData?.global_rank}</div>
                <div className="text-xs text-gray-600">Risk Rank</div>
                <div className="text-xs text-gray-500 mt-1">Higher = Safer</div>
                {result.comparisonData?.globalRankSimilar && result.comparisonData.globalRankSimilar.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Similar: {result.comparisonData.globalRankSimilar[0]?.country}
                  </div>
                )}
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">#{result.supabaseData?.global_peace_rank}</div>
                <div className="text-xs text-gray-600">Peace Rank</div>
                <div className="text-xs text-gray-500 mt-1">Higher = More Peaceful</div>
                {result.comparisonData?.peaceRankSimilar && result.comparisonData.peaceRankSimilar.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Similar: {result.comparisonData.peaceRankSimilar[0]?.country}
                  </div>
                )}
              </div>
            </div>
            {result.supabaseData && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">Natural Hazards</h4>
                <RiskRadarChart
                  hazardIndicators={{
                    earthquake: result.supabaseData.earthquake,
                    river_flood: result.supabaseData.river_flood,
                    tsunami: result.supabaseData.tsunami,
                    tropical_storm: result.supabaseData.tropical_storm,
                    coastal_flood: result.supabaseData.coastal_flood,
                    drought: result.supabaseData.drought,
                    epidemic: result.supabaseData.epidemic,
                    projected_conflict: result.supabaseData.projected_conflict,
                    current_conflict: result.supabaseData.current_conflict
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
                  firstDestination={result.supabaseData.country}
                  secondDestination={compareMode && secondResults?.supabaseData ? secondResults.supabaseData.country : undefined}
                />
              </div>
            )}
            
            {/* Weather Alerts */}
            {result.weatherAlerts && (
              <div className="mt-6">
                <WeatherAlerts alerts={result.weatherAlerts} title="Weather Alerts" />
              </div>
            )}
          </div>
        )}

        {tabId === 'funfact' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Good to know?</h3>
            {result.fun_fact && (
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <p className="text-gray-700 italic text-lg leading-relaxed">"{result.fun_fact?.replace(/^"|"$/g, '')}"</p>
              </div>
            )}
            {!result.fun_fact && (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❓</span>
                </div>
                <p>No interesting information available for this destination</p>
              </div>
            )}
          </div>
        )}

        {tabId === 'news' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Latest News</h3>
            <CityNews city={result.destination} title="" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
        
          <div className={`max-w-4xl mx-auto ${compareMode ? 'grid grid-cols-1 md:grid-cols-2 gap-6 items-start' : 'max-w-lg'}`}>
          {/* First Destination */}
            <div className={`relative ${compareMode ? 'h-full flex flex-col' : ''}`}>
            <label className="block text-left text-sm font-medium text-black mb-2">
              {compareMode ? 'First Destination' : 'Search for any city or country'}
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => setShowSuggestions(false)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter a city or country"
                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
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
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                  {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
              
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    {showHistory ? 'Hide' : 'Show'} Recent Searches
                  </button>
                  {showHistory && (
                    <div className="mt-2 p-2 bg-gray-100 border border-gray-300 rounded-lg">
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleHistorySelect(item.destination)}
                          className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors duration-200"
                        >
                          {item.destination}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                    onClick={handleSecondSearch}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                >
                  Search
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
          
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Map Display - Always below search */}
        {(results || secondResults) && (
          <div className="mb-8">
      <CountryMap 
              searchQuery={searchQuery}
        coordinates={results?.coordinates}
              secondCoordinates={secondResults?.coordinates}
            />
        </div>
      )}

      {/* Results Display */}
      {results && (
          <div className="space-y-6">
            <TabContent result={results} tabId={activeTab} setTabId={setActiveTab} />
              </div>
            )}

        {/* Second Results Display */}
          {secondResults && (
          <div className="space-y-6 mt-6">
            <TabContent result={secondResults} tabId={secondActiveTab} setTabId={setSecondActiveTab} />
                </div>
                  )}
                </div>
    </div>
  );
}
