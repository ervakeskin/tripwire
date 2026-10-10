import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  videoCompression: false,
  e2e: {
    baseUrl: 'http://localhost:4173',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
  },
});
