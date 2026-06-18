(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll(".js-player").forEach(function (container) {
            var video = container.querySelector("video");
            var button = container.querySelector(".play-cover");
            var stream = container.getAttribute("data-stream");
            var loaded = false;
            var hls = null;

            function attach() {
                if (loaded || !video || !stream) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }

                loaded = true;
            }

            function start() {
                attach();
                container.classList.add("is-playing");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        container.classList.remove("is-playing");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });

                video.addEventListener("play", function () {
                    container.classList.add("is-playing");
                });

                video.addEventListener("pause", function () {
                    if (!video.seeking && video.currentTime > 0 && !video.ended) {
                        container.classList.remove("is-playing");
                    }
                });
            }
        });
    });
})();
