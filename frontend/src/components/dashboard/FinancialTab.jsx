import React from 'react';
import { Grid, Box } from '@mui/material';
import { Fade } from '@mui/material';
import { BarChart, AttachMoney } from '@mui/icons-material';
import DashboardCard from './DashboardCard';
import BudgetAllocationChart from '../charts/BudgetAllocationChart';

const FinancialTab = ({ dashboardData }) => {
    return (
        <Grid container spacing={2}>
            {/* Budget Allocation by Status */}
            <Grid item xs={12} md={8}>
                <Fade in timeout={1600}>
                    <DashboardCard
                        title="Budget Allocation by Status"
                        icon={<BarChart sx={{ color: 'warning.main', fontSize: '1.2rem' }} />}
                        height="380px"
                        color="#ff9800"
                        hoverColor="rgba(255, 152, 0, 0.4)"
                        gradient="linear-gradient(90deg, #ff9800, #ffb74d, #ffcc80)"
                    >
                        <Box sx={{ height: '300px', minWidth: '500px' }}>
                            {dashboardData.budgetAllocation.length > 0 ? (
                                <BudgetAllocationChart
                                    title=""
                                    data={dashboardData.budgetAllocation}
                                />
                            ) : (
                                <Box sx={{ 
                                    p: 4, 
                                    border: '2px dashed rgba(0,0,0,0.1)', 
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    color: 'text.secondary'
                                }}>
                                    No data available
                                </Box>
                            )}
                        </Box>
                    </DashboardCard>
                </Fade>
            </Grid>

            {/* Budget Performance by Department */}
            <Grid item xs={12} md={4}>
                <Fade in timeout={1800}>
                    <DashboardCard
                        title="Budget Performance by Department"
                        icon={<AttachMoney sx={{ color: 'success.main', fontSize: '1.2rem' }} />}
                        height="380px"
                        color="#4caf50"
                        hoverColor="rgba(76, 175, 80, 0.4)"
                        gradient="linear-gradient(90deg, #4caf50, #66bb6a, #81c784)"
                    >
                        <Box sx={{ height: '300px', minWidth: '300px' }}>
                            {dashboardData.projectProgress.length > 0 ? (
                                <BudgetAllocationChart
                                    title=""
                                    data={dashboardData.projectProgress.map(dept => ({
                                        name: dept.department,
                                        contracted: dept.contractSum || 0,
                                        paid: dept.amountPaid || 0,
                                        color: '#4caf50',
                                        count: dept.numProjects || 0
                                    }))}
                                />
                            ) : (
                                <Box sx={{ 
                                    p: 4, 
                                    border: '2px dashed rgba(0,0,0,0.1)', 
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    color: 'text.secondary'
                                }}>
                                    No data available
                                </Box>
                            )}
                        </Box>
                    </DashboardCard>
                </Fade>
            </Grid>
        </Grid>
    );
};

export default React.memo(FinancialTab);

