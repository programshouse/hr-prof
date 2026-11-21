import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs.api';
import { jobsKeys } from '../api/jobs.keys';

// --- Sections Query ---
export function useInterviewSectionsQuery(positionId) {
  return useQuery({
    queryKey: jobsKeys.sections(positionId),
    queryFn: () => jobsApi.getSections(positionId),
    enabled: !!positionId,
  });
}

// --- Section Mutations ---
export function useCreateSectionMutation(positionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => jobsApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.sections(positionId) });
    },
  });
}

export function useUpdateSectionMutation(positionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => jobsApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.sections(positionId) });
    },
  });
}

export function useDeleteSectionMutation(positionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => jobsApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.sections(positionId) });
    },
  });
}

// --- Questions Query ---
export function useInterviewQuestionsQuery(sectionId) {
  return useQuery({
    queryKey: jobsKeys.questions(sectionId),
    queryFn: () => jobsApi.getQuestions(sectionId),
    enabled: !!sectionId,
  });
}

// --- Question Mutations ---
export function useCreateQuestionMutation(sectionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => jobsApi.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.questions(sectionId) });
    },
  });
}

export function useUpdateQuestionMutation(sectionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => jobsApi.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.questions(sectionId) });
    },
  });
}

export function useDeleteQuestionMutation(sectionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => jobsApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.questions(sectionId) });
    },
  });
}

export function usePublicQuestionsFormQuery(positionId, companyId) {
  return useQuery({
    queryKey: jobsKeys.publicForm(positionId, companyId),
    queryFn: () => jobsApi.getPublicForm(positionId, companyId),
    enabled: Boolean(positionId && companyId),
  });
}

export function useSubmitCandidateAnswersMutation(positionId, companyId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => jobsApi.submitCandidateAnswers(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.publicForm(positionId, companyId) });
    },
  });
}
