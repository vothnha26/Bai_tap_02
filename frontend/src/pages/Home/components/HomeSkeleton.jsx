import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton - Asymmetric */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="h-16 w-1/2 rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-14 w-40 rounded-2xl" />
              <Skeleton className="h-14 w-40 rounded-2xl" />
            </div>
          </div>
          <div className="hidden lg:block flex-1">
            <Skeleton className="aspect-square w-full rounded-[3rem]" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Feature Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[2.5rem]" />
          ))}
        </div>

        {/* Categories Bento Skeleton */}
        <div className="mb-24">
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-1.5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 h-[400px]">
            <Skeleton className="col-span-2 row-span-2 rounded-[2.5rem]" />
            <Skeleton className="col-span-2 row-span-1 rounded-[2.5rem]" />
            <Skeleton className="col-span-1 row-span-1 rounded-[2.5rem]" />
            <Skeleton className="col-span-1 row-span-1 rounded-[2.5rem]" />
            <Skeleton className="col-span-1 row-span-1 rounded-[2.5rem]" />
            <Skeleton className="col-span-1 row-span-1 rounded-[2.5rem]" />
            <Skeleton className="col-span-2 row-span-1 rounded-[2.5rem]" />
          </div>
        </div>

        {/* Product Carousel Skeleton */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-[2.5rem]" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
