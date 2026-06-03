import { Skeleton } from "@/components/ui/Skeleton";

export default function CartSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Skeleton className="h-6 w-40 mb-10" />
      
      <div className="flex justify-between items-end mb-12">
        <div className="space-y-3">
          <Skeleton className="h-14 w-64 rounded-2xl" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 flex gap-8">
              <Skeleton className="w-40 h-40 rounded-3xl shrink-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-24 rounded" />
                <div className="pt-4 flex gap-6">
                   <Skeleton className="h-12 w-32 rounded-2xl" />
                   <Skeleton className="h-12 w-24 rounded-2xl" />
                </div>
              </div>
              <div className="w-32 flex flex-col items-end gap-2">
                 <Skeleton className="h-3 w-16" />
                 <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Skeleton className="h-[500px] w-full rounded-[3rem]" />
        </div>
      </div>
    </div>
  );
}
