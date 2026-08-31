const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('=== Building Frontend (Panel) ===');
  const frontendDir = path.resolve(__dirname, '../../Frontend');
  execSync('npm install && npm run build', { cwd: frontendDir, stdio: 'inherit' });

  console.log('=== Copying Panel build to Website/dist/panel ===');
  const targetDir = path.resolve(__dirname, '../dist/panel');
  const srcDir = path.resolve(frontendDir, 'dist');

  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(srcDir, targetDir, { recursive: true });

  console.log('=== Panel successfully bundled into Website/dist/panel ===');
} catch (err) {
  console.error('Error bundling panel:', err);
  process.exit(1);
}
