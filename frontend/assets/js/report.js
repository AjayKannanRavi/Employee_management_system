document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const totalEmployees = document.getElementById('totalEmployees');
    const totalDepartments = document.getElementById('totalDepartments');
    const roleFilter = document.getElementById('roleFilter');
    const dateRange = document.getElementById('dateRange');
    const salaryRange = document.getElementById('salaryRange');
    const roleStats = document.getElementById('roleStats');
    const salaryStats = document.getElementById('salaryStats');
    const recentHires = document.getElementById('recentHires');

    // Get data from localStorage
    function getEmployeesFromStorage() {
        return JSON.parse(localStorage.getItem('employees') || '[]');
    }

    let employees = getEmployeesFromStorage();

    // Listen for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'employees') {
            employees = JSON.parse(e.newValue || '[]');
            updateDashboard();
        }
    });

    // Create a custom event listener for immediate updates
    window.addEventListener('employeeDataChanged', () => {
        employees = getEmployees();
        updateDashboard();
    });
    const roles = JSON.parse(localStorage.getItem('employeeRoles')) || [
        'Manager', 'Developer', 'HR', 'Designer', 'Analyst', 'Team Lead'
    ];

    // Populate role filter
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleFilter.appendChild(option);
    });

    // Update summary cards
    function updateSummaryCards() {
        const currentEmployees = getEmployeesFromStorage();
        const activeEmployees = currentEmployees.filter(emp => emp.status === 'Active');
        const departments = new Set(currentEmployees.map(emp => emp.department));

        totalEmployees.textContent = currentEmployees.length;
        document.getElementById('activeEmployees').textContent = activeEmployees.length;
        totalDepartments.textContent = departments.size;

        // Update summary card details
        document.querySelector('.summary-card:nth-child(1) .card-subtitle').textContent = 
            `${Math.round((activeEmployees.length / currentEmployees.length) * 100)}% Active`;
        
        document.querySelector('.summary-card:nth-child(2) .card-subtitle').textContent = 
            Array.from(departments).join(', ');
    }

    // Filter data based on selected criteria
    function filterData() {
        let filtered = [...employees];

        // Role filter
        if (roleFilter.value !== 'all') {
            filtered = filtered.filter(emp => emp.role === roleFilter.value);
        }

        // Date range filter
        const now = new Date();
        if (dateRange.value !== 'all') {
            let cutoffDate = new Date();
            switch(dateRange.value) {
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case '3months':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
                case '6months':
                    cutoffDate.setMonth(now.getMonth() - 6);
                    break;
                case 'year':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            filtered = filtered.filter(emp => new Date(emp.startDate) >= cutoffDate);
        }

        // Salary range filter
        if (salaryRange.value !== 'all') {
            const [min, max] = salaryRange.value.split('-').map(Number);
            filtered = filtered.filter(emp => {
                const salary = Number(emp.salary);
                if (max) {
                    return salary >= min && salary <= max;
                } else {
                    return salary >= min;
                }
            });
        }

        return filtered;
    }

    // Chart instances
    let roleChart = null;
    let salaryChart = null;
    let hiringTrendChart = null;

    // Create role distribution chart
    function createRoleChart(data) {
        const roleCount = {};
        data.forEach(emp => {
            roleCount[emp.role] = (roleCount[emp.role] || 0) + 1;
        });

        const ctx = document.getElementById('roleChart').getContext('2d');
        
        const chartData = {
            labels: Object.keys(roleCount),
            datasets: [{
                data: Object.values(roleCount),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ]
            }]
        };

        if (roleChart) {
            roleChart.data = chartData;
            roleChart.update();
        } else {
            roleChart = new Chart(ctx, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
    }

    // Create salary distribution chart
    function createSalaryChart(data) {
        const salaryRanges = {
            '0-30k': 0,
            '30k-50k': 0,
            '50k-80k': 0,
            '80k+': 0
        };

        data.forEach(emp => {
            const salary = Number(emp.salary);
            if (salary <= 30000) salaryRanges['0-30k']++;
            else if (salary <= 50000) salaryRanges['30k-50k']++;
            else if (salary <= 80000) salaryRanges['50k-80k']++;
            else salaryRanges['80k+']++;
        });

        const ctx = document.getElementById('salaryChart').getContext('2d');
        
        const chartData = {
            labels: Object.keys(salaryRanges),
            datasets: [{
                label: 'Number of Employees',
                data: Object.values(salaryRanges),
                backgroundColor: '#36A2EB'
            }]
        };
        
        if (salaryChart) {
            salaryChart.data = chartData;
            salaryChart.update();
        } else {
            salaryChart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }

    // Create hiring trend chart
    function createHiringTrendChart(data) {
        const monthlyHires = {};
        
        // Get last 12 months
        const months = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            months.push(monthYear);
            monthlyHires[monthYear] = 0;
        }

        // Count hires per month
        data.forEach(emp => {
            const hireDate = new Date(emp.startDate);
            const monthYear = hireDate.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (monthlyHires.hasOwnProperty(monthYear)) {
                monthlyHires[monthYear]++;
            }
        });

        // Count hires per month
        sortedData.forEach(emp => {
            const date = new Date(emp.startDate);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (monthlyHires.hasOwnProperty(monthYear)) {
                monthlyHires[monthYear]++;
            }
        });

        const ctx = document.getElementById('hiringTrendChart').getContext('2d');
        
        const chartData = {
            labels: months,
            datasets: [{
                label: 'New Hires',
                data: months.map(month => monthlyHires[month]),
                borderColor: '#4BC0C0',
                tension: 0.1
            }]
        };

        if (hiringTrendChart) {
            hiringTrendChart.data = chartData;
            hiringTrendChart.update();
        } else {
            hiringTrendChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }

    // Update detailed statistics
    function updateDetailedStats(data) {
        // Role statistics with edit buttons
        const roleCount = {};
        data.forEach(emp => {
            roleCount[emp.role] = (roleCount[emp.role] || 0) + 1;
        });

        roleStats.innerHTML = Object.entries(roleCount)
            .map(([role, count]) => {
                const employeesInRole = data.filter(emp => emp.role === role);
                return `
                    <div class="stat-section">
                        <div class="stat-header">
                            <span class="stat-label">${role}:</span>
                            <span class="stat-value">${count} employees</span>
                        </div>
                        <div class="role-employees">
                            ${employeesInRole.map(emp => `
                                <div class="employee-row">
                                    <div class="employee-info">
                                        <h4>${emp.name}</h4>
                                        <p>${formatDate(emp.startDate)}</p>
                                    </div>
                                    <a href="edit-employee.html?id=${emp.id}" class="edit-btn">✏️ Edit</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');

        // Salary statistics
        const salaries = data.map(emp => Number(emp.salary)).filter(Boolean);
        const avgSalary = salaries.length ? 
            salaries.reduce((a, b) => a + b, 0) / salaries.length : 0;
        const maxSalary = Math.max(...salaries);
        const minSalary = Math.min(...salaries);

        salaryStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Average Salary:</span>
                <span class="stat-value">${formatSalary(avgSalary)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Highest Salary:</span>
                <span class="stat-value">${formatSalary(maxSalary)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Lowest Salary:</span>
                <span class="stat-value">${formatSalary(minSalary)}</span>
            </div>
        `;

        // Recent hires
        const sortedEmployees = [...data].sort((a, b) => 
            new Date(b.startDate) - new Date(a.startDate)
        ).slice(0, 5);

        recentHires.innerHTML = sortedEmployees
            .map(emp => `
                <div class="stat-item">
                    <span class="stat-label">${emp.name}</span>
                    <span class="stat-value">${formatDate(emp.startDate)} - ${emp.role}</span>
                </div>
            `).join('');
    }

    // Function to update all charts and stats
    function updateDashboard() {
        const filteredData = filterData();
        
        // Update everything
        updateSummaryCards();
        createRoleChart(filteredData);
        createSalaryChart(filteredData);
        createHiringTrendChart(filteredData);
        updateDetailedStats(filteredData);

        // Save current filter state
        localStorage.setItem('reportFilters', JSON.stringify({
            role: roleFilter.value,
            dateRange: dateRange.value,
            salaryRange: salaryRange.value
        }));
    }

    // Load saved filters if they exist
    const savedFilters = JSON.parse(localStorage.getItem('reportFilters'));
    if (savedFilters) {
        roleFilter.value = savedFilters.role;
        dateRange.value = savedFilters.dateRange;
        salaryRange.value = savedFilters.salaryRange;
    }

    // Add event listeners
    roleFilter.addEventListener('change', updateDashboard);
    dateRange.addEventListener('change', updateDashboard);
    salaryRange.addEventListener('change', updateDashboard);

    // Initial update
    updateDashboard();

    // Export functionality
    document.getElementById('exportCSV').addEventListener('click', () => {
        const filteredData = filterData();
        const csv = [
            ['ID', 'Name', 'Email', 'Role', 'Join Date', 'Salary'],
            ...filteredData.map(emp => [
                emp.id,
                emp.name,
                emp.email,
                emp.role,
                emp.startDate,
                emp.salary
            ])
        ].map(row => row.join(',')).join('\\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employee_report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    });
    });

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Helper function to format salary
function formatSalary(salary) {
    return salary ? `$${salary.toLocaleString()}` : 'N/A';
}
