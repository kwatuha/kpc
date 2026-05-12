import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box } from '@mui/material';

const DashboardCard = ({ 
    title, 
    icon, 
    children, 
    height = '340px',
    color = '#1976d2',
    hoverColor = 'rgba(25, 118, 210, 0.2)',
    gradient = 'linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6)'
}) => {
    return (
        <Card sx={{ 
            height,
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
                border: `1px solid ${hoverColor}`
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: gradient,
                borderRadius: '12px 12px 0 0'
            }
        }}>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {icon}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.95rem' }}>
                            {title}
                        </Typography>
                    </Box>
                }
                sx={{ pb: 0.5, px: 2, pt: 1.5 }}
            />
            <CardContent sx={{ flexGrow: 1, p: 1.5, pt: 0 }}>
                {children}
            </CardContent>
        </Card>
    );
};

export default React.memo(DashboardCard);

