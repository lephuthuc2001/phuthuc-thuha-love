'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export type MemoryWithMedia = Omit<Schema['Memory']['type'], 'attachments'> & { 
  imageUrls?: string[]; 
  attachments?: Schema['MemoryAttachment']['type'][];
  media?: { url: string; type: 'IMAGE' | 'VIDEO' | 'AUDIO'; id: string }[];
};

export function useMemories() {
  const queryClient = useQueryClient();

  // Fetch Memories
  const memoriesQuery = useQuery({
    queryKey: ['memories'],
    queryFn: async () => {
      const { data: items } = await client.models.Memory.list();
      
      const itemsWithAttachments = await Promise.all(
        items.map(async (item) => {
          // Fetch attachments for this memory
          const { data: attachments } = await client.models.MemoryAttachment.list({
            filter: { memoryId: { eq: item.id } }
          });
          
          let mediaItems: { url: string; type: 'IMAGE' | 'VIDEO' | 'AUDIO'; id: string }[] = [];
          
          if (attachments && attachments.length > 0) {
            mediaItems = await Promise.all(
              attachments.map(async (att) => {
                try {
                  const result = await getUrl({ path: att.path });
                  return {
                    url: result.url.toString(),
                    type: att.type as 'IMAGE' | 'VIDEO' | 'AUDIO' || 'IMAGE',
                    id: att.id
                  };
                } catch (e) {
                  return null;
                }
              })
            ).then(items => items.filter((item): item is NonNullable<typeof item> => item !== null));
          }
          
          return { 
            ...item, 
            attachments: attachments || [], 
            imageUrls: mediaItems.filter(m => m.type === 'IMAGE').map(m => m.url),
            media: mediaItems
          };
        })
      );

      return itemsWithAttachments.sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    },
  });

  // Create Memory Mutation
  const createMemoryMutation = useMutation({
    mutationFn: async (input: {
      title: string;
      date: string;
      description?: string;
      attachments?: { path: string; type: 'IMAGE' | 'VIDEO' | 'AUDIO' }[];
      images?: string[]; // Legacy support
      cost?: number;
      location?: string;
    }) => {
      // 1. Create Memory
      const { data: newMemory } = await client.models.Memory.create({
        title: input.title,
        date: input.date,
        description: input.description,
        cost: input.cost,
        location: input.location,
      });

      if (!newMemory) throw new Error("Failed to create memory");


      // 2. Create Attachments
      const attachmentsToCreate = input.attachments || 
        (input.images ? input.images.map(path => ({ path, type: 'IMAGE' as const })) : []);

      if (attachmentsToCreate.length > 0) {
        await Promise.all(
          attachmentsToCreate.map(att => 
            client.models.MemoryAttachment.create({
              memoryId: newMemory.id,
              path: att.path,
              type: att.type
            })
          )
        );
      }

      return newMemory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });

  // Update Memory Mutation
  const updateMemoryMutation = useMutation({
    mutationFn: async (input: {
      id: string;
      title?: string;
      date?: string;
      description?: string;
      attachments?: { path: string; type: 'IMAGE' | 'VIDEO' | 'AUDIO' }[];
      images?: string[]; // Legacy
      cost?: number;
      location?: string;
    }) => {
      // 1. Update Memory fields
      const { data: updatedMemory } = await client.models.Memory.update({
        id: input.id,
        title: input.title,
        date: input.date,
        description: input.description,
        cost: input.cost,
        location: input.location,
      });

      if (!updatedMemory) throw new Error("Failed to update memory");


      // 2. Sync Attachments
      const newAttachments = input.attachments || 
        (input.images ? input.images.map(path => ({ path, type: 'IMAGE' as const })) : null);

      if (newAttachments) {
        // Fetch existing
        const { data: existingAttachments } = await client.models.MemoryAttachment.list({
          filter: { memoryId: { eq: input.id } }
        });

        const newPaths = newAttachments.map(a => a.path);
        const currentPaths = existingAttachments.map(a => a.path);

        // Determine Additions
        const toAdd = newAttachments.filter(a => !currentPaths.includes(a.path));
        
        // Determine Deletions
        const toDelete = existingAttachments.filter(a => !newPaths.includes(a.path));

        await Promise.all([
          ...toAdd.map(att => 
            client.models.MemoryAttachment.create({
              memoryId: input.id,
              path: att.path,
              type: att.type
            })
          ),
          ...toDelete.map(att => 
            client.models.MemoryAttachment.delete({ id: att.id })
          )
        ]);
      }

      return updatedMemory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });

  // Delete Memory Mutation
  const deleteMemoryMutation = useMutation({
    mutationFn: async (id: string) => {
      // 1. Delete Attachments first
      const { data: attachments } = await client.models.MemoryAttachment.list({
         filter: { memoryId: { eq: id } } 
      });
      
      await Promise.all(
        attachments.map(att => client.models.MemoryAttachment.delete({ id: att.id }))
      );

      // 2. Delete Memory
      await client.models.Memory.delete({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });

  return {
    memories: memoriesQuery.data || [],
    isLoading: memoriesQuery.isLoading,
    isError: memoriesQuery.isError,
    createMemory: createMemoryMutation.mutateAsync,
    updateMemory: updateMemoryMutation.mutateAsync,
    deleteMemory: deleteMemoryMutation.mutateAsync,
    isSubmitting: createMemoryMutation.isPending || updateMemoryMutation.isPending || deleteMemoryMutation.isPending,
  };
}
