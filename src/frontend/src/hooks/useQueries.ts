import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { LegacyPost, Event, Comment, LegacyPostWithCounts, Poll, PollWithResults, PollOption, backendInterface } from '../backend';

/**
 * Helper to ensure actor is available before mutation.
 * Throws a user-friendly error if actor is not ready.
 */
function requireActor(actor: backendInterface | null, isFetching: boolean): backendInterface {
  // If actor is initializing, show connecting message
  if (isFetching && !actor) {
    throw new Error('ACTOR_CONNECTING');
  }
  
  // If actor is still null, show connecting message
  if (!actor) {
    throw new Error('ACTOR_CONNECTING');
  }
  
  return actor;
}

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

export function useListPostsWithCounts() {
  const { actor, isFetching } = useActor();

  return useQuery<LegacyPostWithCounts[]>({
    queryKey: ['postsWithCounts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPostsWithCounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor, isFetching } = useActor();
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
      const validActor = requireActor(actor, isFetching);
      return validActor.createPost(
        authorName,
        title,
        body,
        imageBytes || null,
        imageContentType || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsWithCounts'] });
    },
  });
}

export function useDeletePost() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsWithCounts'] });
    },
  });
}

export function useEditPost() {
  const { actor, isFetching } = useActor();
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
      const validActor = requireActor(actor, isFetching);
      return validActor.editPost(id, title, body, authorName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsWithCounts'] });
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
  const { actor, isFetching } = useActor();
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
      const validActor = requireActor(actor, isFetching);
      return validActor.createEvent(authorName, title, description, location, startTime, endTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Post Likes
export function useGetPostLikeSummary(postId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['postLike', postId.toString()],
    queryFn: async () => {
      if (!actor) return { likeCount: 0n, callerLiked: false };
      const [likeCount, callerLiked] = await Promise.all([
        actor.getPostLikeCount(postId),
        actor.isPostLikedByCaller(postId),
      ]);
      return { likeCount, callerLiked };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLikePost() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.likePost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['postLike', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['postsWithCounts'] });
    },
  });
}

export function useUnlikePost() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.unlikePost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['postLike', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['postsWithCounts'] });
    },
  });
}

// Comments
export function useListComments(postId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCommentCount(postId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['commentCount', postId.toString()],
    queryFn: async () => {
      if (!actor) return 0;
      const results = await actor.getCommentCounts([postId]);
      return results.length > 0 ? Number(results[0][1]) : 0;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateComment() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      authorName,
      content,
    }: {
      postId: bigint;
      authorName: string | null;
      content: string;
    }) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.createComment(postId, authorName, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['commentCount', variables.postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['postsWithCounts'] });
    },
  });
}

// Polls
export function useListPolls() {
  const { actor, isFetching } = useActor();

  return useQuery<Poll[]>({
    queryKey: ['polls'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPolls();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPollResults(pollId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<PollWithResults>({
    queryKey: ['pollResults', pollId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPollResults(pollId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePoll() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      question,
      options,
    }: {
      question: string;
      options: PollOption[];
    }) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.createPoll(question, options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useVotePoll() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pollId,
      optionId,
    }: {
      pollId: bigint;
      optionId: bigint;
    }) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.vote(pollId, optionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['pollResults', variables.pollId.toString()] });
    },
  });
}
