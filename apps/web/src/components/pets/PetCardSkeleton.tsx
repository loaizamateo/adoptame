export function PetCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="flex gap-1 mt-1">
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-5 bg-gray-100 rounded-full w-14" />
        </div>
      </div>
    </div>
  )
}
