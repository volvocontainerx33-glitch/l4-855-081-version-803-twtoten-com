document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let heroIndex = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      setHero(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setHero(heroIndex + 1);
    }, 5600);
  }

  const searchInput = document.querySelector("[data-search-input]");
  const searchCards = Array.from(document.querySelectorAll("[data-search-card]"));

  if (searchInput && searchCards.length) {
    searchInput.addEventListener("input", function () {
      const query = searchInput.value.trim().toLowerCase();

      searchCards.forEach(function (card) {
        const text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-hidden", query.length > 0 && !text.includes(query));
      });
    });
  }

  const video = document.querySelector("[data-player]");
  const playButton = document.querySelector("[data-play-button]");
  const playerOverlay = document.querySelector("[data-player-overlay]");
  let playerReady = false;

  function attachStream() {
    if (!video || playerReady || typeof streamUrl === "undefined") {
      return;
    }

    playerReady = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    if (!video) {
      return;
    }

    attachStream();
    video.controls = true;

    if (playerOverlay) {
      playerOverlay.classList.add("is-hidden");
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }

  if (playerOverlay) {
    playerOverlay.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }
});
