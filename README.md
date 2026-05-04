# Galaxy Football Admin

Galaxy Football Admin is a Vite + React admin interface for the Galaxy Football backend. It provides pages for backend logs, database access, jobs, tracking calls, and backend version information.

## Project Layout

The active frontend app lives in the `html` directory.

- `html/src/App.jsx`: main app shell and routes
- `html/src/DashboardHome.jsx`: home page and backend version details
- `html/src/TablesPage.jsx`: database page
- `html/src/JobsPage.jsx`: admin job actions
- `html/src/LogsPage.jsx`: backend logs viewer

## Local Development

Run frontend commands from the `html` directory:

```bash
cd html
npm install
npm run dev
```

Available scripts:

- `npm run dev`: start the Vite dev server
- `npm run build`: create a production build in `html/dist`
- `npm run preview`: preview the production build locally
- `npm run deploy`: build and publish the site to GitHub Pages

## GitHub Pages Deployment

This project uses `gh-pages` to publish the Vite build output from `html/dist`.

Deploy from the `html` directory:

```bash
cd html
npm install
npm run deploy
```

What happens during deployment:

- `predeploy` runs `npm run build`
- Vite builds the app into `dist`
- `gh-pages -d dist` publishes the built files to the `gh-pages` branch

The app is configured with the GitHub Pages base path `/galaxy-football-admin/`, so the published site should be available at:

```text
https://petervandenhouten.github.io/galaxy-football-admin/
```

If this is the first deployment, confirm the repository Pages settings use:

- Branch: `gh-pages`
- Folder: `/ (root)`

## Notes

- The frontend version shown in the UI comes from `html/package.json`.
- The backend `/version` endpoint provides backend build, branch, version, game version, and database version details shown in the admin UI.
