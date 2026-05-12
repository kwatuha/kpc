import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    IconButton,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Divider
} from '@mui/material';
import {
    Close,
    People,
    CalendarToday,
    LocalHospital,
    BugReport,
    TrendingUp,
    Assessment,
    Person,
    School,
    Work,
    Home,
    HealthAndSafety,
    WaterDrop,
    Thermostat
} from '@mui/icons-material';
import apiService from '../../api';

const DashboardStatsModal = ({ open, onClose, statType, statTitle, filters = {} }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            fetchDetailedData();
        }
    }, [open, statType, filters]);

    const fetchDetailedData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            let response;
            
            switch (statType) {
                case 'totalParticipants':
                    response = await apiService.dashboard.getParticipantDetails(filters);
                    break;
                case 'averageAge':
                    response = await apiService.dashboard.getAgeDistribution(filters);
                    break;
                case 'malariaPrevalence':
                    response = await apiService.dashboard.getMalariaDetails(filters);
                    break;
                case 'denguePrevalence':
                    response = await apiService.dashboard.getDengueDetails(filters);
                    break;
                default:
                    response = await apiService.dashboard.getSummaryStatistics(filters);
            }
            
            setData(response);
        } catch (err) {
            console.error('Error fetching detailed data:', err);
            setError('Failed to load detailed data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatIcon = (type) => {
        const icons = {
            'totalParticipants': <People />,
            'averageAge': <CalendarToday />,
            'malariaPrevalence': <LocalHospital />,
            'denguePrevalence': <BugReport />
        };
        return icons[type] || <Assessment />;
    };

    const getStatColor = (type) => {
        const colors = {
            'totalParticipants': '#1976d2',
            'averageAge': '#4caf50',
            'malariaPrevalence': '#f44336',
            'denguePrevalence': '#ff9800'
        };
        return colors[type] || '#1976d2';
    };

    const renderParticipantDetails = () => {
        if (!data) return null;
        
        return (
            <>
                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <People sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {data.totalParticipants || 0}
                                </Typography>
                                <Typography variant="body2">
                                    Total Participants
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Person sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {data.maleParticipants || 0}
                                </Typography>
                                <Typography variant="body2">
                                    Male Participants
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Person sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {data.femaleParticipants || 0}
                                </Typography>
                                <Typography variant="body2">
                                    Female Participants
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <CalendarToday sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {data.averageAge || 0}
                                </Typography>
                                <Typography variant="body2">
                                    Average Age
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Demographics Breakdown */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Demographics Breakdown
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ borderRadius: '12px', boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Education Level Distribution
                                    </Typography>
                                    {data.educationLevels?.map((item, index) => (
                                        <Box key={index} sx={{ mb: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2">{item.level}</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {item.count} ({item.percentage}%)
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Card sx={{ borderRadius: '12px', boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Occupation Distribution
                                    </Typography>
                                    {data.occupations?.map((item, index) => (
                                        <Box key={index} sx={{ mb: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2">{item.occupation}</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {item.count} ({item.percentage}%)
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </>
        );
    };

    const renderAgeDistribution = () => {
        if (!data) return null;
        
        return (
            <>
                {/* Age Groups Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {data.ageGroups?.map((group, index) => (
                        <Grid item xs={12} md={3} key={index}>
                            <Card sx={{ 
                                background: `linear-gradient(135deg, ${getStatColor('averageAge')} 0%, #66bb6a 100%)`,
                                color: 'white',
                                borderRadius: '12px'
                            }}>
                                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                    <CalendarToday sx={{ fontSize: '2rem', mb: 1 }} />
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {group.count}
                                    </Typography>
                                    <Typography variant="body2">
                                        {group.range}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Detailed Age Analysis */}
                <Card sx={{ borderRadius: '12px', boxShadow: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Age Distribution Analysis
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Age Group</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Count</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Average Age</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.ageGroups?.map((group, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {group.range}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{group.count}</TableCell>
                                            <TableCell>{group.percentage}%</TableCell>
                                            <TableCell>{group.averageAge}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </>
        );
    };

    const renderDiseaseDetails = (diseaseType) => {
        if (!data) return null;
        
        const isMalaria = diseaseType === 'malariaPrevalence';
        const diseaseName = isMalaria ? 'Malaria' : 'Dengue';
        const color = isMalaria ? '#f44336' : '#ff9800';
        
        return (
            <>
                {/* Disease Statistics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                {isMalaria ? <LocalHospital sx={{ fontSize: '2rem', mb: 1 }} /> : <BugReport sx={{ fontSize: '2rem', mb: 1 }} />}
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {data.prevalence || 0}%
                                </Typography>
                                <Typography variant="body2">
                                    {diseaseName} Prevalence
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <HealthAndSafety sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {data.positiveCases || 0}
                                </Typography>
                                <Typography variant="body2">
                                    Positive Cases
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Assessment sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {data.totalTested || 0}
                                </Typography>
                                <Typography variant="body2">
                                    Total Tested
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <TrendingUp sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {data.trend || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    Trend
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Geographic Distribution */}
                <Card sx={{ borderRadius: '12px', boxShadow: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Geographic Distribution
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>County</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Sub-County</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Cases</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Prevalence</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.geographicData?.map((item, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{item.county}</TableCell>
                                            <TableCell>{item.subCounty}</TableCell>
                                            <TableCell>{item.cases}</TableCell>
                                            <TableCell>{item.prevalence}%</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={item.status}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: item.status === 'High' ? '#f44336' : 
                                                                      item.status === 'Medium' ? '#ff9800' : '#4caf50',
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </>
        );
    };

    const renderContent = () => {
        switch (statType) {
            case 'totalParticipants':
                return renderParticipantDetails();
            case 'averageAge':
                return renderAgeDistribution();
            case 'malariaPrevalence':
                return renderDiseaseDetails('malariaPrevalence');
            case 'denguePrevalence':
                return renderDiseaseDetails('denguePrevalence');
            default:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            No detailed data available for this statistic.
                        </Typography>
                    </Box>
                );
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{ 
                pb: 2,
                background: `linear-gradient(135deg, ${getStatColor(statType)} 0%, ${getStatColor(statType)}80 100%)`,
                color: 'white',
                position: 'relative'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getStatIcon(statType)}
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {statTitle} - Detailed Analysis
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Comprehensive breakdown and insights
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton 
                        onClick={onClose}
                        sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    renderContent()
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DashboardStatsModal;
























