(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('.hero-slide', slider);
    var thumbs = selectAll('[data-hero-target]', slider);
    var current = 0;
    var timer = null;
    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        activate(Number(thumb.getAttribute('data-hero-target')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    if (slides.length > 1) {
      start();
    }
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var search = document.getElementById('movieSearch');
    var region = document.getElementById('regionFilter');
    var year = document.getElementById('yearFilter');
    var genre = document.getElementById('genreFilter');
    var items = selectAll('.searchable-item');
    var empty = panel.querySelector('.empty-message');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && search) {
      search.value = q;
    }
    function matchItem(item) {
      var text = normalize(item.textContent + ' ' + item.getAttribute('data-title') + ' ' + item.getAttribute('data-tags'));
      var qValue = normalize(search && search.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var genreValue = normalize(genre && genre.value);
      var itemRegion = normalize(item.getAttribute('data-region'));
      var itemYear = normalize(item.getAttribute('data-year'));
      var itemGenre = normalize(item.getAttribute('data-genre'));
      if (qValue && text.indexOf(qValue) === -1) {
        return false;
      }
      if (regionValue && itemRegion !== regionValue) {
        return false;
      }
      if (yearValue && itemYear !== yearValue) {
        return false;
      }
      if (genreValue && itemGenre.indexOf(genreValue) === -1) {
        return false;
      }
      return true;
    }
    function apply() {
      var visible = 0;
      items.forEach(function (item) {
        var matched = matchItem(item);
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [search, region, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
