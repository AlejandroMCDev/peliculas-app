import { AlertTriangle, RotateCw } from 'lucide-react';
import { describeError } from '@/shared/lib/error-message';
import { Button } from '@/shared/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { title, description, canRetry } = describeError(error);

  return (
    <Empty role="alert">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {canRetry && onRetry && (
        <EmptyContent>
          <Button variant="outline" onClick={onRetry}>
            <RotateCw />
            Reintentar
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
