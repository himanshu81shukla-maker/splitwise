# Splitwise — Friends

A Splitwise-style expense splitter built for a fixed group of 6 friends, with one extra
feature Splitwise doesn't have: scan a receipt photo and it autofills the amount,
merchant, and date using the Gemini API.

Live data syncs in real time across everyone's devices via Firebase Firestore. There's
no login system — just a profile picker (tap your name). Receipt photos are hosted on
Cloudinary (free, no card required).

## Features

- Add expenses with description, amount, category, date, and a receipt photo
- Split equally, by exact amounts, by percentage, or by shares
- Real-time balances for all 6 friends
- Debt simplification (minimum number of payments to settle the whole group)
- Record settlements ("I paid Priyansh ₹500")
- Full expense history, expandable per-expense split breakdown
- Charts: spend by category, spend by person
- Receipt photo scan → autofill via Gemini (reads the image and returns structured data)

## 1. Prerequisites

- Node.js 18+
- A free [Firebase](https://firebase.google.com) account
- A free [Cloudinary](https://cloudinary.com) account
- A free [Google AI Studio](https://aistudio.google.com) account (for the Gemini API key)
- A GitHub account (for hosting)

## 2. Set up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com) → **Add project** →
   name it anything (e.g. `splitwise-friends`) → disable Google Analytics (not needed) →
   Create.
2. In the project, click the **</> (web)** icon to register a new web app. Name it
   anything. Skip Firebase Hosting (we're using GitHub Pages instead).
3. Copy the `firebaseConfig` object shown — you'll need these 5 values for your `.env`
   file (see step 5).
4. In the left sidebar, go to **Build → Firestore Database → Create database**. Start in
   **production mode**, pick a region close to you.
5. Deploy the security rules included in this repo: in Firestore Database → Rules tab,
   paste the contents of `firestore.rules` from this repo → Publish.

   These rules let anyone with your app's config read/write — that's expected, since
   there's no login system. It's fine for a private tool used by your 6 friends, but
   don't put sensitive data in it and don't publicize the live URL.

   Note: this project does **not** use Firebase Storage — Firebase now requires the
   paid Blaze plan just to enable Storage. Receipt photos are hosted on Cloudinary
   instead (free, no card required) — see step 3.

## 3. Set up Cloudinary (for receipt photos)

1. Sign up free at [cloudinary.com](https://cloudinary.com) — no card required.
2. On your Dashboard home page, copy your **Cloud name**.
3. Go to **Settings (gear icon) → Upload → Upload presets → Add upload preset**.
4. Set **Signing Mode** to **Unsigned** (this lets the browser upload directly without
   exposing any secret key). Save, and copy the preset's name.
5. You'll add both values (`VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`)
   to your `.env` in step 5.

## 4. Get a Gemini API key (for receipt scanning)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in
   with any Google account.
2. Click **Create API key**, choose a Google Cloud project (or let it create one for
   you), and copy the key.
3. This is a free-tier key by default — plenty for a group of 6 scanning receipts. You
   can add billing later in Google Cloud Console if you ever need higher limits.
4. Keep this key private. You'll enter it either in the app's Settings tab (stored in
   your browser only) or in your `.env` file.

## 5. Local setup

```bash
git clone <your-repo-url>
cd splitwise-friends
npm install
cp .env.example .env
```

Open `.env` and fill in:
- The 5 Firebase values from step 2.3
- Your Cloudinary cloud name + upload preset from step 3
- Your Gemini API key from step 4.4 (or skip it here and paste it into the app's
  Settings tab instead — either works)

```bash
npm run dev
```

Open the printed local URL. Pick your name from the profile picker and start adding
expenses.

## 6. Editing the friend list

The 6 names are set in `src/utils/friends.js`. Edit the `FRIENDS` array to change names,
emoji avatars, or accent colors.

## 7. Deploy to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that
builds and deploys automatically on every push to `main`.

1. Push this repo to GitHub.
2. In your repo, go to **Settings → Pages** → under **Build and deployment**, set
   **Source** to **GitHub Actions**.
3. Go to **Settings → Secrets and variables → Actions → New repository secret** and add
   each of these (same values as your `.env`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY` (optional — friends can also each paste their own in
     Settings if you'd rather not bake one key into the build)
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
4. Push to `main`. Check the **Actions** tab for build progress. Once it finishes, your
   site is live at `https://yourusername.github.io/your-repo-name/`.

Note: none of these keys are secret in the sense of being protected once deployed —
they're visible in the site's compiled JS, which is normal for Firebase's client SDK and
Cloudinary's unsigned uploads. The security boundary is the **Firestore rules**, the
**Cloudinary unsigned preset** (which can't be used to delete or overwrite anything), and
whatever usage caps you set on the Gemini key in Google Cloud Console — not keeping the
values themselves hidden. Don't reuse these particular keys for a different, more
sensitive project.

## Project structure

```
src/
  components/       UI components (Dashboard, ExpenseForm, Charts, etc.)
  contexts/         AppContext — current user + Gemini API key
  utils/
    friends.js            the 6 friends + expense categories
    splitCalculations.js  split math + debt simplification
    geminiApi.js          Gemini receipt-scan call
    cloudinary.js         Cloudinary receipt photo upload
    useGroupData.js       Firestore real-time hooks
  firebase.js       Firebase init
firestore.rules     Firestore security rules
```

## Tech stack

React + Vite, Tailwind CSS, Firebase Firestore, Cloudinary, Recharts, Gemini API.
