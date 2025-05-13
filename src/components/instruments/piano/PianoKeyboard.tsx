
import React from 'react';
import PianoKey from './PianoKey';
import { ThemeType } from './PianoTheme';

interface PianoKeyboardProps {
  whiteKeys: Array<{
    note: string;
    octave: number;
    isBlack: boolean;
    key: string;
    isActive: boolean;
    keyboardShortcut?: string;
  }>;
  blackKeys: Array<{
    note: string;
    octave: number;
    isBlack: boolean;
    key: string;
    isActive: boolean;
    keyboardShortcut?: string;
    showBlackCord?: boolean;
  }>;
  themeClasses: {
    container: string;
    whiteKey: string;
    blackKey: string;
    activeWhiteKey: string;
    activeBlackKey: string;
  };
  playNote: (note: string, octave: number) => void;
  theme: ThemeType;
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  whiteKeys,
  blackKeys,
  themeClasses,
  playNote,
  theme
}) => {
  return (
    <div className={themeClasses.container}>
      <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
        <div className="flex">
          {blackKeys.map(({ note, octave, isActive, keyboardShortcut, showBlackCord }) => (
            <PianoKey
              key={`${note}${octave}`}
              note={note}
              octave={octave}
              isBlack
              onPlay={playNote}
              isPlaying={isActive}
              keyboardShortcut={keyboardShortcut}
              className={isActive ? themeClasses.activeBlackKey : themeClasses.blackKey}
              showCord={showBlackCord}
              theme={theme}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-center">
        {whiteKeys.map(({ note, octave, isActive, keyboardShortcut }) => (
          <PianoKey
            key={`${note}${octave}`}
            note={note}
            octave={octave}
            onPlay={playNote}
            isPlaying={isActive}
            keyboardShortcut={keyboardShortcut}
            className={isActive ? themeClasses.activeWhiteKey : themeClasses.whiteKey}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
};

export default PianoKeyboard;
