import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, PlayCircle, Save } from 'lucide-react';

interface SavedSequence {
  id: string;
  sequence: { number: number; delay: number }[];
}

const buttonColors = [
  'bg-green-400',
  'bg-blue-400',
  'bg-pink-400',
  'bg-purple-400',
  'bg-yellow-400',
  'bg-red-400',
  'bg-indigo-400',
  'bg-orange-400',
  'bg-teal-400',
  'bg-lime-400',
  'bg-cyan-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-violet-400',
  'bg-fuchsia-400',
  'bg-emerald-400',
];

function App() {
  const [currentSequence, setCurrentSequence] = useState<{ number: number; delay: number }[]>([]);
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pressedButton, setPressedButton] = useState<number | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null);
  const [lastPressTime, setLastPressTime] = useState<number | null>(null); // Track the time of the last button press

  const handleButtonClick = (number: number) => {
    setPressedButton(number);
    setTimeout(() => setPressedButton(null), 200);

    // Play the corresponding sound
    const audio = new Audio(`/sounds/sound${number}.mp3`);
    audio.play();

    if (isRecording) {
      const now = Date.now();
      const delay = lastPressTime ? now - lastPressTime : 0; // Calculate delay since last button press
      setLastPressTime(now);

      setCurrentSequence((prev) => [...prev, { number, delay }]);
    }
  };

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
    if (!isRecording) {
      setCurrentSequence([]); // Reset sequence when starting a new recording
      setLastPressTime(null); // Reset timing
    }
  };

  const saveSequence = () => {
    if (currentSequence.length > 0) {
      const newSequence: SavedSequence = {
        id: new Date().toISOString(),
        sequence: currentSequence,
      };
      setSavedSequences((prev) => [...prev, newSequence]);
      setCurrentSequence([]);
    }
  };

  const playSequence = useCallback(() => {
    const sequenceToPlay = selectedSequenceId
      ? savedSequences.find((seq) => seq.id === selectedSequenceId)?.sequence
      : currentSequence;

    if (sequenceToPlay && sequenceToPlay.length > 0) {
      setIsPlaying(true);
      setPlaybackIndex(0);
    }
  }, [selectedSequenceId, savedSequences, currentSequence]);

  useEffect(() => {
    if (isPlaying && playbackIndex !== null) {
      const sequenceToPlay = selectedSequenceId
        ? savedSequences.find((seq) => seq.id === selectedSequenceId)?.sequence
        : currentSequence;

      if (sequenceToPlay && playbackIndex < sequenceToPlay.length) {
        const currentAction = sequenceToPlay[playbackIndex];

        const timer = setTimeout(() => {
          setPressedButton(currentAction.number);

          // Play sound for the current button
          const audio = new Audio(`/sounds/sound${currentAction.number}.mp3`);
          audio.play();

          setTimeout(() => setPressedButton(null), 400);
          setPlaybackIndex(playbackIndex + 1);
        }, currentAction.delay); // Use the recorded delay

        return () => clearTimeout(timer);
      } else {
        setIsPlaying(false);
        setPlaybackIndex(null);
      }
    }
  }, [isPlaying, playbackIndex, selectedSequenceId, savedSequences, currentSequence]);

  const buttons = Array.from({ length: 16 }, (_, i) => i + 1); // Generate numbers 1-16 for the 4x4 grid

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">Neon Music Creator</h1>
      <div className="grid grid-cols-4 gap-4 mb-8"> {/* Adjust grid to 4x4 */}
        {buttons.map((number, index) => (
          <button
            key={number}
            className={`w-20 h-20 text-2xl font-bold rounded-lg shadow-lg transition-all duration-300 ${
              pressedButton === number
                ? `${buttonColors[index]} text-white transform scale-110 animate-pulse`
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => handleButtonClick(number)}
            disabled={isPlaying}
          >
            {number}
          </button>
        ))}
      </div>
      <div className="flex space-x-4 mb-8">
        <button
          className={`flex items-center justify-center px-6 py-3 rounded-full text-white font-semibold transition-colors ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
          onClick={toggleRecording}
          disabled={isPlaying}
        >
          {isRecording ? (
            <>
              <Square className="w-5 h-5 mr-2" /> Stop Recording
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" /> Record
            </>
          )}
        </button>
        <button
          className={`flex items-center justify-center px-6 py-3 rounded-full text-white font-semibold transition-colors bg-purple-500 hover:bg-purple-600 ${
            isPlaying ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={playSequence}
          disabled={isPlaying || (currentSequence.length === 0 && !selectedSequenceId)}
        >
          <PlayCircle className="w-5 h-5 mr-2" /> Playback
        </button>
        <button
          className={`flex items-center justify-center px-6 py-3 rounded-full text-white font-semibold transition-colors ${
            currentSequence.length > 0
              ? 'bg-indigo-500 hover:bg-indigo-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={saveSequence}
          disabled={isPlaying || currentSequence.length === 0}
        >
          <Save className="w-5 h-5 mr-2" /> Save Sequence
        </button>
      </div>
      <div className="w-full max-w-2xl flex space-x-8">
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-2 text-white">Current Sequence:</h2>
          <p className="text-lg mb-4">
            {currentSequence.map((action, index) => (
              <span
                key={index}
                className={`inline-block px-3 py-2 mx-1 rounded-full ${buttonColors[action.number - 1]} ${
                  playbackIndex !== null && index < playbackIndex
                    ? 'opacity-50'
                    : playbackIndex === index
                    ? 'animate-pulse transform scale-110'
                    : ''
                }`}
              >
                {action.number}
              </span>
            ))}
          </p>
        </div>
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-2 text-white">Saved Sequences:</h2>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {savedSequences.map((seq) => (
              <li
                key={seq.id}
                className={`p-2 rounded cursor-pointer ${
                  selectedSequenceId === seq.id ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => setSelectedSequenceId(seq.id)}
              >
                <span className="font-semibold text-white">
                  {new Date(seq.id).toLocaleTimeString()}:
                </span>{' '}
                {seq.sequence.map((action, index) => (
                  <span
                    key={index}
                    className={`inline-block px-2 py-1 mx-1 rounded-full ${buttonColors[action.number - 1]}`}
                  >
                    {action.number}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
