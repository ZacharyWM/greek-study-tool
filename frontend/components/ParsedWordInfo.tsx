import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface ParsedWordInfoProps {
  word: string;
  parsing: {
    partOfSpeech: string;
    person?: string;
    number?: string;
    tense?: string;
    voice?: string;
    mood?: string;
    case?: string;
    gender?: string;
    degree?: string;
  };
}

const ParsedWordInfo: React.FC<ParsedWordInfoProps> = ({ word, parsing }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Parsed Word: {word}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-2">
          {Object.entries(parsing).map(
            ([key, value]) =>
              value && (
                <React.Fragment key={key}>
                  <dt className="font-semibold">
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </dt>
                  <dd>{value}</dd>
                </React.Fragment>
              )
          )}
        </dl>
      </CardContent>
    </Card>
  );
};

export default ParsedWordInfo;
