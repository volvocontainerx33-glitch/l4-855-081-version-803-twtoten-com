(function () {
    function initMoviePlayer(playbackUrl, title) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("player-start");
        var instance = null;
        var attached = false;

        if (!video || !playbackUrl) {
            return;
        }

        if (title) {
            video.setAttribute("aria-label", title);
        }

        function hideButton() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }

        function attach() {
            return new Promise(function (resolve) {
                if (attached) {
                    resolve();
                    return;
                }

                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = playbackUrl;
                    video.load();
                    resolve();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    instance.loadSource(playbackUrl);
                    instance.attachMedia(video);
                    instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    instance.on(window.Hls.Events.ERROR, function () {
                        resolve();
                    });
                    return;
                }

                video.src = playbackUrl;
                video.load();
                resolve();
            });
        }

        function start() {
            hideButton();
            attach().then(function () {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            });
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
        }

        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                start();
            }
        });

        video.addEventListener("play", hideButton);

        window.addEventListener("pagehide", function () {
            if (instance) {
                instance.destroy();
                instance = null;
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
}());
