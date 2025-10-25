document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#employeeTable tbody");
  const searchBox = document.getElementById("searchBox");
  const roleFilter = document.getElementById("roleFilter");
  const exportCSV = document.getElementById("exportCSV");
  const bulkDelete = document.getElementById("bulkDelete");
  const selectAll = document.getElementById("selectAll");
  const pagination = document.getElementById("pagination");

  // Populate role filter with available roles
  const roles = JSON.parse(localStorage.getItem('employeeRoles')) || [
    'Manager', 'Developer', 'HR', 'Designer', 'Analyst', 'Team Lead'
  ];
  roles.forEach(role => {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role;
    roleFilter.appendChild(option);
  });

  let employees = getEmployees();
  let currentPage = 1;
  const rowsPerPage = 5;
  let sortColumn = null;
  let sortAsc = true;

  function renderTable(data) {
    tableBody.innerHTML = "";
    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginated = data.slice(start, end);

    paginated.forEach(emp => {
      let row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" class="rowCheckbox" data-id="${emp.id}"></td>
        <td>${emp.id}</td>
        <td>
          <a href="edit-employee.html?id=${emp.id}" class="name-link">${emp.name}</a>
        </td>
        <td>${emp.email}</td>
        <td>${emp.role}</td>
        <td>${emp.startDate ? formatDate(emp.startDate) : 'N/A'}</td>
        <td>${emp.salary ? formatSalary(emp.salary) : 'N/A'}</td>
        <td class="actions">
          <a href="edit-employee.html?id=${emp.id}" class="edit-btn">✏️ Edit</a>
          <button class="delete-btn" onclick="deleteEmployee(${emp.id})">🗑️ Delete</button>
        </td>`;
      tableBody.appendChild(row);
    });

    renderPagination(data.length);
  }

  function renderPagination(totalRows) {
    pagination.innerHTML = "";
    let totalPages = Math.ceil(totalRows / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      let btn = document.createElement("button");
      btn.textContent = i;
      btn.className = (i === currentPage) ? "active" : "";
      btn.addEventListener("click", () => {
        currentPage = i;
        applyFilters();
      });
      pagination.appendChild(btn);
    }
  }

  function applyFilters() {
    let filtered = employees;

    // Search filter
    const q = searchBox.value.toLowerCase();
    if (q) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (roleFilter.value !== "all") {
      filtered = filtered.filter(emp => emp.role === roleFilter.value);
    }

    // Sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortAsc ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    renderTable(filtered);
  }

  // Delete single
  window.deleteEmployee = function(id) {
    const employeeToDelete = employees.find(emp => emp.id === id);
    if (employeeToDelete) {
      // Log delete activity
      let activities = JSON.parse(localStorage.getItem('employeeActivities')) || [];
      const activity = {
        id: Date.now(),
        type: 'delete',
        data: {
          name: employeeToDelete.name,
          role: employeeToDelete.role
        },
        timestamp: new Date().toISOString()
      };
      activities.unshift(activity);
      activities = activities.slice(0, 100); // Keep only last 100 activities
      localStorage.setItem('employeeActivities', JSON.stringify(activities));
    }

    employees = employees.filter(emp => emp.id !== id);
    saveEmployees(employees);
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('employeeDataChanged'));
    applyFilters();
  };

  // Bulk delete
  bulkDelete.addEventListener("click", () => {
    const selected = document.querySelectorAll(".rowCheckbox:checked");
    let ids = Array.from(selected).map(cb => parseInt(cb.dataset.id));
    employees = employees.filter(emp => !ids.includes(emp.id));
    saveEmployees(employees);
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('employeeDataChanged'));
    applyFilters();
  });

  // Select all
  selectAll.addEventListener("change", () => {
    document.querySelectorAll(".rowCheckbox").forEach(cb => {
      cb.checked = selectAll.checked;
    });
  });

  // Export CSV
  exportCSV.addEventListener("click", () => {
    let csv = "ID,Name,Email,Role\n";
    employees.forEach(emp => {
      csv += `${emp.id},${emp.name},${emp.email},${emp.role}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
  });

  // Sorting on headers
  document.querySelectorAll("#employeeTable thead th[data-column]").forEach(th => {
    th.addEventListener("click", () => {
      let col = th.dataset.column;
      if (sortColumn === col) {
        sortAsc = !sortAsc;
      } else {
        sortColumn = col;
        sortAsc = true;
      }
      applyFilters();
    });
  });

  // Live search
  searchBox.addEventListener("input", applyFilters);

  // Role filter
  roleFilter.addEventListener("change", applyFilters);

  // Initial load
  applyFilters();
});
