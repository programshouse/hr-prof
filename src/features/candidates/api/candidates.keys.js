// src/features/candidates/api/candidates.keys.js

export const candidatesKeys = {
  all: ['candidates'],
  lists: () => [...candidatesKeys.all, 'list'],
  list: (filters) => [...candidatesKeys.lists(), filters],
  answers: (id) => [...candidatesKeys.all, 'answers', String(id)],
  evaluations: () => [...candidatesKeys.all, 'evaluation'],
  evaluation: (id) => [...candidatesKeys.evaluations(), String(id)],
};
