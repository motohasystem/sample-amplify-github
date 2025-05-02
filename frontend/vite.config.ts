import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',  // Amplify の baseDirectory と一致させる
    },
});
