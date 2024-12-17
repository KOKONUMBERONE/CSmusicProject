import React, { useState } from 'react';

interface CustomSoundFeatureProps {
  buttons: number[];
  onSoundUpload: (buttonNumber: number, file: File) => void;
}

const CustomSoundFeature: React.FC<CustomSoundFeatureProps> = ({ buttons, onSoundUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now());

  return (
    <div className="relative bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
  {/* Choose Button */}
  <label className="block mb-3 text-sm font-semibold text-gray-200">Choose Button:</label>
  <select
    className="w-full p-2 mb-4 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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

  {/* File Upload */}
  <div className="flex items-center space-x-4 mb-4">
    {/* Custom Choose File Button */}
    <label
      htmlFor="file-upload"
      className="cursor-pointer px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md transition"
    >
      Choose File
    </label>

    <input
      id="file-upload"
      key={fileInputKey}
      type="file"
      accept="audio/mp3"
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

    {/* Display Selected File Name */}
    {selectedFileName ? (
      <span className="text-sm text-green-400">{selectedFileName}</span>
    ) : (
      <span className="text-sm text-gray-400">No file selected</span>
    )}
  </div>

  {/* Map Sound to Button */}
  <button
    className={`w-full px-4 py-2 rounded font-semibold text-white shadow-md transition-all ${
      selectedButton && selectedFile
        ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
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

  );
};

export default CustomSoundFeature;
