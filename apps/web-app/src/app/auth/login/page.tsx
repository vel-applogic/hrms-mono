import { Suspense } from 'react';

import { LoginForm } from '@/feature/auth/login-form';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
