// app.js – Handles data loading, search, filters, currency toggle, and course detail modal

(() => {
  const COURSES_URL = "data/courses.json";
  const gridEl = document.getElementById("course-grid");
  const searchInput = document.getElementById("search-input");
  const filterContainer = document.getElementById("filter-chips");
  const currencyAEDBtn = document.getElementById("currency-aed");
  const currencyINRBtn = document.getElementById("currency-inr");

  let courses = [];
  let activeFilter = "All";
  let activeCurrency = localStorage.getItem("currency") || "AED";
  let searchTerm = "";

  // ---------- Modal ----------
  const modal = document.getElementById("course-modal");
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalClose = document.getElementById("modal-close");
  const modalBuyBtn = document.getElementById("modal-buy-btn");

  const openModal = (course) => {
    const imgName = `${course.title}.png`;
    modalImg.src = `assets/${imgName}`;
    modalImg.alt = course.title;
    modalTitle.textContent = course.title;
    modalBuyBtn.href = course.link;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    modalImg.src = "";
  };

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // ---------- Currency ----------
  const setActiveCurrency = (currency) => {
    activeCurrency = currency;
    localStorage.setItem("currency", currency);
    currencyAEDBtn.classList.toggle("active", currency === "AED");
    currencyINRBtn.classList.toggle("active", currency === "INR");
    renderCourses();
  };

  currencyAEDBtn.addEventListener("click", () => setActiveCurrency("AED"));
  currencyINRBtn.addEventListener("click", () => setActiveCurrency("INR"));

  // ---------- Filter chips ----------
  filterContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) {
      const filter = e.target.dataset.filter;
      activeFilter = filter;
      document.querySelectorAll(".chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.filter === filter);
      });
      renderCourses();
    }
  });

  // ---------- Search ----------
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const handleSearch = debounce((e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderCourses();
  }, 300);

  searchInput.addEventListener("input", handleSearch);

  // ---------- Data ----------
  const loadCourses = async () => {
    try {
      const resp = await fetch(COURSES_URL);
      courses = await resp.json();
      renderCourses();
    } catch (err) {
      console.error("Failed to load courses", err);
    }
  };

  // ---------- Filtering ----------
  const matchesFilter = (course) => {
    if (activeFilter === "All") return true;
    const filter = activeFilter;
    if (filter.endsWith("Certifications")) {
      const region = filter.split(" ")[0];
      return course.categories.includes(region);
    }
    return course.categories.includes(filter);
  };

  const matchesSearch = (course) => {
    if (!searchTerm) return true;
    const searchable = `${course.title} ${course.duration}`.toLowerCase();
    return searchable.includes(searchTerm);
  };

  // ---------- Render ----------
  const renderCourses = () => {
    gridEl.innerHTML = "";
    const visible = courses.filter((c) => matchesFilter(c) && matchesSearch(c));
    if (visible.length === 0) {
      gridEl.innerHTML = "<p style='text-align:center;color:var(--color-muted);'>No courses match your criteria.</p>";
      return;
    }
    visible.forEach((course) => {
      const card = document.createElement("div");
      card.className = "card";

      const header = document.createElement("div");
      header.className = "card-header";
      const categoryBadge = document.createElement("span");
      categoryBadge.className = "badge";
      categoryBadge.textContent = course.categories[1] || course.categories[0];
      const durationBadge = document.createElement("span");
      durationBadge.className = "badge";
      durationBadge.textContent = course.duration;

      const title = document.createElement("h3");
      title.className = "title";
      title.textContent = course.title;

      const details = document.createElement("p");
      details.className = "details";
      details.textContent = `Duration: ${course.duration}`;

      const price = document.createElement("p");
      price.className = "price";
      const priceVal = activeCurrency === "AED" ? course.priceAED : course.priceINR;
      const priceSymbol = activeCurrency === "AED" ? "AED " : "Rs. ";
      price.textContent = `${priceSymbol}${priceVal.toLocaleString()}`;

      // "Course Details" button — replaces "Buy now"
      const btn = document.createElement("button");
      btn.className = "cta";
      btn.textContent = "Course Details";
      btn.addEventListener("click", () => openModal(course));

      header.appendChild(categoryBadge);
      header.appendChild(durationBadge);
      card.appendChild(header);
      card.appendChild(title);
      card.appendChild(details);
      card.appendChild(price);
      card.appendChild(btn);
      gridEl.appendChild(card);
    });
  };

  // Initialize
  setActiveCurrency(activeCurrency);
  loadCourses();
})();
