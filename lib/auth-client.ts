import { createAuthClient } from "better-auth/react";

// Use same-origin (Next.js proxy) so cookies work
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
});

export const { signIn, signUp, signOut } = authClient;
