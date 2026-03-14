import axios from 'axios';

import { auth } from '@/lib/auth/auth';

export async function getApiClient() {
  const session = await auth();
  const userId = session?.user?.id;

  const client = axios.create({
    baseURL: process.env.BACKEND_API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {}),
    },
  });

  return client;
}
