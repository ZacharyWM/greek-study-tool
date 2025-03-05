export interface Word {
  id: number;
  text: string;
  parsing?: WordParsing;
  label?: string;
  labelPosition?: { x: number; y: number };
  labelWidth?: number;
  lexicalForm?: string;
  glossaryDefinition?: string;
}

export interface WordParsing {
  partOfSpeech: string;
  person?: string;
  number?: string;
  tense?: string;
  voice?: string;
  mood?: string;
  case?: string;
  gender?: string;
  degree?: string;
}

export interface Section {
  id: number;
  name: string;
  words: Word[];
  phrases: any[]; // We'll define this more specifically when we implement phrase functionality
  translation: string;
}

export interface PhraseType {
  id: string;
  name: string;
  color: string;
}
