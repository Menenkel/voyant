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

export default function WeatherAlerts({ alerts, title = "⚠️ Weather Alerts" }: WeatherAlertsProps) {
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
      <div className="bg-white rounded-lg p-6 border-2 border-green-500 shadow-lg">
        <h4 className="text-lg font-semibold text-green-600 mb-4">{title}</h4>
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✅</span>
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
    <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-black">{title}</h4>
        {totalAlerts > 1 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-black hover:text-gray-600 transition-colors"
          >
            <span className="text-sm">
              {isExpanded ? 'Show Less' : `Show All (${totalAlerts})`}
            </span>
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {alerts.map((dayAlert, dayIndex) => (
          <div key={dayIndex} className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-black font-medium">
                📅 {new Date(dayAlert.forecastDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h5>
              <span className="text-sm text-gray-600">
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
                    className={`p-3 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">
                        {getAlertIcon(alert.type)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold">{alert.type}</span>
                          <span className="text-sm">
                            {getSeverityIcon(alert.severity)} {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm opacity-90 mb-1">
                          {alert.description}
                        </p>
                        <p className="text-xs opacity-75">
                          📍 {alert.forecastPeriod}
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
      
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="text-black">ℹ️</span> Weather alerts are based on 7-day forecasts and may change as conditions develop. 
          Always check local weather services for the most current information.
        </p>
      </div>
    </div>
  );
}
