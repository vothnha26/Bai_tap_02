import { Skeleton } from "@/components/ui/Skeleton";

export default function OrdersSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-16">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-80 rounded-2xl" />
        </div>
        <Skeleton className="h-12 w-48 rounded-[2rem]" />
      </div>

      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
            <div className="flex justify-between items-center pb-8 border-b border-slate-50">
               <div className="flex gap-10">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-40" />
                  </div>
               </div>
               <Skeleton className="h-10 w-40 rounded-full" />
            </div>
            
            <div className="space-y-6">
               {[1, 2].map(j => (
                 <div key={j} className="flex gap-6 items-center">
                    <Skeleton className="w-20 h-20 rounded-3xl shrink-0" />
                    <div className="flex-1 space-y-2">
                       <Skeleton className="h-5 w-1/2" />
                       <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                 </div>
               ))}
            </div>

            <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
               <div className="flex gap-10">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
               </div>
               <div className="flex gap-4">
                  <Skeleton className="h-12 w-32 rounded-2xl" />
                  <Skeleton className="h-12 w-32 rounded-2xl" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
