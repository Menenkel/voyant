'use client';

import React, { useState } from 'react';

interface WeatherAlert {
  type: string;
  description: string;
  forecastPeriod: string;
  severity: 'moderate' | 'high' | 'extreme';
}

interface WeatherAlerts {
  location: string;
  forecastDate: string;
  alerts: WeatherAlert[];
}

interface WeatherAlertsProps {
  alerts: WeatherAlerts[] | null;
  title?: string;
}

export default function WeatherAlerts({ alerts, title = "Weather Alerts" }: WeatherAlertsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate the 16th day from today
  const get16thDayDate = () => {
    const today = new Date();
    const sixteenthDay = new Date(today);
    sixteenthDay.setDate(today.getDate() + 16);
    return sixteenthDay.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate total number of alerts across all days
  const totalAlerts = alerts ? alerts.reduce((total, dayAlert) => total + dayAlert.alerts.length, 0) : 0;

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg animate-fade-in hover:shadow-xl transition-all duration-300">
        <h4 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
          <span className="animate-pulse">✓</span>
          <span>{title}</span>
        </h4>
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 hover:bg-green-100 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl animate-bounce">✓</span>
            <div>
              <p className="text-black font-medium">No Weather Warnings</p>
              <p className="text-gray-600 text-sm">
                No extreme weather warnings for the next 16 days (through {get16thDayDate()})
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return 'bg-red-600 border-red-500 text-white';
      case 'high':
        return 'bg-orange-600 border-orange-500 text-white';
      case 'moderate':
        return 'bg-gray-600 border-gray-500 text-white';
      default:
        return 'bg-gray-600 border-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'moderate':
        return '⚡';
      default:
        return 'ℹ️';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Heavy Rain':
        return '🌧️';
      case 'High Temperature':
        return '🌡️';
      case 'High Wind':
        return '💨';
      case 'Heavy Snow':
        return '❄️';
      case 'Extreme Weather':
        return '⛈️';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg animate-fade-in hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-black flex items-center space-x-2">
          <span className="animate-pulse">⚠️</span>
          <span>{title}</span>
        </h4>
        {totalAlerts > 1 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-black hover:text-gray-600 transition-all duration-200 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg border border-gray-300"
          >
            <span>
              {isExpanded ? 'Show Less' : `Show All (${totalAlerts})`}
            </span>
            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {alerts.map((dayAlert, dayIndex) => (
          <div key={dayIndex} className="border-l-4 border-gray-300 pl-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-black font-medium text-sm">
                {new Date(dayAlert.forecastDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h5>
              <span className="text-xs text-gray-500">
                {dayAlert.location}
              </span>
            </div>
            
            <div className="space-y-2">
              {dayAlert.alerts.map((alert, alertIndex) => {
                // Show first alert always, others only when expanded
                const shouldShow = isExpanded || (dayIndex === 0 && alertIndex === 0);
                
                if (!shouldShow) return null;
                
                return (
                  <div 
                    key={alertIndex}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0 animate-pulse">
                        {getAlertIcon(alert.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-sm">{alert.type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm opacity-90 mb-2">
                          {alert.description}
                        </p>
                        <p className="text-xs opacity-75">
                          {alert.forecastPeriod}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200 hover:bg-blue-100 transition-colors duration-200">
        <p className="text-xs text-blue-800">
          <span className="font-medium">ℹ️ Weather Alert Information:</span> These alerts are based on 16-day forecasts and may change as conditions develop. 
          Always check local weather services for the most current information.
        </p>
      </div>
    </div>
  );
}
