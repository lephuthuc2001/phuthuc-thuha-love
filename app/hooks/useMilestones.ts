'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export type Milestone = Schema['Milestone']['type'];

export function useMilestones() {
  const queryClient = useQueryClient();

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const { data: items } = await client.models.Milestone.list();
      return (items || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  });

  // Memoize dates to prevent infinite re-renders in components using them as effect dependencies
  const { startDate, nextMilestone, nextMilestoneDate } = useMemo(() => {
    const startObj = milestones.find(m => m.category === 'relationship_start');
    const start = startObj ? new Date(startObj.date) : new Date('2025-07-01');

    const next = milestones
      .filter(m => !m.isReached)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    const nextDate = next ? new Date(next.date) : new Date();

    return { 
      startDate: start, 
      nextMilestone: next, 
      nextMilestoneDate: nextDate 
    };
  }, [milestones]);

  // Create Milestone Mutation
  const createMilestone = useMutation({
    mutationFn: async (input: {
      title: string;
      date: string;
      icon?: string;
      isReached?: boolean;
      order?: number;
      category?: string;
    }) => {
      const { data: newMilestone } = await client.models.Milestone.create(input);
      return newMilestone;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  // Update Milestone Mutation
  const updateMilestone = useMutation({
    mutationFn: async (input: Partial<Milestone> & { id: string }) => {
      const { data: updated } = await client.models.Milestone.update(input);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });

  const seedMilestones = async () => {
    const defaults = [
      {
        title: "First Date",
        date: "2025-06-29",
        icon: "heart",
        isReached: true,
        order: 1,
        category: "other"
      },
      {
        title: "First Day",
        date: "2025-07-01",
        icon: "check",
        isReached: true,
        order: 2,
        category: "relationship_start"
      },
      {
        title: "1 Month",
        date: "2025-08-01",
        icon: "check",
        isReached: true,
        order: 3,
        category: "anniversary"
      },
      {
        title: "100 Days",
        date: "2025-10-09",
        icon: "check",
        isReached: true,
        order: 4,
        category: "other"
      },
      {
        title: "6 Months",
        date: "2026-01-01",
        icon: "heart",
        isReached: true,
        order: 5,
        category: "anniversary"
      },
      {
        title: "1 Year",
        date: "2026-07-01",
        icon: "lock",
        isReached: false,
        order: 6,
        category: "anniversary"
      }
    ];

    for (const m of defaults) {
      await client.models.Milestone.create(m);
    }
    queryClient.invalidateQueries({ queryKey: ['milestones'] });
  };

  return {
    milestones,
    isLoading,
    startDate,
    nextMilestone,
    nextMilestoneDate,
    createMilestone: createMilestone.mutateAsync,
    updateMilestone: updateMilestone.mutateAsync,
    seedMilestones,
  };
}
