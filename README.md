# Kubskolan

A Swedish web app that teaches kids (8–10) to solve the Rubik's cube with CFOP, step by step.
Plain HTML/CSS/JS with no build step and no dependencies. Works offline once loaded, and can be installed on an iPad or phone home screen.

## Run locally (PC)

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```
Open http://localhost:8765/

## Put it on the iPad / phones

The app is hosted on GitHub Pages: **https://martinvalerase.github.io/kubskolan/**

1. Open the URL in Safari on the iPad.
2. Share → **Lägg till på hemskärmen**. It now opens full screen like an app and works offline.

### Deploying changes

1. Edit the files.
2. Bump `VERSION` in `sw.js`.
3. Commit and push:
   ```
   git add .
   git commit -m "Describe the change"
   git push
   ```

Pages redeploys in about a minute. Installed apps get the update the next time they're opened online.

(Any static host works too, e.g. drag the folder onto https://app.netlify.com/drop.)

## Deploy to the VPS (https://kubskolan.se)

Every push to `main` also deploys to the one.com VPS. The workflow is `.github/workflows/deploy-vps.yml`: GitHub Actions rsyncs the site over SSH to `/var/www/kubskolan`, and Caddy serves it with automatic HTTPS.

Repo secrets used by the workflow:

| Secret | Value |
|---|---|
| `VPS_HOST` | `kubskolan.se` |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan kubskolan.se` |
| `VPS_SSH_KEY` | private half of the dedicated deploy key (user `deploy` on the server) |

Server setup (once, as root on a fresh Ubuntu/Debian VPS, after DNS points to it):
```
curl -fsSL https://raw.githubusercontent.com/martinvalerase/kubskolan/main/deploy/setup-server.sh | bash -s -- "<deploy public key>"
```
The script is safe to re-run. Run a deploy manually with `gh workflow run deploy-vps.yml`.

Progress is stored per device in the browser (localStorage). Each child gets their own profile on the device.

## Structure

| File | What |
|---|---|
| `js/content.js` | All lessons, texts and algorithms (edit here to change content) |
| `js/cube.js` | 3D cube: model, CSS-3D rendering, animation, notation parser |
| `js/app.js` | Screens: profiles, map, lessons, quiz, trainer, timer, parent view |
| `css/style.css` | Styling |
| `sw.js` | Offline cache — bump `VERSION` when you deploy changes |
| `tools/make-icons.ps1` | Regenerates the PNG icons |

## Curriculum

0 Meet the cube → 1 Daisy → 2 White cross (**C**) → 3 White corners → 4 Middle layer (**F2L**, beginner style)
→ 5 Yellow cross & 6 Yellow face (**2-look OLL**) → 7 T-perm & 8 Ua/Ub/H/Z (**2-look PLL**) → 9 Bonus: real F2L pairs.

Cube orientation everywhere: yellow up, green front (white bottom).
Each case's starting position is generated as the inverse of its algorithm, so the picture always matches the algorithm.
