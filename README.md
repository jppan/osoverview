# osoverview

Personal multi-page static site for the `jpOSh` setup overview.

## Live Site

- GitHub Pages: https://jppan.github.io/osoverview/

## Pages

- `index.html` - overview dashboard
- `themes.html` - theme catalog and palette/source mapping
- `automation.html` - scripts/services and event flows
- `workspace.html` - apps, keybinds, hardware profile

## Stack

- Plain HTML/CSS/JS (no framework)
- Shared styling in `style.css`
- Shared behavior in `script.js`

## Theming

- Theme values are mapped from canonical `jpOSh` palettes.
- Theme choice is persisted in `localStorage` (`jpOSh-theme`).
- RGB mode in the top theme bar auto-rotates themes (`jpOSh-rgb-mode`).

## Run Locally

From project root:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open:

- http://127.0.0.1:8000

## Notes

- Asset URLs use `?v=...` cache-busting for GitHub Pages updates.
- Motion honors `prefers-reduced-motion`.
