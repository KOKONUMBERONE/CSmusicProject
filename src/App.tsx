import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, PlayCircle, Save, Download } from 'lucide-react';
import CustomSoundFeature from './CustomSoundFeature';
import KeyboardControls from './KeyboardControls';



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
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now());
  const [customSounds, setCustomSounds] = useState<{ [key: number]: { url: string; file: File } }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [currentSequence, setCurrentSequence] = useState<{ number: number; delay: number }[]>([]);
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pressedButton, setPressedButton] = useState<number | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null);
  const [lastPressTime, setLastPressTime] = useState<number | null>(null);

  const handleCustomSoundUpload = (buttonNumber: number, file: File) => {
    const url = URL.createObjectURL(file); // Generate a temporary URL
    setCustomSounds((prev) => ({ ...prev, [buttonNumber]: { url, file } }));
  };

  
  const handleButtonClick = (number: number) => {
    setPressedButton(number);
    setTimeout(() => setPressedButton(null), 200);
  
    // Play custom or default sound
    const soundUrl = customSounds[number]?.url || `/sound/sound${number}.mp3`;
    const audio = new Audio(soundUrl);
    audio.play();
  
    if (isRecording) {
      const now = Date.now();
      const delay = lastPressTime ? now - lastPressTime : 0;
      setLastPressTime(now);
      setCurrentSequence((prev) => [...prev, { number, delay }]);
    }
  };
  

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
    if (!isRecording) {
      setCurrentSequence([]);
      setLastPressTime(null);
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
  
        // Calculate the delay before playing the sound
        const delay = currentAction.delay || 0;
  
        const timer = setTimeout(() => {
          // Play the sound
          const soundUrl = customSounds[currentAction.number]?.url
          ? customSounds[currentAction.number].url
          : `/sound/sound${currentAction.number}.mp3`;
        
  
          const audio = new Audio(soundUrl);
          audio.play();
  
          // Visual feedback for the button press
          setPressedButton(currentAction.number);
          setTimeout(() => setPressedButton(null), 400);
  
          // Move to the next button in the sequence
          setPlaybackIndex(playbackIndex + 1);
        }, delay); // Use the recorded delay for this action
  
        return () => clearTimeout(timer);
      } else {
        // Playback finished
        setIsPlaying(false);
        setPlaybackIndex(null);
      }
    }
  }, [isPlaying, playbackIndex, selectedSequenceId, savedSequences, currentSequence, customSounds]);
  
  const exportAudio = async () => {
    console.log('Export Audio process started.');
  
    const sequenceToExport = selectedSequenceId
      ? savedSequences.find((seq) => seq.id === selectedSequenceId)?.sequence
      : currentSequence;
  
    if (!sequenceToExport || sequenceToExport.length === 0) {
      console.warn('No sequence available to export.');
      return;
    }
  
    const offlineContext = new OfflineAudioContext(1, 44100 * 60, 44100);
    let currentTime = 0;
  
    for (const { number, delay } of sequenceToExport) {
      try {
        let audioBuffer;
    
        if (customSounds[number]?.file) {
          // Decode custom sound from File object
          const arrayBuffer = await customSounds[number].file.arrayBuffer();
          audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);
        } else {
          // Fetch default sound
          const response = await fetch(`/sound/sound${number}.mp3`);
          if (!response.ok) throw new Error(`Failed to fetch default sound: ${number}`);
          const arrayBuffer = await response.arrayBuffer();
          audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);
        }
    
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
    
        const startTime = currentTime + delay / 1000;
        source.start(startTime);
        currentTime = startTime + audioBuffer.duration;
    
      } catch (error) {
        console.error(`Error processing sound ${number}:`, error);
      }
    }
    
  
    console.log('Starting rendering of the final audio buffer.');
    offlineContext.startRendering().then((renderedBuffer) => {
      const wavBlob = bufferToWave(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
  
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sequence_export.wav';
      link.click();
  
      console.log('Download triggered.');
    });
  };
  
  

  const bufferToWave = (audioBuffer: AudioBuffer) => {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
  
    // 写入 WAV 头部
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + audioBuffer.length * numOfChan * 2 - 8, true);
    writeUTFBytes(view, 8, 'WAVE');
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * numOfChan * 2, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, audioBuffer.length * numOfChan * 2, true);
  
    // 写入音频数据，放大音量
    let offset = 44;
    for (let i = 0; i < numOfChan; i++) {
      const channelData = audioBuffer.getChannelData(i);
      for (let sample = 0; sample < audioBuffer.length; sample++) {
        const scaledSample = Math.max(-1, Math.min(1, channelData[sample])); // 保持原始音量
        view.setInt16(offset, scaledSample < 0 ? scaledSample * 0x8000 : scaledSample * 0x7fff, true);
        offset += 2;
      }
    }
  
    return new Blob([buffer], { type: 'audio/wav' });
  };
  

  const writeUTFBytes = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const buttons = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
    <h1 className="text-5xl font-bold mb-8 text-white">Neon Music Creator</h1>
    {/* Keyboard Controls */}
    <KeyboardControls onKeyTrigger={handleButtonClick} />
  
    {/* Launchpad */}
    <div className="grid grid-cols-4 gap-6 mb-12">
      {buttons.map((number, index) => (
        <button
          key={number}
          className={`w-24 h-24 text-3xl font-bold rounded-lg shadow-lg transition-all duration-300 ${
            pressedButton === number
              ? `${buttonColors[index]} text-white transform scale-110 animate-pulse`
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-xl hover:scale-105'
          }`}
          onClick={() => handleButtonClick(number)}
        >
          {number}
        </button>
      ))}
    </div>
  

  
      {/* Controls with Dropdown for Custom Sound */}
      <div className="flex space-x-4 mb-8 items-center">
        {/* Record Button */}
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
  
        {/* Playback Button */}
        <button
          className={`flex items-center justify-center px-6 py-3 rounded-full text-white font-semibold transition-colors bg-purple-500 hover:bg-purple-600 ${
            isPlaying ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={playSequence}
          disabled={isPlaying || (currentSequence.length === 0 && !selectedSequenceId)}
        >
          <PlayCircle className="w-5 h-5 mr-2" /> Playback
        </button>
  
        {/* Save Sequence */}
        <button
  className={`flex items-center justify-center min-w-[185px] px-6 py-3 rounded-full text-white font-semibold transition-colors ${
    currentSequence.length > 0
      ? 'bg-indigo-500 hover:bg-indigo-600 shadow-md'
      : 'bg-gray-400 cursor-not-allowed opacity-50'
  }`}
  onClick={saveSequence}
  disabled={isPlaying || currentSequence.length === 0}
>
  <Save className="w-5 h-5 mr-2" /> Save Sequence
</button>


  
        {/* Export Audio */}
        <button
          className="flex items-center justify-center min-w-[190px] px-6 py-3 rounded-full text-white font-semibold bg-blue-500 hover:bg-blue-600 shadow-md"
          onClick={exportAudio}
          disabled={currentSequence.length === 0 && !selectedSequenceId}
        >
          <Download className="w-5 h-5 mr-2" /> Export Audio
        </button>
  
        {/* Add Custom Sound Dropdown */}
        <div className="relative w-full max-w-md mx-auto">
  {/* Dropdown Trigger */}
  <button
    className="bg-yellow-500 text-white w-full px-6 py-3 rounded-lg hover:bg-yellow-600 shadow-lg font-semibold text-center"
  >
    Add Custom Sound
  </button>

  {/* Dropdown Content */}
  <div className="absolute mt-2 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 text-white z-10">
    {/* Button Selector */}
    <div className="p-4">
  <label className="block mb-2 text-sm font-semibold">Choose Button:</label>
  <select
    className="w-full p-4 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
    onChange={(e) => setSelectedButton(Number(e.target.value))}
    value={selectedButton || ''}
  >
    <option value="">-- Select Button --</option>
    {buttons.map((num) => (
      <option key={num} value={num}>
        Button {num}
      </option>
    ))}
  </select>
</div>

    {/* File Upload Section */}
    <div className="p-6 border-t border-gray-700">
  <label className="block mb-4 text-sm font-semibold">Upload Sound:</label>
  <div className="flex flex-col space-y-4">
    <input
      key={fileInputKey}
      type="file"
      accept="audio/mp3"
      id="file-upload"
      className="hidden"
      onChange={(e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          setSelectedFile(files[0]);
          setSelectedFileName(files[0].name);
          setFileInputKey(Date.now());
        } else {
          setSelectedFileName(null);
        }
      }}
    />
    <label
      htmlFor="file-upload"
      className="cursor-pointer flex items-center justify-center px-6 py-3 rounded-full text-white font-semibold bg-blue-500 hover:bg-blue-600 shadow-md"
    >
      Choose File
    </label>

    {/* Display file name */}
    <span className="text-sm text-green-400 text-center truncate">
      {selectedFileName || 'No file selected'}
    </span>
  </div>
</div>


    {/* Map Sound Button */}
    <div className="p-4 border-t border-gray-700">
      <button
        className={`w-full px-4 py-2 rounded font-semibold text-white transition-all ${
          selectedButton && selectedFile
            ? 'bg-green-500 hover:bg-green-600 shadow-md'
            : 'bg-gray-600 cursor-not-allowed opacity-50'
        }`}
        onClick={() => {
          if (selectedButton && selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setCustomSounds((prev) => ({ ...prev, [selectedButton]: { url, file: selectedFile } }));

            // Reset states
            setSelectedFile(null);
            setSelectedFileName(null);
            setSelectedButton(null);
            setFileInputKey(Date.now());
          }
        }}
        disabled={!selectedButton || !selectedFile}
      >
        Map Sound to Button
      </button>
    </div>
  </div>
</div>



      </div>
  
      {/* Current Sequence */}
      <div className="w-full flex justify-start space-x-8 px-8">
        <div className="w-1/3">
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
         {/* Saved Sequence */}
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
