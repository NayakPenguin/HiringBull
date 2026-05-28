import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { usePost } from '@/api';
import {
  FocusAwareStatusBar,
  Text,
  View,
} from '@/components/ui';
import { showGlobalLoading, hideGlobalLoading } from '@/lib';

export default function Post() {
  const local = useLocalSearchParams<{ id: string }>();

  const { data, isPending, isError } = usePost({
    //@ts-ignore
    variables: { id: local.id },
  });

  // Show global loading when fetching
  React.useEffect(() => {
    if (isPending) {
      showGlobalLoading();
    } else {
      hideGlobalLoading();
    }
  }, [isPending]);

  if (isPending) {
    return (
      <View className="flex-1">
        <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
        <FocusAwareStatusBar />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1 justify-center p-3">
        <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
        <FocusAwareStatusBar />
        <Text className="text-center">Error loading post</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-3 ">
      <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
      <FocusAwareStatusBar />
      <Text className="text-xl">{data.title}</Text>
      <Text>{data.body} </Text>
    </View>
  );
}
