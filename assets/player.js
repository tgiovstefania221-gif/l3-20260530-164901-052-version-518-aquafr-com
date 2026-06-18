(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function showMessage(container, message) {
        var old = container.querySelector('.player-message');
        if (old) {
            old.remove();
        }
        var box = document.createElement('div');
        box.className = 'player-message';
        box.textContent = message;
        box.style.position = 'absolute';
        box.style.left = '16px';
        box.style.right = '16px';
        box.style.bottom = '16px';
        box.style.padding = '12px 14px';
        box.style.borderRadius = '12px';
        box.style.color = '#ffffff';
        box.style.background = 'rgba(0, 0, 0, 0.72)';
        box.style.zIndex = '5';
        container.appendChild(box);
    }

    function setupPlayer(container) {
        var video = container.querySelector('video[data-src]');
        var button = container.querySelector('[data-play-button]');
        if (!video || !button) {
            return;
        }
        var hls = null;
        var loaded = false;
        var source = video.getAttribute('data-src');

        function hideButton() {
            button.classList.add('is-hidden');
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    showMessage(container, '浏览器阻止了自动播放，请再次点击视频播放按钮。');
                });
            }
        }

        function loadSource() {
            if (!source) {
                showMessage(container, '当前影片没有可用播放源。');
                return;
            }
            if (loaded) {
                hideButton();
                playVideo();
                return;
            }
            loaded = true;
            hideButton();

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showMessage(container, '播放初始化失败，请刷新页面后重试。');
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
            } else {
                showMessage(container, '当前浏览器不支持 HLS 播放。');
            }
        }

        button.addEventListener('click', loadSource);
        video.addEventListener('play', hideButton);
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
    });
})();
