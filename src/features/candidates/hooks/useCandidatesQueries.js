// src/features/candidates/hooks/useCandidatesQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesApi } from '../api/candidates.api';
import { candidatesKeys } from '../api/candidates.keys';

// --- Candidates List Hook ---
export function useCandidatesQuery(filters, options = {}) {
  return useQuery({
    queryKey: candidatesKeys.list(filters),
    queryFn: () => candidatesApi.getCandidates(filters),
    enabled: options.enabled ?? true,
  });
}

// --- Candidate Answers Hook ---
export function useCandidateAnswersQuery(candidateId) {
  return useQuery({
    queryKey: candidatesKeys.answers(candidateId),
    queryFn: () => candidatesApi.getCandidateAnswers(candidateId),
    enabled: !!candidateId,
  });
}

// --- Evaluate Essay Answers Hook ---
export function useEvaluateAnswersMutation(candidateId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => candidatesApi.evaluateAnswers(candidateId, payload),
    onSuccess: () => {
      // Invalidate both the answer list and the evaluation details to fetch fresh data
      queryClient.invalidateQueries({ queryKey: candidatesKeys.answers(candidateId) });
      queryClient.invalidateQueries({ queryKey: candidatesKeys.evaluation(candidateId) });
      queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() });
    },
  });
}

// --- Evaluation / Comparison Report Hook ---
export function useEvaluationAnswersQuery(candidateId) {
  return useQuery({
    queryKey: candidatesKeys.evaluation(candidateId),
    queryFn: () => candidatesApi.getEvaluationAnswers(candidateId),
    enabled: !!candidateId,
  });
}
