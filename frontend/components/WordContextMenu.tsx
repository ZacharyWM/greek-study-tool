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
  onLabelChange: (
    wordId: number,
    newLabel: string | undefined,
    position?: { x: number; y: number }
  ) => void;
  onStartLine: () => void;  // Simplified props - maintained for backwards compatibility
  onEndLine: () => void;    // Simplified props - maintained for backwards compatibility
  onDeleteLine: () => void; // Simplified props - maintained for backwards compatibility
  isDrawingLine: boolean;   // Simplified props - maintained for backwards compatibility
  hasConnectedLines: boolean; // Simplified props - maintained for backwards compatibility
  children: React.ReactNode;
}

const WordContextMenu: React.FC<WordContextMenuProps> = ({
  word,
  onLabelChange,
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleLabelPositionChange = (newPosition: { x: number; y: number }) => {
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
            <div className="relative" style={{ lineHeight: "normal" }}>
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
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
};

export default WordContextMenu;