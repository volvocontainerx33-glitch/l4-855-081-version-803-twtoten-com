(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (header) {
            var updateHeader = function () {
                if (window.scrollY > 20) {
                    header.classList.add("is-scrolled");
                } else {
                    header.classList.remove("is-scrolled");
                }
            };
            updateHeader();
            window.addEventListener("scroll", updateHeader, { passive: true });
        }

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var active = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("active", position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === active);
            });
        };

        var start = function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function applyFilter(input) {
        var list = document.querySelector("[data-filter-list]") || document.querySelector("[data-search-result-list]");
        if (!list || !input) {
            return;
        }

        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

        cards.forEach(function (card) {
            var content = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
            card.classList.toggle("is-filtered-out", Boolean(query) && content.indexOf(query) === -1);
        });
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        var clears = Array.prototype.slice.call(document.querySelectorAll("[data-filter-clear]"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var pageSearchInput = document.querySelector("[data-search-page-input]");

        if (pageSearchInput) {
            pageSearchInput.value = query;
        }

        inputs.forEach(function (input) {
            if (query && window.location.pathname.indexOf("search") !== -1) {
                input.value = query;
            }
            applyFilter(input);
            input.addEventListener("input", function () {
                applyFilter(input);
            });
        });

        clears.forEach(function (button) {
            button.addEventListener("click", function () {
                inputs.forEach(function (input) {
                    input.value = "";
                    applyFilter(input);
                });
                if (pageSearchInput) {
                    pageSearchInput.value = "";
                }
            });
        });
    }

    ready(function () {
        initHeader();
        initHero();
        initFilters();
    });
}());
