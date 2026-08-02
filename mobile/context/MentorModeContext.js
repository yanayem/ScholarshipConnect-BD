import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MentorModeContext = createContext();

export function MentorModeProvider({ children }) {
  const [isMentorMode, setIsMentorMode] = useState(false);

  useEffect(() => {
    const loadMode = async () => {
      const mode = await AsyncStorage.getItem('mentor_mode');
      setIsMentorMode(mode === 'true');
    };
    loadMode();
  }, []);

  const toggleMentorMode = async (value) => {
    setIsMentorMode(value);
    await AsyncStorage.setItem('mentor_mode', value.toString());
  };

  return (
    <MentorModeContext.Provider value={{ isMentorMode, toggleMentorMode }}>
      {children}
    </MentorModeContext.Provider>
  );
}

export function useMentorMode() {
  return useContext(MentorModeContext);
}
