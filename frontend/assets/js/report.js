// report.js
document.addEventListener("DOMContentLoaded", () => {
  const employees = getEmployees();

  // ==== Summary Cards ====
  document.getElementById("totalEmployees").textContent = employees.length;
  const departments = [...new Set(employees.map(e => e.department))];
  document.getElementById("totalDepartments").textContent = departments.length;
  const activeCount = employees.filter(e => e.status === "Active").length;
  document.getElementById("activeEmployees").textContent = activeCount;

  // ==== Role Count Chart (Bar) ====
  const roleCount = {};
  employees.forEach(emp => {
    roleCount[emp.role] = (roleCount[emp.role] || 0) + 1;
  });

  const ctxRole = document.getElementById("employeeChart").getContext("2d");
  const roleChart = new Chart(ctxRole, {
    type: "bar",
    data: {
      labels: Object.keys(roleCount),
      datasets: [{
        label: "Employees by Role",
        data: Object.values(roleCount),
        backgroundColor: "rgba(37, 99, 235, 0.7)",
      }]
    }
  });

  // ==== Hiring Trend Chart (Line) ====
  const hiresByMonth = {};
  employees.forEach(emp => {
    const month = new Date(emp.hireDate).toLocaleString("default", { month: "short" });
    hiresByMonth[month] = (hiresByMonth[month] || 0) + 1;
  });

  const ctxTrend = document.getElementById("hiringTrendChart").getContext("2d");
  const trendChart = new Chart(ctxTrend, {
    type: "line",
    data: {
      labels: Object.keys(hiresByMonth),
      datasets: [{
        label: "Hires per Month",
        data: Object.values(hiresByMonth),
        borderColor: "rgba(46, 204, 113, 1)",
        fill: false,
        tension: 0.3
      }]
    }
  });

  // ==== Active vs Inactive Pie Chart ====
  const inactiveCount = employees.length - activeCount;
  const ctxStatus = document.getElementById("statusChart").getContext("2d");
  const statusChart = new Chart(ctxStatus, {
    type: "pie",
    data: {
      labels: ["Active", "Inactive"],
      datasets: [{
        data: [activeCount, inactiveCount],
        backgroundColor: ["#2ecc71", "#e74c3c"]
      }]
    }
  });

  // ==== Filters ====
  document.getElementById("applyFilter").addEventListener("click", () => {
    const dept = document.getElementById("department").value;
    const year = document.getElementById("year").value;

    let filtered = employees;

    if (dept !== "all") {
      filtered = filtered.filter(e => e.department === dept);
    }
    if (year) {
      filtered = filtered.filter(e => new Date(e.hireDate).getFullYear().toString() === year);
    }

    // Update summary
    document.getElementById("totalEmployees").textContent = filtered.length;
    const depts = [...new Set(filtered.map(e => e.department))];
    document.getElementById("totalDepartments").textContent = depts.length;
    const actives = filtered.filter(e => e.status === "Active").length;
    document.getElementById("activeEmployees").textContent = actives;

    // Update role chart
    const newRoleCount = {};
    filtered.forEach(emp => {
      newRoleCount[emp.role] = (newRoleCount[emp.role] || 0) + 1;
    });
    roleChart.data.labels = Object.keys(newRoleCount);
    roleChart.data.datasets[0].data = Object.values(newRoleCount);
    roleChart.update();

    // Update trend chart
    const newHiresByMonth = {};
    filtered.forEach(emp => {
      const month = new Date(emp.hireDate).toLocaleString("default", { month: "short" });
      newHiresByMonth[month] = (newHiresByMonth[month] || 0) + 1;
    });
    trendChart.data.labels = Object.keys(newHiresByMonth);
    trendChart.data.datasets[0].data = Object.values(newHiresByMonth);
    trendChart.update();

    // Update status chart
    const newInactive = filtered.length - actives;
    statusChart.data.datasets[0].data = [actives, newInactive];
    statusChart.update();
  });

  // ==== Export Options ====
  document.getElementById("exportCSV").addEventListener("click", () => {
    const csv = [
      ["Name", "Department", "Role", "Status", "Hire Date"],
      ...employees.map(e => [e.name, e.department, e.role, e.status, e.hireDate])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("exportPDF").addEventListener("click", () => {
    alert("PDF export feature can be added using jsPDF library!");
  });
});

// ==== Mock Employee Data Function ====
function getEmployees() {
  return [
    { name: "Alice", department: "HR", role: "Manager", status: "Active", hireDate: "2025-01-12" },
    { name: "Bob", department: "IT", role: "Developer", status: "Active", hireDate: "2025-02-18" },
    { name: "Charlie", department: "Finance", role: "Analyst", status: "Inactive", hireDate: "2024-11-22" },
    { name: "David", department: "Sales", role: "Executive", status: "Active", hireDate: "2025-03-05" },
    { name: "Eva", department: "IT", role: "Developer", status: "Active", hireDate: "2023-07-15" }
  ];
}
