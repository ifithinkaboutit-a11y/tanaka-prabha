// src/hooks/useSearch.ts
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { schemesApi, eventsApi, Scheme, ApiEvent } from "../services/apiService";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "scheme" | "training" | "event" | "quickAction";
  item: any;
  relevanceScore: number;
}

// Simple word-by-word relevance scoring
function computeRelevance(query: string, item: { title: string; description: string; category: string }): number {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);
  let score = 0;

  const titleLower = item.title.toLowerCase();
  const descLower = item.description.toLowerCase();
  const catLower = item.category.toLowerCase();

  // Exact full-query match bonuses
  if (titleLower.includes(q)) score += 100;
  if (descLower.includes(q)) score += 30;
  if (catLower.includes(q)) score += 20;

  // Title starts with query
  if (titleLower.startsWith(q)) score += 50;

  // Per-word scoring
  for (const word of words) {
    if (word.length < 2) continue;
    if (titleLower.includes(word)) score += 15;
    if (descLower.includes(word)) score += 5;
    if (catLower.includes(word)) score += 8;
  }

  return score;
}

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "scheme" | "training" | "event">("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schemesData, eventsData] = await Promise.all([
          schemesApi.getAll().catch(() => [] as Scheme[]),
          eventsApi.getAll().catch(() => [] as ApiEvent[]),
        ]);
        setSchemes(schemesData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching data for search:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const allContent = useMemo(() => {
    const content: Omit<SearchResult, "relevanceScore">[] = [];

    // Add schemes (non-training)
    schemes
      .filter((scheme) => scheme.category !== "Training")
      .forEach((scheme) => {
        content.push({
          id: scheme.id,
          title: scheme.title,
          description: scheme.description || "",
          category: scheme.category,
          type: "scheme",
          item: scheme,
        });
      });

    // Add training programs
    schemes
      .filter((scheme) => scheme.category === "Training")
      .forEach((program) => {
        content.push({
          id: program.id,
          title: program.title,
          description: program.description || "",
          category: program.category,
          type: "training",
          item: program,
        });
      });

    // Add events
    events.forEach((event) => {
      content.push({
        id: event.id,
        title: event.title,
        description: event.description || "",
        category: event.status || "Event",
        type: "event",
        item: event,
      });
    });

    return content;
  }, [schemes, events]);

  const searchResults = useMemo((): SearchResult[] => {
    if (!debouncedQuery.trim()) {
      return [];
    }

    const results = allContent
      .map((item) => ({
        ...item,
        relevanceScore: computeRelevance(debouncedQuery, item),
      }))
      .filter((item) => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .filter((item) => typeFilter === "all" || item.type === typeFilter);

    return results;
  }, [debouncedQuery, allContent, typeFilter]);

  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setTypeFilter("all");
  }, []);

  return {
    searchQuery,
    searchResults,
    performSearch,
    clearSearch,
    totalResults: searchResults.length,
    loading,
    isSearching: searchQuery !== debouncedQuery,
    typeFilter,
    setTypeFilter,
  };
};
