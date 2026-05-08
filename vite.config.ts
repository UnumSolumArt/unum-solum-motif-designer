import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rhinoUrl = env.RHINO_COMPUTE_URL || 'http://localhost:5000';
  const rhinoKey = env.RHINO_COMPUTE_KEY || '';

  return {
    plugins: [
      react(),
      // @selvajs/compute (via rhino3dm) référence Buffer/process — polyfills requis dans le navigateur.
      nodePolyfills({
        include: ['buffer', 'process'],
        globals: { Buffer: true, process: true, global: true },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // En dev, on contourne la Function Netlify et on parle directement
        // à Rhino Compute. La Function reste utilisée en prod.
        '/api/solve': {
          target: rhinoUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/solve/, ''),
          configure: (proxy) => {
            if (rhinoKey) {
              proxy.on('proxyReq', (proxyReq) => {
                proxyReq.setHeader('RhinoComputeKey', rhinoKey);
              });
            }
          },
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
    },
  };
});
