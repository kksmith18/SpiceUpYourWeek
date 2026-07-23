import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-neutral-900">
          Spice Up Your Week
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          Sign in to your library.
        </p>

        {message && (
          <p className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form className="flex flex-col gap-3">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-neutral-600">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-neutral-600">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div className="mt-2 flex gap-2">
            <button
              formAction={login}
              className="flex-1 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Sign in
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
