import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import type {
  InterviewSession,
  SessionDetail,
  InterviewQuestion,
  NextQuestionResponse,
  DoneResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  FinishInterviewResponse,
  DomainsResponse,
  SessionQuestionsResponse,
} from '@/lib/types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const interviewApi = createApi({
  reducerPath: 'interviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Token ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Session', 'Sessions'],
  endpoints: (builder) => ({
    // ── Domains ──────────────────────────────────────────────────────────
    getDomains: builder.query<DomainsResponse, void>({
      query: () => '/domains/',
    }),

    // ── Sessions list ─────────────────────────────────────────────────────
    getSessions: builder.query<InterviewSession[], void>({
      query: () => '/sessions/',
      providesTags: ['Sessions'],
    }),

    // ── Single session ────────────────────────────────────────────────────
    getSession: builder.query<InterviewSession, number>({
      query: (sessionId) => `/sessions/${sessionId}/`,
      providesTags: (_result, _error, id) => [{ type: 'Session', id }],
    }),

    // ── Create / start a new session ──────────────────────────────────────
    createSession: builder.mutation<CreateSessionResponse, CreateSessionRequest>({
      query: (body) => ({
        url: '/sessions/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sessions'],
    }),

    // ── Get next AI-generated question ────────────────────────────────────
    getNextQuestion: builder.mutation<NextQuestionResponse | DoneResponse, number>({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}/next-question/`,
        method: 'POST',
      }),
    }),

    // ── Submit candidate answer ───────────────────────────────────────────
    submitAnswer: builder.mutation<SubmitAnswerResponse, SubmitAnswerRequest>({
      query: ({ sessionId, ...body }) => ({
        url: `/sessions/${sessionId}/submit-answer/`,
        method: 'POST',
        body,
      }),
    }),

    // ── Finish interview and trigger AI evaluation ────────────────────────
    finishInterview: builder.mutation<FinishInterviewResponse, number>({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}/finish/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Session', id },
        'Sessions',
      ],
    }),

    // ── Full results with Q&A and evaluation report ───────────────────────
    getResults: builder.query<SessionDetail, number>({
      query: (sessionId) => `/sessions/${sessionId}/results/`,
      providesTags: (_result, _error, id) => [{ type: 'Session', id }],
    }),

    // ── All questions for a session ───────────────────────────────────────
    getSessionQuestions: builder.query<SessionQuestionsResponse, number>({
      query: (sessionId) => `/sessions/${sessionId}/questions/`,
    }),
  }),
});

export const {
  useGetDomainsQuery,
  useGetSessionsQuery,
  useGetSessionQuery,
  useCreateSessionMutation,
  useGetNextQuestionMutation,
  useSubmitAnswerMutation,
  useFinishInterviewMutation,
  useGetResultsQuery,
  useGetSessionQuestionsQuery,
} = interviewApi;
