import React, { useState } from 'react';
import Modal from './ModalBase'; // Assuming ModalBase is your custom modal component
import Button from './Button'; // Your custom button component

interface PromptChangerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selection: { prompt: string; disease: string; region: string }) => void;
}

const PromptChanger: React.FC<PromptChangerProps> = ({ isOpen, onClose, onSave }) => {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  // Provided arrays
  const prompts = [
    "Virus Variant Tracking: \"Identify updates on new variants of [specific disease] reported by genomic surveillance networks.\"",
    "Latest Outbreak Reports: \"Find the latest reports on disease outbreaks by health organizations.\"",
    "Disease Surveillance Updates: \"Search for recent updates on disease surveillance from public health agencies worldwide.\"",
    "New Disease Cases: \"Locate information on new cases of [specific disease] reported in the last 24 hours.\"",
    "Vaccine Efficacy and Coverage: \"Retrieve latest findings on vaccine efficacy against [specific disease] and current vaccination coverage rates in [specific region/country].\"",
    "Public Health Advisories: \"Collect recent public health advisories and guidelines issued for [specific disease].\"",
    "Travel Health Notices: \"Find current travel health notices related to outbreaks of [specific disease].\"",
    "Zoonotic Disease Transmission: \"Search for new information on cases of zoonotic disease transmission to humans.\"",
    "Emerging Infectious Diseases: \"Identify reports on emerging infectious diseases from scientific publications and health organizations.\"",
    "Global Health Security: \"Retrieve information on global health security measures being implemented to prevent the spread of infectious diseases.\"",
    "Disease Modeling and Forecasts: \"Locate the latest disease modeling studies and forecasts for [specific disease].\"",
    "Epidemiological Studies: \"Find newly published epidemiological studies on [specific disease].\"",
    "Healthcare System Impact: \"Search for reports on the impact of [specific disease] on healthcare systems in [specific region/country].\"",
    "International Health Regulations: \"Retrieve information on International Health Regulations (IHR) compliance and reporting related to [specific disease].\"",
    "Social Media Monitoring for Disease Outbreaks: \"Monitor social media for mentions of symptoms or outbreaks related to [specific disease] in [specific region/country].\"",
    "Environmental Factors in Disease Spread: \"Identify reports on environmental factors contributing to the spread of [specific disease].\"",
    "Pharmaceutical and Therapeutic Developments: \"Find the latest developments in pharmaceuticals and therapeutics for treating [specific disease].\"",
    "Outbreak Response and Containment Efforts: \"Search for information on outbreak response and containment efforts for [specific disease] by [specific region/country].\""
];

const specificDiseases = [
  "COVID-19",
  "Ebola",
  "Zika virus",
  "Influenza",
  "Malaria",
  "Dengue fever",
  "Cholera",
  "Tuberculosis",
  "HIV/AIDS",
];

const specificRegionsCountries = [
  "United States",
  "Brazil",
  "India",
  "China",
  "South Africa",
  "United Kingdom",
  "Australia",
  "Nigeria",
  "Russia",
];


  const handleSave = () => {
    onSave({
      prompt: selectedPrompt,
      disease: selectedDisease,
      region: selectedRegion,
    });
    onClose(); // Close modal after saving
  };

  return (
    <Modal isOpen={isOpen} title="Modify Prompts" onClose={onClose}>
      <div className="space-y-4 p-4 border-t-4 border-green-500 bg-zinc-700">
        <div>
          <label htmlFor="prompt-select" className="block text-sm font-medium text-gray-300">Prompt</label>
          <select
            id="prompt-select"
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select a prompt</option>
            {prompts.map((prompt, index) => (
              <option key={index} value={prompt}>{prompt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="disease-select" className="block text-sm font-medium text-gray-300">Disease</label>
          <select
            id="disease-select"
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select a specific disease</option>
            {specificDiseases.map((disease, index) => (
              <option key={index} value={disease}>{disease}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="region-select" className="block text-sm font-medium text-gray-300">Region/Country</label>
          <select
            id="region-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select a region/country</option>
            {specificRegionsCountries.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PromptChanger;
