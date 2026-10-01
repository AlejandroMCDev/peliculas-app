import { Link, useRouteError } from 'react-router';
import { Button } from '@/shared/ui/button';

export function RouteError() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';

  return (
    <section className="mx-auto max-w-xl space-y-4 px-4 py-10">
      <h1 className="font-display text-4xl tracking-tight uppercase">Algo salió mal</h1>
      <p role="alert" className="text-muted-foreground">
        {message}
      </p>
      <Button asChild>
        <Link to="/">Volver a la cartelera</Link>
      </Button>
    </section>
  );
}
