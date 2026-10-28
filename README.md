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
4. Optionally, in embed mode, add CSS in the **Custom CSS** box.

Until a URL is saved, new tabs are blank.

### Custom CSS

Other extensions (Stylus, Dark Reader, …) can't modify the add-on's new tab page, so styling goes here instead. The CSS is applied as a user stylesheet, so add `!important` to a rule to override the site's own styles.

A quick dark mode for any site:

```css
html { filter: invert(1) hue-rotate(180deg); }
img, video, picture { filter: invert(1) hue-rotate(180deg); }
```

For a site that uses a class or attribute for its own dark theme, targeting that is usually cleaner than inverting.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Add-on manifest (Manifest V2) |
| `newtab.html`, `newtab.js` | The new tab page; embeds or redirects to the saved URL, and injects the link fix and custom CSS into the embedded frame |
| `options.html`, `options.js` | Preferences page |
| `background.js` | Removes frame-blocking headers, only for the embedded frame |
## Development

```sh
npx web-ext run      # launch a temporary Firefox profile with the add-on loaded
npx web-ext lint     # check for AMO validation issues
npx web-ext build    # package into web-ext-artifacts/
```

Or load it by hand: `about:debugging` → **This Firefox** → **Load Temporary Add-on** → select `manifest.json`.

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Saves the chosen URL, the embed/redirect setting and the custom CSS. Stored locally only, never sent anywhere. |
| `chrome_url_overrides.newtab` | Replaces the new tab page with `newtab.html`. This is the core feature. |
| `webRequest`, `webRequestBlocking` | Many sites send `X-Frame-Options` or a CSP `frame-ancestors` header that stops them from being embedded. In embed mode, `background.js` removes those two headers, and **only** for `sub_frame` responses whose parent document is this add-on's own new tab page (`documentUrl` starts with the add-on's `moz-extension://` URL). Other pages, frames and headers are untouched. |
| `<all_urls>` (optional) | Never granted at install. When you save a URL in embed mode, the add-on asks for access to **that one origin** only (e.g. `https://news.ycombinator.com/*`). It is listed as `<all_urls>` only because the user can pick any site. The same per-origin access lets the new tab page inject into its own embedded frame: a `<base target="_top">` tag so links open in the tab, and the user's custom CSS via `tabs.insertCSS`. Without it, neither the header rewrite nor the injection can run for that site. Redirect mode needs no host permission. |

## Limitations

- Some sites still can't be embedded: those that break out of frames with JavaScript, or that only work in a top-level tab. Use redirect mode for them.
- Embedded pages may use partitioned cookies, so a site can show you as logged out inside the new tab.
- Links open in the tab itself (leaving embed mode) once the page has loaded. Links clicked before that, and JavaScript navigations, stay inside the frame.
- Custom CSS:
  - works in embed mode only;
  - is applied after the page loads, so the page briefly shows unstyled;
  - styles only the embedded page itself, not frames nested inside it;
  - takes effect from the next new tab after you save.

## Release notes

**1.4**
- New: **Custom CSS** box on the options page. The CSS is applied to the embedded page on every new tab, so you can add a dark mode or hide clutter. Embed mode only.

**1.3**
- Links in the embedded page now open in the tab itself instead of inside the frame.

## License

[MIT](LICENSE).
