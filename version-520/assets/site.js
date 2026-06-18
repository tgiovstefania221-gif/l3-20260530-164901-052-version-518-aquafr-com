(function () {
  function pickAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function openSearch(url, query) {
    var next = url || './search.html';
    if (query) {
      next += '?q=' + encodeURIComponent(query);
    }
    window.location.href = next;
  }

  pickAll('.js-menu-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = document.querySelector('.js-mobile-panel');
      if (panel) {
        panel.classList.toggle('is-open');
      }
    });
  });

  pickAll('.site-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      openSearch(form.getAttribute('action'), input ? input.value.trim() : '');
    });
  });

  var slider = document.querySelector('.js-hero-slider');
  if (slider) {
    var slides = pickAll('.hero-slide', slider);
    var dots = pickAll('.js-hero-dot', slider);
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function startSlider() {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(i);
        startSlider();
      });
    });

    showSlide(0);
    startSlider();
  }

  function filterCards(scope, query) {
    var cards = pickAll('.movie-card', scope);
    var value = normalize(query);
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var matched = !value || text.indexOf(value) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    var empty = document.querySelector('.js-empty-state');
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  pickAll('.filter-input').forEach(function (input) {
    var section = input.closest('.page-section') || document;
    var scope = section.querySelector('.js-filter-scope') || section;
    input.addEventListener('input', function () {
      filterCards(scope, input.value);
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var pageInput = document.querySelector('.search-page-input');
    if (pageInput) {
      pageInput.value = query;
      pageInput.addEventListener('input', function () {
        filterCards(searchPage, pageInput.value);
      });
    }
    filterCards(searchPage, query);
  }

  window.initPlayer = function (videoId, buttonId, boxId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var box = document.getElementById(boxId);
    var hls = null;
    var started = false;

    if (!video || !button || !box || !streamUrl) {
      return;
    }

    function playNow() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    function loadAndPlay() {
      button.classList.add('is-hidden');
      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          playNow();
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playNow();
          });
        } else {
          video.src = streamUrl;
          playNow();
        }
      } else {
        playNow();
      }
    }

    button.addEventListener('click', loadAndPlay);
    box.addEventListener('click', function (event) {
      if (event.target === video && !started) {
        loadAndPlay();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
