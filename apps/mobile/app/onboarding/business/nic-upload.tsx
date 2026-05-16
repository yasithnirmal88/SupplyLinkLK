import NicUploadScreen from '../supplier/nic-upload';

/**
 * Re-using the NIC upload component with different navigation context.
 * In a production app, we'd refactor the common logic into a component,
 * but for this rapid scaffold specifically matching the requested path:
 */
export default function BusinessNicUpload() {
  return <NicUploadScreen />;
}
