'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export type MemoryWithUrls = Schema['Memory']['type'] & { imageUrls?: string[] };

export function useMemories() {
  const queryClient = useQueryClient();

  // Fetch Memories
  const memoriesQuery = useQuery({
    queryKey: ['memories'],
    queryFn: async () => {
      const { data: items } = await client.models.Memory.list();
      const sortedItems = (items || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const itemsWithUrls = await Promise.all(
        sortedItems.map(async (item) => {
          if (item.images && item.images.length > 0) {
            const urls = await Promise.all(
              item.images.map(async (path) => {
                try {
                  const result = await getUrl({ path: path as string });
                  return result.url.toString();
                } catch (e) {
                  return null;
                }
              })
            );
            return { ...item, imageUrls: urls.filter(Boolean) as string[] };
          }
          return { ...item, imageUrls: [] };
        })
      );
      return itemsWithUrls;
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
      const { data: newMemory } = await client.models.Memory.create(input);
      return newMemory;
    },
    onMutate: async (newMemory) => {
      // Trigger cancellation but don't await it for maximum snappiness
      queryClient.cancelQueries({ queryKey: ['memories'] });
      
      const previousMemories = queryClient.getQueryData<MemoryWithUrls[]>(['memories']);
      
      if (previousMemories) {
        const optimisticMemory = {
          ...newMemory,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageUrls: [],
          images: newMemory.images || [],
          description: newMemory.description || null,
          cost: newMemory.cost || null,
          location: newMemory.location || null,
        } as MemoryWithUrls;

        queryClient.setQueryData(['memories'], [optimisticMemory, ...previousMemories]);
      }
      
      return { previousMemories };
    },
    onError: (err, newMemory, context) => {
      if (context?.previousMemories) {
        queryClient.setQueryData(['memories'], context.previousMemories);
      }
    },
    onSettled: () => {
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
      const { data: updatedMemory } = await client.models.Memory.update(input);
      return updatedMemory;
    },
    onMutate: async (updatedMemory) => {
      queryClient.cancelQueries({ queryKey: ['memories'] });
      const previousMemories = queryClient.getQueryData<MemoryWithUrls[]>(['memories']);
      
      if (previousMemories) {
        queryClient.setQueryData(
          ['memories'],
          previousMemories.map((m) => (m.id === updatedMemory.id ? { ...m, ...updatedMemory } : m))
        );
      }
      
      return { previousMemories };
    },
    onError: (err, updatedMemory, context) => {
      if (context?.previousMemories) {
        queryClient.setQueryData(['memories'], context.previousMemories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });

  // Delete Memory Mutation
  const deleteMemoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.models.Memory.delete({ id });
    },
    onMutate: async (id) => {
      queryClient.cancelQueries({ queryKey: ['memories'] });
      const previousMemories = queryClient.getQueryData<MemoryWithUrls[]>(['memories']);
      
      if (previousMemories) {
        queryClient.setQueryData(
          ['memories'],
          previousMemories.filter((m) => m.id !== id)
        );
      }
      
      return { previousMemories };
    },
    onError: (err, id, context) => {
      if (context?.previousMemories) {
        queryClient.setQueryData(['memories'], context.previousMemories);
      }
    },
    onSettled: () => {
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
