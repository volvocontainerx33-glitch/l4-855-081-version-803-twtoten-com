(function () {
    const mobileToggle = document.querySelector(".mobile-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener("click", function () {
            const isOpen = mobileNav.classList.toggle("is-open");
            mobileToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        const prev = hero.querySelector(".hero-arrow.prev");
        const next = hero.querySelector(".hero-arrow.next");
        let current = 0;
        let timer;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        const startTimer = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        startTimer();
    }

    const filterInputs = Array.from(document.querySelectorAll(".listing-filter"));

    filterInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            filterCards(input.value);
        });
    });

    const searchPage = document.querySelector("[data-search-page]");

    if (searchPage) {
        const input = searchPage.querySelector(".global-search-input");
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";

        if (input) {
            input.value = query;
            filterCards(query);
            input.addEventListener("input", function () {
                filterCards(input.value);
            });
        }
    }

    function filterCards(value) {
        const query = String(value || "").trim().toLowerCase();
        const cards = Array.from(document.querySelectorAll("[data-movie-card]"));

        cards.forEach(function (card) {
            const keywords = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
            card.hidden = Boolean(query && keywords.indexOf(query) === -1);
        });
    }

    const players = Array.from(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
        const video = player.querySelector("video");
        const button = player.querySelector(".play-overlay");
        const source = player.getAttribute("data-video");
        let hlsInstance = null;

        const loadVideo = function () {
            if (!video || !source || video.dataset.ready === "true") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            video.dataset.ready = "true";
        };

        const playVideo = function () {
            loadVideo();
            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");
            const playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        };

        if (button && video) {
            button.addEventListener("click", playVideo);
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    player.classList.add("is-playing");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
