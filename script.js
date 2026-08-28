// @ts-nocheck
/* =========================================================
   MODERN VANILLA PORTFOLIO
   JavaScript handles behavior only; styling remains in CSS.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav-links a");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".nav-links");
  const revealElements = document.querySelectorAll(".reveal");
  const projectCards = document.querySelectorAll(".project-card");
  const modal = document.querySelector("#project-modal");
  const closeModalButtons = document.querySelectorAll("[data-close-modal]");
  const contactForm = document.querySelector("#contact-form");
  const toast = document.querySelector("#toast");
  const year = document.querySelector("#year");

  // =========================================================
  // LIGHT / DARK THEME
  // =========================================================

  const themeToggle = document.querySelector("#themeToggle");
  const themeIcon = document.querySelector(".theme-icon");

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    // FIX: icon now matches the mode you're IN, not the mode you'd switch to.
    if (theme === "light") {
      themeIcon.textContent = "☀";
      themeToggle.setAttribute("aria-label", "Switch to dark theme");
    } else {
      themeIcon.textContent = "☾";
      themeToggle.setAttribute("aria-label", "Switch to light theme");
    }

    // Remember the user's choice.
    localStorage.setItem("portfolio-theme", theme);
  }

  // Load the saved theme when the website opens.
  const savedTheme = localStorage.getItem("portfolio-theme");

  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // No saved theme yet — default to light.
    applyTheme("light");
  }

  // Change theme when the button is clicked.
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
  });

  // Keep the footer year current without hard-coding a date in HTML.
  year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     1. Mobile navigation
     --------------------------------------------------------- */
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  // Close the mobile menu after choosing a section.
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });

  /* ---------------------------------------------------------
     2. Smooth scrolling
     CSS already provides smooth scrolling, but this handler
     lets us account for the sticky header and close the menu.
     --------------------------------------------------------- */
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId.startsWith("#")) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const headerOffset = header.offsetHeight;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - headerOffset + 1;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
    });
  });

  /* ---------------------------------------------------------
     3. Intersection Observer
     Adds .visible when elements enter the viewport.
     This is more efficient than checking every element on
     every scroll event manually.
     --------------------------------------------------------- */
  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observerInstance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => observer.observe(element));

  /* ---------------------------------------------------------
     4. Active navigation + sticky header
     The scroll listener is throttled with requestAnimationFrame
     so rapid scrolling doesn't cause unnecessary calculations.
     --------------------------------------------------------- */
  const sections = document.querySelectorAll("main section[data-section]");
  let scrollTicking = false;

  function updateScrollUI() {
    const scrollY = window.scrollY;

    header.classList.toggle("scrolled", scrollY > 10);

    let currentSection = "home";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - header.offsetHeight - 80;
      if (scrollY >= sectionTop) currentSection = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${currentSection}`
      );
    });

    scrollTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }
  }, { passive: true });

  updateScrollUI();

  /* ---------------------------------------------------------
     5. Project modal
     Clicking a project opens a reusable modal populated from
     data-* attributes in the HTML.
     --------------------------------------------------------- */
  function openProjectModal(card) {
    document.querySelector("#modal-title").textContent = card.dataset.title;
    document.querySelector("#modal-category").textContent = card.dataset.category;
    document.querySelector("#modal-description").textContent = card.dataset.description;
    document.querySelector("#modal-tech").textContent = card.dataset.tech;
    document.querySelector("#modal-year").textContent = card.dataset.year;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    document.querySelector(".modal-close").focus();
  }

  function closeProjectModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  projectCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      // Clicking anywhere on a card is intentional; buttons are
      // inside the card, so this provides a generous click target.
      openProjectModal(card);
    });

    // Keyboard accessibility: Enter or Space opens a focused card.
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProjectModal(card);
      }
    });
  });

  closeModalButtons.forEach((button) => {
    button.addEventListener("click", closeProjectModal);
  });

  // Escape is a familiar keyboard affordance for dialogs.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeProjectModal();
    }
  });

  /* ---------------------------------------------------------
     6. Contact form validation
     This demo intentionally does not send data to a server.
     It validates the form and shows a local success toast.
     --------------------------------------------------------- */
  const fields = {
    name: {
      element: document.querySelector("#name"),
      validate: (value) => value.trim().length >= 2,
      success: "Looks good ✓",
      error: "Please enter at least 2 characters."
    },
    email: {
      element: document.querySelector("#email"),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      success: "Valid email ✓",
      error: "Please enter a valid email."
    },
    message: {
      element: document.querySelector("#message"),
      validate: (value) => value.trim().length >= 10,
      success: "Ready to send ✓",
      error: "Please write at least 10 characters."
    }
  };

  function validateField(field) {
    const value = field.element.value;
    const feedback = field.element.parentElement.querySelector(".field-feedback");
    const valid = field.validate(value);

    field.element.classList.toggle("valid", valid && value.trim() !== "");
    field.element.classList.toggle("invalid", !valid && value.trim() !== "");

    if (value.trim() === "") {
      feedback.textContent = "";
    } else {
      feedback.textContent = valid ? field.success : field.error;
    }

    return valid;
  }

  Object.values(fields).forEach((field) => {
    field.element.addEventListener("blur", () => validateField(field));
    field.element.addEventListener("input", () => {
      // Validate live only after the user has started typing.
      if (field.element.value.trim() !== "") validateField(field);
    });
  });

  let toastTimer;

  function showToast(message) {
    document.querySelector("#toast-message").textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const valid = Object.values(fields).every(validateField);

    if (!valid) {
      showToast("Please check the highlighted fields.");
      const firstInvalid = Object.values(fields).find(
        (field) => field.element.classList.contains("invalid")
      );
      firstInvalid?.element.focus();
      return;
    }

    // In a real project, this is where fetch() could POST to a backend.
    showToast("Message sent successfully! Thanks for reaching out.");
    contactForm.reset();

    Object.values(fields).forEach((field) => {
      field.element.classList.remove("valid", "invalid");
      field.element.parentElement.querySelector(".field-feedback").textContent = "";
    });
  });
});
