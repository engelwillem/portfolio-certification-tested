(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#primary-nav");
  const themeToggle = document.querySelector(".theme-toggle");

  // Mobile nav
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Theme toggle
  const THEME_KEY = "porto_theme";
  const setTheme = (theme) => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      themeToggle.textContent = "Dark";
      themeToggle.setAttribute("aria-pressed", "true");
    } else {
      document.documentElement.removeAttribute("data-theme");
      themeToggle.textContent = "Light";
      themeToggle.setAttribute("aria-pressed", "false");
    }
    localStorage.setItem(THEME_KEY, theme);
  };

  if (themeToggle) {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") setTheme(saved);

    themeToggle.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      setTheme(isLight ? "dark" : "light");
    });
  }
})();
