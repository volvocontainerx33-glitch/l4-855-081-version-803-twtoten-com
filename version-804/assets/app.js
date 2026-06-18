(function () {
  const body = document.body;
  const menuButton = document.querySelector('[data-menu-toggle]');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.location.href = url;
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindCatalog(scope) {
    const search = scope.querySelector('[data-filter-search]');
    const year = scope.querySelector('[data-filter-year]');
    const region = scope.querySelector('[data-filter-region]');
    const category = scope.querySelector('[data-filter-category]');
    const section = scope.closest('section') || document;
    const cards = Array.from(section.querySelectorAll('[data-card]'));
    const empty = section.querySelector('[data-empty-state]');

    function apply() {
      const q = normalize(search && search.value);
      const y = normalize(year && year.value);
      const r = normalize(region && region.value);
      const c = normalize(category && category.value);
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year,
          card.dataset.category,
          card.textContent
        ].join(' '));
        const matchText = !q || haystack.indexOf(q) !== -1;
        const matchYear = !y || normalize(card.dataset.year) === y;
        const matchRegion = !r || normalize(card.dataset.region) === r;
        const matchCategory = !c || normalize(card.dataset.category) === c;
        const ok = matchText && matchYear && matchRegion && matchCategory;
        card.classList.toggle('is-filtered', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [search, year, region, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q');
    if (initial && search) {
      search.value = initial;
    }
    apply();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(bindCatalog);

  function startPlayer(shell) {
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    const stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsPlayer) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        video._hlsPlayer = hls;
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (!video.src) {
      video.src = stream;
    }
    video.play().catch(function () {});
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    const overlay = shell.querySelector('[data-play-button]');
    const video = shell.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(shell);
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }
  });
})();
