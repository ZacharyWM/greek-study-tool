"use client";

import React from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const ColorLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const legendGroups = {
    Cases: [
      { color: "text-blue-600", label: "Nominative" },
      { color: "text-blue-900", label: "Genitive" },
      { color: "text-orange-500", label: "Dative" },
      { color: "text-red-600", label: "Accusative" },
    ],
    "Verbal Moods": [
      { color: "text-green-600", label: "Indicative" },
      { color: "text-pink-600", label: "Subjunctive" },
      { color: "text-yellow-600", label: "Infinitive" },
      { color: "imperative", label: "Imperative" },
      { color: "text-purple-600", label: "Participle" },
    ],
    "Parts of Speech": [
      { color: "adjective", label: "Adjective" },
      { color: "adverb", label: "Adverb" },
      { color: "preposition", label: "Preposition" },
    ],
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-bold">Color Legend</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(legendGroups).map(([group, items]) => (
              <div key={group}>
                <h4 className="font-medium mb-2">{group}</h4>
                <div className="space-y-1">
                  {items.map(({ color, label }) => (
                    <div key={label} className="flex items-center space-x-2">
                      <span className={`inline-block p-1 ${color}`}>Αα</span>
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ColorLegend;
