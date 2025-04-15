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
import DraggableLabel from "./DraggableLabel";

import type { Word } from "../types/models";

interface WordContextMenuProps {
  word: Word;
  onLabelChange: (wordId: number, newLabel: string | undefined, position?: { x: number, y: number }) => void;
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
  const containerRef = useRef<HTMLDivElement>(null);

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
    onLabelChange(word.id, labelInput, word.labelPosition);
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

  const handleLabelPositionChange = (newPosition: { x: number, y: number }) => {
    onLabelChange(word.id, word.label, newPosition);
  };

  const handleLabelTextChange = (newText: string) => {
    onLabelChange(word.id, newText, word.labelPosition);
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
            ref={containerRef}
            className="relative inline-block"
            style={{ zIndex: 1 }} // Establish stacking context
          >
            <div 
              ref={wordRef}
              className="relative" 
              style={{ lineHeight: "normal" }}
              onClick={handleWordClick}
            >
              {word.label && (
                <DraggableLabel
                  text={word.label}
                  initialPosition={word.labelPosition || { x: 0, y: -20 }}
                  onPositionChange={handleLabelPositionChange}
                  onTextChange={handleLabelTextChange}
                  maxWidth={250}
                />
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
    </>
  );
};

export default WordContextMenu;