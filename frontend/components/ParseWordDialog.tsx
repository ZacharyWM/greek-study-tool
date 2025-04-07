import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import type { Word, WordParsing } from "../types/models";

interface ParseWordDialogProps {
  word: Word;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParse: (
    word: Word,
    parsing: WordParsing,
    lexicalForm: string,
    glossaryDefinition: string
  ) => void;
}

const initialParsing: WordParsing = {
  partOfSpeech: "",
  person: "",
  number: "",
  tense: "",
  voice: "",
  mood: "",
  case: "",
  gender: "",
  degree: "",
};

const ParseWordDialog: React.FC<ParseWordDialogProps> = ({
  word,
  open,
  onOpenChange,
  onParse,
}) => {
  const [parsing, setParsing] = useState<WordParsing>(initialParsing);
  const [lexicalForm, setLexicalForm] = useState("");
  const [glossaryDefinition, setGlossaryDefinition] = useState("");

  useEffect(() => {
    // Set initial values when the dialog opens or the word changes
    setParsing(word.parsing || initialParsing);
    setLexicalForm(word.lexicalForm || "");
    setGlossaryDefinition(word.glossaryDefinition || "");
  }, [word]);

  const handleParseChange = (key: keyof WordParsing, value: string) => {
    setParsing((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onParse(word, parsing, lexicalForm, glossaryDefinition);
    onOpenChange(false);
  };

  const renderSelect = (
    label: string,
    key: keyof WordParsing,
    options: string[]
  ) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Select
        onValueChange={(value) => handleParseChange(key, value)}
        value={parsing[key]}
      >
        <SelectTrigger id={key}>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option.toLowerCase()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {word.parsing ? "Edit Parsing" : "Parse Word"}: {word.text}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lexicalForm">Lexical Form</Label>
              <Input
                id="lexicalForm"
                value={lexicalForm}
                onChange={(e) => setLexicalForm(e.target.value)}
                placeholder="Enter lexical form"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="glossaryDefinition">Glossary Definition</Label>
              <Input
                id="glossaryDefinition"
                value={glossaryDefinition}
                onChange={(e) => setGlossaryDefinition(e.target.value)}
                placeholder="Enter glossary definition"
              />
            </div>
            {renderSelect("Part of Speech", "partOfSpeech", [
              "Noun",
              "Verb",
              "Adjective",
              "Adverb",
              "Pronoun",
              "Preposition",
              "Conjunction",
              "Particle",
              "Article",
            ])}

            {parsing.partOfSpeech === "verb" && (
              <>
                {renderSelect("Person", "person", ["1st", "2nd", "3rd"])}
                {renderSelect("Number", "number", ["Singular", "Plural"])}
                {renderSelect("Tense", "tense", [
                  "Present",
                  "Aorist",
                  "Imperfect",
                  "Future",
                  "Perfect",
                  "Pluperfect",
                ])}
                {renderSelect("Voice", "voice", [
                  "Active",
                  "Middle",
                  "Passive",
                ])}
                {renderSelect("Mood", "mood", [
                  "Indicative",
                  "Subjunctive",
                  "Imperative",
                  "Infinitive",
                  "Participle",
                  "Optative",
                ])}
              </>
            )}

            {parsing.partOfSpeech === "participle" && (
              <>
                {renderSelect("Tense", "tense", [
                  "Present",
                  "Aorist",
                  "Perfect",
                  "Future",
                ])}
                {renderSelect("Voice", "voice", [
                  "Active",
                  "Middle",
                  "Passive",
                ])}
                {renderSelect("Case", "case", [
                  "Nominative",
                  "Genitive",
                  "Dative",
                  "Accusative",
                  "Vocative",
                ])}
                {renderSelect("Number", "number", ["Singular", "Plural"])}
                {renderSelect("Gender", "gender", [
                  "Masculine",
                  "Feminine",
                  "Neuter",
                ])}
              </>
            )}

            {(parsing.partOfSpeech === "noun" ||
              parsing.partOfSpeech === "adjective" ||
              parsing.partOfSpeech === "pronoun" ||
              parsing.partOfSpeech === "article") && (
              <>
                {renderSelect("Case", "case", [
                  "Nominative",
                  "Genitive",
                  "Dative",
                  "Accusative",
                  "Vocative",
                ])}
                {renderSelect("Number", "number", ["Singular", "Plural"])}
                {renderSelect("Gender", "gender", [
                  "Masculine",
                  "Feminine",
                  "Neuter",
                ])}
              </>
            )}

            {parsing.partOfSpeech === "adjective" && (
              <>
                {renderSelect("Degree", "degree", [
                  "Positive",
                  "Comparative",
                  "Superlative",
                ])}
              </>
            )}
          </div>
        </ScrollArea>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} className="w-full sm:w-auto">
            {word.parsing ? "Update Parsing" : "Save Parsing"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParseWordDialog;
