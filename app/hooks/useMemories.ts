'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export type MemoryWithUrls = Schema['Memory']['type'] & { imageUrls?: string[]; attachments?: Schema['MemoryAttachment']['type'][] };

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
          
          let urls: string[] = [];
          
          if (attachments && attachments.length > 0) {
            urls = await Promise.all(
              attachments.map(async (att) => {
                try {
                  const result = await getUrl({ path: att.path });
                  return result.url.toString();
                } catch (e) {
                  return '';
                }
              })
            );
          }
          
          return { 
            ...item, 
            attachments: attachments || [], 
            imageUrls: urls.filter(Boolean) as string[] 
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
      images?: string[];
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

      // 2. Create Attachments
      if (input.images && input.images.length > 0) {
        await Promise.all(
          input.images.map(path => 
            client.models.MemoryAttachment.create({
              memoryId: newMemory.id,
              path,
              type: 'IMAGE'
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
      images?: string[];
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

      // 2. Sync Attachments
      if (input.images) {
        // Fetch existing
        const { data: existingAttachments } = await client.models.MemoryAttachment.list({
          filter: { memoryId: { eq: input.id } }
        });

        const newPaths = input.images;
        const currentPaths = existingAttachments.map(a => a.path);

        // Determine Additions
        const toAdd = newPaths.filter(p => !currentPaths.includes(p));
        
        // Determine Deletions
        const toDelete = existingAttachments.filter(a => !newPaths.includes(a.path));

        await Promise.all([
          ...toAdd.map(path => 
            client.models.MemoryAttachment.create({
              memoryId: input.id,
              path,
              type: 'IMAGE'
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
