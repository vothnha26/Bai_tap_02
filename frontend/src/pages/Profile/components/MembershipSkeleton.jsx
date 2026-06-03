import { Skeleton } from "@/components/ui/Skeleton";

export default function MembershipSkeleton() {
  return (
    <div className="space-y-12">
      {/* Tier Progress Skeleton */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-10">
           <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-64 rounded-xl" />
           </div>
           <Skeleton className="h-16 w-16 rounded-2xl" />
        </div>
        <Skeleton className="h-4 w-full rounded-full mb-4" />
        <div className="flex justify-between">
           <Skeleton className="h-3 w-20" />
           <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Benefits Bento Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[1, 2, 3].map(i => (
           <Skeleton key={i} className="h-48 w-full rounded-[2.5rem]" />
         ))}
      </div>

      {/* History Table Skeleton */}
      <div className="space-y-6">
         <Skeleton className="h-8 w-48 rounded-lg" />
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-6 border-b border-slate-50 flex justify-between items-center">
                 <div className="flex gap-4 items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-3 w-20" />
                    </div>
                 </div>
                 <Skeleton className="h-6 w-24" />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
