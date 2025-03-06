import React from "react";
import { Button } from "../components/ui/button";
import { Save, Upload } from "lucide-react";
import type { Section } from "../types/models";

interface SaveLoadButtonsProps {
  sections: Section[];
  onLoad: (loadedSections: Section[]) => void;
}

const SaveLoadButtons: React.FC<SaveLoadButtonsProps> = ({
  sections,
  onLoad,
}) => {
  const handleSave = () => {
    const data = JSON.stringify(sections);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "greek-bible-study-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedSections = JSON.parse(
            e.target?.result as string
          ) as Section[];
          onLoad(loadedSections);
        } catch (error) {
          console.error("Error parsing loaded file:", error);
          alert("Error loading file. Please make sure it's a valid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button onClick={handleSave} className="flex items-center">
        <Save className="mr-2 h-4 w-4" />
        Save Progress
      </Button>
      <label htmlFor="load-file" className="cursor-pointer">
        {/* <Button as="span" className="flex items-center"> */}
        <Button className="flex items-center">
          <Upload className="mr-2 h-4 w-4" />
          Load Progress
        </Button>
      </label>
      <input
        id="load-file"
        type="file"
        accept=".json"
        onChange={handleLoad}
        className="hidden"
      />
    </div>
  );
};

export default SaveLoadButtons;
