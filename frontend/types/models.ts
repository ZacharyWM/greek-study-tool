export interface Word {
  id: number;
  text: string;
  parsing?: WordParsing;
  label?: string;
  labelPosition?: { x: number; y: number };
  labelWidth?: number;
  lexicalForm?: string;
  glossaryDefinition?: string;
  strongs?: string;
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
  type?: string;
}

export interface Section {
  id: number;
  name: string;
  words: Word[];
  phrases: any[]; // We'll define this more specifically when we implement phrase functionality
  translation: string[];
}

export interface PhraseType {
  id: string;
  name: string;
  color: string;
}

export interface Book {
  id: number;
  title: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: number;
  bookId: number;
  number: number;
  verses?: Verse[];
}

export interface Verse {
  id: number;
  chapterId: number;
  number: number;
  words?: VerseWord[] | null;
}

export interface GlossaryDefinition {
  number: number;
  text: string;
}

// TODO - update api to return definitions with words
export interface VerseWord {
  id: number;
  verseId: number;
  text: string;
  lemma: string;
  strong: string;
  morph: string;
  definition: string;
}
