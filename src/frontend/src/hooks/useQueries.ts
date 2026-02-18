import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Post, Event, Comment, PostWithCounts, Poll, PollWithResults, PollOption, backendInterface, PostEdit, ModeratedContent } from '../backend';
import { ExternalBlob } from '../backend';

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

  return useQuery<Post[]>({
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

  return useQuery<PostWithCounts[]>({
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
      video,
    }: {
      authorName: string | null;
      title: string;
      body: string;
      imageBytes?: Uint8Array | null;
      imageContentType?: string | null;
      video?: ExternalBlob | null;
    }) => {
      const validActor = requireActor(actor, isFetching);
      
      // Convert image bytes to ExternalBlob if provided
      let imageBlob: ExternalBlob | null = null;
      if (imageBytes && imageBytes.length > 0) {
        // Cast to Uint8Array<ArrayBuffer> to match ExternalBlob.fromBytes signature
        imageBlob = ExternalBlob.fromBytes(imageBytes as Uint8Array<ArrayBuffer>);
      }
      
      // Use createModerationRequest with both video and image
      return validActor.createModerationRequest(
        title,
        body,
        video || null,
        imageBlob
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsWithCounts'] });
      queryClient.invalidateQueries({ queryKey: ['moderationQueue'] });
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
      
      const postEdit: PostEdit = {
        authorName: authorName || undefined,
        title,
        body,
        video: undefined,
        image: undefined,
      };
      
      return validActor.editPost(id, postEdit);
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

// Moderation Queue Operations
export function useGetModerationQueue() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[bigint, ModeratedContent]>>({
    queryKey: ['moderationQueue'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getModerationQueue();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveModerationRequest() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.approveModerationRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderationQueue'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsWithCounts'] });
    },
  });
}

export function useRejectModerationRequest() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.rejectModerationRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderationQueue'] });
    },
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
      return validActor.createEvent(
        authorName,
        title,
        description,
        location,
        startTime,
        endTime
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Comments
export function useGetComments(postId: bigint) {
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
      queryClient.invalidateQueries({ queryKey: ['postsWithCounts'] });
    },
  });
}

// Likes
export function useGetPostLikeSummary(postId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['postLike', postId.toString()],
    queryFn: async () => {
      if (!actor) return { count: 0n, isLiked: false };
      const [count, isLiked] = await Promise.all([
        actor.getPostLikeCount(postId),
        actor.isPostLikedByCaller(postId),
      ]);
      return { count, isLiked };
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

export function useVote() {
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
      queryClient.invalidateQueries({ queryKey: ['pollResults', variables.pollId.toString()] });
    },
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
