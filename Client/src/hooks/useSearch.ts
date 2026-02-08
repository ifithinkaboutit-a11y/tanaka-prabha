// src/hooks/useSearch.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { schemesApi, Scheme } from "../services/apiService";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "scheme" | "training" | "quickAction";
  item: any;
}

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const data = await schemesApi.getAll();
        setSchemes(data);
      } catch (error) {
        console.error("Error fetching schemes for search:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const allContent = useMemo(() => {
    const content: SearchResult[] = [];

    // Add schemes (non-training)
    schemes
      .filter((scheme) => scheme.category !== "Training")
      .forEach((scheme) => {
        content.push({
          id: scheme.id,
          title: scheme.title,
          description: scheme.description,
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
          description: program.description,
          category: program.category,
          type: "training",
          item: program,
        });
      });

    return content;
  }, [schemes]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();

    return allContent.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [searchQuery, allContent]);

  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    searchResults,
    performSearch,
    clearSearch,
    totalResults: searchResults.length,
    loading,
  };
};
