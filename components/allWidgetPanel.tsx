"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { toggleWidgetInCategory, removeWidget } from "../store/dashboardSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AllWidgetsDrawer: React.FC<Props> = ({ open, onOpenChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const dashboard = useSelector((s: RootState) => s.dashboard);

  const [activeTab, setActiveTab] = useState<string | undefined>(
    dashboard.categories[0]?.id
  );

  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const tabsListRef = useRef<HTMLDivElement | null>(null);

  const [showScrollControls, setShowScrollControls] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const catalogByCategory = useMemo(() => {
    const map = new Map<string, { catId: string; catName: string; widgets: any[] }>();

    // Initialize map with all categories
    for (const c of dashboard.categories) {
      if (!map.has(c.id)) {
        map.set(c.id, { catId: c.id, catName: c.name, widgets: [] });
      }
    }
    for (const widget of dashboard.availableWidgets) {
      const entry = map.get(widget.categoryId);
      if (entry && !entry.widgets.find((w) => w.id === widget.id)) {
        entry.widgets.push(widget);
      }
    }

    return Array.from(map.values());
  }, [dashboard.categories, dashboard.availableWidgets]);
  useEffect(() => {
    if (!activeTab && dashboard.categories[0]) {
      setActiveTab(dashboard.categories[0].id);
    }
    if (activeTab && !dashboard.categories.find((c) => c.id === activeTab)) {
      setActiveTab(dashboard.categories[0]?.id);
    }
  }, [dashboard.categories, activeTab]);


  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        updateScrollState();
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const updateScrollState = () => {
    const container = tabsContainerRef.current;
    const list = tabsListRef.current;

    if (!container || !list) {
      setShowScrollControls(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const hasOverflow = list.scrollWidth > container.clientWidth;
    setShowScrollControls(hasOverflow);

    if (hasOverflow) {
      const scrollLeft = container.scrollLeft;
      const maxScrollLeft = list.scrollWidth - container.clientWidth;



      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft < maxScrollLeft - 1);
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  };

  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      requestAnimationFrame(() => {
        updateScrollState();
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    const initialCheck = () => {
      updateScrollState();
    };

    initialCheck();
    const timeoutId = setTimeout(initialCheck, 100);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        updateScrollState();
      });
    });

    resizeObserver.observe(container);
    if (tabsListRef.current) {
      resizeObserver.observe(tabsListRef.current);
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [dashboard.categories.length]);

  const scrollTabs = (direction: "left" | "right") => {
    const container = tabsContainerRef.current;
    const list = tabsListRef.current;
    if (!container || !list) return;

    const scrollAmount = Math.floor(container.clientWidth * 0.75);
    const currentScroll = container.scrollLeft;
    const maxScroll = list.scrollWidth - container.clientWidth;

    let targetScroll;
    if (direction === "left") {
      targetScroll = Math.max(0, currentScroll - scrollAmount);
    } else {
      targetScroll = Math.min(maxScroll, currentScroll + scrollAmount);
    }

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth"
    });

    setTimeout(() => {
      updateScrollState();
    }, 300);
  };

  const isWidgetInCategory = (targetCategoryId: string, widgetId: string) => {
    const cat = dashboard.categories.find((c) => c.id === targetCategoryId);
    if (!cat) return false;
    return cat.displayedWidgets.includes(widgetId);
  };

  const handleToggle = (categoryId: string, widget: any, checked: boolean | null) => {
    dispatch(toggleWidgetInCategory({ categoryId, widget, checked: !!checked }));
  };

  const handleRemoveWidget = (widgetId: string) => {
    dispatch(removeWidget({ widgetId }));
  };

  const activeCategory = catalogByCategory.find(cat => cat.catId === activeTab) || catalogByCategory[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
       <SheetContent className="w-full sm:max-w-5xl h-[88vh] sm:h-auto overflow-y-auto p-4" >
        <SheetHeader className="px-4 sm:px-6 py-4 border-b shrink-0">
          <SheetTitle className="text-lg font-semibold">Add Widget</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0">
            <p className="text-sm text-muted-foreground mb-4">
              Personalise your dashboard by adding the following widgets.
            </p>

            <div className="flex items-center gap-2 mb-4">
              {dashboard.categories.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 shadow-sm"
                  onClick={() => scrollTabs("left")}
                  disabled={!canScrollLeft}
                  aria-label="Scroll tabs left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}

              {/* Scrollable tabs container */}
              <div
                ref={tabsContainerRef}
                className="flex-1 overflow-x-auto scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                <div
                  ref={tabsListRef}
                  className="flex gap-2 pb-1"
                  style={{ minWidth: 'max-content' }}
                >
                  {dashboard.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={cn(
                        "whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 shrink-0",
                        "border border-transparent min-w-[120px] text-center",
                        activeTab === category.id
                          ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                          : "hover:bg-muted hover:text-muted-foreground hover:shadow-sm hover:scale-[1.01]"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {dashboard.categories.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 shadow-sm"
                  onClick={() => scrollTabs("right")}
                  disabled={!canScrollRight}
                  aria-label="Scroll tabs right"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            {activeCategory && (
              <div className="space-y-3 pb-4">
                {activeCategory.widgets.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-sm text-muted-foreground">
                      No widgets available for this category.
                    </div>
                  </div>
                ) : (
                  activeCategory.widgets.map((widget: any) => {
                    const checked = isWidgetInCategory(activeTab || activeCategory.catId, widget.id);
                    return (
                      <div
                        key={widget.id}
                        className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors "
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) =>
                            handleToggle(activeTab || activeCategory.catId, widget, val === true)
                          }
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">
                            {widget.name}
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {widget.text}
                          </div>
                        </div>
                        {checked && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0  transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleRemoveWidget(widget.id)}
                            aria-label={`Remove ${widget.name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Confirm
          </Button>
        </SheetFooter>
      </SheetContent>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Sheet>
  );
};