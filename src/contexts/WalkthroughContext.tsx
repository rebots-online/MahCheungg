'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type WalkthroughStep = {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for the element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left';
};

type WalkthroughContextType = {
  isActive: boolean;
  currentStepIndex: number;
  steps: WalkthroughStep[];
  startWalkthrough: (steps: WalkthroughStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  endWalkthrough: () => void;
};

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export const useWalkthrough = () => {
  const context = useContext(WalkthroughContext);
  if (context === undefined) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
};

export const WalkthroughProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<WalkthroughStep[]>([]);

  const startWalkthrough = (newSteps: WalkthroughStep[]) => {
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setIsActive(true);
    document.body.classList.add('walkthrough-active');
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endWalkthrough();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const endWalkthrough = () => {
    setIsActive(false);
    setSteps([]);
    document.body.classList.remove('walkthrough-active');
  };

  return (
    <WalkthroughContext.Provider
      value={{
        isActive,
        currentStepIndex,
        steps,
        startWalkthrough,
        nextStep,
        prevStep,
        endWalkthrough,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
};
