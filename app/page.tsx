'use client';
import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import {
  addCategory,
  addAndShowWidget,
  removeWidget,
} from "../store/dashboardSlice";
import { CategoryCard } from "@/components/categoryCard";
import { AddWidgetModal } from "@/components/addWidget";
import { AddCategoryModal } from "@/components/addCategory";
import { Button } from "@/components/ui/button";
import { AllWidgetsDrawer } from "@/components/allWidgetPanel";

export default function Home() {
  const dashboard = useSelector((s: RootState) => s.dashboard);
  const dispatch = useDispatch<AppDispatch>();
  const [addWidgetOpenFor, setAddWidgetOpenFor] = useState<string | null>(
    null
  );
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleAddWidgetConfirm(widget: any) {
    if (!addWidgetOpenFor) return;
    dispatch(addAndShowWidget({ categoryId: addWidgetOpenFor, widget }));
    setAddWidgetOpenFor(null);
  }

  function handleRemoveWidget(categoryId: string, widgetId: string) {
    dispatch(removeWidget({ widgetId }));
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">CNAPP Dashboard</h1>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button onClick={() => setAddCategoryOpen(true)}>+ Add Category</Button>
            <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
              + Add Widget (Panel)
            </Button>
          </div>
        </header>
        
        <div className="flex flex-col gap-6">
          {dashboard.categories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              availableWidgets={dashboard.availableWidgets}
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

      <AllWidgetsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}