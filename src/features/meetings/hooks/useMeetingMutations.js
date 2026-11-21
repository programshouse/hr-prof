// src/features/meetings/hooks/useMeetingMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingsApi, meetingsKeys } from "../api/meetings.api";

export function useCreateMeeting() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => meetingsApi.create(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: meetingsKeys.lists() });
      await qc.invalidateQueries({ queryKey: meetingsKeys.stats });
    },
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => meetingsApi.update(id, payload),
    onSuccess: async (_res, vars) => {
      await qc.invalidateQueries({ queryKey: meetingsKeys.lists() });
      await qc.invalidateQueries({ queryKey: meetingsKeys.stats });
      if (vars?.id) {
        await qc.invalidateQueries({ queryKey: meetingsKeys.detail(vars.id) });
      }
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => meetingsApi.delete(id),
    onSuccess: async (_res, id) => {
      await qc.invalidateQueries({ queryKey: meetingsKeys.lists() });
      await qc.invalidateQueries({ queryKey: meetingsKeys.stats });
      if (id) await qc.removeQueries({ queryKey: meetingsKeys.detail(id) });
    },
  });
}
