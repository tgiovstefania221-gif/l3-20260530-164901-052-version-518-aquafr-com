
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterScopes = document.querySelectorAll('[data-filter-scope]');

  filterScopes.forEach(function (scope) {
    var section = scope.closest('section');
    var list = document.querySelector('[data-card-list]');
    var search = scope.querySelector('[data-local-search]');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));

    if (!list && section) {
      list = section.parentElement.querySelector('[data-card-list]');
    }

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    var applyFilter = function () {
      var q = search ? search.value.trim().toLowerCase() : '';
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = select.value;
      });

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var matchesText = !q || text.indexOf(q) !== -1;
        var matchesYear = !filters.year || card.getAttribute('data-year') === filters.year;
        var matchesType = !filters.type || card.getAttribute('data-type').indexOf(filters.type) !== -1;
        card.style.display = matchesText && matchesYear && matchesType ? '' : 'none';
      });
    };

    if (search) {
      search.addEventListener('input', applyFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });
  });

  var renderSearch = function () {
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var input = document.querySelector('[data-search-input]');

    if (!results || !status || !window.MovieIndex) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();

    if (input) {
      input.value = q;
    }

    if (!q) {
      results.innerHTML = '';
      status.textContent = '输入关键词开始搜索';
      return;
    }

    var keyword = q.toLowerCase();
    var matched = window.MovieIndex.filter(function (movie) {
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase().indexOf(keyword) !== -1;
    });

    status.textContent = '“' + q + '” 找到 ' + matched.length + ' 部影片';
    results.innerHTML = matched.slice(0, 240).map(function (movie) {
      return [
        '<a class="movie-card" href="' + movie.url + '">',
        '  <div class="movie-thumb">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <div class="thumb-shade"></div>',
        '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
        '    <span class="play-chip">▶</span>',
        '  </div>',
        '  <div class="movie-info">',
        '    <h3>' + escapeHtml(movie.title) + '</h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-meta">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.genre) + '</span>',
        '    </div>',
        '  </div>',
        '</a>'
      ].join('');
    }).join('');
  };

  var escapeHtml = function (value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  };

  renderSearch();

  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-cover');
    var attached = false;
    var hls = null;

    if (!video || !button) {
      return;
    }

    var attach = function () {
      if (attached) {
        return;
      }

      attached = true;
      var src = video.getAttribute('data-src');

      if (!src) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };

    var play = function () {
      attach();
      video.setAttribute('controls', 'controls');
      player.classList.add('is-playing');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    };

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        play();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
