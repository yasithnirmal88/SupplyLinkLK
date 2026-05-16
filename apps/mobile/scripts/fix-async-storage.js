const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../node_modules/@react-native-async-storage/async-storage/android/src/main/AndroidManifest.xml');

if (fs.existsSync(manifestPath)) {
  let content = fs.readFileSync(manifestPath, 'utf8');
  if (content.includes('package="com.reactnativecommunity.asyncstorage"')) {
    content = content.replace('package="com.reactnativecommunity.asyncstorage"', '');
    fs.writeFileSync(manifestPath, content);
    console.log('Fixed @react-native-async-storage/async-storage manifest for AGP 8.0+');
  } else {
    console.log('@react-native-async-storage/async-storage manifest already fixed or different.');
  }
} else {
  console.log('Could not find @react-native-async-storage/async-storage manifest at:', manifestPath);
}
