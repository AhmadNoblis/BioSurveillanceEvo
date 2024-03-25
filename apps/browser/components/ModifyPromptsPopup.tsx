

import React, { useState } from 'react';
import promptsData from "./prompts.json";
import TextField from "@/components/TextField";

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
        <ul
        className="absolute left-0 right-0 bg-white border border-gray-200 mt-1 rounded-md z-10"
        style={{ maxHeight: '200px', overflowY: 'auto' }} // Set a max height and enable scrolling
      >
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
  const [activeTab, setActiveTab] = useState('prompt'); // Added state for active tab
  const [inputValue, setInputValue] = useState(''); // State for the input field value


  // Dummy options for demonstration
  const promptsOptions = promptsData.prompts.map((prompt: string) => ({ label: prompt, value: prompt }));
  const diseasesOptions = promptsData.specificDiseases.map((disease: string) => ({ label: disease, value: disease }));
  const regionsOptions = promptsData.specificRegionsCountries.map((region: string) => ({ label: region, value: region }));

  if (!isOpen) {
    return null;
  }
  const renderInputField = () => {
    // Define a common onChange handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };
  
    // Define a common onKeyDown handler
    // Adjust this as necessary for your application's logic, such as submitting data
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        console.log("Enter key pressed with value:", inputValue);
        let type = '';
        switch(activeTab) {
          case 'prompt':
            type = 'prompt';
            break;
          case 'disease':
            type = 'disease';
            break;
          case 'region/country':
            type = 'region/country';
            break;
          default:
            console.error('Invalid type');
            return;
        }
    
        // The value to add is in inputValue
        const value = inputValue;
    
        // Send the data to the server
        fetch('http://localhost:3001/add-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type, value }),
        })
        .then(response => {
          const contentType = response.headers.get('content-type');
          if (!response.ok || !contentType || !contentType.includes('application/json')) {
            console.log(response);
            throw new Error('Non-JSON response received');

          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          setInputValue(''); // Clear the input value after successful submission
        })
        .catch(error => {
          console.error('Error:', error.message);
        });
      }
    };
  
    // Depending on the activeTab, render the TextField with specific placeholders
    // No need for a switch statement if the only difference is the placeholder text
    let placeholderText = '';
    switch(activeTab) {
      case 'prompt':
        placeholderText = "Enter prompt";
        break;
      case 'disease':
        placeholderText = "Enter disease";
        break;
      case 'region/country':
        placeholderText = "Enter region/country";
        break;
      default:
        return null; // Or handle this scenario differently if needed
    }
  
    return (
      <TextField
        type="text"
        placeholder={placeholderText}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full p-2 border rounded-l mb-4" // Adjust the styling as needed
      />
    );
  };
  
  const handleSaveChanges = () => {
    console.log('Save Changes clicked');
    const selectedPromptsFinal = selectedPrompts.length > 0 ? selectedPrompts : promptsOptions.map(option => option.value);
    const selectedDiseasesFinal = selectedDiseases.length > 0 ? selectedDiseases : diseasesOptions.map(option => option.value);
    const selectedRegionsFinal = selectedRegions.length > 0 ? selectedRegions : regionsOptions.map(option => option.value);

    const data = {
      prompts: selectedPromptsFinal,
      specificDiseases: selectedDiseasesFinal,
      specificRegionsCountries: selectedRegionsFinal
    }; 
    fetch('http://localhost:3001/save-selected-prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      onSave({ selectedPrompts: selectedPromptsFinal, selectedDiseases: selectedDiseasesFinal, selectedRegions: selectedRegionsFinal }); // Call onSave with the final selected data
      onClose(); // Close the popup
    })

  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h2 style={{ color: '#71717a', textAlign: 'center' }} className="text-xl font-semibold mb-4">Add Selections</h2> {/* Add Selections Header */}

      <div className="flex justify-around mb-4">
      <button
        className={`tab-button px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${activeTab === 'prompt' ? 'bg-zinc-400 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        onClick={() => setActiveTab('prompt')}
      >
        Prompt
      </button>
      <button
        className={`tab-button px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${activeTab === 'disease' ? 'bg-zinc-400 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        onClick={() => setActiveTab('disease')}
      >
        Disease
      </button>
      <button
        className={`tab-button px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${activeTab === 'region/country' ? 'bg-zinc-400 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        onClick={() => setActiveTab('region/country')}
      >
        Region/Country
      </button>
    </div>

        {renderInputField()}
      <h2 style={{ color: '#71717a', textAlign: 'center' }} className="text-xl font-semibold mb-4">Modify Selections</h2>
        <Dropdown label="Prompts" options={promptsOptions} selectedOptions={selectedPrompts} onChange={setSelectedPrompts} />
        <Dropdown label="Diseases" options={diseasesOptions} selectedOptions={selectedDiseases} onChange={setSelectedDiseases} />
        <Dropdown label="Regions/Countries" options={regionsOptions} selectedOptions={selectedRegions} onChange={setSelectedRegions} />
        <div className="flex justify-between border-t border-gray-200 mt-6 pt-4">
          <button onClick={onClose} className="py-2 px-4 cancel-button bg-red-500 text-white rounded transition">
            Cancel
          </button>
          <button onClick={handleSaveChanges} className="py-2 px-4 save-button bg-green-500 text-white rounded transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
  
  
};
  
export default ModifyPromptsPopup;
