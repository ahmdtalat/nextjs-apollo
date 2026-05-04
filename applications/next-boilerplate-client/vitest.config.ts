import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// #################################################################################################

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/app/components/MultiSelect.tsx',
        'src/app/components/PurchasesPage.tsx',
      ],
    },
  },
})
