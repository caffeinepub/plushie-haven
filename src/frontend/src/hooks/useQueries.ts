import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { LegacyPost, Event } from '../backend';

export function useListPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<LegacyPost[]>({
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
      imageBytes,
      imageContentType,
    }: {
      authorName: string | null;
      title: string;
      body: string;
      imageBytes?: Uint8Array | null;
      imageContentType?: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createPost(
        authorName,
        title,
        body,
        imageBytes || null,
        imageContentType || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useEditPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      body,
      authorName,
    }: {
      id: bigint;
      title: string;
      body: string;
      authorName: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.editPost(id, title, body, authorName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      authorName,
      title,
      description,
      location,
      startTime,
      endTime,
    }: {
      authorName: string | null;
      title: string;
      description: string;
      location: string;
      startTime: bigint;
      endTime: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createEvent(authorName, title, description, location, startTime, endTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
