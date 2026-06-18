(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initImages() {
    document.querySelectorAll(".cover-image").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing-image");
      }, { once: true });
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    function start() {
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
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        stop();
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = document.querySelectorAll("[data-listing]");
    panels.forEach(function (listing) {
      var root = listing.closest("main") || document;
      var input = root.querySelector(".filter-search");
      var select = root.querySelector(".filter-select");
      var items = Array.prototype.slice.call(listing.querySelectorAll(".movie-card, .compact-card"));
      var empty = root.querySelector(".empty-state");
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = select ? select.value : "";
        var visible = 0;
        items.forEach(function (item) {
          var haystack = [
            item.dataset.title || "",
            item.dataset.region || "",
            item.dataset.type || "",
            item.dataset.genre || "",
            item.dataset.tags || ""
          ].join(" ").toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchYear = !year || item.dataset.year === year;
          var show = matchQuery && matchYear;
          item.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll(".movie-player[data-stream]").forEach(function (video) {
      var source = video.dataset.stream;
      var shell = video.closest(".player-shell");
      var startButton = shell ? shell.querySelector(".player-start") : null;
      var state = shell ? shell.querySelector(".player-state") : null;
      var hls = null;
      function setState(text) {
        if (state) {
          state.textContent = text;
        }
      }
      function attachSource() {
        if (!source) {
          setState("播放源暂不可用");
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setState("高清线路已就绪");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setState("网络加载中断，正在重试");
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setState("媒体解析中断，正在恢复");
              hls.recoverMediaError();
            } else {
              setState("播放暂不可用");
              hls.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setState("高清线路已就绪");
        } else {
          setState("播放暂不可用");
        }
      }
      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.then === "function") {
          promise.then(function () {
            if (startButton) {
              startButton.classList.add("is-hidden");
            }
          }).catch(function () {
            setState("点击视频控件开始播放");
          });
        }
      }
      attachSource();
      if (startButton) {
        startButton.addEventListener("click", playVideo);
      }
      video.addEventListener("play", function () {
        if (startButton) {
          startButton.classList.add("is-hidden");
        }
        setState("正在播放");
      });
      video.addEventListener("pause", function () {
        if (startButton) {
          startButton.classList.remove("is-hidden");
        }
        setState("已暂停");
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initFilters();
    initPlayers();
  });
})();
