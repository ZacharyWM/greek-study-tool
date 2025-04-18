import React, { useState, useRef, useEffect } from "react";

const DraggableLabel = ({
  text,
  initialPosition = { x: 0, y: -20 }, // Default position above the word
  onPositionChange,
  maxWidth = 150, // Max width before wrapping
  onTextChange, // Optional callback for text editing
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const labelRef = useRef(null);

  // If initialPosition changes externally, update state
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  // Handle double click for text editing
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (onTextChange) {
      const newText = prompt("Edit label:", text);
      if (newText !== null && newText !== text) {
        onTextChange(newText);
      }
    }
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newPosition = {
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    };

    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Report position change to parent
      if (onPositionChange) {
        onPositionChange(position);
      }
    }
  };

  // Ensure mouse events are properly handled even if mouse leaves the element
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position]);

  // Styling for DraggableLabel component
  // Updates to make it match Oxford Scholar theme
  const customLabelStyles = {
    color: "#252525", // Dark text
    fontFamily: "'EB Garamond', 'Georgia', serif",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  };

  const customActiveStyles = {
    background: "#F7F1E3", // Cream background
    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
    borderColor: "#9F1C1C", // Oxford red border
  };

  return (
    <div
      ref={labelRef}
      className={`absolute text-xs rounded transition-all duration-200 ${
        isDragging ? "opacity-95 scale-105" : "opacity-75 hover:opacity-100"
      } ${
        isHovered || isDragging
          ? "bg-blue-50 shadow-md border-0"
          : "bg-white/70 border-0"
      }`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        maxWidth: `${maxWidth}px`,
        wordWrap: "break-word",
        zIndex: isDragging ? 9999 : 100, // Increased z-index significantly
        userSelect: "none",
        padding: "2px 4px",
        color: isDragging || isHovered ? "#333" : "#666",
        lineHeight: "1.2",
        fontSize: "0.7rem",
        backdropFilter: "blur(2px)",
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {text}
      {(isHovered || isDragging) && (
        <div
          className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-400 rounded-full border border-white"
          style={{ pointerEvents: "none" }}
        />
      )}
    </div>
  );
};

export default DraggableLabel;
