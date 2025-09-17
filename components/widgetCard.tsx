// components/WidgetCard.tsx
import React from "react";
import { Widget } from "../store/dashboardSlice";
import { motion } from "framer-motion";

type Props = {
  widget: Widget;
  onRemove: () => void;
};

export const WidgetCard: React.FC<Props> = ({ widget, onRemove }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="bg-white rounded-xl p-4 shadow-sm border min-h-[88px] flex flex-col justify-between"
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="font-semibold text-sm">{widget.name}</h4>
          <p className="text-xs text-gray-600 mt-2">{widget.text}</p>
        </div>
        <button
          onClick={onRemove}
          aria-label="remove"
          className="text-gray-400 hover:text-red-500 text-xl leading-none"
          title="Remove widget"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};
