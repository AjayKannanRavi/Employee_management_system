document.addEventListener("DOMContentLoaded", () => {
  /* ================= ROLE MANAGEMENT ================= */
  const roleForm = document.getElementById("roleForm");
  const roleList = document.getElementById("roleList");
  const roleInput = document.getElementById("roleInput");
  const roleStatsDiv = document.getElementById("roleStatistics");
  const systemStatsDiv = document.getElementById("systemStatistics");

  // Load existing roles and employees
  let roles = JSON.parse(localStorage.getItem('employeeRoles')) || [
    'Manager', 'Developer', 'HR', 'Designer', 'Analyst', 'Team Lead'
  ];
  let employees = getEmployees();

  function saveRoles() {
    localStorage.setItem('employeeRoles', JSON.stringify(roles));
  }

  function updateStatistics() {
    if (roleStatsDiv) {
      const roleStats = {};
      employees.forEach(emp => {
        roleStats[emp.role] = (roleStats[emp.role] || 0) + 1;
      });

      roleStatsDiv.innerHTML = `
        <h3>Role Statistics</h3>
        <div class="stats-grid">
          ${roles.map(role => `
            <div class="stat-item">
              <span class="stat-label">${role}</span>
              <span class="stat-value">${roleStats[role] || 0} employees</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (systemStatsDiv) {
      const totalEmployees = employees.length;
      const totalRoles = roles.length;
      const avgSalary = employees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0) / totalEmployees || 0;
      const recentHires = employees
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .slice(0, 5);

      systemStatsDiv.innerHTML = `
        <h3>System Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Employees</span>
            <span class="stat-value">${totalEmployees}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Roles</span>
            <span class="stat-value">${totalRoles}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average Salary</span>
            <span class="stat-value">${formatSalary(avgSalary)}</span>
          </div>
        </div>
        <h4>Recent Hires</h4>
        <div class="recent-hires">
          ${recentHires.map(emp => `
            <div class="hire-item">
              <span class="hire-name">${emp.name}</span>
              <span class="hire-details">${emp.role} - ${formatDate(emp.startDate)}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  function renderRoles() {
    if (roleList) {
      roleList.innerHTML = '';
      roles.forEach(role => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${role}</span>
          <button type="button" class="delete-role" data-role="${role}">🗑️</button>
        `;
        roleList.appendChild(li);
      });
    }
    updateStatistics();
  }

  // Add new role
  if (roleForm) {
    roleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newRole = roleInput.value.trim();
      if (newRole && !roles.includes(newRole)) {
        roles.push(newRole);
        saveRoles();
        renderRoles();
        roleInput.value = '';
      }
    });
  }

  // Delete role
  if (roleList) {
    roleList.addEventListener("click", (e) => {
      if (e.target.classList.contains('delete-role')) {
        const roleToDelete = e.target.dataset.role;
        roles = roles.filter(role => role !== roleToDelete);
        saveRoles();
        renderRoles();
      }
    });
  }

  // Initial render of roles
  renderRoles();

  // Listen for employee data changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'employees') {
      employees = JSON.parse(e.newValue || '[]');
      updateStatistics();
    } else if (e.key === 'employeeRoles') {
      roles = JSON.parse(e.newValue || '[]');
      renderRoles();
    }
  });

  // Listen for custom event for immediate updates
  window.addEventListener('employeeDataChanged', () => {
    employees = getEmployees();
    updateStatistics();
  });

  /* ================= DARK MODE ================= */
  const darkModeToggle = document.getElementById("darkModeToggle");

  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    if (darkModeToggle) darkModeToggle.checked = true;
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      if (darkModeToggle.checked) {
        document.body.classList.add("dark");
        localStorage.setItem("darkMode", "enabled");
      } else {
        document.body.classList.remove("dark");
        localStorage.setItem("darkMode", "disabled");
      }
    });
  }

  /* ================= NOTIFICATIONS ================= */
  const emailNotif = document.getElementById("emailNotif");
  const smsNotif = document.getElementById("smsNotif");

  if (emailNotif) {
    emailNotif.addEventListener("change", () => {
      localStorage.setItem("emailNotif", emailNotif.checked ? "on" : "off");
    });
    emailNotif.checked = localStorage.getItem("emailNotif") === "on";
  }

  if (smsNotif) {
    smsNotif.addEventListener("change", () => {
      localStorage.setItem("smsNotif", smsNotif.checked ? "on" : "off");
    });
    smsNotif.checked = localStorage.getItem("smsNotif") === "on";
  }

  /* ================= PROFILE FORM ================= */
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = profileForm.querySelector("input[type='text']").value;
      const email = profileForm.querySelector("input[type='email']").value;

      if (name && email) {
        localStorage.setItem("profileName", name);
        localStorage.setItem("profileEmail", email);
        alert("✅ Profile updated successfully!");
      } else {
        alert("⚠️ Please fill in all fields.");
      }
    });

    // Load saved profile data
    profileForm.querySelector("input[type='text']").value =
      localStorage.getItem("profileName") || "";
    profileForm.querySelector("input[type='email']").value =
      localStorage.getItem("profileEmail") || "";
  }

  /* ================= PASSWORD FORM ================= */
  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = passwordForm.querySelectorAll("input[type='password']");
      const currentPassword = inputs[0].value;
      const newPassword = inputs[1].value;
      const confirmPassword = inputs[2].value;

      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("⚠️ Please fill in all fields.");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("⚠️ New password and confirm password do not match!");
        return;
      }

      // (Demo only — replace with backend call later)
      alert("✅ Password updated successfully!");
      passwordForm.reset();
    });
  }
});
