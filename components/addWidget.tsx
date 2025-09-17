import React, { useState, useEffect } from "react";
import { Widget } from "../store/dashboardSlice";
import { motion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (widget: Widget) => void;
  initialName?: string;
};

export const AddWidgetModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  initialName = "",
}) => {
  const [name, setName] = useState(initialName);
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialName || "");
      setText("");
    }
  }, [open, initialName]);

  if (!open) return null;

  function handleConfirm() {
    if (!name.trim()) return;
    const widget: Widget = {
      id: "w_" + Date.now().toString(36),
      name: name.trim(),
      text: text.trim() || "Placeholder widget content",
    };
    onConfirm(widget);
    setName("");
    setText("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md bg-white rounded-xl p-6 shadow-lg"
      >
        <h4 className="font-semibold mb-2">Add Widget</h4>

        <label className="block text-xs text-gray-600">Widget name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border p-2 mt-1 mb-3"
          placeholder="e.g. Cloud Accounts"
        />

        <label className="block text-xs text-gray-600">Widget text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-md border p-2 mt-1 mb-3"
          rows={3}
          placeholder="Short description or placeholder text"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded-md border">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1 rounded-md bg-blue-600 text-white"
          >
            Add
          </button>
        </div>
      </motion.div>
    </div>
  );
};
