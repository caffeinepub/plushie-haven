import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Event type definition (since backend doesn't have events yet)
export interface Event {
  id: bigint;
  author: string;
  title: string;
  description: string;
  location: string;
  startTime: bigint;
  endTime: bigint;
  createdAt: bigint;
}

export function useListEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      // Backend doesn't have events yet, return empty array
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      title: string;
      description: string;
      location: string;
      startTime: bigint;
      endTime: bigint;
    }) => {
      // Backend doesn't have events yet
      throw new Error('Event creation is not yet implemented in the backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
