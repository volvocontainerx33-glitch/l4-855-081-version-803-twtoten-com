(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-menu-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var grid = document.querySelector('[data-search-grid]');
  if (grid && window.SEARCH_INDEX) {
    var input = document.querySelector('[data-search-input]');
    var category = document.querySelector('[data-search-category]');
    var type = document.querySelector('[data-search-type]');
    var year = document.querySelector('[data-search-year]');
    var status = document.querySelector('[data-search-status]');
    var data = window.SEARCH_INDEX.slice();

    function esc(value) {
      return String(value || '').replace(/[&<>"]/g, function (mark) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[mark];
      });
    }

    function card(item) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + esc(item.url) + '">' +
        '<img src="' + esc(item.cover) + '" alt="' + esc(item.title) + '">' +
        '<span class="poster-badge">' + esc(item.year) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<h3 class="card-title"><a href="' + esc(item.url) + '">' + esc(item.title) + '</a></h3>' +
        '<div class="card-meta"><span>' + esc(item.region) + '</span><span>' + esc(item.type) + '</span></div>' +
        '<p class="card-desc">' + esc(item.oneLine) + '</p>' +
        '</div>' +
        '</article>';
    }

    function render() {
      var q = (input && input.value ? input.value : '').trim().toLowerCase();
      var c = category && category.value ? category.value : '';
      var t = type && type.value ? type.value : '';
      var y = year && year.value ? year.value : '';
      var list = data.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.category, item.oneLine].join(' ').toLowerCase();
        return (!q || haystack.indexOf(q) !== -1) && (!c || item.category === c) && (!t || item.type === t) && (!y || item.year === y);
      });
      grid.innerHTML = list.slice(0, 240).map(card).join('');
      if (status) {
        status.textContent = list.length ? '已为你展示匹配影片，继续输入可缩小范围。' : '暂无匹配影片，可尝试更换关键词。';
      }
    }

    [input, category, type, year].forEach(function (el) {
      if (el) el.addEventListener('input', render);
      if (el) el.addEventListener('change', render);
    });
    render();
  }
})();
