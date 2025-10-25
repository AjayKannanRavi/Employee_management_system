document.addEventListener('DOMContentLoaded', () => {
    const stats = {
        totalEmployees: document.querySelector('.stats .card:nth-child(1) p'),
        departments: document.querySelector('.stats .card:nth-child(2) p'),
        newHires: document.querySelector('.stats .card:nth-child(3) p'),
        pendingTasks: document.querySelector('.stats .card:nth-child(4) p')
    };

    const activityFeed = document.getElementById('activityFeed');
    const activityFilter = document.getElementById('activityFilter');
    const refreshButton = document.getElementById('refreshActivity');
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    let employees = getEmployees();
    let activities = JSON.parse(localStorage.getItem('employeeActivities')) || [];

    // Function to perform employee search
    function searchEmployees(query) {
        const searchResults = employees.filter(emp => {
            const searchString = query.toLowerCase();
            return emp.name.toLowerCase().includes(searchString) ||
                   emp.role.toLowerCase().includes(searchString) ||
                   emp.department.toLowerCase().includes(searchString);
        });

        displaySearchResults(searchResults);
    }

    // Function to display search results
    function displaySearchResults(results) {
        const searchResultsContainer = document.getElementById('searchResults');
        
        if (!searchResultsContainer) {
            const container = document.createElement('div');
            container.id = 'searchResults';
            container.className = 'search-results';
            document.querySelector('.search-bar').appendChild(container);
        }

        const container = document.getElementById('searchResults');
        
        if (results.length === 0) {
            container.innerHTML = '<div class="no-results">No employees found</div>';
            container.style.display = 'block';
            return;
        }

        const resultsHTML = results.map(emp => `
            <div class="search-result-item" data-id="${emp.id}">
                <div class="employee-info">
                    <h3>${emp.name}</h3>
                    <p>${emp.role} - ${emp.department}</p>
                </div>
                <div class="employee-actions">
                    <div class="employee-status ${emp.status.toLowerCase()}">
                        ${emp.status}
                    </div>
                    <button class="edit-btn" onclick="window.location.href='edit-employee.html?id=${emp.id}'">
                        ✏️ Edit
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = resultsHTML;
        container.style.display = 'block';
    }

    // Add click handler for search button
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchEmployees(query);
        }
    });

    // Add keyup handler for search input
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                searchEmployees(query);
            }
        } else if (e.target.value.trim() === '') {
            const searchResults = document.getElementById('searchResults');
            if (searchResults) {
                searchResults.style.display = 'none';
            }
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        const searchResults = document.getElementById('searchResults');
        const searchBar = document.querySelector('.search-bar');
        
        if (searchResults && !searchBar.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Format time elapsed
    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
            }
        }
        return 'just now';
    }

    // Update dashboard statistics
    function updateStats() {
        const roles = new Set(employees.map(emp => emp.role));
        const thisMonth = new Date().getMonth();
        const newHiresCount = employees.filter(emp => {
            const hireDate = new Date(emp.startDate);
            return hireDate.getMonth() === thisMonth;
        }).length;

        stats.totalEmployees.textContent = employees.length;
        stats.departments.textContent = roles.size;
        stats.newHires.textContent = newHiresCount;
        // You can update pending tasks based on your business logic
        stats.pendingTasks.textContent = '0';
    }

    // Generate activity icon
    function getActivityIcon(type) {
        switch(type) {
            case 'add': return '➕';
            case 'edit': return '✏️';
            case 'delete': return '🗑️';
            case 'role': return '👥';
            default: return '📋';
        }
    }

    // Create activity log entry
    function createActivityLog(action, data) {
        const activity = {
            id: Date.now(),
            type: action,
            data: data,
            timestamp: new Date().toISOString()
        };
        activities.unshift(activity);
        // Keep only last 100 activities
        activities = activities.slice(0, 100);
        localStorage.setItem('employeeActivities', JSON.stringify(activities));
        renderActivities();
    }

    // Render activity feed
    function renderActivities() {
        const filterValue = activityFilter.value;
        let filteredActivities = activities;

        if (filterValue !== 'all') {
            filteredActivities = activities.filter(activity => activity.type === filterValue);
        }

        activityFeed.innerHTML = filteredActivities.length ? filteredActivities.map(activity => {
            let message = '';
            const icon = getActivityIcon(activity.type);

            switch(activity.type) {
                case 'add':
                    message = `${activity.data.name} was added as ${activity.data.role}`;
                    break;
                case 'edit':
                    message = `${activity.data.name}'s information was updated`;
                    break;
                case 'delete':
                    message = `Employee ${activity.data.name} was removed`;
                    break;
                case 'role':
                    message = `${activity.data.name}'s role changed to ${activity.data.role}`;
                    break;
            }

            return `
                <div class="activity-item ${activity.type}">
                    <span class="activity-icon">${icon}</span>
                    <div class="activity-content">
                        <p class="activity-message">${message}</p>
                        <span class="activity-time">${timeAgo(activity.timestamp)}</span>
                    </div>
                </div>
            `;
        }).join('') : '<p class="no-activity">No recent activities</p>';
    }

    // Event Listeners
    activityFilter.addEventListener('change', renderActivities);
    
    refreshButton.addEventListener('click', () => {
        employees = getEmployees();
        updateStats();
        renderActivities();
    });

    // Search functionality
    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        if (query) {
            const matches = employees.filter(emp => 
                emp.name.toLowerCase().includes(query) ||
                emp.email.toLowerCase().includes(query) ||
                emp.role.toLowerCase().includes(query)
            );
            
            // Create search result activity
            if (matches.length > 0) {
                activityFeed.innerHTML = matches.map(emp => `
                    <div class="activity-item search">
                        <span class="activity-icon">🔍</span>
                        <div class="activity-content">
                            <p class="activity-message">
                                ${emp.name} - ${emp.role}
                                <a href="edit-employee.html?id=${emp.id}" class="search-action">View Details</a>
                            </p>
                            <span class="activity-time">${emp.email}</span>
                        </div>
                    </div>
                `).join('');
            } else {
                activityFeed.innerHTML = '<p class="no-activity">No employees found matching your search</p>';
            }
        } else {
            renderActivities();
        }
    }

    searchInput.addEventListener('input', handleSearch);
    searchButton.addEventListener('click', handleSearch);

    // Listen for employee data changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'employees') {
            employees = JSON.parse(e.newValue || '[]');
            updateStats();
        } else if (e.key === 'employeeActivities') {
            activities = JSON.parse(e.newValue || '[]');
            renderActivities();
        }
    });

    // Listen for custom event for immediate updates
    window.addEventListener('employeeDataChanged', () => {
        employees = getEmployees();
        updateStats();
        renderActivities();
    });

    // Initial render
    updateStats();
    renderActivities();
});