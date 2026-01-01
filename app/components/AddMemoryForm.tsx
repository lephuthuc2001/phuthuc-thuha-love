'use client';

import { useState, useEffect } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { type Schema } from '@/amplify/data/resource';
import { useMemories, type MemoryWithMedia } from '@/app/hooks/useMemories';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


const memorySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  cost: z.number().min(0).optional(),
  location: z.string().optional(),
});

type MemoryFormValues = z.infer<typeof memorySchema>;

interface AddMemoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: MemoryWithMedia | null; 
}

export default function AddMemoryForm({ open, onOpenChange, initialData }: AddMemoryFormProps) {
  const [newFiles, setNewFiles] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; path: string; url: string; type: 'IMAGE' | 'VIDEO' | 'AUDIO' }[]>([]);

  const [displayCost, setDisplayCost] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema as any),
    defaultValues: {
      cost: 0,
      title: '',
      date: '',
      description: '',
      location: ''
    }
  });

  useEffect(() => {
    if (open) {
      reset(initialData ? {
        title: initialData.title,
        description: initialData.description ?? '',
        date: initialData.date,
        cost: initialData.cost ?? 0,
        location: initialData.location ?? '',
      } : {
        title: '',
        date: '',
        description: '',
        cost: 0,
        location: '',
      });

      // Populate existing images from attachments
      if (initialData?.attachments) {
        setExistingImages(initialData.attachments.map((att: any, i: number) => ({
          id: att.id,
          path: att.path,
          url: initialData.imageUrls?.[i] || initialData.media?.find((m:any) => m.id === att.id)?.url || '',
          type: att.type || 'IMAGE'
        })));
      } else {
        setExistingImages([]);
      }
      
      newFiles.forEach(item => URL.revokeObjectURL(item.preview));
      setNewFiles([]);

      if (initialData?.cost) {
        setDisplayCost(new Intl.NumberFormat('vi-VN').format(initialData.cost));
      } else {
        setDisplayCost('0');
      }
    }
  }, [open, initialData, reset]);

  const formatVND = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(digits));
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatVND(rawValue);
    setDisplayCost(formatted);
    
    // Update form value as number
    const numericValue = parseInt(rawValue.replace(/\D/g, '')) || 0;
    setValue('cost', numericValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newItems = files.map(file => ({
        id: Math.random().toString(36).substring(7) + Date.now(),
        file,
        preview: URL.createObjectURL(file)
      }));
      setNewFiles(prev => [...prev, ...newItems]);
    }
  };


  const removeFile = (id: string) => {
    const itemToRemove = newFiles.find(item => item.id === id);
    if (itemToRemove) URL.revokeObjectURL(itemToRemove.preview);
    setNewFiles(prev => prev.filter(item => item.id !== id));
  };

  
  const removeExisting = (id: string) => {
    setExistingImages(prev => prev.filter(item => item.id !== id));
  };

  const { createMemory, updateMemory, deleteMemory, isSubmitting: isHookSubmitting } = useMemories();
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const isSubmitting = internalSubmitting || isHookSubmitting;

  const onSubmit = async (data: MemoryFormValues) => {
    setInternalSubmitting(true);

    try {
      // 1. Prepare attachments list
      const attachments: { path: string; type: 'IMAGE' | 'VIDEO' | 'AUDIO' }[] = [];

      // Add existing attachments
      existingImages.forEach(img => {
        attachments.push({ path: img.path, type: img.type });
      });

      // Upload and add new files
      for (const item of newFiles) {
        const path = `media/memories/${Date.now()}-${item.file.name}`;
        await uploadData({
          path,
          data: item.file,
        }).result;
        
        let type: 'IMAGE' | 'VIDEO' | 'AUDIO' = 'IMAGE';
        if (item.file.type.startsWith('video/')) type = 'VIDEO';
        if (item.file.type.startsWith('audio/')) type = 'AUDIO';

        attachments.push({ path, type });
      }

      const input = {
        title: data.title,
        description: data.description || '',
        date: data.date,
        cost: data.cost || 0,
        location: data.location || '',
        attachments: attachments,
      };

      if (initialData) {
        await updateMemory({ id: initialData.id, ...input });
      } else {
        await createMemory(input);
      }

      console.log('Memory saved successfully!');
      reset();
      newFiles.forEach(item => URL.revokeObjectURL(item.preview));
      setNewFiles([]);

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving memory:', error);
    } finally {
      setInternalSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    setInternalSubmitting(true);
    try {
      await deleteMemory(initialData.id);
      console.log('Memory deleted');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting memory:', error);
    } finally {
      setInternalSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card bg-black/80 backdrop-blur-xl border-white/10 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {initialData ? 'Edit Memory ✏️' : 'Add New Memory ✨'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/80">Title</Label>
            <Input 
              id="title"
              {...register('title')}
              className="bg-white/10 text-white placeholder:text-white/30 border-white/20 focus:ring-pink-400/50"
              placeholder="e.g. Dinner at..."
            />
            {errors.title && <p className="text-red-300 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-white/80">Date</Label>
            <Input 
              id="date"
              type="date" 
              {...register('date')}
              className="bg-white/10 text-white border-white/20 focus:ring-pink-400/50"
            />
            {errors.date && <p className="text-red-300 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/80">Description</Label>
            <Textarea 
              id="description"
              {...register('description')}
              className="bg-white/10 text-white placeholder:text-white/30 border-white/20 focus:ring-pink-400/50 h-24 resize-none"
              placeholder="How did it feel...?"
            />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-white/80">Cost (VND)</Label>
              <div className="relative">
                <Input 
                  id="cost"
                  type="text" 
                  value={displayCost}
                  onChange={handleCostChange}
                  className="bg-white/10 text-white placeholder:text-white/30 border-white/20 focus:ring-pink-400/50 pl-8 h-12"
                  placeholder="0"
                />
                <span className="absolute left-3 top-3.5 text-white/50 text-xs">₫</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white/80">Location</Label>
              <Input 
                id="location"
                {...register('location')}
                className="bg-white/10 text-white placeholder:text-white/30 border-white/20 focus:ring-pink-400/50 h-12"
                placeholder="Where was this? (e.g. Near the big lake...)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Photos</Label>
            

            {/* Recent/Existing Files Grid */}
            {(existingImages.length > 0 || newFiles.length > 0) && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {existingImages.map((img) => {
                   const isVideo = img.path.toLowerCase().endsWith('.mp4') || img.path.toLowerCase().endsWith('.mov'); // Simple heuristic if type missing
                   // Better: use the type from initialData if available. For now let's rely on extension or assuming image for legacy
                   
                   return (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10 bg-black/40">
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                         {isVideo ? <i className="fas fa-video text-2xl"></i> : <i className="fas fa-image text-2xl"></i>}
                      </div> 
                      {img.url && !isVideo && (
                        <img src={img.url} alt="existing" className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <i className="fas fa-play-circle text-3xl text-white/80"></i>
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={() => removeExisting(img.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                   )
                })}
 
                {newFiles.map((item) => {
                  const isImage = item.file.type.startsWith('image/');
                  const isVideo = item.file.type.startsWith('video/');
                  const isAudio = item.file.type.startsWith('audio/');

                  return (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10 bg-black/40">
                      {isImage && <img src={item.preview} alt="preview" className="w-full h-full object-cover" />}
                      {isVideo && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                           <i className="fas fa-video text-3xl text-pink-400"></i>
                        </div>
                      )}
                      {isAudio && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                           <i className="fas fa-music text-3xl text-pink-400"></i>
                        </div>
                      )}
                      
                      <button 
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}


            <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <i className="fas fa-cloud-upload-alt text-2xl text-pink-300 mb-2"></i>
                <p className="text-sm text-white/70">
                  <span className="font-semibold">Click to upload</span> media
                </p>
                <p className="text-xs text-white/50">Images, Videos, or Audio</p>
              </div>
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*,audio/*"
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
            {initialData && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="destructive"
                    className="h-12 w-12 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-none"
                    title="Delete Memory"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card bg-black/90 backdrop-blur-xl border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      This action cannot be undone. This will permanently delete your memory and remove the data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-red-600 text-white hover:bg-red-700 border-none"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl bg-white/5 text-white hover:bg-white/10 border-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
                </span>
              ) : 'Save Memory'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
