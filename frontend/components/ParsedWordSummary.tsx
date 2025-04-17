
// ParsedWordSummary.tsx - updated for Oxford Scholar theme
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import type { Word } from "../types/models";

interface ParsedWordSummaryProps {
  word: Word;
}

const ParsedWordSummary: React.FC<ParsedWordSummaryProps> = ({ word }) => {
  return (
    <Card className="w-64 academic-card">
      <CardHeader className="academic-card-header">
        <CardTitle className="text-lg">Word: {word.text}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <dl className="space-y-2">
          {word.lexicalForm && (
            <>
              <dt className="font-semibold">Lexical Form:</dt>
              <dd>{word.lexicalForm}</dd>
            </>
          )}
          {word.glossaryDefinition && (
            <>
              <dt className="font-semibold">Definition:</dt>
              <dd>{word.glossaryDefinition}</dd>
            </>
          )}
          {word.parsing && (
            <>
              <dt className="font-semibold">Parsing:</dt>
              <dd>
                {Object.entries(word.parsing)
                  .filter(([, value]) => value && value !== "none")
                  .map(([key, value]) => (
                    <div key={key}>
                      {key}: {value}
                    </div>
                  ))}
              </dd>
            </>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};

export default ParsedWordSummary;