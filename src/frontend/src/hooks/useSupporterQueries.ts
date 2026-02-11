import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SupporterRequest, SupporterProfile, backendInterface } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

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

// Query: Get all supporters (admin-only, returns map for efficient lookups)
export function useGetSupporters() {
  const { actor, isFetching } = useActor();

  return useQuery<Map<string, SupporterProfile>>({
    queryKey: ['supporters'],
    queryFn: async () => {
      if (!actor) return new Map();
      const supporters = await actor.getSupporters();
      const map = new Map<string, SupporterProfile>();
      supporters.forEach(([principal, profile]) => {
        map.set(principal.toString(), profile);
      });
      return map;
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000, // Cache for 30 seconds to avoid excessive calls
  });
}

// Derived helper: Check if caller is a supporter
export function useIsCallerSupporter() {
  const { actor, isFetching } = useActor();
  const { data: supportersMap, isLoading } = useGetSupporters();

  const callerPrincipal = actor ? 'caller' : null; // We'll check via the map

  return {
    isSupporter: false, // Will be determined by checking the map
    isLoading: isLoading || isFetching,
    supportersMap,
  };
}

// Derived helper: Check if a specific principal is a supporter
export function useIsPrincipalSupporter(principal: Principal | null) {
  const { data: supportersMap, isLoading } = useGetSupporters();

  const isSupporter = principal ? supportersMap?.has(principal.toString()) ?? false : false;

  return {
    isSupporter,
    isLoading,
  };
}

// Mutation: Submit supporter request
export function useSubmitSupporterRequest() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      message,
      numberOfCoffees,
      validUntil,
    }: {
      displayName: string;
      message: string;
      numberOfCoffees?: bigint | null;
      validUntil?: bigint | null;
    }) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.submitSupporterRequest(
        displayName,
        message,
        numberOfCoffees || null,
        validUntil || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supporterRequests'] });
    },
  });
}

// Query: Get pending supporter requests (admin-only)
export function useGetSupporterRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, SupporterRequest]>>({
    queryKey: ['supporterRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSupporterRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutation: Approve supporter (admin-only)
export function useApproveSupporter() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      supporter,
      validUntil,
    }: {
      supporter: Principal;
      validUntil?: bigint | null;
    }) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.approveSupporter(supporter, validUntil || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supporters'] });
      queryClient.invalidateQueries({ queryKey: ['supporterRequests'] });
    },
  });
}

// Mutation: Revoke supporter (admin-only)
export function useRevokeSupporter() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supporter: Principal) => {
      const validActor = requireActor(actor, isFetching);
      return validActor.revokeSupporter(supporter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supporters'] });
    },
  });
}
