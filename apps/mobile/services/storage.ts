import {
  StorageReference,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image from a local URI to Firebase Storage.
 *
 * @param uri - Local file URI (e.g. from ImagePicker)
 * @param path - Target path in storage (e.g. 'kyc/uid/selfie.jpg')
 * @returns Public download URL
 */
export async function uploadImage(uri: string, path: string): Promise<string> {
  // Convert URI to Blob (React Native fetch works for local files)
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);

  return getDownloadURL(storageRef);
}
