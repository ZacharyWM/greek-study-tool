import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./ui/select";
import { Button } from "./ui/button";
import type { Book, Chapter, Verse } from "../types/models";

interface TextLookupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  books: Book[];
  chapters: Chapter[];
  verses: Verse[];
  selectedBookId: number | null;
  selectedChapterId: number | null;
  selectedVerseIdStart: number | null;
  selectedVerseIdEnd: number | null;
  onBookSelect: (bookId: number) => void;
  onChapterSelect: (chapterId: number) => void;
  onVerseStartSelect: (verseId: number) => void;
  onVerseEndSelect: (verseId: number) => void;
  onLookupText: () => void;
}

const TextLookupModal: React.FC<TextLookupModalProps> = ({
  open,
  onOpenChange,
  books,
  chapters,
  verses,
  selectedBookId,
  selectedChapterId,
  selectedVerseIdStart,
  selectedVerseIdEnd,
  onBookSelect,
  onChapterSelect,
  onVerseStartSelect,
  onVerseEndSelect,
  onLookupText,
}) => {
  const isLookupDisabled =
    !selectedBookId ||
    !selectedChapterId ||
    !selectedVerseIdStart ||
    !selectedVerseIdEnd;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Text Lookup</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex flex-col gap-4">
            <Select
              value={selectedBookId?.toString()}
              onValueChange={(value) => onBookSelect(Number(value))}
              disabled={books.length === 0}
            >
              <SelectTrigger className="w-full">
                <span>
                  {selectedBookId
                    ? books.find((book) => book.id === selectedBookId)?.title ||
                      `Book ${selectedBookId}`
                    : "Select Book"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id.toString()}>
                    {book.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedChapterId?.toString()}
              onValueChange={(value) => onChapterSelect(Number(value))}
              disabled={chapters.length === 0}
            >
              <SelectTrigger className="w-full">
                <span>
                  {selectedChapterId
                    ? `Chapter ${
                        chapters.find(
                          (chapter) => chapter.id === selectedChapterId
                        )?.number || selectedChapterId
                      }`
                    : "Select Chapter"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id.toString()}>
                    {chapter.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-4 items-center">
              <Select
                value={selectedVerseIdStart?.toString()}
                onValueChange={(value) => onVerseStartSelect(Number(value))}
                disabled={verses.length === 0}
              >
                <SelectTrigger className="w-full">
                  <span>
                    {selectedVerseIdStart
                      ? `Verse ${
                          verses.find(
                            (verse) => verse.id === selectedVerseIdStart
                          )?.number || selectedVerseIdStart
                        }`
                      : "Verse Start"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {verses.map((verse) => (
                    <SelectItem key={verse.id} value={verse.id.toString()}>
                      {verse.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span>to</span>

              <Select
                value={selectedVerseIdEnd?.toString()}
                onValueChange={(value) => onVerseEndSelect(Number(value))}
                disabled={verses.length === 0}
              >
                <SelectTrigger className="w-full">
                  <span>
                    {selectedVerseIdEnd
                      ? `Verse ${
                          verses.find(
                            (verse) => verse.id === selectedVerseIdEnd
                          )?.number || selectedVerseIdEnd
                        }`
                      : "Verse End"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {verses.map((verse) => (
                    <SelectItem key={verse.id} value={verse.id.toString()}>
                      {verse.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={onLookupText} disabled={isLookupDisabled}>
            Lookup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextLookupModal;
