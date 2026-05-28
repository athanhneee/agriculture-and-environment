"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, MapPin, Leaf, Activity } from "lucide-react";
import { searchApi } from "@/lib/api";
import type { GlobalSearchResults } from "@/lib/api";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const response = await searchApi.global(debouncedQuery);
        setResults(response);
        // Auto-open if query is not empty, otherwise let focus handle it
        if (debouncedQuery.trim()) setIsOpen(true);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    router.push(path);
  };

  const hasResults = results && (results.zones.length > 0 || results.crops.length > 0 || results.sensors.length > 0);

  return (
    <div className="relative w-full max-w-sm lg:w-72 lg:max-w-none" ref={wrapperRef}>
      <div className="relative flex h-10 w-full items-center gap-2 rounded-full border bg-card px-3 text-sm text-foreground transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (hasResults || isLoading) setIsOpen(true);
          }}
          placeholder="Tìm vùng trồng, cảm biến..."
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {isLoading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full max-w-md rounded-2xl border bg-card p-2 shadow-lg animate-in fade-in zoom-in-95 z-50 max-h-[70vh] overflow-y-auto">
          {!debouncedQuery.trim() && hasResults && (
            <div className="px-3 pb-2 pt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Gợi ý gần đây
            </div>
          )}
          {isLoading && !results ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Đang tải...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {debouncedQuery.trim() ? `Không tìm thấy kết quả nào cho "${debouncedQuery}"` : "Bạn chưa có dữ liệu nào"}
            </div>
          ) : (
            <div className="space-y-4">
              {results.zones.length > 0 && (
                <div>
                  <h3 className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vùng trồng</h3>
                  <div className="space-y-1">
                    {results.zones.map((zone) => (
                      <button
                        key={zone.id}
                        onClick={() => handleNavigate(`/dashboard/zones/${zone.id}`)}
                        className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-muted transition"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                          <MapPin className="size-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-sm font-medium">{zone.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{zone.soilType}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.crops.length > 0 && (
                <div>
                  <h3 className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cây trồng</h3>
                  <div className="space-y-1">
                    {results.crops.map((crop) => (
                      <button
                        key={crop.id}
                        onClick={() => handleNavigate(`/dashboard/crops`)}
                        className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-muted transition"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                          <Leaf className="size-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-sm font-medium">{crop.name} {crop.variety && `(${crop.variety})`}</div>
                          <div className="truncate text-xs text-muted-foreground">{crop.farmZone?.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.sensors.length > 0 && (
                <div>
                  <h3 className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cảm biến</h3>
                  <div className="space-y-1">
                    {results.sensors.map((sensor) => (
                      <button
                        key={sensor.id}
                        onClick={() => handleNavigate(`/dashboard/sensors`)}
                        className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-muted transition"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
                          <Activity className="size-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-sm font-medium">{sensor.name} - {sensor.code}</div>
                          <div className="truncate text-xs text-muted-foreground">{sensor.farmZone?.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
