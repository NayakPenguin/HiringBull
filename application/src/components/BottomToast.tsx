import React, { useEffect } from 'react';
import { Animated } from 'react-native';
import { Text, View } from '@/components/ui';

export function BottomToast({
  message,
  type,
  visible,
  onHide,
}: {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onHide: () => void;
}) {
  const translateY = React.useRef(new Animated.Value(80)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        zIndex: 50,
      }}
    >
      <View
        className={`rounded-full px-5 py-3 ${
          type === 'success' ? 'bg-neutral-700' : 'bg-red-600'
        }`}
        style={{ opacity: 0.75 }}
      >
        <Text className="text-sm text-white">{message}</Text>
      </View>
    </Animated.View>
  );
}
