document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("employeeForm");
  let employees = getEmployees();

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("id");

  if (editId) {
    const emp = employees.find(e => e.id == editId);
    if (emp) {
      document.getElementById("empId").value = emp.id;
      document.getElementById("name").value = emp.name;
      document.getElementById("email").value = emp.email;
      document.getElementById("role").value = emp.role;
    }
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const id = editId ? Number(editId) : Date.now();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;

    if (editId) {
      employees = employees.map(emp =>
        emp.id == editId ? { id, name, email, role } : emp
      );
    } else {
      employees.push({ id, name, email, role });
    }

    saveEmployees(employees);
    window.location.href = "employees.html";
  });
});