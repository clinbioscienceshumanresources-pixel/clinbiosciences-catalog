// app.js – Handles data loading, search, filters, and currency toggle

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

  const setActiveCurrency = (currency) => {
    activeCurrency = currency;
    localStorage.setItem("currency", currency);
    currencyAEDBtn.classList.toggle("active", currency === "AED");
    currencyINRBtn.classList.toggle("active", currency === "INR");
    renderCourses();
  };

  // Currency toggle listeners
  currencyAEDBtn.addEventListener("click", () => setActiveCurrency("AED"));
  currencyINRBtn.addEventListener("click", () => setActiveCurrency("INR"));

  // Filter chip listener (event delegation)
  filterContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) {
      const filter = e.target.dataset.filter;
      activeFilter = filter;
      // Update active class
      document.querySelectorAll('.chip').forEach((chip) => {
        chip.classList.toggle('active', chip.dataset.filter === filter);
      });
      renderCourses();
    }
  });

  // Debounce helper
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

  const loadCourses = async () => {
    try {
      const resp = await fetch(COURSES_URL);
      courses = await resp.json();
      renderCourses();
    } catch (err) {
      console.error("Failed to load courses", err);
    }
  };

  const matchesFilter = (course) => {
    if (activeFilter === "All") return true;
    // Filter chips correspond to categories or region groups
    // Example: "UAE Certifications" matches any course with "UAE" in categories
    // "Regulatory Affairs" matches specific category name
    const filter = activeFilter;
    if (filter.endsWith("Certifications")) {
      const region = filter.split(" ")[0]; // "UAE" or "India"
      return course.categories.includes(region);
    }
    return course.categories.includes(filter);
  };

  const matchesSearch = (course) => {
    if (!searchTerm) return true;
    const searchable = `${course.title} ${course.duration}`.toLowerCase();
    return searchable.includes(searchTerm);
  };

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
      // Header badges
      const header = document.createElement("div");
      header.className = "card-header";
      const categoryBadge = document.createElement("span");
      categoryBadge.className = "badge";
      categoryBadge.textContent = course.categories[1] || course.categories[0]; // specific category
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
      const priceSymbol = activeCurrency === "AED" ? "AED " : "₹ ";
      price.textContent = `${priceSymbol}${priceVal.toLocaleString()}`;
      const btn = document.createElement("button");
      btn.className = "cta";
      btn.textContent = "Buy now";
      btn.addEventListener("click", () => {
        window.open(course.link, "_blank");
      });

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

  // Initialize UI state
  setActiveCurrency(activeCurrency);

  // Load data
  loadCourses();
})();
