// src/components/charts/LineBarComboChart.jsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const LineBarComboChart = ({
    title, data, barKeys, xAxisKey, yAxisLabelLeft, yAxisLabelRight, lineKeys
}) => {
    // Helper function to format currency
    const formatCurrencyCompact = (value) => {
        if (value === 0) return 'KES 0';
        if (!value || value === null || value === undefined) return '';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '';
        const absValue = Math.abs(numValue);
        if (absValue >= 1000000) return `KES ${(numValue / 1000000).toFixed(1)}M`;
        if (absValue >= 1000) return `KES ${(numValue / 1000).toFixed(0)}K`;
        return `KES ${numValue.toFixed(0)}`;
    };

    // Helper function to format numbers (for project counts, percentages, etc.)
    const formatNumber = (value) => {
        if (value === 0) return '0';
        if (!value || value === null || value === undefined) return '';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '';
        return numValue.toFixed(0);
    };

    // Helper function to format percentages
    const formatPercentage = (value) => {
        if (value === 0) return '0%';
        if (!value || value === null || value === undefined) return '';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '';
        return `${numValue.toFixed(1)}%`;
    };

    // Determine the appropriate formatter based on the data type
    const getYAxisFormatter = () => {
        if (yAxisLabelLeft && yAxisLabelLeft.toLowerCase().includes('budget') || 
            yAxisLabelLeft && yAxisLabelLeft.toLowerCase().includes('kes') ||
            yAxisLabelLeft && yAxisLabelLeft.toLowerCase().includes('currency')) {
            return formatCurrencyCompact;
        } else if (yAxisLabelLeft && yAxisLabelLeft.toLowerCase().includes('rate') ||
                   yAxisLabelLeft && yAxisLabelLeft.toLowerCase().includes('%')) {
            return formatPercentage;
        } else {
            return formatNumber;
        }
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataItem = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '200px'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#333' }}>
                        {dataItem.departmentName || label}
                    </p>
                    {payload.map((entry, index) => {
                        let formattedValue = '';
                        if (entry.name && entry.name.toLowerCase().includes('rate')) {
                            formattedValue = formatPercentage(entry.value);
                        } else if (entry.name && (entry.name.toLowerCase().includes('budget') || entry.name.toLowerCase().includes('amount'))) {
                            formattedValue = formatCurrencyCompact(entry.value);
                        } else {
                            formattedValue = formatNumber(entry.value);
                        }
                        
                        return (
                            <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '14px' }}>
                                <span style={{ fontWeight: 'bold' }}>{entry.name}:</span> {formattedValue}
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
            
            {/* Set explicit height for the ResponsiveContainer */}
            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart
                    data={data}
                    // Optimized margins for better scalability with many years
                    margin={{ 
                        top: 20, 
                        right: 20, 
                        left: 20, 
                        bottom: data.length > 15 ? 140 : data.length > 10 ? 120 : data.length > 5 ? 100 : 80 
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    {/* X-Axis with rotated labels - optimized for many years/data points */}
                    <XAxis
                        dataKey={xAxisKey}
                        angle={data.length > 10 ? -60 : -45}
                        textAnchor="end"
                        height={data.length > 10 ? 140 : data.length > 5 ? 120 : 100} 
                        interval={data.length > 15 ? 1 : 0} // Show every other year if more than 15 years
                        fontSize={data.length > 12 ? 9 : data.length > 8 ? 10 : 12}
                        tick={{ fontSize: data.length > 12 ? 9 : data.length > 8 ? 10 : 12 }}
                    />

                    {/* Y-Axis with formatted labels */}
                    <YAxis
                        yAxisId="left"
                        label={{ value: yAxisLabelLeft, angle: -90, position: 'insideLeft', dx: -10 }}
                        tickFormatter={getYAxisFormatter()}
                    />

                    {/* Right Y-Axis for line charts */}
                    {yAxisLabelRight && (
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: yAxisLabelRight, angle: 90, position: 'insideRight', dx: 10 }}
                            tickFormatter={yAxisLabelRight.toLowerCase().includes('rate') || yAxisLabelRight.toLowerCase().includes('%') ? 
                                formatPercentage : formatNumber}
                        />
                    )}

                    <Tooltip content={<CustomTooltip />} />

                    {/* Legend with fixed position */}
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                    />

                    {/* Bars */}
                    {barKeys.map((key, index) => (
                        <Bar
                            key={key}
                            yAxisId="left"
                            dataKey={key}
                            fill={['#1f77b4', '#ff7f0e', '#2ca02c'][index % 3]}
                        />
                    ))}

                    {/* Lines */}
                    {lineKeys && lineKeys.map((key, index) => (
                        <Line
                            key={key}
                            yAxisId="right"
                            type="monotone"
                            dataKey={key}
                            stroke={['#d62728', '#9467bd', '#8c564b'][index % 3]}
                            strokeWidth={3}
                            dot={{ fill: ['#d62728', '#9467bd', '#8c564b'][index % 3], strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default LineBarComboChart;