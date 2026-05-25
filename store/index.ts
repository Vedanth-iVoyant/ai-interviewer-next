import { configureStore } from '@reduxjs/toolkit';
import { interviewApi } from './api/interviewApi';
import authReducer from './slices/authSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [interviewApi.reducerPath]: interviewApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(interviewApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
