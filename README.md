# Kubskolan

A Swedish web app that teaches kids (8–10) to solve the Rubik's cube with CFOP, step by step.
Plain HTML/CSS/JS with no build step and no dependencies. Works offline once loaded, and can be installed on an iPad or phone home screen.

## Run locally (PC)

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```
Open http://localhost:8765/

## Put it on the iPad / phones

The app is just static files, so any static host works. Easiest without installing anything:

1. Go to https://app.netlify.com/drop and drag the `kubskolan` folder onto the page (free account).
2. Open the URL you get in Safari on the iPad.
3. Share → **Lägg till på hemskärmen**. It now opens full screen like an app and works offline.

(GitHub Pages or Cloudflare Pages work just as well.)

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
