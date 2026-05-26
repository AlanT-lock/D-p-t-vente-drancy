import { LoginForm } from './login-form';

export default async function LoginPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  await params;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-parchment">
      <LoginForm />
    </div>
  );
}
