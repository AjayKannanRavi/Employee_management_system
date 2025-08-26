function getEmployees() {
  return JSON.parse(localStorage.getItem("employees") || "[]");
}

function saveEmployees(data) {
  localStorage.setItem("employees", JSON.stringify(data));
}