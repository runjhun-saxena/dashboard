// components/CategoryCard.tsx
import React from "react";
import { Category } from "../store/dashboardSlice";
import { WidgetCard } from "./widgetCard";
import { AnimatePresence } from "framer-motion";

type Props = {
  category: Category;
  onAddWidgetClick: (categoryId: string) => void;
  onRemoveWidget: (categoryId: string, widgetId: string) => void;
};

export const CategoryCard: React.FC<Props> = ({
  category,
  onAddWidgetClick,
  onRemoveWidget,
}) => {
  return (
    <div className="bg-white/95 rounded-2xl p-5 shadow-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">{category.name}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddWidgetClick(category.id)}
            className="px-3 py-1 rounded-md border bg-white text-sm hover:shadow"
          >
            + Add Widget
          </button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <AnimatePresence>
          {category.widgets.map((w) => (
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
