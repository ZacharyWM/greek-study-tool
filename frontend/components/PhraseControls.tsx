import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { PhraseType } from "../types/models";
import React from "react";

interface PhraseControlsProps {
  selectedPhraseType: PhraseType;
  onPhraseTypeChange: (type: PhraseType) => void;
}

const PhraseControls: React.FC<PhraseControlsProps> = ({
  selectedPhraseType,
  onPhraseTypeChange,
}) => {
  return (
    <div className="flex items-center gap-4">
      <Select
        value={selectedPhraseType.id}
        onValueChange={(value) =>
          onPhraseTypeChange({ id: value, name: value, color: "#000000" })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select phrase type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="prepositional">Prepositional</SelectItem>
          <SelectItem value="participial">Participial</SelectItem>
          <SelectItem value="infinitive">Infinitive</SelectItem>
          <SelectItem value="object">Object</SelectItem>
          <SelectItem value="relative">Relative</SelectItem>
          <SelectItem value="genitive">Genitive Absolute</SelectItem>
          <SelectItem value="subject">Subject</SelectItem>
          <SelectItem value="predicate">Predicate</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground">
        Highlight text and press Shift + {"{"} to create phrase
      </span>
    </div>
  );
};

export default PhraseControls;
