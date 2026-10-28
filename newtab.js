browser.storage.local.get({ url: "", embed: true, css: "" }).then(({ url, embed, css }) => {
  if (!/^https?:\/\//.test(url)) return; // not configured: blank tab
  if (!embed) return location.replace(url);
  // Embedding leaves the address bar empty and focused, so typing isn't clobbered.
  const f = document.createElement("iframe");
  f.src = url;
  // Links in the embedded page open in the tab itself, not inside the frame.
  // ponytail: injected on load, so clicks before the page finishes loading still stay in the frame.
  f.onload = async () => {
    const tabId = (await browser.tabs.getCurrent()).id, frameId = browser.runtime.getFrameId(f);
    browser.tabs.executeScript(tabId, {
      frameId,
      code: `document.head.prepend(Object.assign(document.createElement("base"), { target: "_top" }))`,
    });
    // ponytail: applied on load, so the page flashes unstyled first.
    if (css) browser.tabs.insertCSS(tabId, { frameId, code: css, cssOrigin: "user" });
  };
  document.body.append(f);
});
