const $ = (id) => document.getElementById(id);
browser.storage.local.get({ url: "", embed: true }).then(({ url, embed }) => {
  $("url").value = url;
  $("embed").checked = embed;
});
$("f").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = $("url").value, embed = $("embed").checked;
  // Must be called synchronously in the user gesture, before any other await.
  if (embed && !(await browser.permissions.request({ origins: [new URL(url).origin + "/*"] }))) {
    $("status").textContent = "Embedding needs access to that site";
    return;
  }
  await browser.storage.local.set({ url, embed });
  $("status").textContent = "Saved";
});
