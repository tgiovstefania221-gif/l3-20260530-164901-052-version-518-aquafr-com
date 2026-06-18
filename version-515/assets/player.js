(function () {
  function setupPlayer(player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var source = player.getAttribute("data-video-url");
    var initialized = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function init() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function play() {
      init();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  function setupPlayAnchors() {
    document.querySelectorAll('a[href="#player"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var player = document.getElementById("player");
        if (!player) {
          return;
        }

        event.preventDefault();
        player.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        var overlay = player.querySelector(".player-overlay");
        if (overlay) {
          overlay.click();
        }
      });
    });
  }

  function initAll() {
    document.querySelectorAll("[data-video-url]").forEach(setupPlayer);
    setupPlayAnchors();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
