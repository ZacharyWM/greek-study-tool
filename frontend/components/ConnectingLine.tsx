import React from "react";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface ConnectingLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  annotation?: string;
  onAnnotationChange: (annotation: string) => void;
}

const ConnectingLine: React.FC<ConnectingLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  annotation,
  onAnnotationChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [annotationInput, setAnnotationInput] = useState(annotation || "");
  const [isHovered, setIsHovered] = useState(false);

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const controlPointY = midY - Math.abs(endX - startX) * 0.2;

  const path = `M ${startX} ${startY} Q ${midX} ${controlPointY} ${endX} ${endY}`;

  const handleAnnotationSave = () => {
    onAnnotationChange(annotationInput);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* Main line */}
        <path
          d={path}
          fill="none"
          stroke={isHovered ? "rgba(59, 130, 246, 0.5)" : "rgba(0, 0, 0, 0.25)"}
          strokeWidth="1.5"
          strokeDasharray="5,5"
          pointerEvents="auto"
          cursor="pointer"
          onClick={() => setIsEditing(true)}
        />
        {/* Start word underline */}
        <line
          x1={startX - 15}
          y1={startY + 3}
          x2={startX + 15}
          y2={startY + 3}
          stroke={
            isHovered ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.5)"
          }
          strokeWidth="2"
        />
        {/* End word underline */}
        <line
          x1={endX - 15}
          y1={endY + 3}
          x2={endX + 15}
          y2={endY + 3}
          stroke={
            isHovered ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.5)"
          }
          strokeWidth="2"
        />
      </svg>
      {(annotation || isEditing) && (
        <div
          style={{
            position: "absolute",
            top: controlPointY,
            left: midX,
            transform: "translate(-50%, -100%)",
            pointerEvents: "auto",
          }}
        >
          {isEditing ? (
            <div className="flex items-center space-x-2 bg-white p-2 rounded shadow-md border border-gray-200">
              <Input
                value={annotationInput}
                onChange={(e) => setAnnotationInput(e.target.value)}
                className="w-32 text-xs"
              />
              <Button onClick={handleAnnotationSave} size="sm">
                Save
              </Button>
            </div>
          ) : (
            <div
              className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100 text-xs cursor-pointer transition-all hover:shadow-md"
              onClick={() => setIsEditing(true)}
            >
              {annotation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectingLine;
