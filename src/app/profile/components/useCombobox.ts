// src/app/profile/components/useCombobox.ts

import { useState, useEffect, useCallback } from "react";

// T is the generic type for the data object (e.g., ProvinceItem, PostalCodeItem)
interface UseComboboxProps<T> {
  dependencies?: Record<string, number | string | null | undefined>; // Filter IDs from previous fields
  initialSearchTerm?: string;
  initialSelectedOption?: T | null;
}

// Code for Exponential Backoff
const MAX_RETRIES = 3;
const DELAYS = [1000, 2000, 4000];

// Main Hook
export function useCombobox<T>(
  apiUrl: string,
  {
    dependencies = {},
    initialSearchTerm = "",
    initialSelectedOption = null,
  }: UseComboboxProps<T> = {}
) {
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedOption, setSelectedOption] = useState<T | null>(
    initialSelectedOption
  );

  // Create searchParams from dependencies and searchTerm
  const searchParams = new URLSearchParams();
  Object.entries(dependencies).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  // If there is a search query, include it
  if (searchTerm) {
    searchParams.append("search", searchTerm);
  }

  // Fetch function with Backoff logic
  const fetchOptions = useCallback(
    async (retries = 0) => {
      setIsLoading(true);
      try {
        const url = `${apiUrl}?${searchParams.toString()}`;
        
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: T[] = await response.json();
        setOptions(data);
      } catch (error) {
        console.error(`Error fetching data for ${apiUrl} (Retry ${retries}):`, error);

        if (retries < MAX_RETRIES) {
          const delay = DELAYS[retries];
          await new Promise((resolve) => setTimeout(resolve, delay));
          await fetchOptions(retries + 1); // Retry with backoff
        } else {
          setOptions([]);
          console.error(`Failed to fetch data from ${apiUrl} after ${MAX_RETRIES} attempts.`);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, searchParams.toString()]
  );

  // Effect to trigger API call when dependencies or search term change
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Function to handle user search input
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query.trim());
  }, []);

  return {
    options,
    isLoading,
    searchTerm,
    selectedOption,
    setSelectedOption,
    handleSearch,
    searchParams,
  };
}