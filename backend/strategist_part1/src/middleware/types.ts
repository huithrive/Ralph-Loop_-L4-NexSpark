import type { Env } from '../types/env';

export type AuthVariables = {
  userId: string;
  sessionToken: string;
};

export type AuthContext = {
  Bindings: Env;
  Variables: AuthVariables;
};
