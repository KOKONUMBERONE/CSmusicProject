// import React, { useState } from 'react';

// interface CustomSoundManagerProps {
//   buttons: number[];
//   customSounds: { [key: number]: string };
//   setCustomSounds: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>;
// }

// const CustomSoundManager: React.FC<CustomSoundManagerProps> = ({
//   buttons,
//   customSounds,
//   setCustomSounds,
// }) => {
//   const [showDropdown, setShowDropdown] = useState(false);

//   const handleCustomSoundUpload = (e: React.ChangeEvent<HTMLInputElement>, number: number) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setCustomSounds((prev) => ({ ...prev, [number]: url }));
//     }
//   };

//   return (
//     <div className="relative">
//       <button
//         className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
//         onClick={() => setShowDropdown((prev) => !prev)}
//       >
//         Manage Sounds
//       </button>

//       {showDropdown && (
//         <div className="absolute top-full mt-2 bg-gray-800 text-white rounded shadow-lg w-72 p-4 z-10">
//           <h2 className="text-lg font-semibold mb-4">Assign Custom Sounds</h2>
//           {buttons.map((number) => (
//             <div key={number} className="flex items-center justify-between mb-2">
//               <span>Button {number}</span>
//               <input
//                 type="file"
//                 accept="audio/*"
//                 className="text-gray-300 text-sm"
//                 onChange={(e) => handleCustomSoundUpload(e, number)}
//               />
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomSoundManager;
