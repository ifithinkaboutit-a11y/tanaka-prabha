// src/hooks/useSearch.ts
import { useMemo, useState } from "react";
import { quickActions } from "../data/content/quickActions";
import { schemes } from "../data/content/schemes";
import { trainingPrograms } from "../data/content/trainingPrograms";

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

  const allContent = useMemo(() => {
    const content: SearchResult[] = [];

    // Add schemes
    schemes.forEach((scheme) => {
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
    trainingPrograms.forEach((program) => {
      content.push({
        id: program.id,
        title: program.title,
        description: program.description,
        category: program.category,
        type: "training",
        item: program,
      });
    });

    // Add quick actions
    quickActions.forEach((action) => {
      content.push({
        id: action.id,
        title: action.title,
        description: action.description,
        category: action.category || "Quick Action",
        type: "quickAction",
        item: action,
      });
    });

    return content;
  }, []);

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

  const performSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return {
    searchQuery,
    searchResults,
    performSearch,
    clearSearch,
    totalResults: searchResults.length,
  };
};
