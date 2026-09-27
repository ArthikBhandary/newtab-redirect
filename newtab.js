browser.storage.local.get({ url: "", embed: true }).then(({ url, embed }) => {
  if (!/^https?:\/\//.test(url)) return; // not configured: blank tab
  if (!embed) return location.replace(url);
  // Embedding leaves the address bar empty and focused, so typing isn't clobbered.
  const f = document.createElement("iframe");
  f.src = url;
  document.body.append(f);
});
