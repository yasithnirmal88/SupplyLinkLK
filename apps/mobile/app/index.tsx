import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D6A4F' }}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}