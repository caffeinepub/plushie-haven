import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { normalizeActorError } from '../utils/actorError';
import type { UserProfile, UserProfileEdit, FollowCounts } from '../backend';
import { Principal } from '@dfinity/principal';

/**
 * Fetch all profiles that are opted into the public directory
 */
export function useListDirectoryProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['directoryProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDirectoryProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Fetch a specific user's profile by principal
 */
export function useGetUserProfile(principalString: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principalString],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const principal = Principal.fromText(principalString);
        return actor.getUserProfile(principal);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principalString,
  });
}

/**
 * Fetch the caller's own profile for editing
 */
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

/**
 * Save or update the caller's profile
 */
export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileEdit: UserProfileEdit) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCallerUserProfile(profileEdit);
    },
    onSuccess: (_, variables) => {
      // Invalidate caller's profile
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      
      // Invalidate directory listing if visibility changed
      if (variables.publicDirectory) {
        queryClient.invalidateQueries({ queryKey: ['directoryProfiles'] });
      }
      
      // Invalidate the specific user profile view
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      throw new Error(normalizeActorError(error));
    },
  });
}

// Profile Follow
export function useGetFollowSummary(targetPrincipal: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['followSummary', targetPrincipal],
    queryFn: async () => {
      if (!actor) return { followersCount: 0n, followingCount: 0n, callerFollowsTarget: false };
      try {
        const principal = Principal.fromText(targetPrincipal);
        const [counts, callerFollows] = await Promise.all([
          actor.getFollowCounts(principal),
          actor.doesCallerFollow(principal),
        ]);
        return {
          followersCount: counts.followers,
          followingCount: counts.following,
          callerFollowsTarget: callerFollows,
        };
      } catch (error) {
        console.error('Error fetching follow summary:', error);
        return { followersCount: 0n, followingCount: 0n, callerFollowsTarget: false };
      }
    },
    enabled: !!actor && !isFetching && !!targetPrincipal,
  });
}

export function useFollowProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not initialized');
      const principal = Principal.fromText(targetPrincipal);
      return actor.follow(principal);
    },
    onSuccess: (_, targetPrincipal) => {
      queryClient.invalidateQueries({ queryKey: ['followSummary', targetPrincipal] });
    },
  });
}

export function useUnfollowProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not initialized');
      const principal = Principal.fromText(targetPrincipal);
      return actor.unfollow(principal);
    },
    onSuccess: (_, targetPrincipal) => {
      queryClient.invalidateQueries({ queryKey: ['followSummary', targetPrincipal] });
    },
  });
}

// Profile Likes
export function useGetProfileLikeSummary(targetPrincipal: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['profileLike', targetPrincipal],
    queryFn: async () => {
      if (!actor) return { likeCount: 0n, callerLiked: false };
      try {
        const principal = Principal.fromText(targetPrincipal);
        const [likeCount, callerLiked] = await Promise.all([
          actor.getProfileLikeCount(principal),
          actor.isProfileLikedByCaller(principal),
        ]);
        return { likeCount, callerLiked };
      } catch (error) {
        console.error('Error fetching profile like summary:', error);
        return { likeCount: 0n, callerLiked: false };
      }
    },
    enabled: !!actor && !isFetching && !!targetPrincipal,
  });
}

export function useLikeProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not initialized');
      const principal = Principal.fromText(targetPrincipal);
      return actor.likeProfile(principal);
    },
    onSuccess: (_, targetPrincipal) => {
      queryClient.invalidateQueries({ queryKey: ['profileLike', targetPrincipal] });
    },
  });
}

export function useUnlikeProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not initialized');
      const principal = Principal.fromText(targetPrincipal);
      return actor.unlikeProfile(principal);
    },
    onSuccess: (_, targetPrincipal) => {
      queryClient.invalidateQueries({ queryKey: ['profileLike', targetPrincipal] });
    },
  });
}
