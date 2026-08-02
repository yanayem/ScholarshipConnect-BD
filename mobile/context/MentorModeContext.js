import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MentorModeContext = createContext();

export const MentorModeProvider = ({ children }) => {
  const [isMentorMode, setIsMentorMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentorMode();
  }, []);

  const loadMentorMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('mentorMode');
      if (savedMode !== null) {
        setIsMentorMode(JSON.parse(savedMode));
      }
    } catch (error) {
      console.error('Error loading mentor mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMentorMode = async () => {
    try {
      const newMode = !isMentorMode;
      setIsMentorMode(newMode);
      await AsyncStorage.setItem('mentorMode', JSON.stringify(newMode));
    } catch (error) {
      console.error('Error toggling mentor mode:', error);
    }
  };

  return (
    <MentorModeContext.Provider value={{ isMentorMode, toggleMentorMode, loading }}>
      {children}
    </MentorModeContext.Provider>
  );
};

export const useMentorMode = () => {
  const context = useContext(MentorModeContext);
  if (context === undefined) {
    throw new Error('useMentorMode must be used within a MentorModeProvider');
  }
  return context;
};
