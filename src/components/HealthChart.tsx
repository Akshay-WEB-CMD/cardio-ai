import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface HealthChartProps {
  data: any[];
  color: string;
  dataKey: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  height?: number;
}

export const HealthChart = ({ data, color, dataKey, secondaryDataKey, secondaryColor, height = 100 }: HealthChartProps) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {secondaryDataKey && secondaryColor && (
              <linearGradient id={`gradient-${secondaryDataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.1} />
                <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(2, 6, 23, 0.8)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${dataKey})`}
            isAnimationActive={true}
          />
          {secondaryDataKey && secondaryColor && (
            <Area
              type="monotone"
              dataKey={secondaryDataKey}
              stroke={secondaryColor}
              strokeWidth={1}
              fillOpacity={1}
              fill={`url(#gradient-${secondaryDataKey})`}
              isAnimationActive={true}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
