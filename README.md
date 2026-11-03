# WriteSpace

WriteSpace is a responsive, local-first blog demo built with Vite, React 18, React Router DOM, and Tailwind CSS. Visitors can view the public landing page, register or sign in, and read or write posts. Admins can review activity and manage demo accounts.

## Important demo-only security notice

This application stores account records, passwords, posts, and the current session as unencrypted text in this browser's `localStorage`. Route and ownership checks also run only in the browser. This is not secure authentication or access control. Do not use real passwords or sensitive content. Data stays in one browser profile and is not backed up or synchronized.

The fixed demonstration administrator is:

- Username: `admin`
- Password: `admin`

These credentials are public and must never be used for a real account.

## Requirements and local development

Use Node.js 20 or newer and npm.

```sh
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. All application state is browser-local; no backend, database, or API is used.

## Verify

```sh
npm test
npm run build
```

`npm test` runs the Vitest unit/component suite. Playwright journeys run against the Vite preview server through the repository Playwright config:

```sh
node node_modules/@playwright/test/cli.js test
```

The E2E suite covers public discovery, registration and login, reading, writing, account management, route restrictions, responsive navigation, and browser errors. The shared Playwright fixture writes screenshot evidence for each journey.

## Deploy to Vercel

This is a root-level Vite SPA. The root `vercel.json` contains the required rewrite from every route to `/index.html`, so direct access to browser routes such as `/blog/<id>` is served by the SPA entry point. Build with `npm run build`; the static output is `dist/`.

## Known limits

- Client-side role checks are for demonstration only and can be bypassed by browser users.
- Plaintext localStorage values are visible to anyone with access to the browser profile.
- Removing an account preserves posts already attributed to it.
- There is no rich text, image upload, remote sync, password recovery, or server-side persistence.
