(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-arrow.prev');
  var next = document.querySelector('.hero-arrow.next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  showSlide(0);
  startHero();

  var searchInput = document.querySelector('[data-filter="keyword"]');
  var regionSelect = document.querySelector('[data-filter="region"]');
  var typeSelect = document.querySelector('[data-filter="type"]');
  var yearSelect = document.querySelector('[data-filter="year"]');
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilter() {
    if (!filterItems.length) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var region = normalize(regionSelect && regionSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var visible = 0;

    filterItems.forEach(function (item) {
      var text = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-region'),
        item.getAttribute('data-type'),
        item.getAttribute('data-category'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-year')
      ].join(' '));

      var matches = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matches = false;
      }

      if (region && normalize(item.getAttribute('data-region')).indexOf(region) === -1) {
        matches = false;
      }

      if (type && normalize(item.getAttribute('data-type')).indexOf(type) === -1) {
        matches = false;
      }

      if (year && normalize(item.getAttribute('data-year')) !== year) {
        matches = false;
      }

      item.style.display = matches ? '' : 'none';

      if (matches) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', runFilter);
      control.addEventListener('change', runFilter);
    }
  });

  runFilter();
})();
