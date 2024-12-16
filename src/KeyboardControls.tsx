import { useEffect } from 'react';

interface KeyboardControlsProps {
  onKeyTrigger: (buttonNumber: number) => void;
}

const keyMappings: { [key: string]: number } = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "0": 10,
  "q": 11,
  "w": 12,
  "e": 13,
  "r": 14,
  "t": 15,
  "y": 16,
};

const KeyboardControls: React.FC<KeyboardControlsProps> = ({ onKeyTrigger }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const buttonNumber = keyMappings[e.key.toLowerCase()];
      if (buttonNumber) {
        onKeyTrigger(buttonNumber);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeyTrigger]);

  return null; // No UI, just event listeners
};

export default KeyboardControls;
