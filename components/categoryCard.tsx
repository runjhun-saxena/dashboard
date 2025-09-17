import React from "react";
import { Category, Widget } from "../store/dashboardSlice";
import { WidgetCard } from "./widgetCard";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";

type Props = {
  category: Category;
  availableWidgets: Widget[];
  onAddWidgetClick: (categoryId: string) => void;
  onRemoveWidget: (categoryId: string, widgetId: string) => void;
};

export const CategoryCard: React.FC<Props> = ({
  category,
  availableWidgets,
  onAddWidgetClick,
  onRemoveWidget,
}) => {
  const displayedWidgets = category.displayedWidgets
    .map(widgetId => availableWidgets.find(w => w.id === widgetId))
    .filter(Boolean) as Widget[];

  return (
    <div className="bg-white/95 rounded-2xl p-5 shadow-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">{category.name}</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onAddWidgetClick(category.id)}
            variant="outline"
            size="sm"
          >
            + Add Widget
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <AnimatePresence>
          {displayedWidgets.map((w) => (
            <WidgetCard
              key={w.id}
              widget={w}
              onRemove={() => onRemoveWidget(category.id, w.id)}
            />
          ))}
        </AnimatePresence>


      </div>
    </div>
  );
};
