// Drop frame-blocking headers, but only for frames embedded directly in our new tab page.
const ours = browser.runtime.getURL("");
browser.webRequest.onHeadersReceived.addListener(
  (d) => {
    if (!(d.documentUrl || "").startsWith(ours)) return;
    const responseHeaders = d.responseHeaders
      .filter((h) => h.name.toLowerCase() !== "x-frame-options")
      .map((h) =>
        h.name.toLowerCase() === "content-security-policy"
          ? { ...h, value: h.value.split(";").filter((p) => !/^\s*frame-ancestors/i.test(p)).join(";") }
          : h
      );
    return { responseHeaders };
  },
  { urls: ["<all_urls>"], types: ["sub_frame"] },
  ["blocking", "responseHeaders"]
);
