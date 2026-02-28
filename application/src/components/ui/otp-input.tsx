import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TextInput, View, Pressable, StyleSheet, Platform } from 'react-native';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  autoFocus = true 
}: OTPInputProps) {
  // Use a single hidden TextInput approach to avoid multi-box focus issues
  const hiddenInputRef = useRef<TextInput | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Split value into array for display
  const otpValues = value.split('').concat(Array(length - value.length).fill(''));
  const activeIndex = Math.min(value.length, length - 1);

  useEffect(() => {
    if (autoFocus) {
      // Small delay to let layout settle
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleChange = useCallback((text: string) => {
    // Only allow digits
    const digits = text.replace(/[^0-9]/g, '').slice(0, length);
    console.log('[OTPInput] handleChange: raw =', JSON.stringify(text), '| cleaned =', digits);
    onChange(digits);
  }, [length, onChange]);

  const handleKeyPress = useCallback((e: any) => {
    if (e.nativeEvent.key === 'Backspace' && value.length === 0) {
      // Already empty, do nothing
      return;
    }
  }, [value]);

  const handleBoxPress = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  return (
    <View style={styles.container}>
      {/* Hidden input that captures all keyboard input */}
      <TextInput
        ref={hiddenInputRef}
        value={value}
        onChangeText={handleChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        caretHidden
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        style={styles.hiddenInput}
      />

      {/* Visual boxes */}
      {Array.from({ length }).map((_, index) => (
        <Pressable
          key={index}
          onPress={handleBoxPress}
          style={[
            styles.box,
            isFocused && index === activeIndex && styles.boxFocused,
            otpValues[index] && styles.boxFilled,
          ]}
        >
          <View style={styles.digitContainer}>
            <TextInput
              style={styles.input}
              value={otpValues[index]}
              editable={false}
              pointerEvents="none"
            />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFocused: {
    borderColor: '#171717',
    backgroundColor: '#fff',
  },
  boxFilled: {
    borderColor: '#171717',
    backgroundColor: '#fff',
  },
  digitContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  input: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    color: '#171717',
  },
});
