const $ = (id) => document.getElementById(id);
browser.storage.local.get({ url: "", embed: true, css: "" }).then(({ url, embed, css }) => {
  $("url").value = url;
  $("embed").checked = embed;
  $("css").value = css;
});
$("f").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = $("url").value, embed = $("embed").checked;
  // Whole site, not just the typed origin: sites redirect apex <-> www and http -> https.
  // www.X adds the exact apex X, never *.X: without a public-suffix list, *.X could be a whole TLD (www.co.uk).
  const host = new URL(url).hostname.replace(/\.$/, "");
  const sites = /^[\d.]+$|^\[/.test(host) ? [host] : ["*." + host, ...(/^www\./.test(host) ? [host.slice(4)] : [])];
  // Must be called synchronously in the user gesture, before any other await.
  try {
    if (embed && !(await browser.permissions.request({ origins: sites.map((s) => `*://${s}/*`) }))) {
      $("status").textContent = "Embedding needs access to that site";
      return;
    }
  } catch (err) {
    $("status").textContent = `Couldn't request access: ${err.message}`;
    return;
  }
  await browser.storage.local.set({ url, embed, css: $("css").value });
  $("status").textContent = "Saved";
});
