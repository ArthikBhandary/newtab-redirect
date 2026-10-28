browser.storage.local.get({ url: "", embed: true, css: "" }).then(({ url, embed, css }) => {
  if (!/^https?:\/\//.test(url)) return; // not configured: blank tab
  if (!embed) return location.replace(url);
  // Custom CSS styles our own page (the iframe element), not the site inside it.
  if (css) document.head.append(Object.assign(document.createElement("style"), { textContent: css }));
  // Embedding leaves the address bar empty and focused, so typing isn't clobbered.
  const f = document.createElement("iframe");
  f.src = url;
  // Links in the embedded page open in the tab itself, not inside the frame.
  // ponytail: injected on load, so clicks before the page finishes loading still stay in the frame.
  f.onload = () =>
    browser.tabs.getCurrent()
      .then((tab) => browser.tabs.executeScript(tab.id, {
        frameId: browser.runtime.getFrameId(f),
        code: `document.head?.prepend(Object.assign(document.createElement("base"), { target: "_top" }))`,
      }))
      // Expected when the frame leaves the granted site; otherwise re-save the URL in options to re-grant access.
      .catch((e) => console.warn("New Tab Redirect: link fix not applied:", e.message));
  document.body.append(f);
});
