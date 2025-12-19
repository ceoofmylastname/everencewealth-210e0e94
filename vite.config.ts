import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Plugin } from "vite";

// Plugin to generate static HTML pages after build
function staticPageGenerator(): Plugin {
  return {
    name: "static-page-generator",
    async closeBundle() {
      // Only run in production builds
      if (process.env.NODE_ENV === 'production') {
        console.log('\n📄 Generating static pages...');
        try {
          const { generateStaticPages } = await import('./scripts/generateStaticPages');
          await generateStaticPages(path.resolve(__dirname, 'dist'));
        } catch (err) {
          console.error('Failed to generate static pages:', err);
          // Don't fail the build if static generation fails
        }
      }
    }
  };
}

// Plugin to generate sitemap.xml at build time
function sitemapGenerator(): Plugin {
  return {
    name: "sitemap-generator",
    async buildStart() {
      // Generate sitemap before build so it's included in dist
      console.log('\n🗺️ Generating multi-sitemap structure...');
      try {
        const { generateSitemap } = await import('./scripts/generateSitemap');
        await generateSitemap();
        console.log('✅ Sitemap generation complete');
      } catch (err) {
        console.error('❌ Failed to generate sitemap:', err);
        console.log('⚠️ Falling back to static sitemap files in public/');
        // The static sitemap files in public/ will be used as fallback
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    sitemapGenerator(),
    staticPageGenerator()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
