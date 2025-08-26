document.addEventListener("DOMContentLoaded", () => {
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
