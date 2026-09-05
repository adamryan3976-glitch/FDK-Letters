# Letter Progress Tracker

A web app for kindergarten teachers to track letter naming and letter sound
progress (Mastered / Developing / Not Yet, for every letter A–Z) across the
school year. Teachers sign in with Google; each teacher only ever sees their
own classes.

This is a normal static web app (React + Vite) that talks directly to
Firebase from the browser -- there is no server to run or maintain. You host
the built files on GitHub Pages, and Firebase handles sign-in and data
storage.

## How it works

- **Hosting:** GitHub Pages, built and deployed automatically by a GitHub
  Actions workflow every time you push to `main`.
- **Sign-in:** Firebase Authentication, Google provider. Any teacher with a
  Google account can sign in.
- **Data:** Firebase Firestore. Every class is stored at
  `users/{teacher's uid}/classes/{classId}`. Firestore security rules (in
  `firestore.rules`) enforce that a teacher can only ever read or write
  documents under their own uid -- this is checked on Firebase's servers, not
  just hidden in the app, so one teacher's data is never visible to another.

You will need a (free) Firebase project. Firebase's free "Spark" tier is more
than enough for a school's worth of teachers and classes.

---

## One-time setup

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and click **Add project**. Give it any name (e.g. "kindergarten-tracker").
   You can leave Google Analytics off.
2. Once the project is created, click the **web** icon (`</>`) on the project
   overview page to register a web app. Give it any nickname. You do **not**
   need Firebase Hosting for this step -- skip that checkbox.
3. Firebase will show you a `firebaseConfig` object with keys like `apiKey`,
   `authDomain`, `projectId`, etc. Keep this page open -- you'll need these
   values twice (local `.env` and GitHub secrets, below).

### 2. Turn on Google sign-in

1. In the Firebase console, go to **Build → Authentication → Get started**.
2. Under the **Sign-in method** tab, enable **Google**, pick a support email,
   and save.

### 3. Create the Firestore database

1. Go to **Build → Firestore Database → Create database**.
2. Choose **Start in production mode** (the security rules below replace the
   default deny-all rules). Pick any region close to you.
3. Once it's created, go to the **Rules** tab and replace the contents with
   everything in [`firestore.rules`](./firestore.rules) from this repo, then
   click **Publish**.

### 4. Fill in your Firebase config locally

```bash
cp .env.example .env
```

Open `.env` and paste in the six values from step 1's `firebaseConfig`
(`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, and so on). This file
is gitignored -- it never gets committed.

### 5. Run it locally to confirm it works

```bash
npm install
npm run dev
```

Open the printed `localhost` URL, click **Sign in with Google**, and create a
test class. If sign-in fails with an "unauthorized domain" error, add
`localhost` to **Authentication → Settings → Authorized domains** in the
Firebase console (it's usually there by default).

---

## Publishing from your GitHub repo

### 1. Push this project to a new GitHub repo

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Add your Firebase config as repository secrets

The GitHub Actions workflow needs the same six values from your `.env` file,
but as repo secrets (so they're available at build time without being
committed to the repo).

In your GitHub repo: **Settings → Secrets and variables → Actions → New
repository secret**. Add each of these six, with values from your Firebase
config:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 3. Turn on GitHub Pages

In your repo: **Settings → Pages → Build and deployment → Source**, choose
**GitHub Actions**.

### 4. Deploy

Push to `main` (or re-run the workflow from the **Actions** tab). The first
run takes a couple of minutes. When it finishes, your app is live at:

```
https://<your-username>.github.io/<your-repo>/
```

### 5. Authorize that domain in Firebase

Back in **Authentication → Settings → Authorized domains**, click **Add
domain** and add `<your-username>.github.io`. Without this step, Google
sign-in will fail on the live site (it'll still work at `localhost`).

That's it -- share the `github.io` link with your teachers. Each one signs in
with their own Google account and gets their own private class data.

---

## Optional: restrict sign-in to your school

By default, *any* Google account can sign in and create a class (each
person's data still stays private to them, but you may not want random
sign-ups). To restrict it to your school's Google Workspace domain, open
`src/firebase.js` and add:

```js
googleProvider.setCustomParameters({ hd: 'yourschool.org' });
```

and in `src/hooks/useAuth.js`, check the domain after sign-in and sign the
user back out if it doesn't match -- ask Claude Code (or any AI coding tool)
to wire this up if you'd like help with it, or open an issue/PR pattern in
your own workflow.

## Local development

```bash
npm install       # install dependencies
npm run dev       # start local dev server with hot reload
npm run build     # production build, output in dist/
npm run preview   # preview the production build locally
```

## Project structure

```
src/
  firebase.js           Firebase app/auth/Firestore initialization
  constants.js           Categories, ratings, default assessment periods
  utils.js                CSV export + summary/aggregation helpers
  hooks/useAuth.js        Google sign-in state
  lib/classes.js          Firestore reads/writes for class documents
  components/
    SignInScreen.jsx
    ClassroomApp.jsx      Main app shell (loads/saves the active class)
    Header.jsx, NavTabs
    ClassModal.jsx         Create / switch / delete classes
    RosterView.jsx
    AssessView.jsx         Per-letter M/D/NY entry
    ClassReportView.jsx    Overview / By Letter / Growth reports
    StudentReportView.jsx
    shared.jsx              Small reusable pieces (bars, badges, letter grid)
```

## A note on cost

Firebase's free Spark plan includes generous Firestore and Authentication
quotas (well beyond what a school's kindergarten team would use -- this app
does a handful of reads/writes per teacher per session, not per-request
billing at any meaningful scale). GitHub Pages hosting is free for public
repos. You should not expect to pay anything to run this for a whole school
year, but keep an eye on the Firebase console's usage tab if you're curious.
