(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function normalize(value) {
    return text(value).replace(/\s+/g, " ").trim();
  }

  function createCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card card-hover fade-in";

    var poster = document.createElement("a");
    poster.className = "poster-link";
    poster.href = movie.url;
    poster.setAttribute("aria-label", movie.title);

    var img = document.createElement("img");
    img.src = movie.cover;
    img.alt = movie.title;
    poster.appendChild(img);

    var year = document.createElement("span");
    year.className = "poster-badge";
    year.textContent = movie.year || "电影";
    poster.appendChild(year);

    var score = document.createElement("span");
    score.className = "poster-score";
    score.textContent = movie.rating || "";
    poster.appendChild(score);

    var body = document.createElement("div");
    body.className = "card-body";

    var title = document.createElement("a");
    title.className = "movie-title";
    title.href = movie.url;
    title.textContent = movie.title;
    body.appendChild(title);

    var desc = document.createElement("p");
    desc.className = "movie-desc";
    desc.textContent = movie.summary || movie.genre || "";
    body.appendChild(desc);

    var meta = document.createElement("div");
    meta.className = "movie-meta";
    [movie.region, movie.type, movie.duration].forEach(function (item) {
      if (!item) {
        return;
      }
      var span = document.createElement("span");
      span.textContent = item;
      meta.appendChild(span);
    });
    body.appendChild(meta);

    var tags = document.createElement("div");
    tags.className = "tag-row";
    String(movie.tags || "")
      .split(/[，,、/\s]+/)
      .filter(Boolean)
      .slice(0, 3)
      .forEach(function (item) {
        var tag = document.createElement("span");
        tag.textContent = item;
        tags.appendChild(tag);
      });
    body.appendChild(tags);

    article.appendChild(poster);
    article.appendChild(body);
    return article;
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function go(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        go(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    go(0);
    start();
  }

  function initCardFilter() {
    var filter = document.querySelector("[data-card-filter]");
    var year = document.querySelector("[data-year-filter]");
    var region = document.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));
    var empty = document.querySelector("[data-empty-state]");

    if (!filter && !year && !region) {
      return;
    }

    function apply() {
      var query = normalize(filter ? filter.value : "");
      var y = year ? year.value : "";
      var r = region ? region.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var hay = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var ok = true;

        if (query && hay.indexOf(query) === -1) {
          ok = false;
        }
        if (y && card.getAttribute("data-year") !== y) {
          ok = false;
        }
        if (r && card.getAttribute("data-region") !== r) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    [filter, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-results]");
    if (!root || !window.SITE_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var input = document.querySelector("[data-search-input]");
    var label = document.querySelector("[data-search-label]");
    var load = document.querySelector("[data-load-more]");
    var empty = document.querySelector("[data-empty-state]");
    var query = params.get("q") || "";
    var rendered = 0;
    var pageSize = 48;
    var matches = [];

    if (input) {
      input.value = query;
    }

    function collect(value) {
      var q = normalize(value);
      if (!q) {
        return window.SITE_MOVIES.slice(0, 96);
      }
      return window.SITE_MOVIES.filter(function (movie) {
        return normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.genre,
          movie.tags,
          movie.summary
        ].join(" ")).indexOf(q) !== -1;
      });
    }

    function render(reset) {
      if (reset) {
        root.innerHTML = "";
        rendered = 0;
      }

      var next = matches.slice(rendered, rendered + pageSize);
      next.forEach(function (movie) {
        root.appendChild(createCard(movie));
      });
      rendered += next.length;

      if (label) {
        label.textContent = query ? query : "精选影片";
      }

      if (empty) {
        empty.classList.toggle("is-visible", matches.length === 0);
      }

      if (load) {
        load.style.display = rendered < matches.length ? "" : "none";
      }
    }

    function search(value) {
      query = value || "";
      matches = collect(query);
      render(true);
    }

    if (input) {
      input.addEventListener("input", function () {
        search(input.value);
      });
    }

    if (load) {
      load.addEventListener("click", function () {
        render(false);
      });
    }

    search(query);
  }

  ready(function () {
    initMenu();
    initHero();
    initCardFilter();
    initSearchPage();
  });
})();
