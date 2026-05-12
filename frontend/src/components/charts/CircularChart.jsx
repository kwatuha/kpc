// src/components/charts/CircularChart.jsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getProjectStatusBackgroundColor } from '../../utils/projectStatusColors';

// Custom Tooltip for better readability
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const dataItem = payload[0].payload;
        return (
            <Box sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{dataItem.name}</Typography>
                <Typography variant="body2">{`Value: ${dataItem.value}`}</Typography>
            </Box>
        );
    }
    return null;
};

// Custom Legend Component that wraps into two rows
const CustomLegend = ({ data }) => {
    // Split data into two rows (first 4 items, then remaining)
    const midPoint = Math.ceil(data.length / 2);
    const firstRow = data.slice(0, midPoint);
    const secondRow = data.slice(midPoint);
    
    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '6px',
            width: '100%'
        }}>
            {/* First Row */}
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                justifyContent: 'center', 
                gap: '8px 12px',
            }}>
                {firstRow.map((entry, index) => (
                    <Box 
                        key={`legend-${index}`}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                        }}
                    >
                        <Box 
                            sx={{ 
                                width: 10, 
                                height: 10, 
                                backgroundColor: entry.color,
                                borderRadius: '2px',
                                flexShrink: 0,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }} 
                        />
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.2, fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {entry.name}
                        </Typography>
                    </Box>
                ))}
            </Box>
            {/* Second Row */}
            {secondRow.length > 0 && (
                <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'center', 
                    gap: '8px 12px',
                }}>
                    {secondRow.map((entry, index) => (
                        <Box 
                            key={`legend-${midPoint + index}`}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5,
                            }}
                        >
                            <Box 
                                sx={{ 
                                    width: 10, 
                                    height: 10, 
                                    backgroundColor: entry.color,
                                    borderRadius: '2px',
                                    flexShrink: 0,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }} 
                            />
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.2, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {entry.name}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

const CircularChart = ({ title, data, type }) => {
    const chartData = data.map((item) => ({
        ...item,
        name: item.name || item.status,
        value: item.value || item.count,
        // Use project status color if no color is provided and this looks like a status
        // This ensures consistent colors across the application for project statuses
        color: item.color || (item.name && getProjectStatusBackgroundColor(item.name)) || '#8884d8'
    }));

    // Calculate responsive radius based on container size
    const innerRadius = type === 'donut' ? 15 : 0;
    const colors = chartData.map(item => item.color);

    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', overflow: 'visible', p: 0 }}>
            {title && (
                <Typography variant="h6" align="center" sx={{ mb: 1, flexShrink: 0 }}>
                    {title}
                </Typography>
            )}
            
            <Box sx={{ 
                width: '100%', 
                flex: '1 1 auto', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                minHeight: '280px',
                overflow: 'visible',
                position: 'relative',
                gap: 0.5
            }}>
                <Box sx={{ 
                    width: '100%',
                    height: { xs: '200px', sm: '220px', md: '240px' },
                    flex: { xs: '0 0 200px', sm: '0 0 220px', md: '0 0 240px' },
                    minHeight: { xs: '200px', sm: '220px', md: '240px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 0.5
                }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={type === 'donut' ? '35%' : 0}
                                outerRadius="85%"
                                fill="#8884d8"
                                paddingAngle={2}
                                label={false}
                                labelLine={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
                <Box sx={{ 
                    flexShrink: 0, 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: 0.5,
                    pt: 0.25,
                    pb: 0
                }}>
                    <CustomLegend data={chartData} />
                </Box>
            </Box>
        </Box>
    );
};

export default CircularChart;