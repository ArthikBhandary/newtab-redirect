# New Tab Redirect

A small Firefox add-on that opens a URL of your choice in every new tab.

- **Embed mode (default):** the page is shown inside the new tab, so the address bar stays empty and focused. Whatever you start typing there is never overwritten.
- **Redirect mode:** the new tab navigates to the URL. This works for every site, but the address bar fills with the URL once the page loads.

In embed mode you can also add your own CSS to the embedded page, for example a dark mode.

No build step, no dependencies, no tracking.

## Usage

1. Install the add-on.
2. Open `about:addons` → **New Tab Redirect** → **Preferences**.
3. Enter a URL, choose embed or redirect, and click **Save**. In embed mode, Firefox asks for access to that site (see [Permissions](#permissions)).

Until a URL is saved, new tabs are blank.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Add-on manifest (Manifest V2) |
| `newtab.html`, `newtab.js` | The new tab page; embeds or redirects to the saved URL |
| `options.html`, `options.js` | Preferences page |
| `background.js` | Removes frame-blocking headers, only for the embedded frame |

## Development

```sh
npx web-ext run      # launch a temporary Firefox profile with the add-on loaded
npx web-ext lint     # check for AMO validation issues
```

Or load it by hand: `about:debugging` → **This Firefox** → **Load Temporary Add-on** → select `manifest.json`.

## Submitting to Mozilla (AMO)

1. Bump `version` in `manifest.json`.
2. Run `npx web-ext lint` and fix any errors.
3. Run `npx web-ext build` to create `web-ext-artifacts/new_tab_redirect-<version>.zip`.
4. Go to <https://addons.mozilla.org/developers/addon/submit/>.
   - **On this site** lists it publicly on AMO. **On your own** signs it for self-distribution only.
5. Upload the zip. The source is unminified, so no separate source upload is needed.
6. Paste the permission justifications below into the **Notes to Reviewer** field.

The add-on ID is `newtab-redirect@arthik`. Change it before the first submission if you want a different one; it can't be changed afterwards. `data_collection_permissions` is set to `none`, which AMO requires for new submissions.

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Saves the chosen URL, the embed/redirect setting and the custom CSS. Stored locally only, never sent anywhere. |
| `chrome_url_overrides.newtab` | Replaces the new tab page with `newtab.html`. This is the core feature. |
| `webRequest`, `webRequestBlocking` | Many sites send `X-Frame-Options` or a CSP `frame-ancestors` header that stops them from being embedded. In embed mode, `background.js` removes those two headers, and **only** for `sub_frame` responses whose parent document is this add-on's own new tab page (`documentUrl` starts with the add-on's `moz-extension://` URL). Other pages, frames and headers are untouched. |
| `<all_urls>` (optional) | Never granted at install. When you save a URL in embed mode, the add-on asks for access to **that one origin** only (e.g. `https://news.ycombinator.com/*`). It is listed as `<all_urls>` only because the user can pick any site. The same per-origin access lets the new tab page inject into its own embedded frame: a `<base target="_top">` tag so links open in the tab, and the user's custom CSS via `tabs.insertCSS`. Without it, neither the header rewrite nor the injection can run for that site. Redirect mode needs no host permission. |

### Notes to Reviewer

> The add-on replaces the new tab page with a user-chosen URL, shown in a full-page iframe so the address bar stays empty and focused. Many sites forbid framing, so `background.js` uses a blocking `webRequest.onHeadersReceived` listener to drop `X-Frame-Options` and the `frame-ancestors` CSP directive. It does this only for `sub_frame` responses whose `documentUrl` is the add-on's own new tab page, so no other browsing is affected. Host access is optional and requested per origin when the user saves a URL. Once the frame loads, `newtab.js` uses `tabs.executeScript` and `tabs.insertCSS`, scoped by `frameId` to that one frame only, to (a) add a fixed `<base target="_top">` tag so links open in the tab, and (b) apply CSS the user typed into the options page, as a user stylesheet (e.g. a dark mode). The injected script is a fixed string. User-supplied text is only ever passed as CSS, never run as code. No data is collected or transmitted.

## Limitations

- In embed mode, links open in the tab itself (leaving embed mode) once the page has loaded. Links clicked before that, and JavaScript navigations, stay inside the frame.
- Embedded pages may use partitioned cookies, so a site can show you as logged out inside the new tab.
- Sites that use JavaScript to break out of frames will still escape the embed.
- Custom CSS (e.g. a dark mode) applies in embed mode only, and after the page loads, so it briefly shows unstyled.

## Release notes

**1.4**
- New: **Custom CSS** box on the options page. The CSS is applied to the embedded page on every new tab, so you can add a dark mode or hide clutter. Embed mode only.

**1.3**
- Links in the embedded page now open in the tab itself instead of inside the frame.

## License

[MIT](LICENSE).
