document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("employeeForm");
    
    // Initialize employees array from localStorage
    let employees = JSON.parse(localStorage.getItem('employees')) || [];

    // Get stored roles from localStorage or use default roles
    const roles = JSON.parse(localStorage.getItem('employeeRoles')) || [
        'Manager',
        'Developer',
        'Designer',
        'HR',
        'Analyst',
        'Team Lead',
        'QA Engineer',
        'Product Manager',
        'Sales Executive',
        'Marketing Specialist'
    ];

    // Get stored departments from localStorage or use default departments
    const departments = JSON.parse(localStorage.getItem('employeeDepartments')) || [
        'Engineering',
        'Design',
        'Human Resources',
        'Sales',
        'Marketing',
        'Product',
        'Operations',
        'Finance',
        'Legal'
    ];

    // Populate role dropdown
    const roleSelect = document.getElementById('role');
    roleSelect.innerHTML = '<option value="">-- Select Role --</option>';
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleSelect.appendChild(option);
    });

    // Populate department dropdown
    const departmentSelect = document.getElementById('department');
    departmentSelect.innerHTML = '<option value="">-- Select Department --</option>';
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
    });

    // Function to generate a unique employee ID
    function generateEmployeeId() {
        const lastEmployee = employees[employees.length - 1];
        const lastId = lastEmployee ? parseInt(lastEmployee.id.slice(3)) : 0;
        return `EMP${(lastId + 1).toString().padStart(4, '0')}`;
    }

    // Function to validate email format
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Function to validate phone number
    function isValidPhone(phone) {
        return /^\d{10}$/.test(phone);
    }

    // Function to show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Automatically remove the notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Handle form submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Get form values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const role = document.getElementById("role").value;
        const department = document.getElementById("department").value;
        const startDate = document.getElementById("startDate").value;
        const salary = document.getElementById("salary").value;

        // Validate inputs
        if (!name || !email || !phone || !role || !department || !startDate || !salary) {
            showNotification("Please fill in all required fields", "error");
            return;
        }

        if (!isValidEmail(email)) {
            showNotification("Please enter a valid email address", "error");
            return;
        }

        if (!isValidPhone(phone)) {
            showNotification("Please enter a valid 10-digit phone number", "error");
            return;
        }

        // Create new employee object
        const newEmployee = {
            id: generateEmployeeId(),
            name,
            email,
            phone,
            role,
            department,
            startDate,
            salary: parseFloat(salary),
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        try {
            // Add new employee to array
            employees.push(newEmployee);
            
            // Save to localStorage
            localStorage.setItem('employees', JSON.stringify(employees));

            // Show success message
            showNotification("Employee added successfully!");

            // Reset form
            form.reset();

            // Redirect to employees list after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'employees.html';
            }, 1500);

        } catch (error) {
            showNotification("Error adding employee. Please try again.", "error");
            console.error("Error:", error);
        }
    const employeeData = {
      id,
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      role: document.getElementById("role").value,
      department: document.getElementById("department").value,
      startDate: document.getElementById("startDate").value,
      salary: Number(document.getElementById("salary").value),
      status: document.getElementById("status").value,
      createdAt: editId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editId) {
      employees = employees.map(emp =>
        emp.id == editId ? { ...emp, ...employeeData } : emp
      );
    } else {
      employees.push(employeeData);
    }

    saveEmployees(employees);
    
    // Log activity
    let activities = JSON.parse(localStorage.getItem('employeeActivities')) || [];
    const activity = {
      id: Date.now(),
      type: editId ? 'edit' : 'add',
      data: {
        name: employeeData.name,
        role: employeeData.role
      },
      timestamp: new Date().toISOString()
    };
    activities.unshift(activity);
    activities = activities.slice(0, 100); // Keep only last 100 activities
    localStorage.setItem('employeeActivities', JSON.stringify(activities));
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('employeeDataChanged'));

    // Small delay to ensure the event is processed
    setTimeout(() => {
        window.location.href = "employees.html";
    }, 100);
  });
});