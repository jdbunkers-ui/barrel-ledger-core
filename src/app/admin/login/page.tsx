import { loginAdmin } from "./actions";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const errorMessage = params.error;

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center px-6">
      <section className="w-full max-w-md bg-white rounded-xl shadow p-8 border border-stone-200">
        <h1 className="text-3xl font-bold mb-2">Admin Login</h1>

        <p className="text-gray-600 mb-6">
          Sign in to manage this Barrel Ledger site.
        </p>

        <form action={loginAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>

            <input
              name="email"
              type="email"
              className="w-full rounded border border-stone-300 px-3 py-2"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>

            <input
              name="password"
              type="password"
              className="w-full rounded border border-stone-300 px-3 py-2"
              required
              autoComplete="current-password"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded bg-stone-900 text-white px-4 py-2 font-semibold"
          >
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}