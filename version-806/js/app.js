(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var header = document.querySelector("[data-header]");
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        function updateHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 16);
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        setupHero();
        setupFilters();
        setupHeaderSearch();
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function play() {
            timer = window.setInterval(function () {
                move(1);
            }, 5600);
        }

        function restart() {
            window.clearInterval(timer);
            play();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                move(1);
                restart();
            });
        }

        show(0);
        play();
    }

    function setupHeaderSearch() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var field = document.querySelector("[data-filter-keyword]");
        if (field && q) {
            field.value = q;
            field.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var section = form.closest("section") || document;
            var grid = section.querySelector("[data-filter-grid]") || document.querySelector("[data-filter-grid]");
            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            var keyword = form.querySelector("[data-filter-keyword]");
            var region = form.querySelector("[data-filter-region]");
            var type = form.querySelector("[data-filter-type]");
            var year = form.querySelector("[data-filter-year]");
            var count = form.querySelector("[data-filter-count]");

            function value(node) {
                return node ? node.value.trim().toLowerCase() : "";
            }

            function apply() {
                var q = value(keyword);
                var r = value(region);
                var t = value(type);
                var y = value(year);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = card.textContent.toLowerCase();
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (r && String(card.getAttribute("data-region") || "").toLowerCase() !== r) {
                        ok = false;
                    }
                    if (t && String(card.getAttribute("data-type") || "").toLowerCase() !== t) {
                        ok = false;
                    }
                    if (y && String(card.getAttribute("data-year") || "").toLowerCase() !== y) {
                        ok = false;
                    }
                    card.classList.toggle("is-filtered-out", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            [keyword, region, type, year].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    window.startMoviePlayer = function (streamUrl, videoId) {
        var video = document.getElementById(videoId);
        if (!video || !streamUrl) {
            return;
        }

        var overlay = document.querySelector("[data-play-overlay]");
        var loaded = false;
        var hlsInstance = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hlsInstance) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    };
})();
