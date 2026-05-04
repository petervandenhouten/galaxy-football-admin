# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploying To GitHub Pages

This project uses `gh-pages` to publish the Vite build output from the `dist` folder.

Run deployment from the `html` directory:

```bash
npm install
npm run deploy
```

What happens during deployment:

- `predeploy` runs `npm run build`
- Vite builds the app into `dist`
- `gh-pages -d dist` publishes the built files to the `gh-pages` branch

The app is configured for GitHub Pages with the base path `/galaxy-football-admin/`, so it should be available at:

```text
https://petervandenhouten.github.io/galaxy-football-admin/
```

If this is the first deployment, confirm the GitHub repository Pages settings use:

- Branch: `gh-pages`
- Folder: `/ (root)`
