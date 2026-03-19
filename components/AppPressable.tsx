import React from 'react';
import { Pressable, PressableProps, GestureResponderEvent } from 'react-native';
import { useAudio } from '@/contexts/AudioContext';

interface AppPressableProps extends PressableProps {
  // Optional flag to disable the click sound for this specific button
  silent?: boolean;
}

/**
 * A wrapper around React Native's Pressable that automatically plays a 
 * click sound on press.
 */
export const AppPressable = ({ onPress, silent, ...props }: AppPressableProps) => {
  const { playButtonClick } = useAudio();

  const handlePress = (event: GestureResponderEvent) => {
    if (!silent) {
      playButtonClick();
    }
    if (onPress) {
      onPress(event);
    }
  };

  return <Pressable {...props} onPress={handlePress} />;
};

export default AppPressable;
