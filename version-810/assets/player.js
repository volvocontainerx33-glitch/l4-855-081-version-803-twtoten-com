(function () {
  function initPlayer(frame) {
    var video = frame.querySelector('video');
    var cover = frame.querySelector('.player-cover');
    if (!video || !cover) return;
    var src = video.getAttribute('data-video-url');
    var hls = null;
    var ready = false;

    function tryPlay() {
      var action = video.play();
      if (action && action.catch) action.catch(function () {});
    }

    function start() {
      cover.classList.add('is-hidden');
      video.controls = true;
      if (!ready) {
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', tryPlay, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ maxBufferLength: 36 });
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(src);
          });
          hls.on(window.Hls.Events.MANIFEST_PARSED, tryPlay);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
        } else {
          video.src = src;
          video.addEventListener('loadedmetadata', tryPlay, { once: true });
        }
      } else {
        tryPlay();
      }
    }

    cover.addEventListener('click', function (event) {
      event.preventDefault();
      start();
    });
    video.addEventListener('click', function () {
      if (!ready) start();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-frame')).forEach(initPlayer);
})();
