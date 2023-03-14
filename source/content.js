(async () => {
  let videoPlayer;
  let lastScrollPosition;
  let lastCommentEl;

  // Utility variables
  let ignoreSeekingCallback;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Wait until YouTube player is initialized
  await new Promise(resolve => {
    const interval = setInterval(() => {
      videoPlayer = document.querySelector('video.html5-main-video')
      if (videoPlayer) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });

  // Create 'back to comments' button
  const backToCommentButton = document.createElement('div');
  backToCommentButton.textContent = 'Back to comments';
  backToCommentButton.classList.add('ytp-back-to-comment-button', 'ytp-button');
  backToCommentButton.hidden = true;

  // If Safari browser add class to avoid showing the button on full screen
  if (isSafari) {
    backToCommentButton.classList.add('is-safari');
  }

  // Insert it to player's controls area
  document.querySelector('.ytp-chrome-bottom').prepend(backToCommentButton);

  // When backToCommentButton click scroll to lastScrollPosition
  backToCommentButton.addEventListener('click', () => {
    if (lastScrollPosition) {
      getScrollable().scrollTo(0, lastScrollPosition);

      // Save reference link to another variable
      // Highlight smoothly lastCommentEl element
      const _lastCommentRef = lastCommentEl;
      setTimeout(() => {
        _lastCommentRef.classList.add('highlight');
      }, 300);

      setTimeout(() => {
        _lastCommentRef.classList.remove('highlight');
      }, 3000);

      reset();
    }
  });

  // Clicking on timecode link...
  // Mouseup, cuz click is prevented by YouTube
  document.addEventListener('mouseup', (e) => {
    const target = e.target;

    // Check if target is A and have class yt-simple-endpoint and href attribute
    if (target.tagName === 'A' && target.classList.contains('yt-simple-endpoint') && target.hasAttribute('href')) {
      const isTimeCode = Boolean(target.getAttribute('href')?.split('t=')[1]);
      if (isTimeCode) {
        ignoreSeekingCallback = true;
        backToCommentButton.hidden = false;
        lastScrollPosition = getScrollPosition();
        lastCommentEl = target.closest('ytd-comment-renderer');
        backToCommentButton.title = `Back to comment "${ lastCommentEl.querySelector('#content-text').textContent }"`;
      }
    }
  });

  // Detect video source change and reset the state
  const observer = new MutationObserver(reset);
  observer.observe(videoPlayer, { attributes: true, attributeFilter: ['src'] });

  // Detect user seeking video and reset the state
  videoPlayer.addEventListener('seeking', () => {
    // First seeking is happening by clicking on time code – ignore it
    if (ignoreSeekingCallback) {
      ignoreSeekingCallback = false;
      return;
    }

    reset();
  });

  function reset() {
    ignoreSeekingCallback = false;
    backToCommentButton.hidden = true;
    lastScrollPosition = null;
    lastCommentEl = null;
  }

  function getScrollable() {
    const ytdAppEl = document.querySelector('ytd-app');
    // Detect whether YouTube player is full screen or not
    const isFullScreen = ytdAppEl.hasAttribute('scrolling');
    return isFullScreen ? ytdAppEl : window;
  }

  function getScrollPosition() {
    const scrollable = getScrollable();

    return scrollable === window ? scrollable.scrollY : scrollable.scrollTop;
  }
})();
