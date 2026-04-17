import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read version from package.json
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const adminVersion = pkg.version || 'dev';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/galaxy-football-admin/',
  define: {
    'import.meta.env.VITE_ADMIN_VERSION': JSON.stringify(adminVersion),
  },
})
