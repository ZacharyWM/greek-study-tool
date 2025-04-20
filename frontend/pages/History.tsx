import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { useAuth0 } from "@auth0/auth0-react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "../components/ui/toaster";
import { useToast } from "../hooks/use-toast";

interface Analysis {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function History() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [history, setHistory] = useState<Analysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingHistory(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/analyses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        console.error("Failed to fetch history:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Add useEffect to load analysis when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();

      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get("deleted") === "true") {
        window.history.replaceState({}, document.title, location.pathname);
        const { dismiss } = toast({
          variant: "success",
          title: "Analysis Deleted",
          description: "Your analysis was successfully deleted.",
          style: {
            backgroundColor: "#4caf50",
            color: "#fff",
          },
        });

        setTimeout(dismiss, 4000);
      }
    }
  }, [isAuthenticated, location.pathname, location.search]);

  const handleAnalysisClick = (id: number) => {
    navigate(`/analysis/${id}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">
          You must log in to see your history.
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Your Analysis History</h1>

      <ScrollArea className="flex-1 rounded-md border">
        <div className="p-4">
          {loadingHistory ? (
            <p className="text-center py-10">Loading history...</p>
          ) : history.length > 0 ? (
            <div className="grid gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border p-4 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => handleAnalysisClick(item.id)}
                >
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.updated_at).toLocaleString()}
                  </div>
                  <div className="font-medium">
                    {item.title} - {item.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No history found. Start analyzing text to see your history here.
            </div>
          )}
        </div>
      </ScrollArea>
      <Toaster />
    </div>
  );
}
