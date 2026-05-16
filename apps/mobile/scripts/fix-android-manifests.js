const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Automatically find and fix AndroidManifest.xml files in node_modules
 * that still use the deprecated 'package' attribute, which causes errors in AGP 8.0+.
 */

const searchPaths = [
  path.resolve(__dirname, '../node_modules'),
  path.resolve(__dirname, '../../../node_modules')
];

function fixManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return;

  try {
    let content = fs.readFileSync(manifestPath, 'utf8');
    // Regex to match the package attribute in the manifest tag
    const packageRegex = /\s+package="[^"]+"/;
    
    if (packageRegex.test(content)) {
      const newContent = content.replace(packageRegex, '');
      fs.writeFileSync(manifestPath, newContent);
      console.log(`Fixed manifest at: ${manifestPath}`);
    }
  } catch (err) {
    console.error(`Error fixing manifest at ${manifestPath}:`, err.message);
  }
}

function findAndFix() {
  searchPaths.forEach(searchPath => {
    if (!fs.existsSync(searchPath)) return;
    
    console.log(`Scanning: ${searchPath}`);
    
    // Using find command via child_process for speed (assuming Windows/Linux with find/PowerShell)
    // On Windows, we can use a simpler recursive search if needed, but let's try to be precise.
    
    const walk = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          // Optimization: only search into relevant folders
          if (file === 'node_modules' || file.startsWith('.') || file === 'ios') return;
          walk(filePath);
        } else if (file === 'AndroidManifest.xml' && filePath.includes('android')) {
          fixManifest(filePath);
        }
      });
    };

    walk(searchPath);
  });
}

console.log('Starting automated AndroidManifest fix...');
findAndFix();
console.log('Automated fix complete.');
