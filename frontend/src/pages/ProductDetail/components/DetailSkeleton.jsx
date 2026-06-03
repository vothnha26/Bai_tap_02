import { Skeleton } from "@/components/ui/Skeleton";

export default function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 mb-8">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Images Skeleton */}
          <div className="space-y-6">
            <Skeleton className="aspect-square w-full rounded-[2.5rem]" />
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-10">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-12 w-3/4 rounded-xl" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <Skeleton className="h-32 w-full rounded-[2rem]" />
            
            <Skeleton className="h-20 w-1/2 rounded-2xl" />

            <div className="space-y-6">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40 rounded-xl" />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Skeleton className="h-16 flex-1 rounded-2xl" />
              <Skeleton className="h-16 flex-1 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
