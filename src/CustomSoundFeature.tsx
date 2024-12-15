import React, { useState } from 'react';

interface CustomSoundProps {
  buttonNumber: number;
  onCustomSoundUpload: (number: number, soundUrl: string) => void;
}

const CustomSoundFeature: React.FC<CustomSoundProps> = ({
  buttonNumber,
  onCustomSoundUpload,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileName(file.name);
      onCustomSoundUpload(buttonNumber, url);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        accept="audio/mp3"
        id={`upload-${buttonNumber}`}
        className="hidden"
        onChange={handleFileChange}
      />
      <label
        htmlFor={`upload-${buttonNumber}`}
        className="cursor-pointer text-sm text-white bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
      >
        Upload Sound
      </label>
      {fileName && (
        <span className="text-xs text-green-400">Uploaded: {fileName}</span>
      )}
    </div>
  );
};

export default CustomSoundFeature;
