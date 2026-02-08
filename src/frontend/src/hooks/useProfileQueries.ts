import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { normalizeActorError } from '../utils/actorError';
import type { UserProfile, UserProfileEdit } from '../backend';
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
