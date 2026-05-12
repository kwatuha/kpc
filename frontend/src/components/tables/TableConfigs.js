// Table column configurations for different tabs

// Date formatting function
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return 'Invalid Date';
    }
};

export const overviewTableColumns = [
    {
        id: 'rowNumber',
        label: '#',
        minWidth: 45,
        type: 'number'
    },
    {
        id: 'department',
        label: 'Department',
        minWidth: 160,
        type: 'text'
    },
    {
        id: 'departmentAlias',
        label: 'Alias',
        minWidth: 110,
        type: 'text'
    },
    {
        id: 'percentCompleted',
        label: 'Progress',
        minWidth: 110,
        type: 'progress'
    },
    {
        id: 'healthScore',
        label: 'Health',
        minWidth: 75,
        type: 'number'
    },
    {
        id: 'numProjects',
        label: 'Projects',
        minWidth: 75,
        type: 'number'
    },
    {
        id: 'budgetUtilization',
        label: 'Budget %',
        minWidth: 100,
        type: 'progress'
    },
    {
        id: 'riskLevel',
        label: 'Risk',
        minWidth: 75,
        type: 'risk'
    }
];

export const financialTableColumns = [
    {
        id: 'rowNumber',
        label: '#',
        minWidth: 60,
        type: 'number'
    },
    {
        id: 'department',
        label: 'Department',
        minWidth: 200,
        type: 'text'
    },
    {
        id: 'departmentAlias',
        label: 'Department Alias',
        minWidth: 150,
        type: 'text'
    },
    {
        id: 'allocatedBudget',
        label: 'Allocated Budget',
        minWidth: 140,
        type: 'currency'
    },
    {
        id: 'contractSum',
        label: 'Contract Sum',
        minWidth: 140,
        type: 'currency'
    },
    {
        id: 'amountPaid',
        label: 'Disbursed',
        minWidth: 140,
        type: 'currency'
    },
    {
        id: 'absorptionRate',
        label: 'Absorption Rate',
        minWidth: 120,
        type: 'progress'
    },
    {
        id: 'remainingBudget',
        label: 'Remaining Budget',
        minWidth: 140,
        type: 'currency'
    }
];

export const analyticsTableColumns = [
    {
        id: 'rowNumber',
        label: '#',
        minWidth: 60,
        type: 'number'
    },
    {
        id: 'department',
        label: 'Department',
        minWidth: 200,
        type: 'text'
    },
    {
        id: 'numProjects',
        label: 'Projects',
        minWidth: 80,
        type: 'number'
    },
    {
        id: 'percentCompleted',
        label: 'Avg Progress',
        minWidth: 120,
        type: 'progress'
    },
    {
        id: 'allocatedBudget',
        label: 'Total Budget',
        minWidth: 140,
        type: 'currency'
    },
    {
        id: 'contractSum',
        label: 'Contract Sum',
        minWidth: 140,
        type: 'currency'
    },
    {
        id: 'amountPaid',
        label: 'Disbursed',
        minWidth: 140,
        type: 'currency'
    },
    {
        id: 'riskLevel',
        label: 'Risk Level',
        minWidth: 100,
        type: 'risk'
    },
    {
        id: 'onTimeDelivery',
        label: 'On-Time %',
        minWidth: 100,
        type: 'progress'
    }
];

// Sample data transformers for each tab
export const transformOverviewData = (projectData) => {
    return projectData.map((project, index) => {
        const allocatedBudget = parseFloat(project.allocatedBudget) || 0;
        const amountPaid = parseFloat(project.amountPaid) || 0;
        const budgetUtilization = allocatedBudget > 0 ? Math.round((amountPaid / allocatedBudget) * 10000) / 100 : 0;
        
        return {
            id: project.id,
            rowNumber: index + 1,
            department: project.department || project.departmentName,
            departmentAlias: project.departmentAlias,
            percentCompleted: Math.round((parseFloat(project.percentCompleted) || 0) * 100) / 100,
            healthScore: project.healthScore || 0,
            numProjects: project.numProjects || 0,
            budgetUtilization: budgetUtilization,
            riskLevel: calculateDepartmentRiskLevel(project)
        };
    });
};

export const transformFinancialData = (projectData) => {
    return projectData.map((project, index) => {
        // Ensure all financial values are properly parsed as numbers
        const contractSum = parseFloat(project.contractSum || project.costOfProject || 0);
        const amountPaid = parseFloat(project.amountPaid || project.paidOut || 0);
        const allocatedBudget = parseFloat(project.allocatedBudget || project.costOfProject || 0);
        
        const absorptionRate = contractSum > 0 ? Math.round((amountPaid / contractSum) * 10000) / 100 : 0;
        
        return {
            id: project.id || project.departmentId || `dept-${index}`,
            rowNumber: index + 1,
            department: project.departmentName || project.department,
            departmentAlias: project.departmentAlias || project.department,
            allocatedBudget: allocatedBudget,
            contractSum: contractSum,
            amountPaid: amountPaid,
            absorptionRate: absorptionRate,
            remainingBudget: allocatedBudget - amountPaid
        };
    });
};

export const transformAnalyticsData = (departmentData) => {
    return departmentData.map((dept, index) => ({
        id: dept.departmentId || dept.department,
        rowNumber: index + 1,
        department: dept.department || dept.departmentName,
        numProjects: dept.numProjects || 0,
        percentCompleted: Math.round((parseFloat(dept.percentCompleted) || 0) * 100) / 100,
        allocatedBudget: dept.allocatedBudget || 0,
        contractSum: dept.contractSum || 0,
        amountPaid: dept.amountPaid || 0,
        riskLevel: calculateRiskLevel(dept),
        onTimeDelivery: Math.round((parseFloat(dept.onTimeDelivery) || 0) * 100) / 100
    }));
};

// Helper function to calculate risk level
const calculateRiskLevel = (dept) => {
    const delayed = dept.delayedProjects || 0;
    const stalled = dept.stalledProjects || 0;
    const atRisk = dept.atRiskProjects || 0;
    const total = dept.numProjects || 1;
    
    const riskProjects = delayed + stalled + atRisk;
    return Math.round((riskProjects / total) * 100);
};

// Helper function to calculate department risk level for overview
const calculateDepartmentRiskLevel = (dept) => {
    const percentCompleted = dept.percentCompleted || 0;
    const healthScore = dept.healthScore || 0;
    const allocatedBudget = parseFloat(dept.allocatedBudget) || 0;
    const amountPaid = parseFloat(dept.amountPaid) || 0;
    const budgetUtilization = allocatedBudget > 0 ? (amountPaid / allocatedBudget) * 100 : 0;
    
    // Risk factors: low completion, low health score, high budget utilization without progress
    if (percentCompleted < 25 || healthScore < 30) return 'High';
    if (percentCompleted < 50 || healthScore < 60 || (budgetUtilization > 80 && percentCompleted < 40)) return 'Medium';
    return 'Low';
};
