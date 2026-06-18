(() => {
  const players = document.querySelectorAll('[data-stream]');
  const hlsUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
  let hlsLoading = null;

  const loadHls = () => {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoading) {
      return hlsLoading;
    }

    hlsLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = hlsUrl;
      script.async = true;
      script.onload = () => resolve(window.Hls);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoading;
  };

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('.player-overlay');
    const stream = player.dataset.stream;
    let ready = false;
    let hls = null;

    const prepare = async () => {
      if (ready || !video || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        return;
      }

      const Hls = await loadHls();
      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        ready = true;
      }
    };

    const start = async () => {
      try {
        await prepare();
        await video.play();
        player.classList.add('is-playing');
      } catch (error) {
        player.classList.remove('is-playing');
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', () => player.classList.add('is-playing'));
      video.addEventListener('pause', () => {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', () => player.classList.remove('is-playing'));
    }

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
