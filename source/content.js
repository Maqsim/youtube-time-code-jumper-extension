(async () => {
  let videoPlayerEl; // YouTube player element
  let controlsEl; // Player controls area element
  let lastScrollPosition;
  let lastCommentEl;
  let wasPaused;

  // Utility variables
  let ignoreSeekingCallback;
  let ignoreSrcChangeCallback;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Initialization
  // ==============

  // Wait until YouTube player and controls elements are initialized
  await new Promise(resolve => {
    const interval = setInterval(() => {
      videoPlayerEl = document.querySelector('video.html5-main-video');
      controlsEl = document.querySelector('#ytd-player .ytp-chrome-bottom');

      if (videoPlayerEl && controlsEl) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });

  // Create 'Back to comments' button
  const backToCommentButton = document.createElement('div');
  backToCommentButton.textContent = 'Back to comments';
  backToCommentButton.classList.add('ytp-back-to-comment-button', 'ytp-button');
  backToCommentButton.hidden = true;

  // If Safari browser add class to avoid showing the button on full-screen (scroll doesn't work on Safari in full-screen)
  if (isSafari) {
    backToCommentButton.classList.add('is-safari');
  }

  // Insert it to main YouTube player's controls area
  controlsEl.prepend(backToCommentButton);

  // Event handlers
  // ==============

  // When backToCommentsButton is clicked scroll to lastScrollPosition
  backToCommentButton.addEventListener('click', () => {
    if (lastScrollPosition) {
      getScrollable().scrollTo(0, lastScrollPosition);

      // If video was paused before clicking time code – pause it
      if (wasPaused) {
        videoPlayerEl.pause();
      }

      // Save reference link to another variable
      // Smoothly highlight lastCommentEl element
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

  // Mouseup here, because 'click' is prevented by YouTube
  document.addEventListener('mouseup', (e) => {
    const target = e.target;

    const isTimeCode = Boolean(target.getAttribute('href')?.split('t=')[1]);

    // Clicking time code link...
    if (target.tagName === 'A' && target.hasAttribute('href') && isTimeCode) {
      ignoreSeekingCallback = true;
      backToCommentButton.hidden = false;
      lastScrollPosition = getScrollPosition();
      lastCommentEl = target.closest('#body.ytd-comment-view-model');
      console.log(lastCommentEl);
      backToCommentButton.title = `Back to comment "${ lastCommentEl.querySelector('#content-text').textContent }"`;
      wasPaused = videoPlayerEl.paused;
      getScrollable().scrollTo(0, 0);
    }

    // Clicking ad skip button...
    if (target.closest('.ytp-ad-skip-button')) {
      ignoreSrcChangeCallback = true;
    }
  });

  // Detect video source change (ad skip, play another video)
  const observer = new MutationObserver(() => {
    // When ad is skipped – ignore it
    if (ignoreSrcChangeCallback) {
      ignoreSrcChangeCallback = false;
      return;
    }

    reset();
  });
  observer.observe(videoPlayerEl, { attributes: true, attributeFilter: ['src'] });

  // Detect user seeking video
  videoPlayerEl.addEventListener('seeking', () => {
    // First seeking is happening by clicking on time code – ignore it
    if (ignoreSeekingCallback) {
      ignoreSeekingCallback = false;
      return;
    }

    reset();
  });

  // Helper functions
  // ================

  function reset() {
    ignoreSeekingCallback = false;
    ignoreSrcChangeCallback = false;
    backToCommentButton.hidden = true;
    lastScrollPosition = null;
    lastCommentEl = null;
    wasPaused = null;
  }

  function getScrollable() {
    const ytdAppEl = document.querySelector('ytd-app');
    const isFullScreen = ytdAppEl.hasAttribute('scrolling');

    return isFullScreen ? ytdAppEl : window;
  }

  function getScrollPosition() {
    const scrollable = getScrollable();

    return scrollable === window ? scrollable.scrollY : scrollable.scrollTop;
  }
})();
