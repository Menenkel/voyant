'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeatherDay {
  date: string;
  max_temp: number;
  min_temp: number;
  precipitation: number;
  wind_speed: number;
  weather_code: number;
  weather_description: string;
}

interface WeatherChartProps {
  forecast: WeatherDay[];
  location: string;
}

const WeatherChart: React.FC<WeatherChartProps> = ({ forecast, location }) => {
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isDailyExpanded, setIsDailyExpanded] = useState(false);
  
  // Format dates for display (timezone-safe)
  const formatDate = (dateString: string) => {
    // Parse the date string directly to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show first 7 days by default for charts, all 16 when expanded
  const chartForecast = isChartExpanded ? forecast : forecast.slice(0, 7);
  const dates = chartForecast.map(day => formatDate(day.date));
  const maxTemps = chartForecast.map(day => day.max_temp);
  const minTemps = chartForecast.map(day => day.min_temp);
  const precipitation = chartForecast.map(day => day.precipitation);

  // Show first 4 days by default for daily cards, all 16 when expanded
  const dailyForecast = isDailyExpanded ? forecast : forecast.slice(0, 4);

  // Temperature chart data
  const temperatureData = {
    labels: dates,
    datasets: [
      {
        label: 'Max Temperature',
        data: maxTemps,
        borderColor: '#f59e0b', // amber-500
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Min Temperature',
        data: minTemps,
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Precipitation chart data
  const precipitationData = {
    labels: dates,
    datasets: [
      {
        label: 'Precipitation (mm)',
        data: precipitation,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#d1d5db', // gray-300
          font: {
            size: 12,
            weight: '500' as const,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: `${isChartExpanded ? '16' : '7'}-Day Weather Forecast - ${location}`,
        color: '#f3f4f6', // gray-100
        font: {
          size: 16,
          weight: '600' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)', // gray-900 with opacity
        titleColor: '#f3f4f6', // gray-100
        bodyColor: '#d1d5db', // gray-300
        borderColor: '#374151', // gray-700
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            
            if (datasetLabel.includes('Temperature')) {
              return `${datasetLabel}: ${value}°C`;
            } else if (datasetLabel.includes('Precipitation')) {
              return `${datasetLabel}: ${value}mm`;
            }
            return `${datasetLabel}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)', // gray-600 with opacity
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af', // gray-400
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)', // gray-600 with opacity
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af', // gray-400
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + '°C';
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const precipitationOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: `${isChartExpanded ? '16' : '7'}-Day Precipitation Forecast - ${location}`,
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: function(value: any) {
            return value + 'mm';
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Chart Expand/Collapse Button */}
      {forecast.length > 7 && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsChartExpanded(!isChartExpanded)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            {isChartExpanded ? (
              <>
                <span>Show 7-Day Chart</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Show 16-Day Chart</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Temperature Chart */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="h-64">
          <Line data={temperatureData} options={chartOptions} />
        </div>
      </div>

      {/* Precipitation Chart */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="h-48">
          <Bar data={precipitationData} options={precipitationOptions} />
        </div>
      </div>

      {/* Daily Weather Summary Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Daily Forecast</h3>
          {forecast.length > 4 && (
            <button
              onClick={() => setIsDailyExpanded(!isDailyExpanded)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              {isDailyExpanded ? (
                <>
                  <span>Show 4 Days</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show All {forecast.length} Days</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dailyForecast.map((day, index) => (
            <div key={index} className="bg-gray-600 rounded-lg p-4 text-center">
              <p className="text-gray-300 text-sm font-medium mb-2">
                {formatDate(day.date)}
              </p>
              <div className="text-2xl mb-2">
                {day.weather_description === 'Clear sky' && '☀️'}
                {day.weather_description === 'Partly cloudy' && '⛅'}
                {day.weather_description === 'Overcast' && '☁️'}
                {day.weather_description === 'Slight rain' && '🌦️'}
                {day.weather_description === 'Moderate rain' && '🌧️'}
                {day.weather_description === 'Heavy rain' && '⛈️'}
                {day.weather_description === 'Thunderstorm' && '⛈️'}
                {day.weather_description === 'Snow' && '❄️'}
                {!['Clear sky', 'Partly cloudy', 'Overcast', 'Slight rain', 'Moderate rain', 'Heavy rain', 'Thunderstorm', 'Snow'].includes(day.weather_description) && '🌤️'}
              </div>
              <p className="text-white font-semibold text-sm mb-1">
                {day.weather_description}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-amber-400 font-semibold">
                  {day.max_temp}°
                </span>
                <span className="text-blue-400 font-semibold">
                  {day.min_temp}°
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                {day.precipitation}mm • {day.wind_speed} km/h
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherChart;
