import React, { useState, useEffect, useRef } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Pencil, X, ArrowUpDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

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
  lineStyle?: "solid" | "dashed" | "dotted";
  lineColor?: string;
  lineWidth?: number;
  arrowhead?: boolean;
}

const ConnectingLine: React.FC<ConnectingLineProps> = ({
  id,
  startWord,
  endWord,
  startX,
  startY,
  endX,
  endY,
  annotation,
  onAnnotationChange,
  onDeleteLine,
  onReverseDirection,
  lineStyle = "dashed",
  lineColor = "rgba(0, 0, 0, 0.25)",
  lineWidth = 1.5,
  arrowhead = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [annotationInput, setAnnotationInput] = useState(annotation || "");
  const [isHovered, setIsHovered] = useState(false);
  const [curveHeight, setCurveHeight] = useState<number>(50); // Default curve height
  const [isDraggingCurve, setIsDraggingCurve] = useState(false);
  const annotationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Adjust line parameters based on direction and distance
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate the control point for the bezier curve
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 - curveHeight;
  
  // Path for the connecting line
  const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
  
  // Create arrowhead if enabled
  const arrowPath = arrowhead ? calculateArrowhead(startX, startY, endX, endY, midX, midY) : null;
  
  // Determine stroke-dasharray based on lineStyle
  const getDashArray = () => {
    switch (lineStyle) {
      case "solid": return "";
      case "dashed": return "5,5";
      case "dotted": return "2,2";
      default: return "5,5";
    }
  };
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  // Click outside to close annotation editor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (annotationRef.current && !annotationRef.current.contains(e.target as Node)) {
        if (isEditing) {
          handleAnnotationSave();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, annotationInput]);
  
  // Handle dragging the curve control point
  useEffect(() => {
    if (!isDraggingCurve) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Get mouse position relative to the midpoint
      const mouseY = e.clientY;
      const curve = Math.max(0, Math.min(150, (midY + curveHeight) - mouseY));
      setCurveHeight(curve);
    };
    
    const handleMouseUp = () => {
      setIsDraggingCurve(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCurve, midY, curveHeight]);
  
  // Calculate arrowhead path
  function calculateArrowhead(sx: number, sy: number, ex: number, ey: number, cx: number, cy: number) {
    // Get the end point of the curve (actual end position of the line)
    // For a bezier curve, we need to calculate the tangent at t=1
    // Simplified approach - use direction from control point to end point
    const dx = ex - cx;
    const dy = ey - cy;
    const angle = Math.atan2(dy, dx);
    
    // Arrow dimensions
    const arrowLength = 8;
    const arrowWidth = 4;
    
    // Calculate arrowhead points
    const p1x = ex - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle);
    const p1y = ey - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle);
    const p2x = ex - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle);
    const p2y = ey - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle);
    
    return `M ${ex} ${ey} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`;
  }

  const handleAnnotationSave = () => {
    onAnnotationChange(annotationInput);
    setIsEditing(false);
  };
  
  // Handles mouse wheel over the curve to adjust curve height
  const handleWheel = (e: React.WheelEvent) => {
    if (isHovered) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      setCurveHeight(prev => Math.max(0, Math.min(150, prev + delta)));
    }
  };
  
  const handleControlPointMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingCurve(true);
  };
  
  const hoverColor = isHovered ? "rgba(59, 130, 246, 0.7)" : lineColor;
  const hoverWidth = isHovered ? lineWidth + 0.5 : lineWidth;

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
      onWheel={handleWheel}
    >
      {/* Word Highlights */}
      {isHovered && (
        <>
          <div 
            className="absolute rounded bg-blue-100/50 pointer-events-none"
            style={{
              left: startX - 20,
              top: startY - 15,
              width: "40px",
              height: "30px",
              opacity: 0.6
            }}
          />
          <div 
            className="absolute rounded bg-blue-100/50 pointer-events-none"
            style={{
              left: endX - 20,
              top: endY - 15,
              width: "40px",
              height: "30px",
              opacity: 0.6
            }}
          />
        </>
      )}
      
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
        {/* Main connecting line */}
        <path
          d={path}
          fill="none"
          stroke={hoverColor}
          strokeWidth={hoverWidth}
          strokeDasharray={getDashArray()}
          pointerEvents="auto"
          cursor="pointer"
          onClick={() => setIsEditing(true)}
        />
        
        {/* Draggable curve control point */}
        {isHovered && (
          <>
            <circle
              cx={midX}
              cy={midY}
              r={6}
              fill="rgba(59, 130, 246, 0.8)"
              stroke="white"
              strokeWidth={1.5}
              pointerEvents="auto"
              cursor="ns-resize"
              onMouseDown={handleControlPointMouseDown}
            />
            <line 
              x1={midX} 
              y1={midY} 
              x2={midX} 
              y2={midY + curveHeight}
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              pointerEvents="none"
            />
          </>
        )}
        
        {/* Arrowhead if enabled */}
        {arrowhead && arrowPath && (
          <path
            d={arrowPath}
            fill={hoverColor}
            stroke={hoverColor}
            pointerEvents="none"
          />
        )}
        
        {/* Start word underline */}
        <line
          x1={startX - 10}
          y1={startY + 3}
          x2={startX + 10}
          y2={startY + 3}
          stroke={isHovered ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.5)"}
          strokeWidth="2"
        />
        
        {/* End word underline */}
        <line
          x1={endX - 10}
          y1={endY + 3}
          x2={endX + 10}
          y2={endY + 3}
          stroke={isHovered ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.5)"}
          strokeWidth="2"
        />
        
        {/* Word indicators on hover */}
        {isHovered && (
          <>
            <text
              x={startX}
              y={startY - 10}
              textAnchor="middle"
              fill="rgba(107, 114, 128, 0.7)"
              fontSize="10"
              pointerEvents="none"
            >
              {startWord}
            </text>
            <text
              x={endX}
              y={endY - 10}
              textAnchor="middle"
              fill="rgba(107, 114, 128, 0.7)"
              fontSize="10"
              pointerEvents="none"
            >
              {endWord}
            </text>
          </>
        )}
      </svg>
      
      {/* Annotation or edit interface */}
      {(annotation || isEditing || isHovered) && (
        <div
          ref={annotationRef}
          style={{
            position: "absolute",
            top: midY - 5,
            left: midX,
            transform: "translate(-50%, -100%)",
            pointerEvents: "auto",
            zIndex: 20,
          }}
        >
          {isEditing ? (
            <div className="flex items-center space-x-2 bg-white p-2 rounded shadow-md border border-gray-200">
              <Input
                ref={inputRef}
                value={annotationInput}
                onChange={(e) => setAnnotationInput(e.target.value)}
                className="w-40 text-xs h-7"
                placeholder="Add relation label..."
              />
              <Button onClick={handleAnnotationSave} size="sm" className="h-7 text-xs px-2">
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <div
                className={`bg-white px-2 py-1 rounded shadow-sm border border-gray-100 text-xs cursor-pointer transition-all hover:shadow-md ${
                  !annotation && isHovered ? "opacity-70" : ""
                }`}
                onClick={() => setIsEditing(true)}
              >
                {annotation || (isHovered ? "Add label" : "")}
              </div>
              
              {isHovered && (
                <div className="flex ml-1 bg-white rounded shadow-sm border border-gray-100">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                          }} 
                          className="h-6 w-6"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Edit label</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onReverseDirection();
                          }} 
                          className="h-6 w-6"
                        >
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Reverse direction</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLine();
                          }} 
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Delete connection</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectingLine;