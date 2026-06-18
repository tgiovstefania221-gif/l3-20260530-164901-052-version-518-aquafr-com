(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function closest(element, selector) {
    while (element && element !== document) {
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilter(root) {
    var queryInput = root.querySelector(".js-page-search-input");
    var query = normalize(queryInput ? queryInput.value : "");
    var activeButtons = root.querySelectorAll(".js-filter-button.is-active");
    var filters = [];

    activeButtons.forEach(function (button) {
      var key = button.getAttribute("data-filter-key");
      var value = button.getAttribute("data-filter-value");
      if (key && value && value !== "all") {
        filters.push({ key: key, value: normalize(value) });
      }
    });

    var cards = root.querySelectorAll(".searchable-card");
    var visible = 0;

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute("data-search") || card.textContent);
      var ok = !query || searchText.indexOf(query) !== -1;

      filters.forEach(function (filter) {
        var dataValue = normalize(card.getAttribute("data-" + filter.key));
        if (dataValue.indexOf(filter.value) === -1) {
          ok = false;
        }
      });

      card.style.display = ok ? "" : "none";
      if (ok) {
        visible += 1;
      }
    });

    var empty = root.querySelector(".empty-state");
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".js-menu-button");
    var mobilePanel = document.querySelector(".js-mobile-panel");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".js-site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    document.querySelectorAll(".js-filter-root").forEach(function (root) {
      var input = root.querySelector(".js-page-search-input");
      if (input) {
        input.addEventListener("input", function () {
          applyFilter(root);
        });
      }

      root.querySelectorAll(".js-filter-button").forEach(function (button) {
        button.addEventListener("click", function () {
          var group = button.getAttribute("data-filter-group");
          root.querySelectorAll('.js-filter-button[data-filter-group="' + group + '"]').forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          applyFilter(root);
        });
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
        applyFilter(root);
      }
    });

    document.querySelectorAll(".js-hero").forEach(function (hero) {
      var slides = hero.querySelectorAll(".hero-slide");
      var dots = hero.querySelectorAll(".hero-dot");
      var prev = hero.querySelector(".js-hero-prev");
      var next = hero.querySelector(".js-hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.addEventListener("click", function (event) {
      var link = closest(event.target, "a[href^='#']");
      if (!link) {
        return;
      }
      var target = document.querySelector(link.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  window.SitePlayer = {
    mount: function (videoId, overlayId, buttonId, src) {
      ready(function () {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var button = document.getElementById(buttonId);
        var hls = null;
        var attached = false;

        if (!video || !src) {
          return;
        }

        function attach() {
          if (attached) {
            return;
          }
          attached = true;

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hls.loadSource(src);
            hls.attachMedia(video);
          } else {
            video.src = src;
          }
        }

        function start() {
          attach();
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        }

        if (button) {
          button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
          });
        }

        if (overlay) {
          overlay.addEventListener("click", function () {
            start();
          });
        }

        video.addEventListener("click", function () {
          if (!attached || video.paused) {
            start();
          }
        });

        window.addEventListener("beforeunload", function () {
          if (hls && typeof hls.destroy === "function") {
            hls.destroy();
          }
        });
      });
    }
  };
})();
