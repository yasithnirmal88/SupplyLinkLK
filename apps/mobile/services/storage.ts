import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { storage } from './firebase';
// import * as ImageManipulator from 'expo-image-manipulator'; // Recommended dependency

/**
 * Upload an image with optimization and multi-size generation.
 * 
 * Note: multi-size generation requires 'expo-image-manipulator'.
 * If not available, it defaults to uploading the original with basic compression.
 */
export async function uploadProfilePhoto(uid: string, uri: string): Promise<{
  original: string;
  medium?: string;
  thumbnail?: string;
}> {
  const timestamp = Date.now();
  const basePath = `profilePhotos/${uid}/${timestamp}`;

  // 1. Upload Original (with basic compression from ImagePicker)
  const originalUrl = await uploadImage(uri, `${basePath}_original.jpg`);

  // 2. Optional: Generate and upload other sizes if manipulator is available
  // This is a structured placeholder for Step 15.2
  /*
  const medium = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 500 } }], { compress: 0.8 });
  const thumb = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 150 } }], { compress: 0.6 });
  
  const [mediumUrl, thumbUrl] = await Promise.all([
    uploadImage(medium.uri, `${basePath}_medium.jpg`),
    uploadImage(thumb.uri, `${basePath}_thumb.jpg`)
  ]);
  
  return { original: originalUrl, medium: mediumUrl, thumbnail: thumbUrl };
  */

  return { original: originalUrl };
}

/**
 * Generic helper to upload a blob to a specific path.
 */
export async function uploadImage(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);

  return getDownloadURL(storageRef);
}
