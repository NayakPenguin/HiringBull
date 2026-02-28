import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TextInput, View, Pressable, StyleSheet } from 'react-native';

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
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Guard against rapid duplicate calls from Android keyboard
  const lastValue = useRef(value);

  // Split value into array for display
  const otpValues = value
    .split('')
    .concat(Array(length - value.length).fill(''));

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [autoFocus]);

  // Keep ref in sync
  useEffect(() => {
    lastValue.current = value;
  }, [value]);

  const handleChange = useCallback(
    (text: string, index: number) => {
      // Only allow digits
      const digit = text.replace(/[^0-9]/g, '');

      if (digit.length > 1) {
        // Handle paste — distribute digits across boxes
        const digits = digit.slice(0, length);
        if (digits === lastValue.current) return; // duplicate guard
        lastValue.current = digits;
        onChange(digits);
        const nextIndex = Math.min(digits.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        return;
      }

      // Build new value
      const newValue = lastValue.current.split('');
      // Pad to current index
      while (newValue.length <= index) newValue.push('');
      newValue[index] = digit;
      const joined = newValue.join('').replace(/\s/g, '').slice(0, length);

      if (joined === lastValue.current) return; // duplicate guard
      lastValue.current = joined;
      onChange(joined);

      // Move to next input if digit entered
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [length, onChange]
  );

  const handleKeyPress = useCallback(
    (e: any, index: number) => {
      if (e.nativeEvent.key === 'Backspace') {
        if (!otpValues[index] && index > 0) {
          // Current box empty → move to previous and clear it
          const newValue = lastValue.current.split('');
          newValue[index - 1] = '';
          const joined = newValue.join('');
          lastValue.current = joined;
          onChange(joined);
          inputRefs.current[index - 1]?.focus();
        } else {
          // Clear current box
          const newValue = lastValue.current.split('');
          newValue[index] = '';
          const joined = newValue.join('');
          lastValue.current = joined;
          onChange(joined);
        }
      }
    },
    [otpValues, onChange]
  );

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleBoxPress = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <Pressable
          key={index}
          onPress={() => handleBoxPress(index)}
          style={[
            styles.box,
            focusedIndex === index && styles.boxFocused,
            !!otpValues[index] && styles.boxFilled,
          ]}
        >
          <TextInput
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={styles.input}
            value={otpValues[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="number-pad"
            maxLength={index === 0 ? length : 1}
            selectTextOnFocus
            caretHidden
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
          />
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
  input: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    color: '#171717',
  },
});
