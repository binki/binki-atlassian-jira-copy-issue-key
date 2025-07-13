// ==UserScript==
// @name binki-atlassian-jira-copy-issue-key
// @homepageURL https://github.com/binki/binki-atlassian-jira-copy-issue-key
// @version 1.1.1
// @match https://*.atlassian.net/*
// @require https://github.com/binki/binki-userscript-when-element-changed-async/raw/88cf57674ab8fcaa0e86bdf5209342ec7780739a/binki-userscript-when-element-changed-async.js
// ==/UserScript==

(async () => {
  const span = document.createElement('span');
  span.role = 'presentation';
  const button = document.createElement('button');
  button.innerHTML = '<span><span data-testid="x-binki-copy-issue-key"><svg width="24" height="24" viewBox="0 0 24 24" role="presentation" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor" fill-rule="evenodd"><path d="M 12.476563,4 C 9.4606244,4 7,6.4606237 7,9.4765625 V 12.523438 C 7,15.539376 9.4606242,18 12.476563,18 h 3.046875 C 18.539377,18 21,15.539376 21,12.523438 V 9.4765625 C 21,6.4606238 18.539376,4 15.523438,4 Z m 0,2.0507812 h 3.046875 c 1.915184,0 3.425781,1.5105973 3.425781,3.4257813 v 3.0468755 c 0,1.915183 -1.510598,3.425781 -3.425781,3.425781 h -3.046875 c -1.915183,0 -3.4257817,-1.510599 -3.4257817,-3.425781 V 9.4765625 c 0,-1.9151838 1.5105987,-3.4257812 3.4257817,-3.4257813 z" /><path d="M 11.523438,18.949219 H 8.4765625 c -1.9151837,0 -3.4257813,-1.510597 -3.4257813,-3.425781 V 12.476563 L 3,12.476563 v 3.046875 C 3,18.539376 5.4606236,21 8.4765625,21 h 3.0468755" /></g></svg></span></span>';
  button.title = 'Copy issue key';
  button.addEventListener('click', e => {
    navigator.clipboard.writeText(document.querySelector('[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"]').textContent);
    e.preventDefault();
    button.disabled = true;
    setTimeout(() => button.disabled = false, 1000);
  });
  span.append(button);

  const getTestId = element => {
    while (element) {
      if (element.dataset.testid) return element.dataset.testid;
      element = element.firstElementChild;
    }
  };
  let lastSeenInsertionParent;
  while (true) {
    await whenElementChangedAsync(document.body);
    const keyPermalinkButton = document.querySelector('[data-testid="issue.common.component.permalink-button.button.copy-link-button-wrapper"] button');
    if (!keyPermalinkButton) continue;
    // Be certain NOT to append this if it is already there. If multiple scripts (e.g., binki-atlassian-jira-copy-issue-key)
    // do this, then any append which result in a DOM mutation happening will retrigger our change detection, creating an
    // infinite loop and rendering the browser nonresponsive.
    const insertionParent = keyPermalinkButton.parentElement.parentElement;
    if (insertionParent !== lastSeenInsertionParent) {
      lastSeenInsertionParent = insertionParent;
      button.className = keyPermalinkButton.className;
      // Implement https://github.com/binki/binki-atlassian-jira-copy-issue-key/issues/2
      let next = insertionParent.firstChild;
      while (next && (!getTestId(next) || getTestId(next) < getTestId(span))) next = next.nextElementSibling;
      insertionParent.insertBefore(span, next);
    }
  }
})();
