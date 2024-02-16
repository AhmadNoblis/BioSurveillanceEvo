import React, { useState } from 'react';

interface DropdownProps {
  label: string;
  options: { label: string; value: string; }[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selectedOptions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = (value: string) => {
    const newSelection = selectedOptions.includes(value)
      ? selectedOptions.filter((option) => option !== value)
      : [...selectedOptions, value];
    onChange(newSelection);
  };

  return (
    <div className="relative mb-4">
      <button
        className="p-2 bg-gray-200 rounded-md w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
      </button>
      {isOpen && (
        <ul className="absolute left-0 right-0 bg-white border border-gray-200 mt-1 rounded-md z-10">
          {options.map((option) => (
            <li
              key={option.value}
              className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedOptions.includes(option.value) ? "bg-gray-200" : ""}`}
              onClick={() => toggleSelection(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface ModifyPromptsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void; // Adjust based on your data structure
  initialData: any; // Adjust based on your data structure
}

const ModifyPromptsPopup: React.FC<ModifyPromptsPopupProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Dummy options for demonstration
  const promptsOptions = initialData.prompts.map((prompt: string) => ({ label: prompt, value: prompt }));
  const diseasesOptions = initialData.diseases.map((disease: string) => ({ label: disease, value: disease }));
  const regionsOptions = initialData.regionsCountries.map((region: string) => ({ label: region, value: region }));

  if (!isOpen) {
    return null;
  }

  const handleSaveChanges = () => {
    // Handle saving changes here
    console.log({ selectedPrompts, selectedDiseases, selectedRegions });
    onSave({ selectedPrompts, selectedDiseases, selectedRegions });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
  
      <h2 style={{ color: '#71717a', textAlign: 'center' }} className="text-xl font-semibold mb-4">Modify Selections</h2>
        <Dropdown label="Prompts" options={promptsOptions} selectedOptions={selectedPrompts} onChange={setSelectedPrompts} />
        <Dropdown label="Diseases" options={diseasesOptions} selectedOptions={selectedDiseases} onChange={setSelectedDiseases} />
        <Dropdown label="Regions/Countries" options={regionsOptions} selectedOptions={selectedRegions} onChange={setSelectedRegions} />
        <div className="flex justify-end border-t border-gray-200 mt-6 pt-4">
        <button onClick={handleSaveChanges} className="py-2 px-4 save-button text-white rounded transition">
          Save Changes
        </button>

        </div>
      </div>
    </div>
  );
};
  
export default ModifyPromptsPopup;