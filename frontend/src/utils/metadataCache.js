/**
 * Metadata Cache Utility
 * Provides client-side comparison of import data against cached metadata
 * This avoids database queries during preview, making it instant
 */

// Enhanced normalization: trim, normalize spaces/slashes, handle apostrophes, collapse multiple spaces
const normalizeStr = (v) => {
    if (typeof v !== 'string') return v;
    let normalized = v.trim();
    // Remove apostrophes (handle different apostrophe characters)
    normalized = normalized.replace(/[''"`\u0027\u2018\u2019\u201A\u201B\u2032\u2035]/g, '');
    // Normalize slashes: remove spaces around existing slashes
    normalized = normalized.replace(/\s*\/\s*/g, '/');
    // Collapse multiple spaces to single space
    normalized = normalized.replace(/\s+/g, ' ');
    return normalized;
};

// Normalize alias for matching: remove &, commas, and spaces, then lowercase
const normalizeAlias = (v) => {
    if (typeof v !== 'string') return v;
    return normalizeStr(v)
        .replace(/[&,]/g, '')  // Remove ampersands and commas
        .replace(/\s+/g, '')   // Remove all spaces
        .toLowerCase();         // Lowercase for case-insensitive matching
};

// Normalize financial year name for comparison
const normalizeFinancialYear = (name) => {
    if (!name) return '';
    let normalized = String(name).trim().toLowerCase();
    // Remove FY or fy prefix (with optional space)
    normalized = normalized.replace(/^fy\s*/i, '');
    // Normalize all separators (space, dash) to slash
    normalized = normalized.replace(/[\s\-]/g, '/');
    // Remove any extra slashes
    normalized = normalized.replace(/\/+/g, '/');
    return normalized.trim();
};

/**
 * Get metadata cache from localStorage
 */
export const getMetadataCache = () => {
    try {
        const cached = localStorage.getItem('metadataCache');
        if (cached) {
            const data = JSON.parse(cached);
            // Check if cache is less than 24 hours old
            const cachedAt = new Date(data.cachedAt);
            const now = new Date();
            const hoursSinceCache = (now - cachedAt) / (1000 * 60 * 60);
            if (hoursSinceCache < 24) {
                return data;
            }
        }
    } catch (error) {
        console.error('Error reading metadata cache:', error);
    }
    return null;
};

/**
 * Check if a department exists in cache
 */
export const checkDepartment = (departmentName, cache) => {
    if (!departmentName || !cache || !cache.departments) return false;
    
    const normalizedDept = normalizeStr(departmentName).toLowerCase();
    const normalizedDeptAlias = normalizeAlias(departmentName);
    
    return cache.departments.some(dept => {
        const normalizedName = normalizeStr(dept.name || '').toLowerCase();
        const normalizedAlias = normalizeAlias(dept.alias || '');
        
        return normalizedName === normalizedDept || 
               normalizedAlias === normalizedDeptAlias ||
               (dept.alias && dept.alias.split(',').some(a => {
                   const aliasNorm = normalizeStr(a).toLowerCase();
                   return aliasNorm === normalizedDept || normalizeAlias(a) === normalizedDeptAlias;
               }));
    });
};

/**
 * Check if a ward exists in cache
 */
export const checkWard = (wardName, cache) => {
    if (!wardName || !cache || !cache.wards) return false;
    
    const wardNameLower = normalizeStr(wardName).toLowerCase();
    const wardNameNoSuffix = wardNameLower.replace(/\s+ward\s*$/i, '').trim();
    
    return cache.wards.some(ward => {
        const normalized = normalizeStr(ward).toLowerCase();
        const withSlash = normalized.replace(/\s+/g, '/');
        const withSpace = normalized.replace(/\//g, ' ');
        const words = normalized.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
        
        return normalized === wardNameLower ||
               normalized === wardNameNoSuffix ||
               withSlash === wardNameLower ||
               withSpace === wardNameLower ||
               words === wardNameLower.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
    });
};

/**
 * Check if a subcounty exists in cache
 */
export const checkSubcounty = (subcountyName, cache) => {
    if (!subcountyName || !cache || !cache.subcounties) return false;
    
    let subcountyNameLower = normalizeStr(subcountyName).toLowerCase();
    subcountyNameLower = subcountyNameLower.replace(/\s+sc\s*$/i, '').trim();
    subcountyNameLower = subcountyNameLower.replace(/\s+subcounty\s*$/i, '').trim();
    subcountyNameLower = subcountyNameLower.replace(/\s+sub\s+county\s*$/i, '').trim();
    
    return cache.subcounties.some(subcounty => {
        const normalized = normalizeStr(subcounty).toLowerCase();
        const withSlash = normalized.replace(/\s+/g, '/');
        const withSpace = normalized.replace(/\//g, ' ');
        const words = normalized.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
        
        return normalized === subcountyNameLower ||
               withSlash === subcountyNameLower ||
               withSpace === subcountyNameLower ||
               words === subcountyNameLower.split(/[\s\/]+/).filter(w => w.length > 0).sort().join(' ');
    });
};

/**
 * Check if a financial year exists in cache
 */
export const checkFinancialYear = (finYearName, cache) => {
    if (!finYearName || !cache || !cache.financialYears) return false;
    
    const normalizedFY = normalizeFinancialYear(finYearName);
    
    return cache.financialYears.some(fy => {
        const normalized = normalizeFinancialYear(fy);
        return normalized === normalizedFY;
    });
};

/**
 * Check if a budget exists in cache
 */
export const checkBudget = (budgetName, cache) => {
    if (!budgetName || !cache || !cache.budgets) return false;
    
    const normalizedBudget = normalizeStr(budgetName).toLowerCase();
    
    return cache.budgets.some(budget => {
        const normalized = normalizeStr(budget).toLowerCase();
        return normalized === normalizedBudget;
    });
};

/**
 * Perform client-side metadata check on import data
 * Returns a mapping summary without hitting the database
 */
export const checkMetadataClientSide = (dataToImport) => {
    const cache = getMetadataCache();
    if (!cache) {
        console.warn('No metadata cache available, falling back to server-side check');
        return null;
    }
    
    const mappingSummary = {
        budgets: { existing: [], new: [], unmatched: [] },
        financialYears: { existing: [], new: [], unmatched: [] },
        departments: { existing: [], new: [], unmatched: [] },
        wards: { existing: [], new: [], unmatched: [] },
        subcounties: { existing: [], new: [], unmatched: [] },
        totalRows: dataToImport.length,
        rowsWithUnmatchedMetadata: [],
        duplicateProjectNames: []
    };
    
    // Track unique values
    const uniqueBudgets = new Set();
    const uniqueFinancialYears = new Set();
    const uniqueDepartments = new Set();
    const uniqueWards = new Set();
    const uniqueSubcounties = new Set();
    const projectNameMap = new Map();
    
    // Process all rows
    dataToImport.forEach((row, index) => {
        const projectName = (row.projectName || row['Project Name'] || '').toString().trim();
        const budgetName = normalizeStr(
            row.budgetName || 
            row['BudgetName'] || 
            row['Budget Name'] || 
            row['Budget'] || 
            row.budget
        );
        
        // Skip rows that have neither project name nor budget name
        if ((!projectName || projectName.length < 3) && !budgetName) {
            return;
        }
        
        // Track project names for duplicate detection
        if (projectName && projectName.length >= 3) {
            const normalizedProjectName = normalizeStr(projectName).toLowerCase();
            if (!projectNameMap.has(normalizedProjectName)) {
                projectNameMap.set(normalizedProjectName, []);
            }
            projectNameMap.get(normalizedProjectName).push({
                rowNumber: index + 2,
                projectName: projectName,
                budgetName: budgetName || 'N/A'
            });
        }
        
        const department = normalizeStr(row.department || row.Department || row.dbDepartment || row['db_department']);
        const ward = normalizeStr(row.dbWard || row['db_ward'] || row.ward || row.Ward);
        const subcounty = normalizeStr(
            row.dbSubcounty || 
            row['db_subcounty'] || 
            row['sub-county'] || 
            row.SubCounty || 
            row['Sub County'] || 
            row.Subcounty ||
            row.subcounty
        );
        const finYear = normalizeStr(
            row.financialYear || 
            row.FinancialYear || 
            row['Financial Year'] || 
            row.finYear || 
            row['fin_year']
        );
        
        if (budgetName) uniqueBudgets.add(budgetName);
        if (department) uniqueDepartments.add(department);
        if (ward && ward !== 'unknown' && ward !== 'CountyWide') uniqueWards.add(ward);
        if (subcounty && subcounty !== 'unknown' && subcounty !== 'CountyWide') uniqueSubcounties.add(subcounty);
        if (finYear) uniqueFinancialYears.add(finYear);
    });
    
    // Check budgets
    uniqueBudgets.forEach(budgetName => {
        if (checkBudget(budgetName, cache)) {
            mappingSummary.budgets.existing.push(budgetName);
        } else {
            mappingSummary.budgets.new.push(budgetName);
        }
    });
    
    // Check financial years
    uniqueFinancialYears.forEach(fy => {
        if (checkFinancialYear(fy, cache)) {
            mappingSummary.financialYears.existing.push(fy);
        } else {
            mappingSummary.financialYears.new.push(fy);
        }
    });
    
    // Check departments
    uniqueDepartments.forEach(dept => {
        if (checkDepartment(dept, cache)) {
            mappingSummary.departments.existing.push(dept);
        } else {
            mappingSummary.departments.new.push(dept);
        }
    });
    
    // Check wards
    uniqueWards.forEach(ward => {
        if (checkWard(ward, cache)) {
            mappingSummary.wards.existing.push(ward);
        } else {
            mappingSummary.wards.new.push(ward);
        }
    });
    
    // Check subcounties
    uniqueSubcounties.forEach(subcounty => {
        if (checkSubcounty(subcounty, cache)) {
            mappingSummary.subcounties.existing.push(subcounty);
        } else {
            mappingSummary.subcounties.new.push(subcounty);
        }
    });
    
    // Build duplicate project names list
    projectNameMap.forEach((occurrences, normalizedName) => {
        if (occurrences.length > 1) {
            mappingSummary.duplicateProjectNames.push({
                projectName: occurrences[0].projectName,
                occurrences: occurrences.length,
                rows: occurrences.map(occ => ({
                    rowNumber: occ.rowNumber,
                    budgetName: occ.budgetName
                }))
            });
        }
    });
    
    // Identify rows with unmatched metadata
    dataToImport.forEach((row, index) => {
        const projectName = (row.projectName || row['Project Name'] || '').toString().trim();
        const budgetName = normalizeStr(
            row.budgetName || 
            row['BudgetName'] || 
            row['Budget Name'] || 
            row['Budget'] || 
            row.budget
        );
        
        if ((!projectName || projectName.length < 3) && !budgetName) {
            return;
        }
        
        const department = normalizeStr(row.department || row.Department || row.dbDepartment || row['db_department']);
        const ward = normalizeStr(row.dbWard || row['db_ward'] || row.ward || row.Ward);
        const subcounty = normalizeStr(
            row.dbSubcounty || 
            row['db_subcounty'] || 
            row['sub-county'] || 
            row.SubCounty || 
            row['Sub County'] || 
            row.Subcounty ||
            row.subcounty
        );
        const finYear = normalizeStr(
            row.financialYear || 
            row.FinancialYear || 
            row['Financial Year'] || 
            row.finYear || 
            row['fin_year']
        );
        
        const unmatched = [];
        if (budgetName && !mappingSummary.budgets.existing.includes(budgetName) && !mappingSummary.budgets.new.includes(budgetName)) {
            unmatched.push(`Budget: ${budgetName}`);
        }
        if (department && !mappingSummary.departments.existing.includes(department) && !mappingSummary.departments.new.includes(department)) {
            unmatched.push(`Department: ${department}`);
        }
        if (ward && ward !== 'unknown' && ward !== 'CountyWide' && !mappingSummary.wards.existing.includes(ward) && !mappingSummary.wards.new.includes(ward)) {
            unmatched.push(`Ward: ${ward}`);
        }
        if (subcounty && subcounty !== 'unknown' && subcounty !== 'CountyWide' && !mappingSummary.subcounties.existing.includes(subcounty) && !mappingSummary.subcounties.new.includes(subcounty)) {
            unmatched.push(`Subcounty: ${subcounty}`);
        }
        if (finYear && !mappingSummary.financialYears.existing.includes(finYear) && !mappingSummary.financialYears.new.includes(finYear)) {
            unmatched.push(`Financial Year: ${finYear}`);
        }
        
        if (unmatched.length > 0) {
            mappingSummary.rowsWithUnmatchedMetadata.push({
                rowNumber: index + 2,
                projectName: projectName || `Row ${index + 2}`,
                unmatched: unmatched
            });
        }
    });
    
    return mappingSummary;
};
