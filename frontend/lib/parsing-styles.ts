import type { WordParsing } from "../types/models";

export function getParsingClass(parsing: WordParsing): string {
  const classes: string[] = ["parsed-word"];

  switch (parsing.partOfSpeech.toLowerCase()) {
    case "article":
    case "noun":
    case "pronoun":
      if (parsing.case) {
        classes.push(`case-${parsing.case.toLowerCase()}`);
      }
      break;

    case "verb":
      if (parsing.mood) {
        classes.push(`mood-${parsing.mood.toLowerCase()}`);
      }
      break;

    case "participle":
      classes.push("participle");
      if (parsing.case) {
        classes.push(`case-${parsing.case.toLowerCase()}`);
      }
      break;

    case "adverb":
      classes.push("adverb");
      break;

    case "adjective":
      classes.push("adjective");
      if (parsing.case) {
        classes.push(`case-${parsing.case.toLowerCase()}`);
      }
      break;

    case "preposition":
      classes.push("preposition");
      break;

    case "conjunction":
      classes.push("conjunction");
      break;
  }

  return classes.join(" ");
}
