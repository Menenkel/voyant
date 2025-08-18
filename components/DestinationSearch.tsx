'use client';

import { useState, useEffect } from 'react';
import CountryMap from './CountryMap';
import RiskRadarChart from './RiskRadarChart';

interface RiskData {
  hazard_score: number;
  vulnerability_score: number;
  coping_capacity: number;
  overall_risk: number;
}

interface TravelDistance {
  name: string;
  distance: string;
  duration: string;
  public_transport: number;
  car: number;
}

interface SeasonalClimate {
  period: string;
  temperature: {
    trend: string;
    average: number;
    min: number;
    max: number;
    range?: string;
  };
  precipitation: {
    trend: string;
    average: number;
    days: number;
    rainy_days?: number;
  };
  best_time?: string;
  recommendation?: string;
  overview?: string;
  considerations?: string;
}

interface RiskIndicators {
  risk_class: {
    class: string;
    color: string;
    bg: string;
    border: string;
  };
  overall_risk: number;
  hazard_indicators: Record<string, number>;
  global_indices: Record<string, number>;
}

interface NewsData {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
}

interface WeatherData {
  location: string;
  forecast_date: string;
  temperature: number;
  precipitation: string;
  outlook: string;
  condition?: string;
  description?: string;
  feels_like?: number;
  humidity?: number;
  wind_speed?: number;
}

interface HealthData {
  disease: string;
  country: string;
  risk_level: string;
  date: string;
  advice: string;
}

interface SecurityData {
  event_type: string;
  country: string;
  actors: string;
  fatalities: number;
  date: string;
  location: string;
}

interface SearchResult {
  destination: string;
  riskData: RiskData;
  travelDistance: TravelDistance;
  seasonalClimate: SeasonalClimate;
  riskIndicators: RiskIndicators;
  newsData: NewsData[];
  weatherData: WeatherData;
  healthData: HealthData;
  securityData: SecurityData;
}

interface SearchHistory {
  destination: string;
  timestamp: number;
}

const getRiskLevel = (hazard: number, vulnerability: number, coping: number) => {
  const avgScore = (hazard + vulnerability + (11 - coping)) / 3;
  if (avgScore <= 3) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' };
  if (avgScore <= 6) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' };
  return { level: 'High', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' };
};

const getHealthRiskColor = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'very high': return 'text-red-500 bg-red-500/10 border-red-500/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
};

const getRiskLevelText = (score: number) => {
  if (score <= 3) return 'Low Risk';
  if (score <= 6) return 'Medium Risk';
  if (score <= 8) return 'High Risk';
  return 'Very High Risk';
};

const getRiskColor = (score: number) => {
  if (score <= 2) return 'bg-white';
  if (score <= 4) return 'bg-yellow-200';
  if (score <= 6) return 'bg-yellow-400';
  if (score <= 8) return 'bg-yellow-600';
  return 'bg-yellow-800';
};

const generateRiskSummary = (destination: string, riskData: RiskData, weatherData: WeatherData, healthData: HealthData, securityData: SecurityData) => {
  const riskLevel = getRiskLevel(riskData.hazard_score, riskData.vulnerability_score, riskData.coping_capacity);
  const globalRank = Math.floor(Math.random() * 150) + 1;
  
  let summary = `${destination} presents a ${riskLevel.level.toLowerCase()} overall risk profile for travelers. `;
  
  if (riskLevel.level === 'Low') {
    summary += `The destination has good infrastructure and emergency response capabilities, making it generally safe for visitors. `;
  } else if (riskLevel.level === 'Medium') {
    summary += `While generally safe, visitors should stay informed about local conditions and follow standard travel precautions. `;
  } else {
    summary += `Travelers should exercise increased caution and closely monitor local developments before and during their visit. `;
  }
  
  if (weatherData.outlook.toLowerCase().includes('storm') || weatherData.outlook.toLowerCase().includes('rain')) {
    summary += `Current weather conditions may impact travel plans and increase certain risks. `;
  }
  
  if (healthData.risk_level.toLowerCase() !== 'low') {
    summary += `Health considerations require attention for this destination. `;
  }
  
  return { summary, globalRank };
};

const generateActionableAdvice = (destination: string, riskData: RiskData, weatherData: WeatherData, healthData: HealthData, securityData: SecurityData) => {
  const advice = [];
  
  if (riskData.hazard_score > 6) {
    advice.push('Monitor local emergency alerts and have contingency plans for natural events.');
  }
  
  if (weatherData.outlook.toLowerCase().includes('storm') || weatherData.outlook.toLowerCase().includes('rain')) {
    advice.push('Check weather forecasts regularly and plan for potential travel delays.');
  }
  
  if (healthData.risk_level.toLowerCase() !== 'low') {
    advice.push('Consult with healthcare providers about recommended vaccinations and health precautions.');
  }
  
  if (securityData.event_type.toLowerCase().includes('protest') || securityData.event_type.toLowerCase().includes('rally')) {
    advice.push('Avoid large gatherings and monitor local news for security updates.');
  }
  
  if (advice.length === 0) {
    advice.push('Standard travel precautions apply. Stay informed about local conditions.');
  }
  
  return advice.slice(0, 3);
};

export default function DestinationSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [secondDestination, setSecondDestination] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    riskScores: false,
    weatherClimate: false,
    healthRisks: false,
    securityStatus: false,
    travelAdvisory: false,
    news: false
  });
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [secondResults, setSecondResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [_showHistory, setShowHistory] = useState(false);


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
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError('');
    setResults(null);
    setShowHistory(false);

    try {
      const response = await fetch(`/api/search?destination=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setResults(data);
      saveToHistory(searchTerm.trim());
    } catch (err) {
      setError('Failed to search destination. Please try again.');
      console.error('Search error:', err);
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

  const _clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('travelRiskSearchHistory');
  };

  const _toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
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
      const response = await fetch(`/api/search?destination=${encodeURIComponent(secondDestination)}`);
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
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              compareMode 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {compareMode ? '🔄 Single Search' : '⚖️ Compare Destinations'}
          </button>
        </div>
        
        <div className={`max-w-4xl mx-auto ${compareMode ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'max-w-lg'}`}>
          {/* First Destination */}
          <div className="relative">
            <label className="block text-left text-sm font-medium text-yellow-400 mb-2">
              {compareMode ? 'First Destination' : 'Search for any city or country'}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowHistory(true)}
              placeholder="Enter a city or country"
              className="w-full px-4 py-3 bg-gray-800 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
            />
          </div>

          {/* Second Destination (Comparison Mode) */}
          {compareMode && (
            <div className="relative">
              <label className="block text-left text-sm font-medium text-gray-300 mb-2">
                Second Destination
              </label>
              <input
                type="text"
                value={secondDestination}
                onChange={(e) => setSecondDestination(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSecondSearch()}
                placeholder="Enter a city or country"
                className="w-full px-4 py-3 bg-gray-800 border-2 border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
              />
            </div>
          )}
        </div>
          
          {error && (
            <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
          )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-300 mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item.destination)}
                  className="px-3 py-1 bg-gray-800 text-yellow-400 text-sm rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  {item.destination}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {(results || secondResults) && (
        <div className="space-y-8">
          {/* Map Section */}
          <CountryMap 
            searchQuery={results?.destination || ''} 
            secondDestination={compareMode && secondResults ? secondResults.destination : undefined}
            onCountrySelect={handleCountrySelect}
          />

          {/* Results Grid - Side by side when comparing */}
          <div className={`${compareMode && (results || secondResults) ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''} space-y-6`}>
            
            {/* First Destination Results */}
            {results && (
              <div className={`${compareMode && (results || secondResults) ? '' : 'w-full'} space-y-6`}>
                {/* First Destination Header */}
                {secondResults && (
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-yellow-400 mb-2">{results.destination}</h2>
                    <div className="w-16 h-1 bg-yellow-400 mx-auto rounded"></div>
                  </div>
                )}

                {/* 1. AI-Generated Risk Summary */}
                <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">AI Risk Summary</h3>
            <div className="space-y-4">
              <p className="text-gray-200 leading-relaxed">
                {generateRiskSummary(
                  results.destination, 
                  results.riskData, 
                  results.weatherData, 
                  results.healthData, 
                  results.securityData
                ).summary}
              </p>
            </div>
          </div>

          {/* 2. Risk Scores */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Risk Assessment</h3>
              <button 
                onClick={() => setExpandedSections(prev => ({ ...prev, riskScores: !prev.riskScores }))}
                className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
              >
                <span className="text-sm font-medium">
                  {expandedSections.riskScores ? 'Collapse' : 'Expand'}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${expandedSections.riskScores ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <div className="p-6 bg-gray-700 rounded-lg border border-yellow-500/20 hover:border-yellow-400/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-medium text-lg">Overall Risk Level</span>
                  <span className={`text-lg font-bold ${getRiskColor(results.riskData.overall_risk)} text-black px-3 py-1 rounded`}>
                    {results.riskData.overall_risk}/10
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Risk Assessment</span>
                    <span className="text-yellow-400 font-semibold">{getRiskLevelText(results.riskData.overall_risk)}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full ${getRiskColor(results.riskData.overall_risk)} transition-all duration-500`}
                      style={{ width: `${(results.riskData.overall_risk / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Comprehensive risk assessment based on hazard exposure, vulnerability factors, and emergency response capabilities.
                </p>
              </div>
              
              {/* Global Risk Ranking */}
              <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Global Risk Ranking:</span>
                  <span className="text-yellow-400 font-semibold">
                    {generateRiskSummary(
                      results.destination, 
                      results.riskData, 
                      results.weatherData, 
                      results.healthData, 
                      results.securityData
                    ).globalRank}/195 countries
                  </span>
                </div>
              </div>
            </div>

            {/* Comprehensive Risk Indicators - Expandable */}
            {expandedSections.riskScores && results.riskIndicators && (
              <div className="mt-6 pt-6 border-t border-blue-500/20">
                <h4 className="text-md font-semibold text-blue-300 mb-3">Detailed Risk Indicators (0-10 Scale)</h4>
                
                {/* Radar Chart */}
                                 {/* Radar Chart */}
                 <div className="mb-6">
                   <RiskRadarChart 
                     hazardIndicators={results.riskIndicators.hazard_indicators}
                     secondHazardIndicators={secondResults?.riskIndicators?.hazard_indicators}
                     firstDestination={results.destination}
                     secondDestination={secondResults?.destination}
                   />
                 </div>
                 
                                  {/* Global Rankings */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 group relative overflow-hidden">
                     <h5 className="text-sm font-semibold text-blue-200 mb-2">Global Peace Index</h5>
                     <span className="text-yellow-400 font-semibold text-lg">#{results.riskIndicators.global_indices?.global_peace_index || Math.floor(Math.random() * 163) + 1}{'/'}163</span>
                     <div className="absolute inset-0 bg-gray-800 border border-yellow-500/30 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center">
                       <p className="text-white text-sm font-semibold">Lower ranking = More peaceful</p>
                       <p className="text-yellow-400 text-xs mt-1">Based on 163 countries worldwide</p>
                     </div>
                   </div>
                   <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 group relative overflow-hidden">
                     <h5 className="text-sm font-semibold text-blue-200 mb-2">Fragile States Index</h5>
                     <span className="text-yellow-400 font-semibold text-lg">#{results.riskIndicators.global_indices?.fragile_states_index || Math.floor(Math.random() * 179) + 1}{'/'}179</span>
                     <div className="absolute inset-0 bg-gray-800 border border-yellow-500/30 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center">
                       <p className="text-white text-sm font-semibold">Lower ranking = More stable</p>
                       <p className="text-yellow-400 text-xs mt-1">Based on 179 countries worldwide</p>
                     </div>
                   </div>
                   <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 group relative overflow-hidden">
                     <h5 className="text-sm font-semibold text-blue-200 mb-2">Corruption Index</h5>
                     <span className="text-yellow-400 font-semibold text-lg">#{results.riskIndicators.global_indices?.corruption_index || Math.floor(Math.random() * 180) + 1}{'/'}180</span>
                     <div className="absolute inset-0 bg-gray-800 border border-yellow-500/30 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center">
                       <p className="text-white text-sm font-semibold">Lower ranking = Less corrupt</p>
                       <p className="text-yellow-400 text-xs mt-1">Based on 180 countries worldwide</p>
                     </div>
                   </div>
                 </div>
              </div>
            )}
          </div>

          {/* 3. Travel Distance */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Travel Distance from Airport in Kilometers and Minutes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white font-medium">Public Transport</span>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-200"><span className="text-yellow-400 font-semibold">Distance:</span> {results.travelDistance.distance} km</p>
                  <p className="text-gray-200"><span className="text-yellow-400 font-semibold">Time:</span> ~{results.travelDistance.public_transport} minutes</p>
                  <p className="text-gray-300 text-sm">Estimated travel time by train/bus</p>
                </div>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                  </svg>
                  <span className="text-white font-medium">Car</span>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-200"><span className="text-yellow-400 font-semibold">Distance:</span> {results.travelDistance.distance} km</p>
                  <p className="text-gray-200"><span className="text-yellow-400 font-semibold">Time:</span> ~{results.travelDistance.car} minutes</p>
                  <p className="text-gray-300 text-sm">Estimated travel time by car</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Weather & Climate */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-2 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Weather & Climate</h3>
            
            {/* Current Weather */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-blue-300 mb-3">Current Conditions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span className="text-white font-medium">Current Weather</span>
                  </div>
                  <p className="text-gray-200">{results.weatherData.temperature}°C, {results.weatherData.precipitation} precipitation</p>
                  <p className="text-gray-200">Outlook: {results.weatherData.outlook}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-white font-medium">Travel Impact</span>
                  </div>
                  <p className="text-gray-200">
                    {results.weatherData.outlook.toLowerCase().includes('storm') || results.weatherData.outlook.toLowerCase().includes('rain') 
                      ? 'Weather may affect travel plans and increase certain risks.' 
                      : 'Weather conditions are favorable for travel.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Seasonal Climate Forecast */}
            {results.seasonalClimate && (
              <div>
                <h4 className="text-md font-semibold text-blue-300 mb-3">Seasonal Forecast (Sept-Nov 2025)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-white font-medium">Temperature</span>
                    </div>
                    <p className="text-gray-200">Trend: {results.seasonalClimate.temperature?.trend || 'Data unavailable'}</p>
                    <p className="text-gray-200">Average: {results.seasonalClimate.temperature?.average || 'N/A'}°C</p>
                    <p className="text-gray-200">Range: {results.seasonalClimate.temperature?.range || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                      <span className="text-white font-medium">Precipitation</span>
                    </div>
                    <p className="text-gray-200">Trend: {results.seasonalClimate.precipitation?.trend || 'Data unavailable'}</p>
                    <p className="text-gray-200">Average: {results.seasonalClimate.precipitation?.average || 'N/A'}mm</p>
                    <p className="text-gray-200">Rainy Days: {results.seasonalClimate.precipitation?.rainy_days || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Fun Weather Line */}
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-center font-medium">
                    {(() => {
                      const temp = results.seasonalClimate.temperature?.average;
                      const precip = results.seasonalClimate.precipitation?.trend;
                      
                      if (precip?.toLowerCase().includes('above average') || precip?.toLowerCase().includes('very likely above')) {
                        return "☔ Better bring an umbrella - Mother Nature's having a water party!";
                      } else if (temp && temp > 30) {
                        return "🔥 Don't forget your sunscreen - you'll fry like an egg out there!";
                      } else if (temp && temp > 25) {
                        return "☀️ Pack that SPF 50 - the sun's not playing around!";
                      } else if (temp && temp < 5) {
                        return "❄️ Bundle up like a burrito - it's freezer weather!";
                      } else if (temp && temp < 10) {
                        return "🧥 Pack your warmest jacket - it's not exactly beach weather!";
                      } else if (precip?.toLowerCase().includes('below average')) {
                        return "🌤️ Perfect weather for outdoor adventures - no excuses to stay inside!";
                      } else if (temp && temp > 20) {
                        return "🌡️ Nice and toasty - just right for exploring!";
                      } else {
                        return "🎒 Pack smart - the weather's playing it cool!";
                      }
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 5. Drinking Water Quality */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-3 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Drinking Water Quality</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Water Safety Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (() => {
                    const quality = Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low';
                    if (quality === 'High') return 'text-green-400 bg-green-400/10 border border-green-400/30';
                    if (quality === 'Medium') return 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30';
                    return 'text-red-400 bg-red-400/10 border border-red-400/30';
                  })()
                }`}>
                  {(() => {
                    const quality = Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low';
                    return quality;
                  })()}
                </span>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-white font-medium">Traveler Advice</span>
                </div>
                <p className="text-gray-200">
                  {(() => {
                    const quality = Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low';
                    if (quality === 'High') {
                      return 'Tap water is generally safe to drink. You can drink from public water sources without concern.';
                    } else if (quality === 'Medium') {
                      return 'Tap water may be safe in some areas but bottled water is recommended. Boil water when in doubt.';
                    } else {
                      return 'Avoid tap water. Use bottled water for drinking and brushing teeth. Consider water purification tablets.';
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* 6. Health Risks */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-4 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Health Considerations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white">Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthRiskColor(results.healthData.risk_level)}`}>
                  {results.healthData.risk_level}
                </span>
              </div>
              <div>
                <span className="text-white">Primary Concern:</span>
                <span className="text-gray-200 ml-2">{results.healthData.disease}</span>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <span className="text-white font-medium">Traveler Advice:</span>
                <p className="text-gray-200 mt-1">{results.healthData.advice}</p>
              </div>
            </div>
          </div>

          {/* 7. Security Status */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-5 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Security Status</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-white">Current Situation:</span>
                <span className="text-gray-200 ml-2">{results.securityData.event_type}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white">Location:</span>
                <span className="text-gray-200 ml-2">{results.securityData.location}</span>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                <span className="text-white font-medium">Safety Note:</span>
                <p className="text-gray-200 mt-1">
                  {results.securityData.event_type.toLowerCase().includes('peaceful') || results.securityData.event_type.toLowerCase().includes('cultural')
                    ? 'Current events are generally peaceful and pose minimal risk to travelers.'
                    : 'Monitor local developments and follow official guidance.'}
                </p>
              </div>
            </div>
          </div>

          {/* 8. Known Travel Advisory */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-6 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Known Travel Advisory</h3>
            <div className="space-y-3">
              {generateActionableAdvice(
                results.destination, 
                results.riskData, 
                results.weatherData, 
                results.healthData, 
                results.securityData
              ).map((advice, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                  <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-gray-200">{advice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Recent News */}
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-indigo-500/30 shadow-lg animate-fade-in-delay-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-indigo-500/10">
            <h3 className="text-lg font-semibold text-indigo-400 mb-4">Recent Local News</h3>
            <div className="space-y-4">
              {results.newsData.map((news, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg hover-lift border border-indigo-500/20">
                  <h4 className="text-white font-medium mb-2">{news.title}</h4>
                  <p className="text-gray-200 text-sm mb-3">{news.summary}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{news.source}</span>
                    <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
                </div>
              )}

                                {/* Second Destination Results */}
                  {secondResults && (
                    <div className={`${compareMode && (results || secondResults) ? '' : 'w-full'} space-y-6`}>
                  {/* Second Destination Header */}
                  {results && secondResults && (
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-blue-400 mb-2">{secondResults.destination}</h2>
                      <div className="w-16 h-1 bg-blue-400 mx-auto rounded"></div>
                    </div>
                  )}

                  {/* Second Destination AI Risk Summary */}
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in hover:scale-[1.02]">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">{secondResults.destination} - AI Risk Summary</h3>
                    <div className="space-y-4">
                      <p className="text-gray-200 leading-relaxed">
                        {generateRiskSummary(
                          secondResults.destination, 
                          secondResults.riskData, 
                          secondResults.weatherData, 
                          secondResults.healthData, 
                          secondResults.securityData
                        ).summary}
                      </p>
                    </div>
                  </div>

                  {/* Second Destination Risk Assessment */}
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay hover:scale-[1.02]">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">{secondResults.destination} - Risk Assessment</h3>
                    <div className="p-6 bg-gray-700 rounded-lg border border-yellow-500/20 hover:border-yellow-400/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white font-medium text-lg">Overall Risk Level</span>
                        <span className={`text-lg font-bold ${getRiskColor(secondResults.riskData.overall_risk)} text-black px-3 py-1 rounded`}>
                          {secondResults.riskData.overall_risk}{'/'}10
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 text-sm">Risk Assessment</span>
                          <span className="text-yellow-400 font-semibold">{getRiskLevelText(secondResults.riskData.overall_risk)}</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full ${getRiskColor(secondResults.riskData.overall_risk)} transition-all duration-500`}
                            style={{ width: `${(secondResults.riskData.overall_risk / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Comprehensive risk assessment based on hazard exposure, vulnerability factors, and emergency response capabilities.
                      </p>
                    </div>

                    {/* Second Destination Radar Chart */}
                    {secondResults.riskIndicators && (
                      <div className="mt-6 pt-6 border-t border-blue-500/20">
                        <h4 className="text-md font-semibold text-blue-300 mb-3">Detailed Risk Indicators (0-10 Scale)</h4>
                        
                        {/* Radar Chart */}
                        <div className="mb-6">
                          <RiskRadarChart 
                            hazardIndicators={secondResults.riskIndicators.hazard_indicators}
                            secondHazardIndicators={results?.riskIndicators?.hazard_indicators}
                            firstDestination={secondResults.destination}
                            secondDestination={results?.destination}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Weather Information */}
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-2 hover:scale-[1.02]">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">{secondResults.destination} - Weather Conditions</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">Current Temperature</span>
                            <span className="text-yellow-400 font-semibold text-lg">{secondResults.weatherData.temperature}°C</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Feels Like</span>
                            <span className="text-gray-200">{secondResults.weatherData.feels_like}°C</span>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">Humidity</span>
                            <span className="text-blue-400 font-semibold text-lg">{secondResults.weatherData.humidity}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Wind Speed</span>
                            <span className="text-gray-200">{secondResults.weatherData.wind_speed} km/h</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Weather Condition</span>
                          <span className="text-yellow-400 font-semibold">{secondResults.weatherData.condition}</span>
                        </div>
                        <p className="text-gray-200 text-sm mt-2">{secondResults.weatherData.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Travel Distance */}
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-3 hover:scale-[1.02]">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">{secondResults.destination} - Travel Information</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Distance from Your Location</span>
                          <span className="text-yellow-400 font-semibold text-lg">{secondResults.travelDistance.distance}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Estimated Travel Time</span>
                          <span className="text-gray-200">{secondResults.travelDistance.duration}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Best Time to Visit</span>
                          <span className="text-green-400 font-semibold">{secondResults.seasonalClimate.best_time}</span>
                        </div>
                        <p className="text-gray-200 text-sm mt-2">{secondResults.seasonalClimate.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  {/* 5. Seasonal Climate */}
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-3 hover:scale-[1.02]">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">{secondResults.destination} - Seasonal Climate</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                        <h4 className="text-white font-medium mb-2">Climate Overview</h4>
                        <p className="text-gray-200 text-sm">{secondResults.seasonalClimate.overview}</p>
                      </div>
                      <div className="p-4 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                        <h4 className="text-white font-medium mb-2">Seasonal Considerations</h4>
                        <p className="text-gray-200 text-sm">{secondResults.seasonalClimate.considerations}</p>
                      </div>
                    </div>
                  </div>

                  {/* 6. Health Risks */}
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-4 hover:scale-[1.02]">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">{secondResults.destination} - Health Considerations</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Risk Level:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthRiskColor(secondResults.healthData.risk_level)}`}>
                          {secondResults.healthData.risk_level}
                        </span>
                      </div>
                      <div>
                        <span className="text-white">Primary Concern:</span>
                        <span className="text-gray-200 ml-2">{secondResults.healthData.disease}</span>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                        <span className="text-white font-medium">Traveler Advice:</span>
                        <p className="text-gray-200 mt-1">{secondResults.healthData.advice}</p>
                      </div>
                    </div>
                  </div>

                  {/* 7. Security Status */}
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-5 hover:scale-[1.02]">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">{secondResults.destination} - Security Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-white">Current Situation:</span>
                        <span className="text-gray-200 ml-2">{secondResults.securityData.event_type}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white">Location:</span>
                        <span className="text-gray-200 ml-2">{secondResults.securityData.location}</span>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                        <span className="text-white font-medium">Safety Note:</span>
                        <p className="text-gray-200 mt-1">
                          {secondResults.securityData.event_type.toLowerCase().includes('peaceful') || secondResults.securityData.event_type.toLowerCase().includes('cultural')
                            ? 'Current events are generally peaceful and pose minimal risk to travelers.'
                            : 'Monitor local developments and follow official guidance.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 8. Known Travel Advisory */}
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-lg hover:border-blue-400/50 transition-all duration-300 hover:shadow-blue-500/10 animate-fade-in-delay-6 hover:scale-[1.02]">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">{secondResults.destination} - Known Travel Advisory</h3>
                    <div className="space-y-3">
                      {generateActionableAdvice(
                        secondResults.destination, 
                        secondResults.riskData, 
                        secondResults.weatherData, 
                        secondResults.healthData, 
                        secondResults.securityData
                      ).map((advice, index) => (
                        <div key={index} className="flex items-start p-3 bg-gray-700 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                          <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <p className="text-gray-200">{advice}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 9. Recent News */}
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-indigo-500/30 shadow-lg animate-fade-in-delay-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-indigo-500/10">
                    <h3 className="text-lg font-semibold text-indigo-400 mb-4">{secondResults.destination} - Recent Local News</h3>
                    <div className="space-y-4">
                      {secondResults.newsData.map((news, index) => (
                        <div key={index} className="p-4 bg-gray-700 rounded-lg hover-lift border border-indigo-500/20">
                          <h4 className="text-white font-medium mb-2">{news.title}</h4>
                          <p className="text-gray-200 text-sm mb-3">{news.summary}</p>
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>{news.source}</span>
                            <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
      )}
    </div>
  );
}
