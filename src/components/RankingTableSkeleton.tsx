import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RankingTableSkeletonProps {
  rows?: number;
}

const RankingTableSkeleton = ({ rows = 20 }: RankingTableSkeletonProps) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <Skeleton className="h-7 w-48" />
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Skeleton className="h-10 flex-1 sm:w-64" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
    <div className="glass-card rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5 border-b border-border">
            <TableHead className="w-16"><Skeleton className="h-3 w-8" /></TableHead>
            <TableHead><Skeleton className="h-3 w-20" /></TableHead>
            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
            <TableHead><Skeleton className="h-3 w-14" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-6" /></TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-10" /></TableCell>
              <TableCell><Skeleton className="h-4 w-10" /></TableCell>
              <TableCell><Skeleton className="h-4 w-10" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default RankingTableSkeleton;
