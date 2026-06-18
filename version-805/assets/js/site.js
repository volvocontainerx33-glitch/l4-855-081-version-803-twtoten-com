(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function activate(index) {
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

    function startTimer() {
      if (slides.length < 2) {
        return;
      }
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    if (slides.length) {
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          activate(Number(dot.getAttribute('data-hero-target')) || 0);
          startTimer();
        });
      });
      if (previous) {
        previous.addEventListener('click', function () {
          activate(current - 1);
          startTimer();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          activate(current + 1);
          startTimer();
        });
      }
      startTimer();
    }

    var searchForms = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
    searchForms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    var filterInput = document.querySelector('.site-filter-input');
    var yearFilter = document.querySelector('.site-year-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card, .rank-table tbody tr'));
    var emptyState = document.querySelector('.empty-state');

    function applyFilter() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || card.textContent.toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        var matched = matchedKeyword && matchedYear;
        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0 && cards.length > 0);
      }
    }

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (query) {
        filterInput.value = query;
      }
      filterInput.addEventListener('input', applyFilter);
      applyFilter();
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
      applyFilter();
    }
  });
}());
