# New Tab Redirect

A small Firefox add-on that opens a URL of your choice in every new tab.

- **Embed mode (default):** the page is shown inside the new tab, so the address bar stays empty and focused and never overwrites what you start typing. You can also add your own CSS to the page, for example a dark mode.
- **Redirect mode:** the new tab navigates to the URL. Works with every site, but the address bar fills with the URL once the page loads.

No build step, no dependencies, no tracking. Requires Firefox 140 or later.

## Usage

1. Install the add-on.
2. Open `about:addons` → **New Tab Redirect** → **Preferences**.
3. Enter a URL, choose embed or redirect, and click **Save**. In embed mode, Firefox asks for access to that site (see [Permissions](#permissions)).
4. Optional, embed mode only: add CSS in the **Custom CSS** box.

Until a URL is saved, new tabs are blank. Changes apply from the next new tab.

### Custom CSS

The CSS is added to the add-on's own new tab page, not to the embedded site, so it styles the `iframe` element around the site. It applies instantly and works for any site, but it can't target elements inside the site.

A quick dark mode for any site:

```css
iframe { filter: invert(1) hue-rotate(180deg); }
```

Or invert the whole new tab page, which also turns the white background shown while the site loads dark:

```css
html { filter: invert(1) hue-rotate(180deg); }
```

Both invert images and videos too. To restyle the site itself, use an extension like Stylus.

## Limitations

- Some sites still can't be embedded: those that break out of frames with JavaScript, that only work in a top-level tab, or that use a service worker (e.g. YouTube), whose responses bypass the header removal. Use redirect mode for them.
- Embedded pages may use partitioned cookies, so a site can show you as logged out inside the new tab.
- Links and form submissions leave embed mode and load in the tab itself, but only once the page has finished loading. Links clicked earlier, and JavaScript navigations, stay inside the frame.
- Custom CSS styles the frame as a whole (filters, size, borders), not the site's own elements.

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Saves the URL, the embed/redirect setting and the custom CSS. Stored locally, never sent anywhere. |
| `chrome_url_overrides.newtab` | Replaces the new tab page with `newtab.html`. |
| `webRequest`, `webRequestBlocking` | Many sites send `X-Frame-Options` or a CSP `frame-ancestors` header that blocks embedding. `background.js` removes those two headers **only** for `sub_frame` responses whose parent is this add-on's own new tab page. Other pages, frames and headers are untouched. |
| `<all_urls>` (optional) | Never granted at install. Saving a URL in embed mode asks for access to **that one site** only, including its subdomains, because sites often redirect to `www.` or from http to https (e.g. `*://*.google.com/*`; a `www.` URL asks for the `www.` host and its subdomains plus the bare domain, e.g. `*://*.www.google.com/*` and `*://google.com/*`); it's declared as `<all_urls>` because you can pick any site. That access lets the add-on rewrite the headers above and inject a `<base target="_top">` tag into the embedded page. Redirect mode needs no host permission. |

## Development

```sh
npx web-ext run      # launch a temporary Firefox profile with the add-on loaded
npx web-ext lint     # check for AMO validation issues
npx web-ext build    # package into web-ext-artifacts/
```

Or load it by hand: `about:debugging` → **This Firefox** → **Load Temporary Add-on** → select `manifest.json`.

| File | Purpose |
|---|---|
| `manifest.json` | Add-on manifest (Manifest V2) |
| `newtab.html`, `newtab.js` | New tab page: embeds or redirects to the saved URL, applies the custom CSS, and injects the link fix into the frame |
| `options.html`, `options.js` | Preferences page |
| `background.js` | Strips frame-blocking headers for the embedded frame only |

## Release notes

**1.4.2**
- For `www.` URLs, embed mode now asks for the `www.` host plus the bare domain, never a wildcard on the bare domain (so `www.co.uk` can't ask for every `.co.uk` site).
- The options page shows an error if Firefox rejects the permission request, instead of failing silently.
- When the link fix can't be applied, a warning appears in the console.
- The Custom CSS placeholder and label now say the CSS styles the frame, not the site's elements.

**1.4.1**
- Custom CSS now styles the frame around the embedded page instead of the page itself. It applies instantly and works for every site.
- Embed mode asks for access to the whole site, including subdomains, so sites that redirect (e.g. `google.com` → `www.google.com`) can be embedded. Save the URL again after updating.
- Requires Firefox 140 or later.

**1.4**
- New **Custom CSS** box on the options page, applied to the embedded page on every new tab. Embed mode only.

**1.3**
- Links in the embedded page now open in the tab itself instead of inside the frame.

## License

[MIT](LICENSE).
