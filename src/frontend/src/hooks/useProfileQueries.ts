import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile, UserProfileEdit } from '../backend';

export function useListDirectoryProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['directoryProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDirectoryProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileEdit: UserProfileEdit) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profileEdit);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.refetchQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['directoryProfiles'] });
      await queryClient.refetchQueries({ queryKey: ['directoryProfiles'] });
    },
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.follow(target);
    },
    onSuccess: (_, target) => {
      queryClient.invalidateQueries({ queryKey: ['followCounts', target.toString()] });
      queryClient.invalidateQueries({ queryKey: ['doesCallerFollow', target.toString()] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollow(target);
    },
    onSuccess: (_, target) => {
      queryClient.invalidateQueries({ queryKey: ['followCounts', target.toString()] });
      queryClient.invalidateQueries({ queryKey: ['doesCallerFollow', target.toString()] });
    },
  });
}

export function useDoesCallerFollow(target: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['doesCallerFollow', target?.toString()],
    queryFn: async () => {
      if (!actor || !target) return false;
      return actor.doesCallerFollow(target);
    },
    enabled: !!actor && !isFetching && !!target,
  });
}

export function useGetFollowCounts(principal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['followCounts', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return { followers: BigInt(0), following: BigInt(0) };
      return actor.getFollowCounts(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}
