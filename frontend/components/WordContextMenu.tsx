import React from "react";
import { useState, useRef, useEffect } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "../components/ui/context-menu";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  const handleAddEditLabel = () => {
    setIsModalOpen(true);
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
    setIsModalOpen(false);
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
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Label for "{word.text}"</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Input
              ref={inputRef}
              value={labelInput}
              onChange={handleLabelInputChange}
              onKeyDown={handleLabelInputKeyDown}
              placeholder="Enter label"
              className="flex-1"
            />
          </div>
          <DialogFooter>
            <Button onClick={saveLabelChanges}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={wordRef}
            className="relative inline-block"
            onClick={handleWordClick}
          >
            <div className="relative" style={{ lineHeight: "normal" }}>
              {word.label && (
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
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
};

export default WordContextMenu;
