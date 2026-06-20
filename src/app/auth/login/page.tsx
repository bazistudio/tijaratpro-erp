import LoginForm from "./form"

export const metadata = {
  title: "Sign In — TijaratPro",
  description: "Sign in to your TijaratPro account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border rounded-xl shadow-sm p-8 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Sign In</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your credentials to continue
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}