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
import { useAuth0 } from "@auth0/auth0-react";

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
  type: "",
};

const ParseWordDialog: React.FC<ParseWordDialogProps> = ({
  word,
  open,
  onOpenChange,
  onParse,
}) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [parsing, setParsing] = useState<WordParsing>(initialParsing);
  const [lexicalForm, setLexicalForm] = useState("");
  const [glossaryDefinition, setGlossaryDefinition] = useState("");
  const [strongsData, setStrongsData] = useState<any>(null);

  function trimSpecialChars(str: string): string {
    // Regex matches unwanted chars at start (^) or end ($) of string
    return str.replace(
      /^[\s.,()[\]{}'"!?;:<>\\/-]+|[\s.,()[\]{}'"!?;:<>\\/-]+$/g,
      ""
    );
  }

  useEffect(() => {
    // Log the word prop when component loads or word changes
    console.log("ParseWordDialog - word prop:", word);

    // Set initial values when the dialog opens or the word changes
    setParsing(word.parsing || initialParsing);
    setLexicalForm(word.lexicalForm || "");
    setGlossaryDefinition(word.glossaryDefinition || "");

    const fetchStrongsData = async () => {
      if ((!word.glossaryDefinition || !word.lexicalForm) && isAuthenticated) {
        let fetchUrl = "";
        if (word.strongs) {
          fetchUrl = `/api/strongs/${trimSpecialChars(word.strongs)}`;
        } else {
          fetchUrl = `/api/word/${trimSpecialChars(word.text)}/strongs`;
        }
        try {
          const token = await getAccessTokenSilently();
          const res = await fetch(fetchUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            console.log("Strongs data fetched:", data);
            setStrongsData(data);
            if (
              data &&
              Array.isArray(data.definitions) &&
              data.definitions.length > 0
            ) {
              if (!word.glossaryDefinition) {
                setGlossaryDefinition(data.definitions[0].definition || "");
              }
              if (!word.lexicalForm) {
                setLexicalForm(data.lemma || "");
              }
            }
          } else {
            setStrongsData(null);
            console.error("Failed to fetch Strongs data:", await res.text());
          }
        } catch (err) {
          setStrongsData(null);
          console.error("Failed to fetch Strongs data:", err);
        }
      } else {
        setStrongsData(null);
      }
    };
    fetchStrongsData();
  }, [word, isAuthenticated, getAccessTokenSilently]);

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
            {word.parsing ? "Edit Parsing" : "Parse Word"}:{" "}
            <span className="greek-text">{word.text}</span>
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
              "Article",
              "Noun",
              "Pronoun",
              "Adjective",
              "Adverb",
              "Verb",
              "Preposition",
              "Conjunction",
              "Particle",
            ])}

            {(parsing.partOfSpeech === "article" ||
              parsing.partOfSpeech === "noun" ||
              parsing.partOfSpeech === "adjective" ||
              parsing.partOfSpeech === "pronoun") && (
              <>
                {renderSelect("Case", "case", [
                  "Nominative",
                  "Genitive",
                  "Dative",
                  "Accusative",
                  "Vocative", // should pronoun have vocative too?
                ])}
                {renderSelect("Gender", "gender", [
                  "Masculine",
                  "Feminine",
                  "Neuter",
                ])}
                {renderSelect("Number", "number", ["Singular", "Plural"])}
              </>
            )}
            {parsing.partOfSpeech === "pronoun" && (
              <>
                {renderSelect("Person", "person", ["1st", "2nd", "3rd"])}
                {renderSelect("Type", "type", [
                  "Personal",
                  "Demonstrative",
                  "Relative",
                  "Indefinite",
                  "Interrogative",
                  "Reflexive",
                  "Reciprocal",
                  "Possessive",
                ])}
              </>
            )}

            {(parsing.partOfSpeech === "adjective" ||
              parsing.partOfSpeech === "adverb") && (
              <>
                {renderSelect("Degree", "degree", [
                  "Positive",
                  "Comparative",
                  "Superlative",
                ])}
              </>
            )}

            {parsing.partOfSpeech === "verb" && (
              <>
                {renderSelect("Mood", "mood", [
                  "Indicative",
                  "Subjunctive",
                  "Imperative",
                  "Infinitive",
                  "Participle",
                  "Optative",
                ])}

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

                {[
                  "indicative",
                  "subjunctive",
                  "imperative",
                  "optative",
                ].includes(parsing.mood ?? "") && (
                  <>
                    {renderSelect("Person", "person", ["1st", "2nd", "3rd"])}
                    {renderSelect("Number", "number", ["Singular", "Plural"])}
                  </>
                )}

                {parsing.mood === "participle" && (
                  <>
                    {renderSelect("Number", "number", ["Singular", "Plural"])}
                    {renderSelect("Gender", "gender", [
                      "Masculine",
                      "Feminine",
                      "Neuter",
                    ])}
                    {renderSelect("Case", "case", [
                      "Nominative",
                      "Genitive",
                      "Dative",
                      "Accusative",
                      "Vocative",
                    ])}
                  </>
                )}
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
