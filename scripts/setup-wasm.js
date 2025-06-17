const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WASM_DIR = path.resolve(__dirname, '..', 'wasm'); // Project root 'wasm' directory
const TMP_ZIP = path.resolve(__dirname, 'kaspa-wasm.zip');
const ASPECTRON_URL = 'https://kaspa.aspectron.org/nightly/downloads/kaspa-wasm32-sdk-2024-09-13.zip';

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  try {
    fs.mkdirSync(WASM_DIR, { recursive: true });
    console.log('⬇️ Downloading WASM SDK from', ASPECTRON_URL);
    await download(ASPECTRON_URL, TMP_ZIP);

    console.log('📦 Unzipping...');
    execSync(`unzip -o ${TMP_ZIP} -d ${path.dirname(__dirname)}`);

    // Find and copy kaspa WASM files to 'wasm' directory
    const parentDir = path.dirname(__dirname);
    let foundPath = '';
    const entries = fs.readdirSync(parentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('kaspa-wasm32-sdk')) {
        const kaspaPath = path.join(parentDir, entry.name, 'web', 'kaspa');
        if (fs.existsSync(kaspaPath)) {
          foundPath = kaspaPath;
          break;
        }
      }
    }

    if (!foundPath) {
      throw new Error('Extracted WASM directory not found.');
    }

    fs.readdirSync(foundPath).forEach(file => {
      const src = path.join(foundPath, file);
      const dest = path.join(WASM_DIR, file);
      fs.copyFileSync(src, dest);
    });

    // Clean up temporary files
    fs.unlinkSync(TMP_ZIP);
    entries.forEach(entry => {
      if (entry.isDirectory() && entry.name.startsWith('kaspa-wasm32-sdk')) {
        fs.rmSync(path.join(parentDir, entry.name), { recursive: true, force: true });
      }
    });

    console.log('✅ WASM ready in wasm/');
  } catch (err) {
    console.error('❌ WASM setup failed:', err);
    process.exit(1);
  }
})();
