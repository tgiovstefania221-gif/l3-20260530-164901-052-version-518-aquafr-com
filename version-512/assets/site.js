(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        event.preventDefault();
        location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5800);
    }
  }

  var normalize = function (value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  };

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var section = panel.parentElement;
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card-grid] article'));
    var input = panel.querySelector('[data-filter-input]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var empty = section.querySelector('[data-empty-state]');

    var applyFilter = function () {
      var q = normalize(input ? input.value : '');
      var r = normalize(region ? region.value : '');
      var y = normalize(year ? year.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = (!q || text.indexOf(q) !== -1) && (!r || cardRegion === r) && (!y || cardYear === y);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }
    applyFilter();
  });

  document.querySelectorAll('.js-player').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-start');
    var stream = box.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;

    var startVideo = function () {
      if (!video || !stream) {
        return;
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      var playNow = function () {
        var task = video.play();
        if (task && typeof task.catch === 'function') {
          task.catch(function () {});
        }
      };

      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          ready = true;
          playNow();
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            ready = true;
            playNow();
          });
        } else {
          video.src = stream;
          ready = true;
          playNow();
        }
      } else {
        playNow();
      }
    };

    if (button) {
      button.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }

    box.addEventListener('click', function (event) {
      if (event.target === box) {
        startVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
