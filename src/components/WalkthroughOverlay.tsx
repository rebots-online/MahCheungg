'use client';

import React, { useEffect, useState } from 'react';
import { useWalkthrough } from '@/contexts/WalkthroughContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const WalkthroughOverlay = () => {
  const { isActive, currentStepIndex, steps, nextStep, prevStep, endWalkthrough } = useWalkthrough();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || !steps.length) return;

    const currentStep = steps[currentStepIndex];
    if (!currentStep.targetSelector) {
      setTargetElement(null);
      return;
    }

    // Find the target element
    const element = document.querySelector(currentStep.targetSelector) as HTMLElement;
    setTargetElement(element);

    if (element) {
      // Calculate position for the overlay
      const rect = element.getBoundingClientRect();
      const position = currentStep.position || 'bottom';

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - 200; // 200px above the element
          left = rect.left + rect.width / 2 - 150; // Centered horizontally
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 100; // Centered vertically
          left = rect.right + 20; // 20px to the right
          break;
        case 'bottom':
          top = rect.bottom + 20; // 20px below the element
          left = rect.left + rect.width / 2 - 150; // Centered horizontally
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 100; // Centered vertically
          left = rect.left - 320; // 320px to the left (card width)
          break;
      }

      setOverlayPosition({ top, left });
    }
  }, [isActive, currentStepIndex, steps]);

  if (!isActive || !steps.length) return null;

  const currentStep = steps[currentStepIndex];

  return (
    <>
      {/* Dimming overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={endWalkthrough}
      />

      {/* Highlight the target element if it exists */}
      {targetElement && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 10 + 'px',
            left: targetElement.getBoundingClientRect().left - 10 + 'px',
            width: targetElement.getBoundingClientRect().width + 20 + 'px',
            height: targetElement.getBoundingClientRect().height + 20 + 'px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            borderRadius: '4px',
          }}
        />
      )}

      {/* Instruction card */}
      <Card
        className="fixed z-50 w-[300px] walkthrough-card"
        style={{
          top: overlayPosition.top + 'px',
          left: overlayPosition.left + 'px',
        }}
      >
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          <p className="text-sm text-muted-foreground">Step {currentStepIndex + 1} of {steps.length}</p>
        </CardHeader>
        <CardContent>
          <p>{currentStep.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="mr-2"
            >
              Previous
            </Button>
            <Button onClick={nextStep}>
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={endWalkthrough}>
            Skip
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
