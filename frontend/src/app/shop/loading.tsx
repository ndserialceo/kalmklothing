import Skeleton from "@/components/LoadingSkeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-10 max-w-md" />
        </div>
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="space-y-6">
              <Skeleton className="h-6 w-20" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </aside>
          <div className="flex-1">
            <div className="flex justify-between mb-6 pb-4 border-b border-brand-100">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-44" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
