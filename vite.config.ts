import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Plugin } from "vite";

// Plugin to generate static HTML pages for blog articles after build
function staticPageGenerator(): Plugin {
  return {
    name: "static-page-generator",
    async closeBundle() {
      // Only run in production builds
      if (process.env.NODE_ENV === 'production') {
        console.log('\n📄 Generating static blog pages...');
        try {
          const { generateStaticPages } = await import('./scripts/generateStaticPages');
          await generateStaticPages(path.resolve(__dirname, 'dist'));
          console.log('✅ Static blog pages generated successfully');
        } catch (err) {
          console.error('❌ CRITICAL: Failed to generate static blog pages:', err);
          // Throw error to fail the build - AI crawlers need these pages!
          throw new Error(`Static blog page generation failed: ${err}`);
        }
      }
    }
  };
}

// Plugin to generate static HTML pages for QA pages after build
function staticQAPageGenerator(): Plugin {
  return {
    name: "static-qa-page-generator",
    async closeBundle() {
      // Only run in production builds
      if (process.env.NODE_ENV === 'production') {
        console.log('\n🔍 Generating static QA pages...');
        try {
          const { generateStaticQAPages } = await import('./scripts/generateStaticQAPages');
          await generateStaticQAPages(path.resolve(__dirname, 'dist'));
          console.log('✅ Static QA pages generated successfully');
        } catch (err) {
          console.error('❌ CRITICAL: Failed to generate static QA pages:', err);
          // Throw error to fail the build - AI crawlers need these pages!
          throw new Error(`Static QA page generation failed: ${err}`);
        }
      }
    }
  };
}

// Plugin to generate static glossary pages after build
function staticGlossaryPageGenerator(): Plugin {
  return {
    name: "static-glossary-page-generator",
    async closeBundle() {
      // Only run in production builds
      if (process.env.NODE_ENV === 'production') {
        console.log('\n📖 Generating static glossary page...');
        try {
          const { generateStaticGlossaryPage } = await import('./scripts/generateStaticGlossary');
          await generateStaticGlossaryPage(path.resolve(__dirname, 'dist'));
          console.log('✅ Static glossary page generated successfully');
        } catch (err) {
          console.error('❌ Warning: Failed to generate static glossary page:', err);
          // Don't throw - glossary is less critical than blog/QA
        }
      }
    }
  };
}

// Plugin to generate sitemap.xml at build time (moved to closeBundle for dist/ output)
function sitemapGenerator(): Plugin {
  return {
    name: "sitemap-generator",
    async closeBundle() {
      // Only run in production builds
      if (process.env.NODE_ENV !== 'production') {
        console.log('⏭️ Skipping sitemap generation in development');
        return;
      }
      
      console.log('\n🗺️ Generating multi-sitemap structure...');
      console.log('📍 Environment check:');
      console.log('  - VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set (using fallback)');
      console.log('  - VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Not set (using fallback)');
      
      try {
        const { generateSitemap } = await import('./scripts/generateSitemap');
        // Write to both public/ (for dev) and dist/ (for production)
        await generateSitemap(path.resolve(__dirname, 'dist'));
        console.log('✅ Sitemap generation complete');
      } catch (err) {
        console.error('❌ CRITICAL: Failed to generate sitemap:', err);
        // Throw error - sitemaps are critical for AI discovery
        throw new Error(`Sitemap generation failed: ${err}`);
      }
    }
  };
}

// Plugin to verify static files were generated after build
function buildVerifier(): Plugin {
  return {
    name: "build-verifier",
    async closeBundle() {
      if (process.env.NODE_ENV !== 'production') return;
      
      console.log('\n🔍 Verifying build output...');
      const fs = await import('fs');
      const distDir = path.resolve(__dirname, 'dist');
      
      const checks = [
        { path: 'blog', desc: 'Blog articles' },
        { path: 'qa', desc: 'QA pages' },
        { path: 'glossary', desc: 'Glossary page' },
        { path: 'sitemap-blog.xml', desc: 'Blog sitemap' },
        { path: 'sitemap-qa.xml', desc: 'QA sitemap' },
        { path: 'sitemap-index.xml', desc: 'Sitemap index' }
      ];
      
      let hasErrors = false;
      for (const check of checks) {
        const fullPath = path.join(distDir, check.path);
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            const files = fs.readdirSync(fullPath);
            console.log(`✅ ${check.desc}: ${files.length} items in ${check.path}/`);
          } else {
            const size = (stats.size / 1024).toFixed(1);
            console.log(`✅ ${check.desc}: ${check.path} (${size}KB)`);
          }
        } else {
          console.error(`❌ MISSING: ${check.desc} at ${check.path}`);
          hasErrors = true;
        }
      }
      
      if (hasErrors) {
        console.error('\n⚠️ Build verification found missing files!');
      } else {
        console.log('\n✨ Build verification passed - all static content present');
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
    staticPageGenerator(),
    staticQAPageGenerator(),
    staticGlossaryPageGenerator(),
    buildVerifier()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
