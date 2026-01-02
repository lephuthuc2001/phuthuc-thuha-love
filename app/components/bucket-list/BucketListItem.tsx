import { motion } from "motion/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Schema } from "@/amplify/data/resource";

type BucketItem = Schema["BucketItem"]["type"];

interface BucketListItemProps {
  item: BucketItem;
  toggleComplete: (item: BucketItem) => void;
  handleEdit: (item: BucketItem) => void;
  deleteItem: (id: string) => void;
  editingItem: BucketItem | null;
  editText: string;
  setEditText: (text: string) => void;
  saveEdit: () => void;
  setEditingItem: (item: BucketItem | null) => void;
  isDraggable?: boolean;
  dragControls?: any;
}

export function BucketListItem({
  item,
  toggleComplete,
  handleEdit,
  deleteItem,
  editingItem,
  editText,
  setEditText,
  saveEdit,
  setEditingItem,
  isDraggable,
  dragControls,
}: BucketListItemProps) {
  return (
    <div
      className={`w-full group flex flex-col md:flex-row md:items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all ${
        item.completed
          ? "bg-green-50/50 border-green-100 shadow-sm"
          : "bg-white border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5"
      }`}
    >
      {editingItem?.id === item.id ? (
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full animate-in fade-in slide-in-from-left-2 duration-300 p-1">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") setEditingItem(null);
            }}
            className="flex-1 h-12 sm:h-14 rounded-xl border-2 border-pink-200 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 bg-white text-base px-4 transition-all"
            autoFocus
          />
          <div className="flex gap-2 justify-end sm:shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={saveEdit}
              className="flex-1 sm:flex-none text-green-500 hover:bg-green-100 h-11 w-full sm:w-12 bg-white shadow-sm border border-green-100 rounded-xl transition-all active:scale-95"
            >
              <i className="fas fa-check"></i>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingItem(null)}
              className="flex-1 sm:flex-none text-gray-400 hover:bg-gray-100 h-11 w-full sm:w-12 bg-white shadow-sm border border-gray-100 rounded-xl transition-all active:scale-95"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {isDraggable && dragControls && (
              <div 
                className="pt-2 text-gray-300 cursor-grab active:cursor-grabbing touch-none px-1"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <i className="fas fa-grip-vertical"></i>
              </div>
            )}
            <div className="pt-0.5 shrink-0 relative group/checkbox">
              <Checkbox
                checked={!!item.completed}
                onCheckedChange={() => toggleComplete(item)}
                className={cn(
                  "peer h-8 w-8 rounded-full border-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white transition-all duration-300",
                  item.completed
                    ? "border-pink-500"
                    : "border-pink-200 bg-pink-50/30 hover:border-pink-400 hover:bg-pink-100/50"
                )}
              />
              {!item.completed && (
                <i className="fas fa-heart absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-pink-200 group-hover/checkbox:text-pink-400 transition-colors pointer-events-none"></i>
              )}
            </div>

            <span
              className={`flex-1 break-words min-w-0 text-[15px] sm:text-lg leading-relaxed ${
                item.completed
                  ? "line-through text-gray-400 font-normal italic"
                  : "text-gray-700 font-semibold"
              }`}
            >
              {item.text}
            </span>
          </div>

          <div className="flex gap-2 shrink-0 items-center justify-end md:justify-center mt-2 md:mt-0 pt-2 md:pt-0 border-t border-gray-50 md:border-none">
            {!item.completed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(item)}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-pink-400 hover:text-pink-600 hover:bg-pink-50 h-9 w-9 sm:h-11 sm:w-11 rounded-xl active:scale-90 duration-200"
              >
                <i className="fas fa-edit text-sm"></i>
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-red-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 sm:h-11 sm:w-11 rounded-xl active:scale-90 duration-200"
                >
                  <i className="fas fa-trash text-sm"></i>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card bg-black/90 backdrop-blur-xl border-white/10 text-white rounded-3xl mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">
                    Delete this dream?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-white/60">
                    Are you sure you want to remove "{item.text}" from our
                    bucket list?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row gap-2">
                  <AlertDialogCancel className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl mt-0">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteItem(item.id)}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700 border-none rounded-xl"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
