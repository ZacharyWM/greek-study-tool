import React from "react";

// This is a placeholder component to maintain backward compatibility
// The ConnectingLine feature has been removed as requested
interface ConnectingLineProps {
  id: number;
  startWord: string;
  endWord: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  annotation?: string;
  onAnnotationChange: (annotation: string) => void;
  onDeleteLine: () => void;
  onReverseDirection: () => void;
}

const ConnectingLine: React.FC<ConnectingLineProps> = () => {
  return null;
};

export default ConnectingLine;