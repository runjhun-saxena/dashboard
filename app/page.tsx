'use client';
import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import {
  addCategory,
  addWidget,
  removeWidget,
  DashboardState,
} from "../store/dashboardSlice";

import { CategoryCard } from "@/components/categoryCard";
import { AddWidgetModal } from "@/components/addWidget";
import { AddCategoryModal } from "@/components/addCategory";


export default function Home() {
  const dashboard = useSelector((s: RootState) => s.dashboard);
  const dispatch = useDispatch<AppDispatch>();

  const [query, setQuery] = useState("");
  const [addWidgetOpenFor, setAddWidgetOpenFor] = useState<string | null>(
    null
  );
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  // flattened widgets for search
  const allWidgetsFlat = useMemo(() => {
    return dashboard.categories.flatMap((c) =>
      c.widgets.map((w) => ({ ...w, categoryId: c.id, categoryName: c.name }))
    );
  }, [dashboard]);

  const filteredWidgets = useMemo(() => {
    if (!query.trim()) return allWidgetsFlat;
    const q = query.toLowerCase();
    return allWidgetsFlat.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.text.toLowerCase().includes(q) ||
        w.categoryName.toLowerCase().includes(q)
    );
  }, [query, allWidgetsFlat]);

  function handleAddWidgetConfirm(widget: any) {
    if (!addWidgetOpenFor) return;
    dispatch(addWidget({ categoryId: addWidgetOpenFor, widget }));
    setAddWidgetOpenFor(null);
  }

  function handleRemoveWidget(categoryId: string, widgetId: string) {
    dispatch(removeWidget({ categoryId, widgetId }));
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">CNAPP Dashboard</h1>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setAddCategoryOpen(true)}
              className="px-3 py-2 rounded-md bg-indigo-600 text-white"
            >
              + Add Category
            </button>
          </div>
        </header>

        {/* Search results */}
        {query.trim() ? (
          <section className="mb-6">
            <h3 className="font-semibold mb-3">Search results</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {filteredWidgets.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-xl p-4 border flex justify-between"
                >
                  <div>
                    <div className="font-semibold">{w.name}</div>
                    <div className="text-xs text-gray-600">{w.text}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Category: {w.categoryName}
                    </div>
                  </div>
                </div>
              ))}
              {filteredWidgets.length === 0 && (
                <div className="text-sm text-gray-500">No widgets found</div>
              )}
            </div>
          </section>
        ) : null}

        {/* Categories grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {dashboard.categories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              onAddWidgetClick={(id) => setAddWidgetOpenFor(id)}
              onRemoveWidget={handleRemoveWidget}
            />
          ))}
        </div>

        <AddWidgetModal
          open={!!addWidgetOpenFor}
          onClose={() => setAddWidgetOpenFor(null)}
          onConfirm={handleAddWidgetConfirm}
        />

        <AddCategoryModal
          open={addCategoryOpen}
          onClose={() => setAddCategoryOpen(false)}
          onConfirm={(id: string, name: string) =>
            dispatch(addCategory({ id, name }))
          }
        />
      </div>
    </div>
  );
}
