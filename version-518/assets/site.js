(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
        roots.forEach(function (root) {
            var list = document.querySelector('[data-filter-list]');
            var input = root.querySelector('[data-filter-input]');
            var selects = Array.prototype.slice.call(root.querySelectorAll('[data-filter-select]'));
            var counter = root.querySelector('[data-result-count]');
            if (!list || !input) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .horizontal-card'));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');
            if (initialQuery) {
                input.value = initialQuery;
            }

            function cardText(card) {
                return [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.category
                ].map(normalize).join(' ');
            }

            function apply() {
                var query = normalize(input.value);
                var activeFilters = {};
                selects.forEach(function (select) {
                    activeFilters[select.getAttribute('data-filter-select')] = normalize(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var matched = true;
                    if (query && cardText(card).indexOf(query) === -1) {
                        matched = false;
                    }
                    Object.keys(activeFilters).forEach(function (key) {
                        var value = activeFilters[key];
                        if (!value) {
                            return;
                        }
                        var cardValue = normalize(card.dataset[key]);
                        if (cardValue.indexOf(value) === -1) {
                            matched = false;
                        }
                    });
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (counter) {
                    counter.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部';
                }
            }

            input.addEventListener('input', apply);
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
