import { defineConfig  } from 'vite';

// Vite config
export default defineConfig({
    base: '/iso-maze',
    server: {
        port: 5173,
        open: true,
    }
});