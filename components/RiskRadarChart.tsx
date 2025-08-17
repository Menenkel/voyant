'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface RiskRadarChartProps {
  hazardIndicators: { [key: string]: number };
}

export default function RiskRadarChart({ hazardIndicators }: RiskRadarChartProps) {
  // Transform the hazard indicators into the format needed for the radar chart
  const data = Object.entries(hazardIndicators).map(([key, value]) => ({
    indicator: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value,
    fullMark: 10,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-yellow-500/30 p-3 rounded-lg shadow-lg z-50">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-yellow-400">
            Risk Score: <span className="text-white font-bold">{payload[0].value}/10</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="indicator" 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickLine={{ stroke: '#374151' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickLine={{ stroke: '#374151' }}
          />
          <Radar
            name="Risk Score"
            dataKey="value"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
            wrapperStyle={{ zIndex: 1000 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
