import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';

interface PreRenderedAsset {
  name: string | undefined;
  source: string | Uint8Array;
  type: 'asset';
}

// https://vite.dev/config/
export default () => {
  return defineConfig({
    // __BASE_URL__: "{{.BaseUrl}}",
    base: '',
    plugins: [
      react(),
      svgr(),
      tailwindcss(),
      VitePWA({
        injectRegister: null,
        selfDestroying: true,
        scope: '{{.BaseUrl}}',
        // strategies: "injectManifest",
        useCredentials: true,
        includeAssets: [
          // looks inside "public" folder
          // manifest's icons are automatic added
          'favicon.ico',
        ],
        manifest: {
          name: 'f1rr',
          short_name: 'f1rr',
          description: 'Application for formula 1',
          theme_color: '#141415',
          background_color: '#141415',
          start_url: '{{.BaseUrl}}',
          scope: '{{.BaseUrl}}',
          display: 'standalone',
        },
        workbox: {
          // looks inside "dist" folder
          globPatterns: ['**/*.{js,css,html,svg,woff2}'],
          sourcemap: true,
          navigateFallbackDenylist: [/^\/api/],
        },
      }),
      // {
      //   name: 'html-transformer-plugin',
      //   enforce: 'post',
      //   apply: 'build',
      //   async closeBundle() {
      //     const outputDir = 'dist'; // Adjust this if your `build.outDir` is different
      //     const htmlPath = path.resolve(outputDir, 'index.html');

      //     // Check if the file exists
      //     if (!fs.existsSync(htmlPath)) {
      //       console.error(
      //         `Could not find ${htmlPath}. Make sure the output directory matches.`
      //       );
      //       return;
      //     }

      //     // Read the `index.html` content
      //     let html = fs.readFileSync(htmlPath, 'utf-8');

      //     // Perform your transformations here
      //     // the experimental renderBuiltUrl works except for the style font url where it escapes the curly braces
      //     // we look for those and replace with the non escaped curly braces to be able to correctly replace baseurl.
      //     html = html.replace(
      //       '%7B%7B.AssetBaseUrl%7D%7D/',
      //       '{{.AssetBaseUrl}}'
      //     ); // Example: Replace `{{.BaseUrl}}`

      //     // Write the updated `index.html` back
      //     fs.writeFileSync(htmlPath, html);

      //     console.log('Transformed index.html successfully.');
      //   },
      // },
    ],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: fileURLToPath(new URL('./src/', import.meta.url)),
        },
        {
          find: '@app',
          replacement: fileURLToPath(new URL('./src/', import.meta.url)),
        },
        {
          find: '@components',
          replacement: fileURLToPath(
            new URL('./src/components', import.meta.url)
          ),
        },
        {
          find: '@hooks',
          replacement: fileURLToPath(new URL('./src/hooks', import.meta.url)),
        },
        {
          find: '@api',
          replacement: fileURLToPath(new URL('./src/api', import.meta.url)),
        },
        {
          find: '@screens',
          replacement: fileURLToPath(new URL('./src/screens', import.meta.url)),
        },
        {
          find: '@utils',
          replacement: fileURLToPath(new URL('./src/utils', import.meta.url)),
        },
        {
          find: '@types',
          replacement: fileURLToPath(new URL('./src/types', import.meta.url)),
        },
      ],
    },
    server: {
      port: 3000,
      hmr: {
        overlay: true,
      },
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:7474/',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          assetFileNames: (chunkInfo: PreRenderedAsset) => {
            if (chunkInfo.name === 'Inter-Variable.woff2') {
              return 'assets/[name][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    // experimental: {
    //   renderBuiltUrl(filename: string, { hostId, hostType, type }: {
    //     hostId: string,
    //     hostType: 'js' | 'css' | 'html',
    //     type: 'public' | 'asset'
    //   }) {
    //     // console.debug(filename, hostId, hostType, type)
    //     return '{{.AssetBaseUrl}}' + filename
    //     // if (type === 'public') {
    //     //   return 'https://www.domain.com/' + filename
    //     // }
    //     // else if (path.extname(hostId) === '.js') {
    //     //   return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
    //     // }
    //     // else {
    //     //   return 'https://cdn.domain.com/assets/' + filename
    //     // }
    //   }
    // }
  });
};
