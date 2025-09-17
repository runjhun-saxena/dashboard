import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string, name: string) => void;
  initialName?: string;
};

export const AddCategoryModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  initialName = "",
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName || "");
  }, [open, initialName]);

  if (!open) return null;

  function handleAdd() {
    if (!name.trim()) return;
    onConfirm("c_" + Date.now().toString(36), name.trim());
    setName("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md bg-white rounded-xl p-6 shadow-lg"
      >
        <h4 className="font-semibold mb-2">Add Category</h4>

        <label className="block text-xs text-gray-600">Category name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border p-2 mt-1 mb-3"
          placeholder="e.g. CSPM Executive Dashboard"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded-md border">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-3 py-1 rounded-md bg-blue-600 text-white"
          >
            Add
          </button>
        </div>
      </motion.div>
    </div>
  );
};
