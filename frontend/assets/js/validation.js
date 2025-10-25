document.addEventListener('DOMContentLoaded', () => {
    // Form validation functions
    function validateName(name) {
        const nameRegex = /^[A-Za-z\s]{2,50}$/;
        return nameRegex.test(name.trim());
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    function validatePhone(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phone ? phoneRegex.test(phone.trim()) : true; // Optional field
    }

    function validateSalary(salary) {
        return salary >= 0;
    }

    // Show error message
    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        const existingError = formGroup.querySelector('.error-message');
        
        if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            formGroup.appendChild(errorDiv);
        }
        
        inputElement.classList.add('error');
    }

    // Remove error message
    function removeError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        inputElement.classList.remove('error');
    }

    // Real-time validation
    const form = document.getElementById('employeeForm');
    const inputs = form.querySelectorAll('input, select');

    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });

        input.addEventListener('blur', function() {
            validateField(this);
        });
    });

    function validateField(input) {
        removeError(input);

        switch(input.id) {
            case 'name':
                if (!validateName(input.value)) {
                    showError(input, 'Name should only contain letters and spaces (2-50 characters)');
                    return false;
                }
                break;

            case 'email':
                if (!validateEmail(input.value)) {
                    showError(input, 'Please enter a valid email address');
                    return false;
                }
                break;

            case 'phone':
                if (input.value && !validatePhone(input.value)) {
                    showError(input, 'Please enter a valid 10-digit phone number');
                    return false;
                }
                break;

            case 'salary':
                if (!validateSalary(input.value)) {
                    showError(input, 'Salary cannot be negative');
                    return false;
                }
                break;

            case 'role':
            case 'department':
            case 'status':
                if (!input.value) {
                    showError(input, 'This field is required');
                    return false;
                }
                break;

            case 'startDate':
                if (!input.value) {
                    showError(input, 'Please select a start date');
                    return false;
                }
                break;
        }

        return true;
    }

    // Form submission validation
    form.addEventListener('submit', function(e) {
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
            showMessage('Please correct the errors in the form', 'error');
        }
    });

    // Show success/error message
    function showMessage(message, type = 'success') {
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.innerHTML = `
            <div class="message ${type}">
                ${message}
                <button class="close-message">×</button>
            </div>
        `;
        messageContainer.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);

        // Close button functionality
        const closeBtn = messageContainer.querySelector('.close-message');
        closeBtn.addEventListener('click', () => {
            messageContainer.style.display = 'none';
        });
    }

    // Confirmation dialog functionality
    const confirmDialog = document.getElementById('confirmDialog');
    const deleteBtn = document.getElementById('deleteEmployee');
    const confirmBtn = document.getElementById('confirmAction');
    const cancelBtn = document.getElementById('cancelAction');

    deleteBtn.addEventListener('click', () => {
        document.getElementById('confirmMessage').textContent = 
            'Are you sure you want to delete this employee? This action cannot be undone.';
        confirmDialog.style.display = 'block';
    });

    confirmBtn.addEventListener('click', () => {
        // Handle delete action
        const empId = document.getElementById('empId').value;
        if (empId) {
            deleteEmployee(empId);
        }
        confirmDialog.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        confirmDialog.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === confirmDialog) {
            confirmDialog.style.display = 'none';
        }
    });
});
