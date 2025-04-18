import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import ParseWordDialog from "../components/ParseWordDialog";
import WordContextMenu from "../components/WordContextMenu";
import ParsedWordSummary from "../components/ParsedWordSummary";
import { getParsingClass } from "../lib/parsing-styles";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Save, Copy, Download } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import type {
  Section,
  Word,
  WordParsing,
  Book,
  Chapter,
  Verse,
} from "../types/models";
import debounce from "lodash/debounce";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { get } from "http";

const TranslationToggle: React.FC<{
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="translation-toggle"
        checked={isEnabled}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="translation-toggle">Show Translation</Label>
    </div>
  );
};

export default function Home() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [inputText, setInputText] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
  const [lineSpacing, setLineSpacing] = useState(3);
  const [analysisId, setAnalysisId] = useState<number>(parseInt(id || "0"));

  // Books, Chapters, Verses
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(
    null
  );
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedVerseStart, setSelectedVerseStart] = useState<number | null>(
    null
  );
  const [selectedVerseEnd, setSelectedVerseEnd] = useState<number | null>(null);

  // Translation state
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [translation, setTranslation] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [showCopiedAlert, setShowCopiedAlert] = useState<boolean>(false);

  // Split position state for resizable translation panel
  const [splitPosition, setSplitPosition] = useState<number>(50); // Default 50% split
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const translationRef = useRef<HTMLTextAreaElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

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
            words: [word],
          };
        }
      } else if (currentVerse) {
        // Add to current verse
        currentVerse.words.push(word);
      } else if (index === 0) {
        // First word with no verse marker, create a default verse
        currentVerse = {
          number: "1",
          words: [word],
        };
      }
    });

    // Add the last verse
    if (currentVerse) {
      verses.push(currentVerse);
    }

    return verses;
  };

  const fetchBooks = async () => {
    if (!isAuthenticated) return;
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("/api/books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      } else {
        console.error("Failed to fetch books:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchChapters = async (bookId: number) => {
    if (!isAuthenticated) return;
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/books/${bookId}/chapters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setChapters(data);
      } else {
        console.error("Failed to fetch chapters:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  const fetchVerses = async (chapterId: number) => {
    if (!isAuthenticated) return;
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/chapters/${chapterId}/verses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setVerses(data);
      } else {
        console.error("Failed to fetch verses:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching verses:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && selectedBookId) {
      fetchChapters(selectedBookId);
    }
  }, [isAuthenticated, selectedBookId]);

  useEffect(() => {
    if (isAuthenticated && selectedChapterId) {
      fetchVerses(selectedChapterId);
    }
  }, [isAuthenticated, selectedChapterId]);

  const getBookTitle = (bookId: number) => {
    const book = books.find((b) => b.id === bookId);
    return book ? book.title : "";
  };

  const getChapterNumber = (chapterId: number) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    return chapter ? chapter.number : "";
  };

  const getVerseNumber = (verseId: number) => {
    const verse = verses.find((v) => v.id === verseId);
    return verse ? verse.number : "";
  };

  const fetchAnalysis = async (id: number) => {
    if (!isAuthenticated) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/analyses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisId(data.id);

        if (data.details) {
          if (data.details.sections) {
            setSections(data.details.sections);
            // Set translation if it exists in the first section
            if (
              data.details.sections.length > 0 &&
              data.details.sections[0].translation
            ) {
              setTranslation(data.details.sections[0].translation);
            }
          }
          if (data.details.lineSpacing) {
            setLineSpacing(data.details.lineSpacing);
          }
          // Set the translation visibility if it exists in saved data
          if (data.details.showTranslation !== undefined) {
            setShowTranslation(data.details.showTranslation);
          }
          // Set split position if it exists in saved data
          if (data.details.splitPosition !== undefined) {
            setSplitPosition(data.details.splitPosition);
          }
          if (data.title) setTitle(data.title);
          if (data.description) setDescription(data.description);
          if (!window.location.toString().includes(`/analysis/${data.id}`)) {
            window.history.replaceState({}, "", `/analysis/${data.id}`);
          }
        }
      } else {
        window.alert("Analysis not found");
        setAnalysisId(0);
        window.history.replaceState({}, "", "/analysis");
        console.error("Failed to fetch analysis:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("new") === "true") {
        setSections([]);
        setInputText("");
        setAnalysisId(0);
        setTitle("");
        setSelectedWord(null);
        setDialogOpen(false);
        setSummaryOpen(false);
        setDescription("");
        window.history.replaceState({}, "", "/analysis");
      } else if (analysisId > 0) {
        fetchAnalysis(analysisId);
      }
    }
  }, [isAuthenticated, analysisId, window.location.search]);

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        summaryRef.current &&
        !summaryRef.current.contains(event.target as Node)
      ) {
        setSummaryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update the saved status when translation changes
  useEffect(() => {
    if (sections.length > 0) {
      setIsSaved(translation === sections[0].translation);
    }
  }, [translation, sections]);

  const saveAnalysis = async (
    saveTitle: string,
    saveDescription: string,
    saveSections: Section[],
    saveLineSpacing: number,
    saveAnalysisId: number,
    saveShowTranslation: boolean,
    saveSplitPosition: number
  ) => {
    if (!isAuthenticated) return;

    try {
      const token = await getAccessTokenSilently();

      const analysisData = {
        sections: saveSections,
        lineSpacing: saveLineSpacing,
        showTranslation: saveShowTranslation,
        splitPosition: saveSplitPosition,
      };

      const requestOptions = {
        method: saveAnalysisId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: saveTitle,
          description: saveDescription,
          details: analysisData,
        }),
      };

      const url = saveAnalysisId
        ? `/api/analyses/${saveAnalysisId}`
        : "/api/analyses";

      const response = await fetch(url, requestOptions);

      if (response.ok) {
        const data = await response.json();
        if (!saveAnalysisId && data.id) {
          setAnalysisId(data.id);
        }
        setIsSaved(true);
      } else {
        console.error("Failed to save analysis:", await response.text());
      }
    } catch (error) {
      console.error("Error saving analysis:", error);
    }
  };

  const debouncedSave = useCallback(
    debounce(
      (
        saveTitle: string,
        saveDescription: string,
        saveSections: Section[],
        saveLineSpacing: number,
        saveAnalysisId: number,
        saveShowTranslation: boolean,
        saveSplitPosition: number
      ) => {
        saveAnalysis(
          saveTitle,
          saveDescription,
          saveSections,
          saveLineSpacing,
          saveAnalysisId,
          saveShowTranslation,
          saveSplitPosition
        );
      },
      1000
    ),
    [isAuthenticated]
  );

  // Update sections with translation
  const updateSectionsWithTranslation = useCallback(() => {
    if (sections.length > 0) {
      setSections((prevSections) => {
        const newSections = [...prevSections];
        newSections[0] = {
          ...newSections[0],
          translation: translation,
        };
        return newSections;
      });
    }
  }, [sections, translation]);

  // Debounced translation update
  const debouncedUpdateTranslation = useCallback(
    debounce(() => {
      updateSectionsWithTranslation();
    }, 500),
    [updateSectionsWithTranslation]
  );

  // Handle translation changes
  const handleTranslationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTranslation(e.target.value);
    setIsSaved(false);
    debouncedUpdateTranslation();
  };

  // Handle direct translation changes (from EnhancedTranslation)
  const handleTranslationUpdate = (value: string) => {
    setTranslation(value);
    setIsSaved(false);
    debouncedUpdateTranslation();
  };

  // Handle manual save of translation
  const handleSaveTranslation = () => {
    updateSectionsWithTranslation();
  };

  useEffect(() => {
    if (sections.length > 0) {
      debouncedSave(
        title,
        description,
        sections,
        lineSpacing,
        analysisId,
        showTranslation,
        splitPosition
      );
    }
  }, [
    sections,
    lineSpacing,
    debouncedSave,
    title,
    description,
    analysisId,
    showTranslation,
    splitPosition,
  ]);

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

  const handleTextSubmit = () => {
    if (inputText.trim()) {
      const newSection: Section = {
        id: Date.now(),
        name: "Imported Text",
        words: inputText.split(/\s+/).map((word, index) => ({
          id: index + 1,
          text: word,
        })),
        phrases: [],
        translation: "",
      };

      const truncateAndClean = (text) => {
        // Replace line breaks with spaces
        const noLineBreaks = text.replace(/\r?\n/g, " ");
        // Replace multiple spaces with single space
        const singleSpaced = noLineBreaks.replace(/\s+/g, " ");
        // Return first 100 characters
        return singleSpaced.substring(0, 100);
      };

      setDescription(truncateAndClean(inputText));

      setSections([newSection]);
      setInputText("");
      setTranslation("");
      // TODO - we want to do this later
      // setAnalysisId(0);
    }
  };

  const handleWordClick = (word: Word, event: React.MouseEvent) => {
    if (event.type === "contextmenu") {
      return;
    }

    setSelectedWord(word);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setDialogPosition({
        top: rect.bottom - containerRect.top,
        left: rect.left - containerRect.left,
      });
    }

    if (word.parsing || word.lexicalForm || word.glossaryDefinition) {
      setSummaryOpen(true);
    } else {
      setDialogOpen(true);
    }
  };

  const handleParse = (
    word: Word,
    parsing: WordParsing,
    lexicalForm: string,
    glossaryDefinition: string
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        words: section.words.map((w) =>
          w.id === word.id
            ? { ...w, parsing, lexicalForm, glossaryDefinition }
            : w
        ),
      }))
    );
  };

  const handleLabelChange = (
    wordId: number,
    newLabel: string | undefined,
    position?: { x: number; y: number }
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        words: section.words.map((w) => {
          if (w.id === wordId) {
            return {
              ...w,
              label: newLabel,
              labelPosition: position || w.labelPosition,
            };
          }
          return w;
        }),
      }))
    );
  };

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

  const handleEditParsing = () => {
    if (selectedWord) {
      setSummaryOpen(false);
      setDialogOpen(true);
    }
  };

  const handleLineSpacingChange = (value: number[]) => {
    setLineSpacing(value[0]);
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear this analysis? This action cannot be undone."
      )
    ) {
      setSections([]);
      setInputText("");

      const sections = [];
      debouncedSave(
        title,
        description,
        sections,
        lineSpacing,
        analysisId,
        showTranslation,
        splitPosition
      );
    }
  };

  const deleteAnalysis = async () => {
    if (!isAuthenticated) return;
    if (
      window.confirm(
        "Are you sure you want to delete this analysis? This action cannot be undone."
      )
    ) {
      try {
        const token = await getAccessTokenSilently();

        const requestOptions = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await fetch(
          `/api/analyses/${analysisId}`,
          requestOptions
        );
        if (response.ok) {
          navigate("/analyses?deleted=true");
        } else {
          console.error("Failed to delete analysis:", await response.text());
        }
      } catch (error) {
        console.error("Error deleting analysis:", error);
      }
    }
  };

  // Update analysisId when URL param changes
  useEffect(() => {
    const newId = parseInt(id || "0");
    setAnalysisId(newId);
  }, [id]);

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
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Preset split layouts
  const setLayout = (preset: "greek" | "equal" | "translation") => {
    switch (preset) {
      case "greek":
        setSplitPosition(65);
        break;
      case "equal":
        setSplitPosition(50);
        break;
      case "translation":
        setSplitPosition(35);
        break;
      default:
        setSplitPosition(50);
    }
  };

  // Get verses from the first section
  const sectionVerses = sections.length > 0 ? extractVerses(sections[0]) : [];

  // Split translation into verses based on empty lines
  const translationVerses = translation.split(/\n\n+/);

  return (
    <div className="container mx-auto p-4 max-w-4xl" ref={containerRef}>
      <div className="mb-4">
        <div className="flex items-center mb-4">
          <Label className="text-lg font-semibold mr-2 text-gray-900">
            Title:{" "}
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 pl-2"
            onClick={deleteAnalysis}
            title="Delete analysis"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4">
          {/* Layout Options */}
          {showTranslation && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Layout:</span>
              <div className="flex border rounded overflow-hidden">
                <button
                  className={`px-2 py-1 text-xs ${
                    splitPosition >= 60 ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setLayout("greek")}
                >
                  Greek Focus
                </button>
                <button
                  className={`px-2 py-1 text-xs border-l border-r ${
                    splitPosition > 40 && splitPosition < 60
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setLayout("equal")}
                >
                  Equal
                </button>
                <button
                  className={`px-2 py-1 text-xs ${
                    splitPosition <= 40 ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setLayout("translation")}
                >
                  Translation Focus
                </button>
              </div>
            </div>
          )}

          {/* Dropdown Selectors */}
          <div className="flex items-center gap-4">
            <Select onValueChange={(value) => setSelectedBookId(Number(value))}>
              <SelectTrigger className="w-32">
                <span>
                  {selectedBookId
                    ? `${getBookTitle(selectedBookId)}`
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
              onValueChange={(value) => setSelectedChapterId(Number(value))}
            >
              <SelectTrigger className="w-32">
                <span>
                  {selectedChapterId
                    ? `Chapter ${getChapterNumber(selectedChapterId)}`
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
            <Select
              onValueChange={(value) => setSelectedVerseStart(Number(value))}
            >
              <SelectTrigger className="w-32">
                <span>
                  {selectedVerseStart
                    ? `${getVerseNumber(selectedVerseStart)}`
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
            -
            <Select
              onValueChange={(value) => setSelectedVerseEnd(Number(value))}
            >
              <SelectTrigger className="w-32">
                <span>
                  {selectedVerseEnd
                    ? `${getVerseNumber(selectedVerseEnd)}`
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

          <Button
            onClick={clearAllData}
            variant="secondary"
            className="ml-auto"
          >
            Clear
          </Button>
        </div>
      </div>

      {sections.length === 0 && (
        <div className="mb-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Select your text or paste it here..."
            className="w-full min-h-[100px] greek-text"
          />
          <Button onClick={handleTextSubmit} className="mt-2">
            Submit Text
          </Button>
        </div>
      )}

      {/* NON-TRANSLATION MODE */}
      {sections.length > 0 && !showTranslation && (
        <div className="border rounded-lg" ref={textContainerRef}>
          {/* Royal Blue header */}
          <div className="bg-blue-700 text-white p-2 font-bold">Greek Text</div>

          {/* Remove overflow hidden, add padding, and ensure proper positioning context */}
          <div className="p-4 pt-4 relative">
            <div
              className="greek-text text-lg break-words"
              style={{ lineHeight: lineSpacing, wordSpacing: "0.4em" }}
            >
              {sections[0]?.words.map((word, index) => (
                <React.Fragment key={word.id}>
                  {index > 0 && word.text.startsWith("[") && (
                    <div className="h-4" />
                  )}
                  <WordContextMenu
                    word={word}
                    onLabelChange={handleLabelChange}
                  >
                    <span
                      className={`cursor-pointer hover:bg-gray-200 rounded inline-block mr-2 ${
                        word.parsing ? getParsingClass(word.parsing) : ""
                      }`}
                      onClick={(e) => handleWordClick(word, e)}
                    >
                      {formatVerseText(word.text)}
                    </span>
                  </WordContextMenu>
                </React.Fragment>
              )) || "No text submitted yet."}
            </div>
          </div>
        </div>
      )}

      {/* TRANSLATION MODE WITH SIDE-BY-SIDE LAYOUT */}
      {sections.length > 0 && showTranslation && (
        <div className="border rounded-lg" ref={splitContainerRef}>
          {/* Headers */}
          <div className="flex border-b">
            <div
              className="bg-blue-700 text-white p-2 font-bold"
              style={{ width: `${splitPosition}%` }}
            >
              Greek Text
            </div>
            <div
              className="bg-blue-700 text-white p-2 font-bold flex justify-between items-center border-l"
              style={{ width: `${100 - splitPosition}%` }}
            >
              <span>Translation</span>
              <div className="flex items-center gap-1">
                {!isSaved && (
                  <span className="text-xs text-yellow-200 italic mr-2">
                    Unsaved changes
                  </span>
                )}
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
                  onClick={handleSaveTranslation}
                  title="Save translation"
                  className="h-6 px-2 bg-white text-black text-xs"
                  disabled={isSaved}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Resizer and content */}
          <div className="relative">
            {/* Content - removed overflow property */}
            <div className="relative" ref={textContainerRef}>
              {sectionVerses.length > 0 ? (
                sectionVerses.map((verse, index) => (
                  <div
                    key={`verse-row-${verse.number}`}
                    className="flex border-b"
                  >
                    {/* Greek Column */}
                    <div
                      id={`greek-verse-${verse.number}`}
                      className="p-4 pt-4 bg-white relative" // Relative positioning for labels
                      style={{ width: `${splitPosition}%` }}
                    >
                      <div
                        className="greek-text text-lg"
                        style={{
                          lineHeight: lineSpacing,
                          wordSpacing: "0.4em",
                        }}
                      >
                        {verse.words.map((word, wordIndex) => {
                          // Format first word of verse to display verse number as superscript
                          const displayWord =
                            wordIndex === 0 && word.text.match(/^\[\d+\]/)
                              ? formatVerseText(word.text)
                              : word.text;

                          return (
                            <WordContextMenu
                              key={word.id}
                              word={word}
                              onLabelChange={handleLabelChange}
                            >
                              <span
                                className={`cursor-pointer hover:bg-gray-200 rounded inline-block mr-2 ${
                                  word.parsing
                                    ? getParsingClass(word.parsing)
                                    : ""
                                }`}
                                onClick={(e) => handleWordClick(word, e)}
                              >
                                {displayWord}
                              </span>
                            </WordContextMenu>
                          );
                        })}
                      </div>
                    </div>

                    {/* Translation Column */}
                    <div
                      id={`translation-verse-${verse.number}`}
                      className="p-4 bg-white border-l"
                      style={{ width: `${100 - splitPosition}%` }}
                    >
                      <div className="text-blue-700 text-sm font-semibold mb-2">
                        <sup>{verse.number}</sup>
                      </div>
                      <Textarea
                        placeholder={`Translation for verse ${verse.number}...`}
                        className="w-full border-0 p-0 focus-visible:ring-0 bg-transparent resize-none"
                        style={{
                          fontFamily: "'Times New Roman', serif",
                        }}
                        value={translationVerses[index] || ""}
                        onChange={(e) => {
                          const newVerses = [...translationVerses];
                          newVerses[index] = e.target.value;
                          setTranslation(newVerses.join("\n\n"));
                          setIsSaved(false);
                          debouncedUpdateTranslation();
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex border-b">
                  <div
                    className="p-4 bg-white"
                    style={{ width: `${splitPosition}%` }}
                  >
                    <div className="text-gray-500 italic">
                      No verses detected
                    </div>
                  </div>
                  <div
                    className="p-4 bg-white border-l"
                    style={{ width: `${100 - splitPosition}%` }}
                  >
                    <Textarea
                      value={translation}
                      onChange={handleTranslationChange}
                      placeholder="Enter your translation here..."
                      className="w-full min-h-[300px] border-0 p-0 focus-visible:ring-0 bg-transparent resize-none"
                      style={{ fontFamily: "'Times New Roman', serif" }}
                    />
                  </div>
                </div>
              )}

              {/* Resizer handle */}
              <div
                className="absolute top-0 bottom-0 w-5 bg-transparent hover:bg-gray-100 cursor-col-resize z-10 flex items-center justify-center transition-colors"
                style={{
                  left: `calc(${splitPosition}% - 10px)`,
                  opacity: isDragging ? 0.8 : 0.5,
                }}
                onMouseDown={handleMouseDown}
              >
                <div className="h-12 w-1 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {showCopiedAlert && (
            <Alert className="m-2 py-1 bg-green-50 border-green-200">
              <AlertDescription className="text-xs">
                Translation copied to clipboard!
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {selectedWord && (
        <div
          style={{
            position: "absolute",
            top: `${dialogPosition.top}px`,
            left: `${dialogPosition.left}px`,
            zIndex: 50,
          }}
          ref={summaryRef}
        >
          {summaryOpen ? (
            <div>
              <ParsedWordSummary word={selectedWord} />
              <Button onClick={handleEditParsing} className="mt-2 w-full">
                Edit Parsing
              </Button>
            </div>
          ) : (
            <ParseWordDialog
              word={selectedWord}
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onParse={handleParse}
            />
          )}
        </div>
      )}
    </div>
  );
}
