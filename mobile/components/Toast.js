/**
 * LEGACY TOAST BRIDGE: This component now connects to the Global Toast Context.
 * All pages using useToast() will now trigger the single global toast in RootLayout.
 */
import React from 'react';
import { useGlobalToast } from '../context/ToastContext';

export function useToast() {
  const { showToast } = useGlobalToast();

  // Return a null component because the actual Toast is now rendered globally in _layout.js
  return {
    showToast,
    ToastComponent: null
  };
}
