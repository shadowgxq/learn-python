import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const vendorChunkGroups = [
  {
    name: 'react-vendor',
    packages: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      '@remix-run/router',
      'scheduler',
    ],
  },
  {
    name: 'query-vendor',
    packages: ['@tanstack/react-query', '@tanstack/query-core'],
  },
  {
    name: 'ui-vendor',
    packages: ['@radix-ui/', 'lucide-react'],
  },
  {
    name: 'http-vendor',
    packages: ['axios'],
  },
] as const;

function matchesPackage(id: string, packageName: string) {
  const packagePath = `/node_modules/${packageName}`;

  if (packageName.endsWith('/')) {
    return id.includes(packagePath);
  }

  return id.includes(`${packagePath}/`) || id.endsWith(packagePath);
}

function manualChunks(id: string) {
  const normalizedId = id.split('\\').join('/');

  if (!normalizedId.includes('/node_modules/')) {
    return undefined;
  }

  const chunkGroup = vendorChunkGroups.find((group) =>
    group.packages.some((packageName) => matchesPackage(normalizedId, packageName)),
  );

  return chunkGroup?.name ?? 'vendor';
}

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'lucide-react',
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/shared/testing/setupTests.ts',
  },
});
