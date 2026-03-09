# ESP32 IoT Dashboard (Frontend) + Render Backend

This setup gives you a secure flow:

- ESP32 -> Render backend -> Firestore (sensor writes)
- React frontend (authenticated user) -> Render backend -> Firestore (LED control)
- React frontend reads Firestore for live dashboard updates
- ESP32 reads LED state from Render backend

## Architecture

```text
ESP32 --(device token)--> Render Backend --(Admin SDK)--> Firestore
Frontend --(Firebase Auth ID token)--> Render Backend --(Admin SDK)--> Firestore
Frontend <--(onSnapshot)-- Firestore
ESP32 <--(device token)-- Render Backend <-- Firestore
```

## Frontend env (`.env`)

```env
VITE_FIREBASE_API_KEY=YOUR_WEB_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_BACKEND_BASE_URL=https://your-render-service.onrender.com
```

## Firebase setup

1. Firebase Console -> Project Settings -> General -> Your apps -> Web app.
2. Copy `apiKey`, `authDomain`, `projectId` into frontend `.env`.
3. Firebase Console -> Authentication -> Sign-in method -> enable **Google**.
4. Add your GitHub Pages domain to authorized domains in Firebase Auth.

## Firestore rules

Use [`firestore.rules`](./firestore.rules) to block all direct client writes.

Apply rules:

1. Firebase Console -> Firestore Database -> Rules
2. paste rules from `firestore.rules`
3. publish

## Collection tree

```text
sensorData/
  latest
    temperature: number
    humidity: number
    timestamp: number
    source: "esp32"

sensorHistory/
  slot_00 ... slot_24
    temperature: number
    humidity: number
    timestamp: number
    slot: number
    source: "esp32"

deviceControl/
  led
    state: 0 | 1
    updatedBy: string
```

## Frontend deploy (GitHub Pages)

A workflow already exists in `.github/workflows/deploy-pages.yml`.

1. GitHub repo -> Settings -> Pages -> Source = **GitHub Actions**
2. Add repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
3. Push to `main`.

## Backend repo (private) + Render deploy

Backend code is generated at:

- `C:\PROJECTS\esp32-backend-render`

Create new private repo and push backend:

```bash
cd C:\PROJECTS\esp32-backend-render
git init
git add .
git commit -m "Initial Render backend"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-private-backend-repo>.git
git push -u origin main
```

Deploy on Render:

1. Render -> New -> Web Service
2. Connect private backend repo
3. Build command: `npm ci`
4. Start command: `npm start`
5. Add env vars from backend `.env.example`
6. Deploy and copy Render URL

## ESP32 firmware

Use `ESP32.ino` from this frontend repo root.

Set before upload:

- `WIFI_SSID`
- `WIFI_PASSWORD`
- `BACKEND_BASE_URL`
- `DEVICE_TOKEN` (must match backend env)

Upload, then monitor serial output at 115200.

## Security notes

- Do not put Firebase Admin SDK JSON in frontend or firmware.
- Keep backend repo private.
- Rotate any exposed keys/tokens.
- Firebase web `apiKey` is not a secret, but rules/auth still must be strict.
