// src/components/charts/BudgetAllocationChart.jsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getProjectStatusBackgroundColor } from '../../utils/projectStatusColors';
import { currencyFormatter } from '../../utils/tableHelpers';

// Custom Tooltip for budget allocation with enhanced information
const BudgetTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const dataItem = payload[0].payload;
        const formatCurrency = (value) => {
            return currencyFormatter.format(value);
        };
        
        return (
            <Box sx={{ 
                p: 2.5, 
                bgcolor: 'rgba(255, 255, 255, 0.98)', 
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                minWidth: '280px',
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
                    {label}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    <Typography variant="body2" sx={{ 
                        mb: 0.5,
                        fontWeight: '500',
                        color: 'text.primary'
                    }}>
                        <strong>Contracted:</strong> {formatCurrency(dataItem.contracted || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        mb: 0.5,
                        fontWeight: '500',
                        color: 'text.primary'
                    }}>
                        <strong>Paid:</strong> {formatCurrency(dataItem.paid || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        mb: 0.5,
                        fontWeight: '500',
                        color: 'text.secondary'
                    }}>
                        <strong>Absorption Rate:</strong> {dataItem.contracted > 0 ? ((dataItem.paid / dataItem.contracted) * 100).toFixed(1) : 0}%
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        fontWeight: '500',
                        color: 'text.secondary'
                    }}>
                        <strong>Projects:</strong> {dataItem.count}
                    </Typography>
                </Box>
            </Box>
        );
    }
    return null;
};

// Custom Y-axis formatter for currency
const formatYAxis = (value) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
};

const BudgetAllocationChart = ({ title, data }) => {
    const chartData = data.map((item) => ({
        ...item,
        name: item.name || item.status,
        contracted: item.contracted || 0,
        paid: item.paid || 0,
        // Use project status color if no color is provided
        color: item.color || (item.name && getProjectStatusBackgroundColor(item.name)) || '#8884d8'
    }));

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
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                        style={{ zIndex: 1 }}
                        data={chartData}
                        margin={{
                            top: 15,
                            right: 20,
                            left: 15,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                        <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                            stroke="#666"
                            fontWeight="500"
                        />
                        <YAxis 
                            tickFormatter={formatYAxis}
                            fontSize={12}
                            stroke="#666"
                            fontWeight="500"
                        />
                        <Tooltip content={<BudgetTooltip />} />
                        <Bar 
                            dataKey="contracted" 
                            name="Contracted"
                            radius={[4, 4, 0, 0]}
                            stroke="#fff"
                            strokeWidth={1}
                            fill="#1976d2"
                            opacity={0.8}
                        />
                        <Bar 
                            dataKey="paid" 
                            name="Paid"
                            radius={[4, 4, 0, 0]}
                            stroke="#fff"
                            strokeWidth={1}
                            fill="#4caf50"
                            opacity={0.9}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default BudgetAllocationChart;
