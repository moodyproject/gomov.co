import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputDir = resolve(__dirname, '..', 'docs');
const indexHtmlPath = resolve(outputDir, 'index.html');
const notFoundPath = resolve(outputDir, '404.html');

async function ensureOutputDir() {
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }
}

async function createNotFoundFallback() {
  if (!existsSync(indexHtmlPath)) {
    console.warn('[postbuild] Skipping 404.html copy because index.html was not found.');
    return;
  }

  try {
    await copyFile(indexHtmlPath, notFoundPath);
  } catch (error) {
    console.error('[postbuild] Failed to copy index.html to 404.html:', error);
    throw error;
  }
}

async function run() {
  await ensureOutputDir();
  await createNotFoundFallback();
}

run().catch((error) => {
  console.error('[postbuild] Unhandled error:', error);
  process.exitCode = 1;
});
