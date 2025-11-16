// src/components/header/search-bar.tsx

"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HeaderSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

export function HeaderSearchBar({
  value,
  onChange,
  onSearch,
}: HeaderSearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="relative flex items-center">
      <Input
        placeholder="ค้นหาสินค้า..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full pl-4 pr-12 py-2 lg:py-3 text-foreground bg-white border-0 focus:ring-2 focus:ring-white/50 h-10 lg:h-12 text-sm lg:text-base"
      />
      <Button
        size="sm"
        onClick={onSearch}
        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 h-8 w-8 lg:h-10 lg:w-10 p-0"
      >
        <Search className="h-3 w-3 lg:h-4 lg:w-4" />
      </Button>
    </div>
  );
}
