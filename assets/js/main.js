(() => {
  const root = document.documentElement;

  // Theme
  const saved = localStorage.getItem("ew_theme");
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  const initial = saved || (prefersLight ? "light" : "dark");
  root.setAttribute("data-theme", initial);

  const toggleBtn = document.getElementById("themeToggle");
  const setToggleLabel = () => {
    const t = root.getAttribute("data-theme") || "dark";
    if (toggleBtn) toggleBtn.textContent = (t === "light") ? "Dark" : "Light";
  };
  setToggleLabel();

  toggleBtn?.addEventListener("click", () => {
    const t = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", t);
    localStorage.setItem("ew_theme", t);
    setToggleLabel();
  });

  // Smooth scroll for in-page links
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
    });
  });

  // Active section highlight
  const sections = [...document.querySelectorAll("section[id]")];
  const nav = document.querySelectorAll(".nav a[href^='#']");
  const byId = new Map([...nav].map(a => [a.getAttribute("href")?.slice(1), a]));

  const setActive = (id) => {
    if (!id || !byId.has(id)) return;
    byId.forEach(a => a.classList.remove("active"));
    byId.get(id).classList.add("active");
  };

  const isNearBottom = () =>
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  const ratios = new Map(sections.map(s => [s.id, 0]));

  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(e => ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));

    if (isNearBottom()) return setActive("contact");

    const best = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0];
    if (best && best[1] > 0) setActive(best[0]);
  }, {
    rootMargin: "-30% 0px -35% 0px",
    threshold: [0, 0.12, 0.22, 0.35],
  });

  sections.forEach(s => navObs.observe(s));

  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Topbar polish: compact on scroll
  const topbar = document.querySelector(".topbar");
  const updateTopbar = () => {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", window.scrollY > 8);
  };

  // Scroll progress bar
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  const updateProgress = () => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    progress.style.width = `${p * 100}%`;
  };

  // Reveal-on-scroll
  const prefersReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealTargets = [
    ...document.querySelectorAll(
      ".section-title, .card, .hero-actions, .profile-links, .footer"
    ),
  ];

  if (!prefersReduce) {
    revealTargets.forEach(el => el.classList.add("reveal"));

    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObs.unobserve(entry.target);
      });
    }, { rootMargin: "-10% 0px -10% 0px", threshold: 0.1 });

    revealTargets.forEach(el => revealObs.observe(el));
  }

  // Click ripple for buttons/CTAs (no text added)
  const rippleTargets = document.querySelectorAll(".btn, .pill");
  rippleTargets.forEach(el => {
    el.addEventListener("click", (ev) => {
      if (prefersReduce) return;

      const rect = el.getBoundingClientRect();
      const r = document.createElement("span");
      r.className = "ripple";

      const x = (ev.clientX || (rect.left + rect.width / 2)) - rect.left;
      const y = (ev.clientY || (rect.top + rect.height / 2)) - rect.top;
      r.style.left = `${x}px`;
      r.style.top = `${y}px`;

      el.appendChild(r);
      r.addEventListener("animationend", () => r.remove());
    }, { passive: true });
  });

  // Cursor glow (pointer fine only)
  const finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (finePointer && !prefersReduce) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);

    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        glow.style.setProperty("--x", `${e.clientX}px`);
        glow.style.setProperty("--y", `${e.clientY}px`);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
  }

  // Bind scroll events (passive)
  window.addEventListener("scroll", () => {
    updateTopbar();
    updateProgress();
  }, { passive: true });

  // Initial paint
  updateTopbar();
  updateProgress();
})();
