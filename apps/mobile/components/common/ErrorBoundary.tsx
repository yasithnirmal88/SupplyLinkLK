import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RotateCcw } from 'lucide-react-native';
import { COLORS } from '../../constants/Colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Production-grade Error Boundary for the mobile application.
 * Step 21.1: Ensure Production Quality
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    // Future: Log to Sentry/Crashlytics
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
          <View className="items-center">
            <View className="w-20 h-20 bg-rose-50 rounded-full items-center justify-center mb-6">
              <AlertTriangle size={40} color="#E11D48" />
            </View>
            
            <Text className="text-2xl font-black text-slate-950 text-center mb-3">
              Something went wrong
            </Text>
            
            <Text className="text-slate-500 text-center text-base mb-8 leading-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            <Pressable
              onPress={() => this.handleReset()}
              className="flex-row items-center bg-slate-900 px-8 py-4 rounded-[2rem] shadow-lg shadow-slate-400/20"
            >
              <RotateCcw size={18} color="white" className="mr-2" />
              <Text className="text-white font-black uppercase tracking-widest ml-2">
                Try Again
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
