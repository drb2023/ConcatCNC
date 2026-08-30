# File13

This is a "junk drawer," not a trash can. Everything here was moved out of the live app tree during the 2026-08-29 cleanup audit because it is not referenced by any code path (`index.js`, `app/index.html`, or any `.js`/`.css` file that html loads). Nothing was deleted — if any of this turns out to still matter, `git mv` it back to its original path (shown below) and it'll work exactly as it did before, since the move was done with `git mv` and shows up as a rename in history.

Original path -> reason moved:

- `scan.js` -> standalone leftover dev script for network-scanning Grbl devices (`evilscan`). `index.js` has its own inline copy of this logic; this file was never `require()`d from anywhere.
- `rose1.svg` -> zero references anywhere in the codebase.
- `api.doc` -> a dump of Grbl `$` parameter values; reads like personal notes, not code or documentation that's linked from anywhere.
- `electron-builder` -> a stray 0-byte file at repo root (no extension). Almost certainly created by accident (e.g. a mistyped command redirecting output to a file named after the CLI tool).
- `splash.png`, `app/splashicon.png`, `app/img/splash.png`, `app/img/splash.svg`, `app/Openbuildslogo_5.jpg`, `app/img/openbuilds-white-logo.svg` -> old branding/splash art. The in-app splash screen (`app/index.html` `#openbuildslogosplash`) actually uses `/img/OpenBuildsCONTROL.svg`, not any of these. Likely leftovers from before that svg existed. Since you're commissioning new logo/icon art anyway, these were due to be replaced regardless.
- `grbl.bin` -> a legacy full-image classic-Grbl firmware binary. The active flashing tool (`app/wizards/flashingtool2/flashingtool.js`) only ever flashes the three `grbl-*-nodoor.hex` files (still in place at repo root) for classic Grbl boards; `grbl.bin` isn't referenced by that tool or anything else.
- `app/img/surfacing/Drawing.skp` -> a SketchUp source model, not used by any wizard at runtime.
- `app/css/mobilejog.css` -> **not** confirmed dead in the normal sense — this stylesheet is never `<link>`ed from anywhere, including `app/jog/index.html` (the page that loads `mobilejog.js`). Either it was cut when someone forgot to remove the matching `<link>`, or the link was never added. See `todo.md` — worth checking the Mobile Jog page on a phone before deciding whether to restore the link or confirm it's dead.
- `app/jog/manifest.json_old` -> superseded by `app/jog/manifest.json`.
- `app/jog/assets/` (`PWA-Logo.sketch`, `PWA-Splash-Screens.sketch`, `logo.png`, `pwa-lighthouse.png`) -> unreferenced anywhere; filenames match the default sample output of PWA-scaffolding tools (e.g. `pwa-asset-generator`), never used or cleaned up.
- `app/wizards/mailinglist_unused/mailinglist_unused.js` -> already named "unused" by the original devs, and per `CHANGELOG.txt` v1.0.390 ("Removed mailing list signup form to allow access to CONTROL") this was intentionally disabled. Confirms this was correctly identified as dead.
- `app/wizards/flashingtool/` (`grbl-flashing.js`, `interface-firmware-version.txt`) -> superseded by `app/wizards/flashingtool2/`. The `<script>` tag loading this was already commented out in `app/index.html`; that dead commented-out tag was removed as part of this cleanup.
- `app/affiliates/carveco/`, `app/affiliates/fabber/` -> whole affiliate-partner asset folders with no surviving UI entry point in `app/index.html` (only Lightburn and Vectric are still wired up in the affiliates menu). The matching dead `socket.on("carveco", ...)` / `socket.on("fabber", ...)` handlers in `index.js` were removed in the same cleanup, since nothing could ever trigger them.
- `build/icon.icnsworking`, `build/installerSidebarBackup.bmp` -> not referenced by the `build` config in `package.json` (which points at `build/icon.icns` and `build/installerSidebar.bmp`). Read as an old working copy and an old backup, respectively.
- `docs/EXECUTABLE.PNG`, `docs/KMS INSTALLED.PNG`, `docs/RPI.PNG`, `docs/WEBDRIVER.PNG`, `docs/pi-appbar.png`, `docs/pi-build.png`, `docs/pi-executed.png`, `docs/pi-extracted.png`, `docs/pi-running.png` -> not referenced by `README.md`/`CONTRIBUTING.md`/`CODE_OF_CONDUCT.md`/`SECURITY.md`/`pi-install.sh` in this repo. **Caveat:** these look like how-to screenshots, the kind that sometimes get hotlinked by raw GitHub URL from a wiki page or forum post outside this repo, which I can't see or check. If an image goes missing somewhere after this move, it's one of these — `git mv` it back from here to `docs/`.

See `todo.md` at the repo root for follow-up items these findings raised.
