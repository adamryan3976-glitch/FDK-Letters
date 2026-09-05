import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Serving from a custom domain (fdk-letters.winchesterps.ca) means the site
// lives at the root of that domain, so asset paths should always be root
// relative -- no repo-name subpath needed here.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
});
