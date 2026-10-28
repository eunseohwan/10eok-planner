import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정: React(JSX)를 쓸 수 있게 플러그인을 붙여요.
export default defineConfig({
  plugins: [react()],
});
