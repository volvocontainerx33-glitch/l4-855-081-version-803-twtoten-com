(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
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
        var index = 0;
        var timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                stop();
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupGlobalSearch() {
        Array.prototype.slice.call(document.querySelectorAll('.global-search')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
            });
        });
    }

    function setupFilters() {
        var input = document.querySelector('.js-search');
        var year = document.querySelector('.js-year-filter');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
        if (!cards.length || (!input && !year)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input && initial) {
            input.value = initial;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedYear = !selectedYear || cardYear === selectedYear;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedYear));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
        apply();
    }

    function prepareVideo(video) {
        var source = video.getAttribute('data-source');
        if (!source || video.getAttribute('data-ready') === '1') {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.setAttribute('data-ready', '1');
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
            video.setAttribute('data-ready', '1');
            return;
        }
        video.src = source;
        video.setAttribute('data-ready', '1');
    }

    function setupPlayers() {
        Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
            var video = shell.querySelector('video[data-source]');
            var button = shell.querySelector('[data-play-target]');
            if (!video) {
                return;
            }

            function start() {
                prepareVideo(video);
                shell.classList.add('is-playing');
                var play = video.play();
                if (play && typeof play.catch === 'function') {
                    play.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    start();
                });
            }
            shell.addEventListener('click', function (event) {
                if (event.target === video && video.getAttribute('data-ready') === '1') {
                    return;
                }
                start();
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.currentTime) {
                    shell.classList.remove('is-playing');
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupGlobalSearch();
        setupFilters();
        setupPlayers();
    });
}());
