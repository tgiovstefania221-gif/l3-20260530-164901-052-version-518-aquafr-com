(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function textOf(element) {
        return (element || "").toString().toLowerCase();
    }

    onReady(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.from(slider.querySelectorAll(".hero-slide"));
            var dots = Array.from(slider.querySelectorAll(".hero-dot"));
            var current = 0;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-slide")) || 0);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5800);
            }
        }

        var filterInput = document.querySelector(".page-filter-input");
        var cards = Array.from(document.querySelectorAll("[data-search-card], .rank-row"));
        var emptyState = document.querySelector(".empty-state");
        var activeType = "";
        var activeGenre = "";

        function updateCards() {
            if (!filterInput && cards.length === 0) {
                return;
            }

            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var content = textOf(card.textContent) + " " +
                    textOf(card.getAttribute("data-title")) + " " +
                    textOf(card.getAttribute("data-genre")) + " " +
                    textOf(card.getAttribute("data-region")) + " " +
                    textOf(card.getAttribute("data-type")) + " " +
                    textOf(card.getAttribute("data-year")) + " " +
                    textOf(card.getAttribute("data-tags"));
                var typeOk = !activeType || textOf(card.getAttribute("data-type")).indexOf(activeType.toLowerCase()) !== -1 || content.indexOf(activeType.toLowerCase()) !== -1;
                var genreOk = !activeGenre || textOf(card.getAttribute("data-genre")).indexOf(activeGenre.toLowerCase()) !== -1 || content.indexOf(activeGenre.toLowerCase()) !== -1;
                var keywordOk = !keyword || content.indexOf(keyword) !== -1;
                var show = typeOk && genreOk && keywordOk;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        if (filterInput) {
            filterInput.addEventListener("input", updateCards);
        }

        document.querySelectorAll(".filter-chip").forEach(function (chip) {
            chip.addEventListener("click", function () {
                document.querySelectorAll(".filter-chip").forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                activeType = chip.getAttribute("data-filter-type") || "";
                activeGenre = chip.getAttribute("data-filter-genre") || "";
                if (chip.hasAttribute("data-filter-all")) {
                    activeType = "";
                    activeGenre = "";
                }
                updateCards();
            });
        });

        var searchInput = document.getElementById("searchInput");
        var searchResults = document.getElementById("searchResults");
        var searchSummary = document.getElementById("searchSummary");

        if (searchInput && searchResults && window.SearchMovies) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            searchInput.value = query;
            renderSearch(query);

            searchInput.addEventListener("input", function () {
                renderSearch(searchInput.value);
            });
        }

        function renderSearch(query) {
            var keyword = query.trim().toLowerCase();
            var list = keyword ? window.SearchMovies.filter(function (movie) {
                return [
                    movie.title,
                    movie.oneLine,
                    movie.genre,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.tags
                ].join(" ").toLowerCase().indexOf(keyword) !== -1;
            }) : window.SearchMovies.slice(0, 36);

            searchSummary.textContent = keyword ? "搜索结果" : "精选内容";
            searchResults.innerHTML = list.slice(0, 120).map(function (movie) {
                return [
                    '<a class="movie-card" href="' + movie.url + '">',
                    '<div class="card-cover">',
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '<div class="cover-shade"></div>',
                    '<div class="card-cover-meta"><span>' + escapeHtml(movie.duration) + '</span><span>' + escapeHtml(String(movie.year)) + '</span></div>',
                    '</div>',
                    '<div class="card-body">',
                    '<h3>' + escapeHtml(movie.title) + '</h3>',
                    '<p>' + escapeHtml(movie.oneLine) + '</p>',
                    '<div class="card-meta"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
                    '</div>',
                    '</a>'
                ].join("");
            }).join("");
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    });
})();
