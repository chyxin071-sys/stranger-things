# Stranger Things Letter Wall Handoff

## Project Summary

This is a playful Stranger Things-inspired letter wall web app.

The desktop page shows the letter wall and lets the user type a message by clicking letters, using the keyboard, or experimenting with camera hand gestures. The phone page opens from a QR code, joins the same room, and displays sent words with a glowing custom font animation.

## Public URLs

- Main site: <https://stranger.pinnuozhujia.cn/>
- CloudBase fallback: <https://cloud1-8grodf5s3006f004-1421470557.tcloudbaseapp.com/>
- Private stats: <https://stranger.pinnuozhujia.cn/?stats=1>

## Main Features

- Interactive letter wall with calibrated bulbs and hit targets
- Click-to-type letters
- Keyboard controls:
  - `Backspace`: delete previous letter
  - `Esc`: clear the whole message
  - `Enter`: send
- Bottom controls:
  - `Camera`: start or stop camera gesture input
  - `Connect`: open the room QR code
  - `Clear`: clear the whole message
  - `Rotate`: mobile-only layout rotation helper
- Camera gesture input with MediaPipe loaded from local assets
- Single open palm sends the current message
- Multiple phones can join the same room
- Phone receiver waits for the custom font before showing words
- Receiver word size adapts to message length
- Hidden stats page for personal usage tracking

## CloudBase Setup

Environment:

```text
cloud1-8grodf5s3006f004
```

Required resources:

- Static hosting
- Cloud function: `letter-wall-room`
- Document database collection: `letter_wall_rooms`
- Anonymous login enabled

The room and stats sync are handled by the CloudBase function. Static hosting alone is not enough because desktop and phone need shared state.

## Important Files

- App logic: `app/page.tsx`
- Global styles: `app/globals.css`
- Vite entry: `src/main.tsx`
- CloudBase Vite config: `vite.cloudbase.config.ts`
- CloudBase function: `cloudfunctions/letter-wall-room/index.js`
- CloudBase function config: `cloudbaserc.json`
- Background image: `public/reference-wall.png`
- Receiver font: `public/fonts/pinzelan-italic.ttf`
- MediaPipe model: `public/mediapipe/hand_landmarker.task`
- Deployment notes: `CLOUDBASE_DEPLOY.md`

## Local Development

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000/
```

## Validation

Before deploying:

```bash
npm run lint
npm run build:cloudbase
```

## Deployment

Deploy the CloudBase function:

```bash
npx -p @cloudbase/cli@3.8.1 tcb fn deploy --all --force -e cloud1-8grodf5s3006f004
```

Deploy the static site:

```bash
npm run build:cloudbase
npx -p @cloudbase/cli@3.8.1 tcb hosting deploy ./dist / -e cloud1-8grodf5s3006f004
```

## Current Notes

- The private stats page is intentionally hidden by URL only. It is not password-protected.
- Stats page views are not counted as public visits.
- A normal homepage visit is counted once per device per day.
- The project still keeps the old `fz-liuxing.ttf` asset in `public/fonts`, but the receiver now uses `pinzelan-italic.ttf`.
- The root-level temporary PNG file is not required for deployment and should not be committed unless it becomes an intentional source asset.
