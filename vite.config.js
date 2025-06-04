import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: '/login', // 👈 this forces browser to open LoginPage on dev start
  },
});