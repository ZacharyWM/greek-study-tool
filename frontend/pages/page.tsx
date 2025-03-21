"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import ParseWordDialog from "../components/ParseWordDialog";
import WordContextMenu from "../components/WordContextMenu";
import ParsedWordSummary from "../components/ParsedWordSummary";
import ConnectingLine from "../components/ConnectingLine";
import { getParsingClass } from "../lib/parsing-styles";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import type { Section, Word, WordParsing } from "../types/models";
import debounce from "lodash/debounce";
import { useAuth0 } from "@auth0/auth0-react";

interface Line {
  id: number;
  startWord: Word;
  endWord: Word;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  annotation?: string;
}

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
  const [lines, setLines] = useState<Line[]>([]);
  const [drawingLine, setDrawingLine] = useState<{
    startWord: Word;
    startX: number;
    startY: number;
  } | null>(null);
  const [lineSpacing, setLineSpacing] = useState(1.6);
  const [analysisId, setAnalysisId] = useState<number>(1); // TODO - probably change to null or 0 later
  const containerRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const fetchAnalysis = async (id: number) => {
    if (!isAuthenticated) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/analyses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisId(data.id);

        if (data.details) {
          if (data.details.sections) setSections(data.details.sections);
          if (data.details.lines) setLines(data.details.lines);
          if (data.details.lineSpacing)
            setLineSpacing(data.details.lineSpacing);
        }
        console.log("Analysis loaded successfully");
      } else {
        console.error("Failed to fetch analysis:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    }
  };

  // Add useEffect to load analysis when authenticated
  useEffect(() => {
    console.log("Authenticated:", isAuthenticated, "Analysis ID:", analysisId);
    if (isAuthenticated && analysisId) {
      fetchAnalysis(analysisId);
    }
  }, [isAuthenticated]);

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     loginWithRedirect();
  //   }
  // }, [isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        summaryRef.current &&
        !summaryRef.current.contains(event.target as Node)
      ) {
        setSummaryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to save analysis data to the backend
  const saveAnalysis = async () => {
    if (!isAuthenticated) return;

    console.log("Saving analysis...");
    try {
      const token = await getAccessTokenSilently();

      // Combine all data into a single details object
      const analysisData = {
        sections,
        lines,
        lineSpacing,
      };

      const requestOptions = {
        method: analysisId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          details: analysisData,
        }),
      };

      const url = analysisId ? `/api/analyses/${analysisId}` : "/api/analyses";

      const response = await fetch(url, requestOptions);

      if (response.ok) {
        const data = await response.json();
        // If this was a new analysis, save the ID for future updates
        if (!analysisId && data.id) {
          setAnalysisId(data.id);
        }
        console.log("Analysis saved successfully");
      } else {
        console.error("Failed to save analysis:", await response.text());
      }
    } catch (error) {
      console.error("Error saving analysis:", error);
    }
  };

  // Create a debounced version of saveAnalysis
  const debouncedSave = useCallback(
    debounce(() => {
      console.log("Debounced save");
      saveAnalysis();
    }, 1000),
    [sections, lines, lineSpacing, analysisId, isAuthenticated]
  );

  // Trigger save whenever data changes
  useEffect(() => {
    if (sections.length > 0) {
      debouncedSave();
    }
  }, [sections, lines, lineSpacing, debouncedSave]);

  const handleTextSubmit = () => {
    if (inputText.trim()) {
      const newSection: Section = {
        id: Date.now(),
        name: "Imported Text",
        words: inputText.split(/\s+/).map((word, index) => ({
          id: index + 1,
          text: word,
        })),
        phrases: [],
        translation: "",
      };
      setSections([newSection]);
      setInputText("");
      setLines([]);
      // TODO - we want to do this later
      // setAnalysisId(0);
    }
  };

  const handleWordClick = (word: Word, event: React.MouseEvent) => {
    if (event.type === "contextmenu" || drawingLine) {
      return;
    }

    setSelectedWord(word);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setDialogPosition({
        top: rect.bottom - containerRect.top,
        left: rect.left - containerRect.left,
      });
    }

    if (word.parsing || word.lexicalForm || word.glossaryDefinition) {
      setSummaryOpen(true);
    } else {
      setDialogOpen(true);
    }
  };

  const handleParse = (
    word: Word,
    parsing: WordParsing,
    lexicalForm: string,
    glossaryDefinition: string
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        words: section.words.map((w) =>
          w.id === word.id
            ? { ...w, parsing, lexicalForm, glossaryDefinition }
            : w
        ),
      }))
    );
  };

  const handleLabelChange = (wordId: number, newLabel: string | undefined) => {
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        words: section.words.map((w) => {
          if (w.id === wordId) {
            return {
              ...w,
              label: newLabel,
            };
          }
          return w;
        }),
      }))
    );
  };

  const handleEditParsing = () => {
    if (selectedWord) {
      setSummaryOpen(false);
      setDialogOpen(true);
    }
  };

  const handleStartLine = (word: Word, x: number, y: number) => {
    if (textContainerRef.current) {
      const containerRect = textContainerRef.current.getBoundingClientRect();
      setDrawingLine({
        startWord: word,
        startX: x - containerRect.left,
        startY: y - containerRect.top,
      });
    }
  };

  const handleEndLine = (word: Word, x: number, y: number) => {
    if (
      drawingLine &&
      drawingLine.startWord.id !== word.id &&
      textContainerRef.current
    ) {
      const containerRect = textContainerRef.current.getBoundingClientRect();
      setLines((prevLines) => [
        ...prevLines,
        {
          id: Date.now(),
          startWord: drawingLine.startWord,
          endWord: word,
          startX: drawingLine.startX,
          startY: drawingLine.startY,
          endX: x - containerRect.left,
          endY: y - containerRect.top,
        },
      ]);
      setDrawingLine(null);
    }
  };

  const hasConnectedLines = (word: Word) => {
    return lines.some(
      (line) => line.startWord.id === word.id || line.endWord.id === word.id
    );
  };

  const handleDeleteLine = (word: Word) => {
    setLines((prevLines) =>
      prevLines.filter(
        (line) => line.startWord.id !== word.id && line.endWord.id !== word.id
      )
    );
  };

  const handleAnnotationChange = (lineId: number, annotation: string) => {
    setLines((prevLines) =>
      prevLines.map((line) =>
        line.id === lineId ? { ...line, annotation } : line
      )
    );
  };

  const handleLineSpacingChange = (value: number[]) => {
    setLineSpacing(value[0]);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl" ref={containerRef}>
      <div className="mb-4">
        <Label htmlFor="line-spacing" className="block mb-2">
          Line Spacing
        </Label>
        <Slider
          id="line-spacing"
          min={1}
          max={3}
          step={0.1}
          value={[lineSpacing]}
          onValueChange={handleLineSpacingChange}
          className="w-full max-w-xs"
        />
      </div>
      <div className="mb-4">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your Greek text here..."
          className="w-full min-h-[100px] greek-text"
        />
        <Button onClick={handleTextSubmit} className="mt-2">
          Submit Text
        </Button>
      </div>
      <div
        className="border p-4 pt-8 rounded-lg relative"
        ref={textContainerRef}
      >
        <div
          className="greek-text text-lg space-y-4 break-words overflow-x-auto"
          style={{ lineHeight: lineSpacing }}
        >
          {sections[0]?.words.map((word, index) => (
            <React.Fragment key={word.id}>
              {index > 0 && word.text.startsWith("[") && (
                <div className="h-4" />
              )}
              <WordContextMenu
                word={word}
                onLabelChange={handleLabelChange}
                onStartLine={handleStartLine}
                onEndLine={handleEndLine}
                onDeleteLine={handleDeleteLine}
                isDrawingLine={!!drawingLine}
                hasConnectedLines={hasConnectedLines(word)}
              >
                <span
                  className={`cursor-pointer hover:bg-gray-200 rounded inline-block ${
                    word.parsing ? getParsingClass(word.parsing) : ""
                  }`}
                  onClick={(e) => handleWordClick(word, e)}
                >
                  {word.text}
                </span>
              </WordContextMenu>{" "}
            </React.Fragment>
          )) || "No text submitted yet."}
        </div>
        {lines.map((line) => (
          <ConnectingLine
            key={line.id}
            startX={line.startX}
            startY={line.startY}
            endX={line.endX}
            endY={line.endY}
            annotation={line.annotation}
            onAnnotationChange={(annotation) =>
              handleAnnotationChange(line.id, annotation)
            }
          />
        ))}
      </div>
      {selectedWord && (
        <div
          style={{
            position: "absolute",
            top: `${dialogPosition.top}px`,
            left: `${dialogPosition.left}px`,
          }}
          ref={summaryRef}
        >
          {summaryOpen ? (
            <div>
              <ParsedWordSummary word={selectedWord} />
              <Button onClick={handleEditParsing} className="mt-2 w-full">
                Edit Parsing
              </Button>
            </div>
          ) : (
            <ParseWordDialog
              word={selectedWord}
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onParse={handleParse}
            />
          )}
        </div>
      )}
    </div>
  );
}
