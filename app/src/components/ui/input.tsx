import * as React from 'react';
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { useController } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import {
  I18nManager,
  TextInput as NTextInput,
  StyleSheet,
  View,
} from 'react-native';
import { tv } from 'tailwind-variants';

import colors from './colors';
import { Text } from './text';
import { Ionicons } from '@expo/vector-icons';

const inputTv = tv({
  slots: {
    container: 'mb-4',
    label: 'text-grey-100 mb-1 text-lg dark:text-neutral-100',
    input:
      'mt-0  font-inter text-base  font-medium leading-5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white',
  },

  variants: {
    focused: {
      true: {
        input: 'border-neutral-400 dark:border-neutral-300',
      },
    },
    error: {
      true: {
        input: 'border-danger-600',
        label: 'text-danger-600 dark:text-danger-600',
      },
    },
    disabled: {
      true: {
        input: 'bg-neutral-200',
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
});

export interface NInputProps extends TextInputProps {
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  isSearch?: boolean;
}

type TRule<T extends FieldValues> =
  | Omit<
      RegisterOptions<T>,
      'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
    >
  | undefined;

export type RuleType<T extends FieldValues> = { [name in keyof T]: TRule<T> };
export type InputControllerType<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: RuleType<T>;
};

interface ControlledInputProps<T extends FieldValues>
  extends NInputProps,
    InputControllerType<T> {}

export const Input = React.forwardRef<NTextInput, NInputProps>((props, ref) => {
  const { label, error, testID, className, disabled, isSearch, ...inputProps } =
    props;
  const [isFocussed, setIsFocussed] = React.useState(false);
  const onBlur = React.useCallback(() => setIsFocussed(false), []);
  const onFocus = React.useCallback(() => setIsFocussed(true), []);

  const styles = React.useMemo(
    () =>
      inputTv({
        error: Boolean(error),
        focused: isFocussed,
        disabled: Boolean(disabled),
      }),
    [error, isFocussed, disabled]
  );

  return (
    <View>
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className={styles.label()}
        >
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center ${isSearch ? 'rounded-full bg-slate-50' : 'rounded-xl'} border-[0.5px] p-2 px-4`}
      >
        <NTextInput
          testID={testID}
          ref={ref}
          placeholderTextColor={colors.neutral[400]}
          className={`${styles.input()}  ${className || ''} flex-1`}
          onBlur={onBlur}
          onFocus={onFocus}
          editable={!disabled}
          {...inputProps}
          style={StyleSheet.flatten([
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
            inputProps.multiline ? { textAlignVertical: 'top' } : {},
            inputProps.style,
          ])}
        />
        {isSearch && <Ionicons name="search-outline" size={20} color="black" />}
      </View>
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          className="text-sm text-danger-400 dark:text-danger-600"
        >
          {error}
        </Text>
      )}
    </View>
  );
});

// only used with react-hook-form
export const ControlledInput = React.forwardRef<
  NTextInput,
  ControlledInputProps<any>
>(function ControlledInput<T extends FieldValues>(
  props: ControlledInputProps<T>,
  ref: React.Ref<NTextInput>
) {
  const { name, control, rules, ...inputProps } = props;

  const { field, fieldState } = useController({ control, name, rules });

  // Merge refs: react-hook-form's field.ref and external ref
  const mergedRef = React.useCallback(
    (node: NTextInput | null) => {
      // Set react-hook-form's ref
      if (typeof field.ref === 'function') {
        field.ref(node);
      } else if (field.ref) {
        // eslint-disable-next-line react-compiler/react-compiler
        (field.ref as React.RefObject<NTextInput | null>).current = node;
      }

      // Set external ref
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.RefObject<NTextInput | null>).current = node;
      }
    },
    [field.ref, ref]
  );

  return (
    <Input
      ref={mergedRef}
      autoCapitalize="none"
      onChangeText={field.onChange}
      value={(field.value as string) || ''}
      {...inputProps}
      error={fieldState.error?.message}
    />
  );
});
