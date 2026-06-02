# Public Release Checklist

Use this before publishing or updating GitHub Pages.

## Repository Safety

- [ ] No secrets, tokens, passwords, Wi-Fi credentials, or private API keys.
- [ ] No absolute Windows paths.
- [ ] No private local files.
- [ ] No unnecessary generated screenshots or test artifacts.
- [ ] `.gitignore` covers local-only files and dependency folders.

## Demo

- [ ] `npx http-server -p 8080` starts a local server.
- [ ] `http://localhost:8080/` loads.
- [ ] `sound-demo.html` opens from the landing page.
- [ ] Start Audio works after click.
- [ ] NexusUI piano appears.
- [ ] Computer keyboard input works.
- [ ] Web MIDI works or fails gracefully.
- [ ] Track selection works.
- [ ] Adding synth tracks works.
- [ ] Adding FX works.
- [ ] Import/export buttons do not crash.

## GitHub Pages

- [ ] Root `index.html` uses relative links.
- [ ] `.nojekyll` exists.
- [ ] Required local libraries are committed.
- [ ] Required audio assets are committed.
- [ ] Public URL tested after deployment.

## Presets/Templates

- [ ] Exported JSON has no private data.
- [ ] Imported JSON is reviewed before sharing.
- [ ] Template format limitations are documented.

## Old Ultragear Files

- [ ] Old controller-specific files are identified.
- [ ] Public README explains that ESP32 firmware and hardware-specific controller UI are not included.
- [ ] Old Ultragear app is not the public homepage.

## Final

- [ ] README is current.
- [ ] Docs are current.
- [ ] License placeholder is resolved or intentionally left as a placeholder.
