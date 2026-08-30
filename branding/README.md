# branding/

Master source files for ConcatCNC's visual identity live here — nowhere else. Everywhere else in the repo (`app/img/`, `app/icon.png`, `build/icon.*`, `app/jog/*.png`, `app/favicon.ico`, etc.) holds a *derived* copy exported from these masters at a specific size/format for a specific consumer. When the branding changes, it changes here first, then gets re-exported outward — never edit a derived copy directly and expect it to stick.

Drop the two master SVGs here as:

- `logo-master.svg` — the full logo (wordmark + mark, or however it's composed). Source for the splash screen and menu logo currently at `app/img/OpenBuildsCONTROL.svg` and `app/img/openbuilds-logo.svg`.
- `icon-master.svg` — the square icon/mark on its own, no wordmark. Source for every icon-shaped asset: the desktop app icon (`app/icon.png`, `build/icon.ico`/`.icns`/`build/icons/*.png`), the browser favicon (`app/favicon.ico`), and the Mobile Jog PWA icon set (`app/jog/*.png`, `app/jog/favicon.ico`).

Once both files are here, let me know and I'll generate the full derived set (all the Windows/Mac/Linux icon sizes, the PWA icon ladder, the favicon) from these two sources and drop each one in its correct spot — see the placement list from earlier in this conversation for exactly where each derived file goes.
