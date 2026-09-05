import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// BASE_PATH is set automatically by the GitHub Actions workflow to
// "/<repo-name>/", which is what GitHub Pages needs for a project site
// (username.github.io/repo-name/). It defaults to "/" for local dev.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
});
