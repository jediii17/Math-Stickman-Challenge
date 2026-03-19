import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';

interface AudioContextType {
  playButtonClick: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const buttonClickPlayer = useAudioPlayer(require('@/assets/sounds/button_click.mp3'));

  const playButtonClick = useCallback(() => {
    try {
      if (buttonClickPlayer) {
        buttonClickPlayer.seekTo(0);
        buttonClickPlayer.play();
      }
    } catch (error) {
      console.warn('Click sound failed', error);
    }
  }, [buttonClickPlayer]);

  return (
    <AudioContext.Provider value={{ playButtonClick }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
