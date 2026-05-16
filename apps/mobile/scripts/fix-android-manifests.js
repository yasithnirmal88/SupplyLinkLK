const fs = require('fs');
const path = require('path');

const libraries = [
  {
    name: '@react-native-async-storage/async-storage',
    relPath: 'node_modules/@react-native-async-storage/async-storage/android/src/main/AndroidManifest.xml',
    package: 'package="com.reactnativecommunity.asyncstorage"'
  },
  {
    name: 'react-native-linear-gradient',
    relPath: 'node_modules/react-native-linear-gradient/android/src/main/AndroidManifest.xml',
    package: 'package="com.BV.LinearGradient"'
  },
  {
    name: '@react-native-firebase/auth',
    relPath: 'node_modules/@react-native-firebase/auth/android/src/main/AndroidManifest.xml',
    package: 'package="io.invertase.firebase.auth"'
  },
  {
    name: '@react-native-firebase/app',
    relPath: 'node_modules/@react-native-firebase/app/android/src/main/AndroidManifest.xml',
    package: 'package="io.invertase.firebase.app"'
  }
];

libraries.forEach(lib => {
  // Check local node_modules (apps/mobile/node_modules)
  let manifestPath = path.resolve(__dirname, '../', lib.relPath);
  
  if (!fs.existsSync(manifestPath)) {
    // Check root node_modules (../../node_modules)
    manifestPath = path.resolve(__dirname, '../../../', lib.relPath);
  }

  if (fs.existsSync(manifestPath)) {
    let content = fs.readFileSync(manifestPath, 'utf8');
    if (content.includes(lib.package)) {
      content = content.replace(lib.package, '');
      fs.writeFileSync(manifestPath, content);
      console.log(`Fixed ${lib.name} manifest at: ${manifestPath}`);
    } else {
      console.log(`${lib.name} manifest already fixed or different at: ${manifestPath}`);
    }
  } else {
    console.log(`Could not find ${lib.name} manifest in local or root node_modules.`);
  }
});
