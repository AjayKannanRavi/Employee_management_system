document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#employeeTable tbody");
  const searchBox = document.getElementById("searchBox");
  const roleFilter = document.getElementById("roleFilter");
  const exportCSV = document.getElementById("exportCSV");
  const bulkDelete = document.getElementById("bulkDelete");
  const selectAll = document.getElementById("selectAll");
  const pagination = document.getElementById("pagination");

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
        <td>${emp.name}</td>
        <td>${emp.email}</td>
        <td>${emp.role}</td>
        <td>
          <a href="edit-employee.html?id=${emp.id}">Edit</a> |
          <button class="delete" onclick="deleteEmployee(${emp.id})">Delete</button>
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
    employees = employees.filter(emp => emp.id !== id);
    saveEmployees(employees);
    applyFilters();
  };

  // Bulk delete
  bulkDelete.addEventListener("click", () => {
    const selected = document.querySelectorAll(".rowCheckbox:checked");
    let ids = Array.from(selected).map(cb => parseInt(cb.dataset.id));
    employees = employees.filter(emp => !ids.includes(emp.id));
    saveEmployees(employees);
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
