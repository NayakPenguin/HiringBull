import React, { useRef, useState, useEffect } from 'react';
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
  autoFocus = true 
}: OTPInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Split value into array for display
  const otpValues = value.split('').concat(Array(length - value.length).fill(''));

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // Handle paste - distribute digits across boxes
      const digits = digit.slice(0, length);
      onChange(digits);
      const nextIndex = Math.min(digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Build new value
    const newValue = value.split('');
    newValue[index] = digit;
    const joinedValue = newValue.join('').slice(0, length);
    onChange(joinedValue);

    // Move to next input if digit entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // If current box is empty, move to previous and clear it
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBoxPress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <Pressable
          key={index}
          onPress={() => handleBoxPress(index)}
          style={[
            styles.box,
            focusedIndex === index && styles.boxFocused,
            otpValues[index] && styles.boxFilled,
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
            maxLength={index === 0 ? length : 1} // Allow paste on first box
            selectTextOnFocus
            caretHidden
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
