import React from 'react';
import type { PressableProps, View } from 'react-native';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

const button = tv({
  slots: {
    container: 'flex flex-row items-center justify-center rounded-xl px-4',
    label: 'font-inter text-base font-semibold',
    indicator: 'h-6 text-white',
  },

  variants: {
    variant: {
      default: {
        container: 'bg-primary-500',
        label: 'text-white',
        indicator: 'text-white',
      },
      secondary: {
        container: 'bg-secondary-500',
        label: 'text-white',
        indicator: 'text-white',
      },
      outline: {
        container: 'border-2 border-primary-500 bg-transparent',
        label: 'text-primary-600',
        indicator: 'text-primary-600',
      },
      'outline-secondary': {
        container: 'border-2 border-secondary-500 bg-transparent',
        label: 'text-secondary-600',
        indicator: 'text-secondary-600',
      },
      destructive: {
        container: 'bg-danger-500',
        label: 'text-white',
        indicator: 'text-white',
      },
      ghost: {
        container: 'bg-transparent',
        label: 'text-neutral-700 dark:text-neutral-300',
        indicator: 'text-neutral-700 dark:text-neutral-300',
      },
      link: {
        container: 'bg-transparent',
        label: 'text-primary-600 underline',
        indicator: 'text-primary-600',
      },
    },
    size: {
      default: {
        container: 'h-12 px-4',
        label: 'text-base',
      },
      lg: {
        container: 'h-14 px-8',
        label: 'text-lg',
      },
      sm: {
        container: 'h-10 px-3',
        label: 'text-sm',
        indicator: 'h-2',
      },
      icon: { container: 'size-10' },
    },
    disabled: {
      true: {
        container: 'bg-neutral-200 dark:bg-neutral-800 opacity-60',
        label: 'text-neutral-400 dark:text-neutral-500',
        indicator: 'text-neutral-400 dark:text-neutral-500',
      },
    },
    fullWidth: {
      true: {
        container: '',
      },
      false: {
        container: 'self-center',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    disabled: false,
    fullWidth: true,
    size: 'default',
  },
});

type ButtonVariants = VariantProps<typeof button>;
type Props = ButtonVariants &
  Omit<PressableProps, 'disabled'> & {
    label?: string;
    loading?: boolean;
    className?: string;
    textClassName?: string;
  };

export const Button = React.forwardRef<View, Props>(
  (
    {
      label: text,
      loading = false,
      variant = 'default',
      disabled = false,
      size = 'default',
      className = '',
      testID,
      textClassName = '',
      ...props
    },
    ref
  ) => {
    const styles = React.useMemo(
      () => button({ variant, disabled, size }),
      [variant, disabled, size]
    );

    return (
      <Pressable
        disabled={disabled || loading}
        className={styles.container({ className })}
        {...props}
        ref={ref}
        testID={testID}
      >
        {props.children ? (
          props.children
        ) : (
          <>
            {loading ? (
              <ActivityIndicator
                size="small"
                className={styles.indicator()}
                testID={testID ? `${testID}-activity-indicator` : undefined}
              />
            ) : (
              <Text
                testID={testID ? `${testID}-label` : undefined}
                className={styles.label({ className: textClassName })}
              >
                {text}
              </Text>
            )}
          </>
        )}
      </Pressable>
    );
  }
);
