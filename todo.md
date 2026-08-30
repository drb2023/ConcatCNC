# TODO / Recommended changes

Running list of things worth doing, roughly grouped by priority. Nothing here is committed to — work through it whenever, in whatever order matters most to you.

## Carried over from the old `todo` file
- [ ] Make a download page
- [ ] Keyboard/Gamepad/HID support

## From the 2026-08-29 cleanup audit

### Worth checking soon
- [ ] **Mobile Jog styling** — `app/css/mobilejog.css` exists but is never linked from `app/jog/index.html` (only `mobilejog.js` is loaded there). Open the Mobile Jog page from a phone/tablet and see if it looks unstyled or broken. If it looks fine, the CSS file truly is dead (already moved to `File13/`). If it looks wrong, restore the link: add `<link rel="stylesheet" href="../css/mobilejog.css" />` to `app/jog/index.html`.
- [ ] **`docs/` screenshots moved to File13** — if any image goes missing on a GitHub Wiki page or forum post that links to this repo, it's one of the 9 screenshots moved into `File13/docs/`. Check external references before deleting them for good.

### Rebrand-blocking
- [ ] **TLS certificate for the local HTTPS server** — `index.js` runs an HTTPS server on port 3001 using a checked-in cert (`privkey1.pem`/`fullchain1.pem`) for `mymachine.openbuilds.com`, a domain you don't own. That cert already expired 2025-02-24, so it's currently non-functional either way. Figure out what depends on that secure-context HTTPS server (likely camera/webcam access, which browsers require HTTPS for) and decide: get your own domain + cert, or find another way to provide a secure context, before shipping the rebrand.
- [ ] **Full rebrand pass** — beyond the new logo/icons, `package.json` (`appId`, `productName`, `repository`), window title strings, and any remaining "OpenBuilds" text in `app/index.html` will need updating together once the new name is locked in. AGPL-3.0 lets you keep the code; the "OpenBuilds" name/trademark is separate and shouldn't carry over.
- [ ] **Legacy CI configs** — `.travis.yml` and `appveyor.yml` look superseded by the GitHub Actions workflow in `.github/workflows/build.yml` (which is what the README build badge points at). Check whether the Travis CI / AppVeyor integrations are still connected to the GitHub repo; if not, these two files can be retired safely.

### Lower priority / just noted
- [ ] **Duplicate Font Awesome 5 bundles** — `app/lib/fontawesome5/` and `app/lib/furcanIconPicker/fontawesome-5.11.2/` both ship a full Font Awesome 5 icon set. Both are actually loaded (one for the main UI, one is a dependency of the icon-picker widget used in macros), so this isn't dead code — just shipped twice. Could investigate whether the icon picker can be pointed at the already-loaded copy to shave install size, but that's a "nice to have," not a bug.
