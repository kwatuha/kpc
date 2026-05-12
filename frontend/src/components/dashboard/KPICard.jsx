import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';

const KPICard = ({ title, value, icon, color, subtitle, progress }) => {
    return (
        <Card sx={{ 
            height: '100px',
            borderRadius: '12px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: `1px solid ${color}20`
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${color}, ${color}80, ${color}40)`,
                borderRadius: '12px 12px 0 0'
            }
        }}>
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                        {title}
                    </Typography>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                        {value}
                    </Typography>
                    {progress !== undefined && (
                        <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                backgroundColor: `${color}20`,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: color,
                                    borderRadius: 2
                                }
                            }} 
                        />
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                        {subtitle}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default React.memo(KPICard);

