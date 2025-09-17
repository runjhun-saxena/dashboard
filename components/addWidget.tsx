"use client";

import React, { useState, useEffect } from "react";
import { Widget } from "../store/dashboardSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (widget: Widget) => void;
  categoryId?: string;
};

export const AddWidgetModal: React.FC<Props> = ({ open, onClose, onConfirm, categoryId }) => {
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setText("");
    }
  }, [open]);

  function handleConfirm() {
    if (!name.trim() || !categoryId) return;
    const widget: Widget = {
      id: "w_" + Date.now().toString(36),
      name: name.trim(),
      text: text.trim() || "Placeholder widget",
      categoryId: categoryId,
    };
    onConfirm(widget);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Widget name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Widget text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
