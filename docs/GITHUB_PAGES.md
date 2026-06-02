# GitHub Pages

The project is prepared for a static GitHub Pages demo.

Expected public URL:

```text
https://jeanmicheldewez-ux.github.io/midi2sound/
```

## Entry Point

Root `index.html` is a clean landing page that links to:

```text
sound-demo.html
```

The demo uses relative paths:

- `nexusUI.js`
- `tone_15_04.js`
- `ultrasound.js`
- `ultra.css`
- `Amen-break.wav`

## `.nojekyll`

`.nojekyll` is included so GitHub Pages serves files directly without Jekyll processing.

## Local Pages Test

```bash
npx http-server -p 8080
```

Open:

```text
http://localhost:8080/
```

Then open the demo from the landing page.

## Enable GitHub Pages

1. Push the repository to GitHub.
2. Open repository settings.
3. Go to `Pages`.
4. Select the branch to publish, usually `main`.
5. Select root folder `/`.
6. Save.
7. Wait for GitHub Pages deployment.
8. Test the public URL.

## Things To Check

- `index.html` loads.
- `sound-demo.html` loads from the landing page.
- browser console has no fatal errors.
- Start Audio works after click.
- NexusUI piano appears.
- Web MIDI permission request works or fails gracefully.
- Import/export buttons do not crash.
