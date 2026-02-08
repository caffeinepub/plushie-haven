import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Post } from '../backend';

export function useListPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      authorName,
      title,
      body,
    }: {
      authorName: string | null;
      title: string;
      body: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createPost(authorName, title, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
