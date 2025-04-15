import React, { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Copy, Download, Save } from "lucide-react";

interface EnhancedTranslationProps {
  sections: any[];
  translation: string;
  onTranslationChange: (value: string) => void;
  onSaveTranslation: () => void;
  isSaved: boolean;
  lines?: any[];
  onAnnotationChange?: (lineId: number, annotation: string) => void;
  onUpdateSections?: (sections: any[]) => void;
  lineSpacing?: number;
}

/**
 * Enhanced Translation component that displays Greek text and translation side by side
 * with verse segmentation, formatting options, and resizable panels.
 */
const EnhancedTranslation: React.FC<EnhancedTranslationProps> = ({
  sections,
  translation,
  onTranslationChange,
  onSaveTranslation,
  isSaved,
  lines = [],
  onAnnotationChange,
  onUpdateSections,
  lineSpacing = 1.6
}) => {
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // Default 50% split
  const [isDragging, setIsDragging] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const translationRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Function to extract verses from section
  const extractVerses = (section) => {
    if (!section || !section.words || !section.words.length) return [];
    
    const verses: { number: string; words: any[] }[] = [];
    let currentVerse: { number: string; words: any[] } | null = null;
    
    section.words.forEach((word, index) => {
      // Check if this word starts a new verse
      if (word.text.match(/^\[\d+\]/)) {
        // Extract verse number
        const match = word.text.match(/^\[(\d+)\]/);
        if (match) {
          // Save previous verse if it exists
          if (currentVerse) {
            verses.push(currentVerse);
          }
          
          // Start a new verse
          currentVerse = {
            number: match[1],
            words: [word]
          };
        }
      } else if (currentVerse) {
        // Add to current verse
        currentVerse.words.push(word);
      } else if (index === 0) {
        // First word with no verse marker, create a default verse
        currentVerse = {
          number: "1",
          words: [word]
        };
      }
    });
    
    // Add the last verse
    if (currentVerse) {
      verses.push(currentVerse);
    }
    
    return verses;
  };
  
  // Split translation into verses based on empty lines
  const translationVerses = translation.split(/\n\n+/);
  const verses = sections.length > 0 ? extractVerses(sections[0]) : [];
  
  // Ensure we have enough empty verses to match the Greek text
  useEffect(() => {
    if (verses.length > translationVerses.length) {
      const newTranslation = [...translationVerses];
      
      // Add empty strings for missing verses
      while (newTranslation.length < verses.length) {
        newTranslation.push("");
      }
      
      onTranslationChange(newTranslation.join("\n\n"));
    }
  }, [verses.length, translationVerses.length, onTranslationChange]);
  
  // Function to ensure translation boxes match Greek text height
  const adjustVerseHeights = () => {
    verses.forEach((verse) => {
      const greekVerseEl = document.getElementById(`greek-verse-${verse.number}`);
      const translationVerseEl = document.getElementById(`translation-verse-${verse.number}`);
      
      if (greekVerseEl && translationVerseEl) {
        // Get computed height of the Greek verse container
        const greekHeight = greekVerseEl.getBoundingClientRect().height;
        
        // Apply exact same height to translation verse container with small buffer
        const heightWithBuffer = Math.ceil(greekHeight) + 5; // 5px buffer for safety
        translationVerseEl.style.height = `${heightWithBuffer}px`;
        
        // Reset min-height to ensure no conflicts
        translationVerseEl.style.minHeight = `${heightWithBuffer}px`;
        
        // Ensure the textarea inside fills available space
        const textarea = translationVerseEl.querySelector('textarea');
        if (textarea) {
          textarea.style.height = `${heightWithBuffer - 40}px`; // Subtract padding/margins
        }
      }
    });
  };
  
  // Match heights of corresponding verse containers after render
  useEffect(() => {
    // Initial adjustment after render
    setTimeout(adjustVerseHeights, 100);
    
    // Use ResizeObserver to adjust when content changes
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(adjustVerseHeights, 0);
    });
    
    // Observe all verse containers
    verses.forEach(verse => {
      const greekEl = document.getElementById(`greek-verse-${verse.number}`);
      if (greekEl) resizeObserver.observe(greekEl);
    });
    
    // Also adjust on window resize
    window.addEventListener('resize', adjustVerseHeights);
    
    // Adjust when split position changes
    if (splitPosition) {
      setTimeout(adjustVerseHeights, 100);
    }
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', adjustVerseHeights);
    };
  }, [verses, splitPosition]);
  
  const handleCopyToClipboard = () => {
    if (translation) {
      navigator.clipboard.writeText(translation);
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000);
    }
  };
  
  const handleDownloadTranslation = () => {
    if (translation) {
      const blob = new Blob([translation], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `translation-${new Date().toISOString().split("T")[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  // Function to format verse marker as superscript
  const formatVerseText = (text: string): React.ReactNode => {
    const match = text.match(/^\[(\d+)\](.*)/);
    if (match) {
      return (
        <>
          <sup className="text-blue-700 font-semibold mr-1">{match[1]}</sup>
          {match[2]}
        </>
      );
    }
    return text;
  };
  
  // Handle mouse down for resizer
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle mouse move for resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !splitContainerRef.current) return;
    
    const containerRect = splitContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Calculate percentage (with limits to prevent extreme sizing)
    let newSplitPosition = (mouseX / containerWidth) * 100;
    newSplitPosition = Math.max(30, Math.min(70, newSplitPosition));
    
    setSplitPosition(newSplitPosition);
  };

  // Handle mouse up to stop resizing
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Preset split layouts
  const setLayout = (preset: 'greek' | 'equal' | 'translation') => {
    switch(preset) {
      case 'greek':
        setSplitPosition(65);
        break;
      case 'equal':
        setSplitPosition(50);
        break;
      case 'translation':
        setSplitPosition(35);
        break;
      default:
        setSplitPosition(50);
    }
  };
  
  return (
    <div className="flex flex-col w-full">
      {/* Layout Controls */}
      <div className="flex justify-between items-center mb-3 bg-gray-50 p-2 rounded">
        <div className="flex items-center gap-2">
          <span className="text-sm">Layout:</span>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-2 py-1 text-xs ${splitPosition >= 60 ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setLayout('greek')}
            >
              Greek Focus
            </button>
            <button 
              className={`px-2 py-1 text-xs border-l border-r ${splitPosition > 40 && splitPosition < 60 ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setLayout('equal')}
            >
              Equal
            </button>
            <button 
              className={`px-2 py-1 text-xs ${splitPosition <= 40 ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setLayout('translation')}
            >
              Translation Focus
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isSaved && (
            <span className="text-xs text-amber-500 italic">Unsaved changes</span>
          )}
        </div>
      </div>
    
      {/* Main resizable container */}
      <div 
        ref={splitContainerRef}
        className="flex overflow-hidden border rounded-lg relative"
        style={{ cursor: isDragging ? 'col-resize' : 'auto', minHeight: "400px" }}
      >
        {/* Greek Text Column */}
        <div 
          className="overflow-y-auto" 
          ref={textContainerRef}
          style={{ width: `${splitPosition}%` }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-blue-700 text-white p-2 font-bold border-b z-10">
            Greek Text
          </div>
          
          {/* Display verses in sections */}
          <div className="relative">
            {verses.length > 0 ? (
              verses.map((verse) => (
                <div 
                  key={`greek-verse-${verse.number}`}
                  id={`greek-verse-${verse.number}`}
                  className="p-4 bg-white border-b flex flex-col"
                  ref={el => verseRefs.current[`greek-${verse.number}`] = el}
                  style={{ boxSizing: 'border-box' }}
                >
                  <div className="greek-text text-lg" style={{ 
                    lineHeight: lineSpacing,
                    wordSpacing: '0.4em',
                    padding: '0.5rem'
                  }}>
                    {verse.words.map((word, wordIndex) => {
                      // Format first word of verse to display verse number as superscript
                      const displayWord = wordIndex === 0 && word.text.match(/^\[\d+\]/) 
                        ? formatVerseText(word.text)
                        : word.text;
                        
                      return (
                        <span 
                          key={word.id}
                          className={`cursor-pointer hover:bg-gray-200 rounded inline-block mr-2 ${
                            word.parsing ? `parsed-word ${word.parsing}` : ""
                          }`}
                        >
                          {displayWord}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500 italic">No text available</div>
            )}
          </div>
        </div>
        
        {/* Resizer handle */}
        <div 
          className="absolute top-0 bottom-0 w-5 bg-transparent hover:bg-gray-100 cursor-col-resize z-10 flex items-center justify-center transition-colors"
          style={{ 
            left: `calc(${splitPosition}% - 10px)`,
            opacity: isDragging ? 0.8 : 0.5
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="h-12 w-1 bg-gray-300 rounded"></div>
        </div>
        
        {/* Translation Column */}
        <div 
          className="overflow-y-auto border-l" 
          ref={translationRef}
          style={{ width: `${100 - splitPosition}%` }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-blue-700 text-white p-2 font-bold border-b z-10 flex justify-between items-center">
            <span>Translation</span>
            <div className="flex items-center gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCopyToClipboard} 
                title="Copy to clipboard"
                className="h-6 w-6 p-0 bg-white"
              >
                <Copy className="h-3 w-3 text-black" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDownloadTranslation} 
                title="Download translation"
                className="h-6 w-6 p-0 bg-white"
              >
                <Download className="h-3 w-3 text-black" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={onSaveTranslation} 
                title="Save translation"
                className="h-6 px-2 bg-white text-black text-xs"
                disabled={isSaved}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
          
          {showCopiedAlert && (
            <Alert className="m-2 py-1 bg-green-50 border-green-200">
              <AlertDescription className="text-xs">Translation copied to clipboard!</AlertDescription>
            </Alert>
          )}
          
          {/* Display translation by verse sections */}
          <div style={{ fontFamily: "'Times New Roman', serif" }}>
            {verses.length > 0 ? (
              verses.map((verse, index) => (
                <div 
                  key={`translation-verse-${verse.number}`}
                  id={`translation-verse-${verse.number}`}
                  className="p-4 bg-white border-b flex flex-col"
                  ref={el => verseRefs.current[`translation-${verse.number}`] = el}
                  style={{ height: 'auto', boxSizing: 'border-box' }}
                >
                  <div className="text-blue-700 text-sm font-semibold mb-1">
                    <sup>{verse.number}</sup>
                  </div>
                  <Textarea
                    placeholder={`Translation for verse ${verse.number}...`}
                    className="w-full border-0 p-0 focus-visible:ring-0 bg-transparent resize-none"
                    style={{ 
                      fontFamily: "'Times New Roman', serif",
                      height: 'calc(100% - 25px)', // Subtract verse number height
                      boxSizing: 'border-box'
                    }}
                    value={translationVerses[index] || ''}
                    onChange={(e) => {
                      const newVerses = [...translationVerses];
                      newVerses[index] = e.target.value;
                      onTranslationChange(newVerses.join('\n\n'));
                    }}
                  />
                </div>
              ))
            ) : (
              <Textarea
                value={translation}
                onChange={(e) => onTranslationChange(e.target.value)}
                placeholder="Enter your translation here..."
                className="w-full min-h-[300px] border-0 p-4 focus-visible:ring-0 bg-transparent resize-none"
                style={{ fontFamily: "'Times New Roman', serif" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTranslation;