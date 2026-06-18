(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-stream');
    var initialized = false;
    var hlsInstance = null;
    if (!video || !stream) {
      return;
    }
    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    function initialize() {
      if (initialized) {
        playVideo();
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            }
          }
        });
      } else {
        video.src = stream;
        playVideo();
      }
    }
    function start(event) {
      if (event && event.target === video && !video.paused) {
        return;
      }
      player.classList.add('is-playing');
      initialize();
    }
    player.addEventListener('click', start);
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
