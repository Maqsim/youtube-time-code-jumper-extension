let lastScrollPosition;
let lastCommentEl;

(async () => {
  // Wait until YouTube player is initialized
  await new Promise(resolve => {
    const interval = setInterval(() => {
      if (document.querySelector('.html5-video-player')) {
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

      // Clear state
      backToCommentButton.hidden = true;
      lastScrollPosition = null;
      lastCommentEl = null;
    }
  });

  // Clicking on timecode link...
  // Mouseup, cuz click is prevented by YouTube
  document.addEventListener('mouseup', (e) => {
    const target = e.target;

    // Check if target is A and have class yt-simple-endpoint and href attribute
    if (target.tagName === 'A' && target.classList.contains('yt-simple-endpoint') && target.hasAttribute('href')) {
      const isTimecode = Boolean(target.getAttribute('href')?.split('t=')[1]);
      if (isTimecode) {
        backToCommentButton.hidden = false;
        lastScrollPosition = getScrollPosition();
        lastCommentEl = target.closest('ytd-comment-renderer');
        backToCommentButton.title = `Back to comment "${lastCommentEl.querySelector('#content-text').textContent}"`;
      }
    }
  });
})();

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
