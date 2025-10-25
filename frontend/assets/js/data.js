// Data storage functions
function getEmployees() {
    return JSON.parse(localStorage.getItem('employees')) || [];
}

function saveEmployees(employees) {
    localStorage.setItem('employees', JSON.stringify(employees));
}

// Helper functions for formatting
function formatSalary(salary) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(salary);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
