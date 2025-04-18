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
        const moodLower = parsing.mood.toLowerCase();
        classes.push(`mood-${moodLower}`);

        // If it's a participle, also add the case class for combined styling
        if (moodLower === "participle" && parsing.case) {
          classes.push(`case-${parsing.case.toLowerCase()}`);
        }
      }
      break;

    case "participle": // Handle participle as a separate part of speech
      classes.push("mood-participle");
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
