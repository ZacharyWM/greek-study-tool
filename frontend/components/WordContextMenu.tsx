import React from "react";
import { useState, useRef, useEffect } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@radix-ui/react-context-menu";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

import type { Word } from "../types/models";

interface WordContextMenuProps {
  word: Word;
  onLabelChange: (wordId: number, newLabel: string | undefined) => void;
  onStartLine: (word: Word, x: number, y: number) => void;
  onEndLine: (word: Word, x: number, y: number) => void;
  onDeleteLine: (word: Word) => void;
  isDrawingLine: boolean;
  hasConnectedLines: boolean;
  children: React.ReactNode;
}

const WordContextMenu: React.FC<WordContextMenuProps> = ({
  word,
  onLabelChange,
  onStartLine,
  onEndLine,
  onDeleteLine,
  isDrawingLine,
  hasConnectedLines,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAddEditLabel = () => {
    setIsEditing(true);
    setLabelInput(word.label || "");
  };

  const handleDeleteLabel = () => {
    onLabelChange(word.id, undefined);
  };

  const handleLabelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelInput(e.target.value);
  };

  const handleLabelInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      saveLabelChanges();
    }
  };

  const saveLabelChanges = () => {
    onLabelChange(word.id, labelInput);
    setIsEditing(false);
  };

  const handleLineAction = () => {
    if (wordRef.current) {
      const rect = wordRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      onStartLine(word, centerX, centerY);
    }
  };

  const handleWordClick = (e: React.MouseEvent) => {
    if (isDrawingLine) {
      e.preventDefault();
      e.stopPropagation();
      if (wordRef.current) {
        const rect = wordRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        onEndLine(word, centerX, centerY);
      }
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={wordRef}
          className="relative inline-block"
          onClick={handleWordClick}
        >
          <div className="relative" style={{ lineHeight: "normal" }}>
            {word.label && !isEditing && (
              <span
                className="absolute left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap bg-white/90 px-0.5"
                style={{
                  top: "-1.2em",
                  lineHeight: "1",
                }}
              >
                {word.label}
              </span>
            )}
            {isEditing && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-1"
                style={{
                  top: "-2em",
                  lineHeight: "1",
                }}
              >
                <Input
                  ref={inputRef}
                  value={labelInput}
                  onChange={handleLabelInputChange}
                  onKeyDown={handleLabelInputKeyDown}
                  className="w-32 text-xs h-6 py-0 px-1"
                />
                <Button
                  onClick={saveLabelChanges}
                  size="sm"
                  className="h-6 px-2 py-0 text-xs"
                >
                  Save
                </Button>
              </div>
            )}
            {children}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onSelect={handleAddEditLabel}>
          {word.label ? "Edit Label" : "Add Label"}
        </ContextMenuItem>
        {word.label && (
          <ContextMenuItem onSelect={handleDeleteLabel}>
            Delete Label
          </ContextMenuItem>
        )}
        <ContextMenuItem onSelect={handleLineAction}>
          Create Word Link
        </ContextMenuItem>
        {hasConnectedLines && (
          <ContextMenuItem onSelect={() => onDeleteLine(word)}>
            Delete Word Link
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default WordContextMenu;
