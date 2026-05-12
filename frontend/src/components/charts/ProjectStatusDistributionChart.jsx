// src/components/charts/ProjectStatusDistributionChart.jsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getProjectStatusBackgroundColor } from '../../utils/projectStatusColors';


// Two-row Legend for compact layout
const StatusLegend = ({ payload }) => {
    const total = payload.reduce((sum, entry) => sum + entry.payload.value, 0);
    
    // Split payload into two rows
    const midPoint = Math.ceil(payload.length / 2);
    const firstRow = payload.slice(0, midPoint);
    const secondRow = payload.slice(midPoint);

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1, 
            mt: 1.5,
            p: 1
        }}>
            {/* First Row */}
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                gap: 1
            }}>
                {firstRow.map((entry, index) => {
                    const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0;
                    return (
                        <Box key={`legend-${index}`} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.4,
                            p: 0.4,
                            borderRadius: '4px',
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            minHeight: '20px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 1)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }
                        }}>
                            <Box 
                                sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    backgroundColor: entry.color,
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    border: '1px solid #fff',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                    WebkitColorAdjust: 'exact',
                                    colorAdjust: 'exact',
                                    filter: 'saturate(1.1) contrast(1.05)',
                                    transform: 'translateZ(0)',
                                    backfaceVisibility: 'hidden'
                                }} 
                            />
                            <Typography variant="caption" sx={{ 
                                fontWeight: 'bold', 
                                fontSize: '0.65rem',
                                color: 'text.primary',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap'
                            }}>
                                {entry.value} ({percentage}%)
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
            
            {/* Second Row */}
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                gap: 1
            }}>
                {secondRow.map((entry, index) => {
                    const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0;
                    return (
                        <Box key={`legend-${index + midPoint}`} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.4,
                            p: 0.4,
                            borderRadius: '4px',
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            minHeight: '20px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 1)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }
                        }}>
                            <Box 
                                sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    backgroundColor: entry.color,
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    border: '1px solid #fff',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                    WebkitColorAdjust: 'exact',
                                    colorAdjust: 'exact',
                                    filter: 'saturate(1.1) contrast(1.05)',
                                    transform: 'translateZ(0)',
                                    backfaceVisibility: 'hidden'
                                }} 
                            />
                            <Typography variant="caption" sx={{ 
                                fontWeight: 'bold', 
                                fontSize: '0.65rem',
                                color: 'text.primary',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap'
                            }}>
                                {entry.value} ({percentage}%)
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

const ProjectStatusDistributionChart = ({ title, data }) => {
    const chartData = data.map((item) => ({
        ...item,
        name: item.name || item.status,
        value: item.value || item.count,
        // Use project status color if no color is provided
        color: item.color || (item.name && getProjectStatusBackgroundColor(item.name)) || '#8884d8'
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    
    // Enhanced tooltip that has access to the total
    const EnhancedStatusTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataItem = payload[0].payload;
            const percentage = total > 0 ? ((dataItem.value / total) * 100).toFixed(1) : 0;
            
            return (
                <Box sx={{ 
                    p: 2.5, 
                    bgcolor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    minWidth: '220px',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9999,
                    position: 'relative'
                }}>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        color: dataItem.color, 
                        mb: 1.5,
                        fontSize: '1rem'
                    }}>
                        {dataItem.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ 
                            mb: 0.5,
                            fontWeight: '500',
                            color: 'text.primary'
                        }}>
                            <strong>Projects:</strong> {dataItem.value}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            mb: 0.5,
                            fontWeight: '500',
                            color: 'text.primary'
                        }}>
                            <strong>Percentage:</strong> {percentage}%
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            fontWeight: '500',
                            color: 'text.secondary'
                        }}>
                            <strong>Total:</strong> {total} projects
                        </Typography>
                    </Box>
                </Box>
            );
        }
        return null;
    };

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            p: 1
        }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                color: 'text.primary',
                fontSize: '1.1rem',
                letterSpacing: '0.5px'
            }}>
                {title}
            </Typography>
            
            <Box sx={{ 
                flex: 1, 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: '12px',
                bgcolor: 'rgba(248, 249, 250, 0.8)',
                p: 2,
                border: '1px solid rgba(0,0,0,0.05)',
                // Enhanced color rendering properties
                WebkitColorAdjust: 'exact',
                colorAdjust: 'exact',
                imageRendering: 'crisp-edges',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                isolation: 'isolate'
            }}>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart style={{ zIndex: 1 }}>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={0}
                            outerRadius={70}
                            fill="#8884d8"
                            paddingAngle={3}
                            stroke="#fff"
                            strokeWidth={2}
                            label={({ name, value, percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color}
                                    style={{
                                        filter: 'saturate(1.1) contrast(1.05)',
                                        WebkitColorAdjust: 'exact',
                                        colorAdjust: 'exact'
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<EnhancedStatusTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                
                <StatusLegend payload={chartData.map((item, index) => ({
                    value: item.name,
                    color: item.color,
                    payload: item
                }))} />
            </Box>
        </Box>
    );
};

export default ProjectStatusDistributionChart;
