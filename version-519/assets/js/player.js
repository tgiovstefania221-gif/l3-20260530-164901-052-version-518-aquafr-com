(function () {
  var player = document.querySelector('[data-player]');
  var trigger = document.querySelector('[data-play-trigger]');

  if (!player || !trigger) {
    return;
  }

  var source = trigger.getAttribute('data-video-src');
  var started = false;
  var hls = null;

  function setMessage(text) {
    var label = trigger.querySelector('span');
    if (label) {
      label.textContent = text;
    }
  }

  function playVideo() {
    if (!source) {
      setMessage('暂无可用片源');
      return;
    }

    if (started) {
      player.play();
      return;
    }

    started = true;
    trigger.classList.add('is-hidden');

    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = source;
      player.play().catch(function () {
        trigger.classList.remove('is-hidden');
        setMessage('点击继续播放');
      });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(player);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        player.play().catch(function () {
          trigger.classList.remove('is-hidden');
          setMessage('点击继续播放');
        });
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          trigger.classList.remove('is-hidden');
          setMessage('播放失败，请稍后重试');
          if (hls) {
            hls.destroy();
            hls = null;
          }
        }
      });
      return;
    }

    trigger.classList.remove('is-hidden');
    setMessage('浏览器无法播放');
  }

  trigger.addEventListener('click', playVideo);
  player.addEventListener('click', function () {
    if (!started) {
      playVideo();
    }
  });
})();
