import { SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet';

type FiltersSheetProps = { activeCount: number; children: ReactNode };

export function FiltersSheet({ activeCount, children }: FiltersSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-10 lg:hidden">
          <SlidersHorizontal />
          Filtros
          {activeCount > 0 && (
            <Badge className="h-5 min-w-5 px-1.5 tabular-nums">{activeCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(22rem,90vw)] gap-0">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl uppercase">Filtros</SheetTitle>
          <SheetDescription>Los resultados se actualizan al momento.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        <SheetFooter className="border-t">
          <SheetClose asChild>
            <Button>Ver resultados</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
