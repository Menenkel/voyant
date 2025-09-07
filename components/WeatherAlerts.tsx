'use client';

import React from 'react';

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

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500/30 shadow-lg">
        <h4 className="text-lg font-semibold text-green-400 mb-4">{title}</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-white font-medium">No Weather Warnings</p>
              <p className="text-gray-300 text-sm">
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
        return 'bg-yellow-600 border-yellow-500 text-black';
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
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-500/30 shadow-lg">
      <h4 className="text-lg font-semibold text-yellow-400 mb-4">{title}</h4>
      
      <div className="space-y-4">
        {alerts.map((dayAlert, dayIndex) => (
          <div key={dayIndex} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-white font-medium">
                📅 {new Date(dayAlert.forecastDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h5>
              <span className="text-sm text-gray-400">
                {dayAlert.location}
              </span>
            </div>
            
            <div className="space-y-2">
              {dayAlert.alerts.map((alert, alertIndex) => (
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
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="text-yellow-400">ℹ️</span> Weather alerts are based on 7-day forecasts and may change as conditions develop. 
          Always check local weather services for the most current information.
        </p>
      </div>
    </div>
  );
}
