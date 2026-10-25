import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const currentDir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : __dirname;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(currentDir, 'index.html'),
        instructor: resolve(currentDir, 'instructor.html'),
        login: resolve(currentDir, 'login.html'),
        signup: resolve(currentDir, 'signup.html'),
        student: resolve(currentDir, 'student.html'),
        studentLogin: resolve(currentDir, 'student-login.html'),
        studentSignup: resolve(currentDir, 'student-signup.html'),
        report: resolve(currentDir, 'report.html'),
        dashboard: resolve(currentDir, 'dashboard.html'),
      },
    },
  },
});
