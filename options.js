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
  const host = new URL(url).hostname, site = /^[\d.]+$|^\[/.test(host) ? host : "*." + host.replace(/^www\./, "");
  // Must be called synchronously in the user gesture, before any other await.
  if (embed && !(await browser.permissions.request({ origins: [`*://${site}/*`] }))) {
    $("status").textContent = "Embedding needs access to that site";
    return;
  }
  await browser.storage.local.set({ url, embed, css: $("css").value });
  $("status").textContent = "Saved";
});
