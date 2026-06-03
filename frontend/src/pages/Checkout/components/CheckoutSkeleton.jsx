import { Skeleton } from "@/components/ui/Skeleton";

export default function CheckoutSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-12">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          {/* Section: Shipping Address */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <Skeleton className="h-8 w-48 rounded-lg" />
               <Skeleton className="h-6 w-32 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[1, 2].map(i => (
                 <Skeleton key={i} className="h-40 w-full rounded-[2rem]" />
               ))}
            </div>
          </div>

          {/* Section: Payment Method */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[1, 2].map(i => (
                 <Skeleton key={i} className="h-24 w-full rounded-[1.5rem]" />
               ))}
            </div>
          </div>

          {/* Section: Order Note */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-32 w-full rounded-[1.5rem]" />
          </div>
        </div>

        <aside className="lg:col-span-1">
          <Skeleton className="h-[600px] w-full rounded-[3rem]" />
        </aside>
      </div>
    </div>
  );
}
