// frontend/app/login/loading.tsx
export default function Loading() {
  return (
    <div className="container flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-md">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-10 rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          <div className="h-10 w-full rounded bg-primary" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded border bg-background" />
            <div className="h-10 rounded border bg-background" />
          </div>

          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
