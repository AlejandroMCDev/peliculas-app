# Guía: por qué Cartelera está hecha así

Esta guía explica las decisiones del proyecto en lenguaje sencillo. Cada sección dice **qué** se usó,
**por qué** y **dónde verlo** en el código. Puedes leerla en orden o saltar a lo que te interese.

1. [La idea general](#1-la-idea-general)
2. [El stack: por qué cada herramienta](#2-el-stack-por-qué-cada-herramienta)
3. [La arquitectura de carpetas](#3-la-arquitectura-de-carpetas)
4. [El viaje de un dato: de TMDB a la pantalla](#4-el-viaje-de-un-dato-de-tmdb-a-la-pantalla)
5. [Patrones de componentes](#5-patrones-de-componentes)
6. [View Transitions, paso a paso](#6-view-transitions-paso-a-paso)
7. [Tests](#7-tests)
8. [Ideas para practicar](#8-ideas-para-practicar)

---

## 1. La idea general

Una regla guía casi todo: **separar lo que cambia por razones distintas.**

- Lo que la app _es_ (una película tiene título, año y nota) cambia poco.
- _De dónde_ vienen los datos (TMDB, con sus nombres raros como `vote_average`) puede cambiar.
- _Cómo se ve_ (cards, carruseles, colores) cambia todo el tiempo.

Si esas tres cosas viven mezcladas en el mismo archivo, cambiar una rompe las otras. Si viven separadas,
puedes cambiar el diseño sin tocar los datos, o cambiar de API sin tocar el diseño.

---

## 2. El stack: por qué cada herramienta

| Herramienta                  | Para qué                       | Por qué esta y no otra                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vite**                     | Servidor de desarrollo y build | Arranca en milisegundos y recarga al instante. Es el estándar actual para una SPA de React (Create React App está abandonado).                                                                                                         |
| **React 19**                 | La interfaz                    | Trae `<ViewTransition>` (la animación del póster) y `<title>` dentro de componentes, sin librerías extra.                                                                                                                              |
| **React Router (data mode)** | Rutas (`/`, `/peliculas`…)     | El "modo datos" (`createBrowserRouter`) permite redirecciones, carga diferida de páginas (`lazy`) y la opción `useTransitions`, que es lo que activa las View Transitions al navegar.                                                  |
| **TanStack Query**           | Datos del servidor             | Resuelve lo que harías a mano con `useEffect` + `useState`: caché, estados de carga y error, reintentos, scroll infinito y _prefetch_. Escribirlo a mano es fácil de hacer mal (condiciones de carrera, datos duplicados).             |
| **axios**                    | Peticiones HTTP                | Permite crear un cliente con la URL base y el token configurados una sola vez (`tmdb-client.ts`).                                                                                                                                      |
| **Zod**                      | Validar datos externos         | TypeScript solo revisa tu código, no lo que llega por internet. Zod revisa en tiempo de ejecución que la respuesta de TMDB tenga la forma esperada. También valida la URL (filtros) y el `.env`.                                       |
| **Tailwind + shadcn/ui**     | Estilos y componentes          | shadcn no es una dependencia: **copia** el código de cada componente a `src/shared/ui`, así que es tuyo y lo puedes editar. Los colores salen de _tokens_ (`bg-primary`), lo que hace posible el modo claro/oscuro con un solo cambio. |
| **Vitest + Testing Library** | Tests                          | Vitest usa la misma configuración que Vite. Testing Library prueba lo que el usuario ve ("hay un botón llamado Reintentar"), no detalles internos.                                                                                     |

---

## 3. La arquitectura de carpetas

```
src/
├── app/                  ← arranque: router, layout, menú, cliente de Query
├── shared/               ← cosas genéricas que no saben nada de películas
│   ├── ui/               ← componentes shadcn (Button, Card, Carousel…)
│   ├── hooks/            ← useInView, useDebouncedValue…
│   └── lib/              ← AppError, utilidades
├── features/
│   └── movies/           ← todo lo de películas, en 4 capas
│       ├── domain/           1. qué es una película (tipos y reglas)
│       ├── application/      2. qué puede hacer el usuario (casos de uso)
│       ├── infrastructure/   3. cómo se habla con TMDB
│       ├── presentation/     4. pantallas, componentes y hooks de React
│       ├── movies.composition.ts   ← une la capa 2 con la 3
│       └── index.ts                ← lo único que el resto de la app puede importar
└── test/                 ← todos los tests, copiando la estructura de src/
```

### ¿Por qué "features" y no `components/`, `hooks/`, `services/`?

Agrupar por **tipo de archivo** (todos los componentes juntos, todos los hooks juntos) funciona en apps
pequeñas. Cuando la app crece, cambiar algo de "películas" te obliga a abrir cinco carpetas distintas.
Agrupar por **funcionalidad** deja todo lo de películas en un solo lugar. Si mañana agregas "series" o
"favoritos", cada una sería su propia carpeta en `features/`.

### Las 4 capas (Clean Architecture), con una analogía

Piensa en un restaurante:

- **domain** = la receta. Dice qué es un plato, sin importar quién lo cocina ni dónde se compran los
  ingredientes. Ejemplo: `movie.ts` define `Movie` y reglas como `pickFeatured` (quedarse solo con
  películas que tienen imagen ancha).
- **application** = el pedido del cliente. "Quiero ver las películas destacadas". Ejemplo:
  `get-featured-movies.ts`. No sabe que existe TMDB: solo pide datos a un _repositorio_.
- **infrastructure** = el proveedor. Sabe que TMDB llama `vote_average` a la nota y `poster_path` a la
  imagen, y lo traduce a nuestro idioma (`rating`, `poster`). Ejemplos: `tmdb-dtos.ts`, `tmdb-mappers.ts`.
- **presentation** = el mesero y el plato servido. Componentes y páginas de React.

### La regla de oro: las dependencias apuntan hacia adentro

```
presentation ──▶ application ──▶ domain ◀── infrastructure
```

`domain` no importa a nadie. `infrastructure` depende de `domain` (implementa lo que este pide), pero
`domain` no sabe que `infrastructure` existe. Esto no es solo un acuerdo: **ESLint lo hace cumplir**
(`eslint.config.js`, función `layer`). Si importas React dentro de `domain/`, `pnpm lint` falla.

### El "puerto" (`movie-repository.ts`) y la "composición"

`domain/movie-repository.ts` es una **interfaz**: una lista de lo que la app necesita
("dame las películas en cartelera de una región"), sin decir cómo se consigue.

```ts
export interface MovieRepository {
  listNowPlaying(region: Region): Promise<MovieWithBackdrop[]>;
  // ...
}
```

`infrastructure/tmdb-movie-repository.ts` es **una** forma de cumplir esa lista, usando TMDB. Y
`movies.composition.ts` es el único archivo que decide "usamos la versión de TMDB":

```ts
export const movieRepository: MovieRepository = createTmdbMovieRepository(
  createTmdbClient(env.tmdbToken),
);
```

**¿Por qué tanto rodeo?** Porque en los tests usamos otra versión, `in-memory-movie-repository.ts`, que
devuelve películas inventadas sin internet. Los casos de uso no notan la diferencia: reciben el
repositorio como primer argumento (`getFeaturedMovies(repository, 'PE')`).

### `index.ts`: la puerta de entrada

Fuera de `features/movies`, nadie puede importar archivos internos. Solo lo que `index.ts` exporta
(`HomePage`, `MoviesPage`, `MOVIES_PATH`…). Así puedes reorganizar el interior de la feature sin romper
el resto de la app.

### ¿No es demasiado para una app pequeña?

Para una app de este tamaño, sí sería más de lo estrictamente necesario. Se eligió a propósito porque el
proyecto es para **aprender** esta arquitectura en un caso real y manejable. En un prototipo de un día,
probablemente no la usarías completa.

---

## 4. El viaje de un dato: de TMDB a la pantalla

Sigamos el hero del inicio:

```
HomePage
  └─ useFeaturedMovies('PE')                      presentation/movie-queries.ts   (TanStack Query: caché)
       └─ getFeaturedMovies(repository, 'PE')     application/get-featured-movies.ts
            ├─ repository.listNowPlaying('PE')    infrastructure/tmdb-movie-repository.ts
            │    ├─ GET /movie/now_playing?region=PE      (axios)
            │    ├─ valida con movieDtoSchema             (Zod)
            │    └─ traduce con toMovieWithBackdrop       (mapper)
            └─ pickFeatured(movies, 6)            domain/movie.ts   (regla pura)
```

Detalles que vale la pena notar:

- **Zod con `.catch()`** (`tmdb-dtos.ts`): si una película viene sin fecha, ese campo queda en `null` y
  la película igual se muestra. Una película rara no rompe toda la lista.
- **La "query key factory"** (`movieKeys` en `movie-queries.ts`): todas las llaves de caché se definen en
  un solo objeto. Así, por ejemplo, la página de detalle puede buscar una película que ya estaba en la caché
  de una lista (`findCachedMovie`) sin adivinar cómo se llamaba la llave.
- **Prefetch** (`usePrefetchMovie`): al pasar el mouse sobre una card, el detalle empieza a cargar
  _antes_ del clic. Muchas veces la página se abre ya completa.
- **Los filtros viven en la URL** (`use-movie-filters.ts`): `/peliculas?genres=28&sort=rating`. Así un
  filtro se puede compartir, sobrevive a recargar la página y "Atrás" lo restaura. La URL es la única
  fuente de verdad: ningún componente copia los filtros a un `useState`. Se usa `replace: true` para que
  cada clic en un filtro no llene el historial.

---

## 5. Patrones de componentes

### 5.1 Contenedor y pantalla

Las páginas (`movies-page.tsx`, `home-page.tsx`) son **contenedores**: leen la URL, piden datos y
preparan funciones. Los componentes que dibujan (`MovieGrid`, `MovieShelf`, `HeroCarousel`) son
**pantallas puras**: reciben todo por props y devuelven JSX.

```tsx
// Contenedor: sabe de datos
const list = useMovieList(filters);
<MovieGrid movies={movies} isLoading={list.isPending} onLoadMore={list.fetchNextPage} ... />

// Pantalla: solo dibuja lo que le dan
export function MovieGrid({ movies, isLoading, onLoadMore }: MovieGridProps) { ... }
```

**¿Por qué?** La pantalla se puede probar y reutilizar sin internet ni router. Y cuando algo se ve mal,
sabes que el problema está en la pantalla; cuando un dato está mal, en el contenedor.

### 5.2 Todos los estados están diseñados

Cada pantalla contempla **cargando** (Skeleton con la forma del contenido final, para que nada "salte"),
**vacío** (con un texto que dice qué hacer), **error** (con botón Reintentar) y **éxito**. Ejemplo:
`MovieShelf` muestra skeleton, error, texto vacío o el carrusel, según el caso.

### 5.3 Composición en vez de muchas props booleanas

`HeroCarousel` no sabe nada de tráilers. Recibe una función `renderActions` y la página decide qué
botones poner:

```tsx
<HeroCarousel movies={movies} renderActions={(movie, onOpenChange) => <HeroTrailer id={movie.id} ... />} />
```

La alternativa sería `showTrailerButton`, `showShareButton`, `trailerVariant`… y el componente crecería
con cada pedido nuevo. Con composición, el componente queda pequeño y quien lo usa decide.

### 5.4 Hooks pequeños en `shared/hooks`

`useInView` (¿este elemento está cerca de la pantalla?), `useDebouncedValue` (espera a que dejes de
escribir antes de buscar) y `usePrefersReducedMotion`. No saben nada de películas, por eso viven en
`shared`. Se usan, por ejemplo, para que las secciones del inicio solo pidan datos cuando te acercas
haciendo scroll.

### 5.5 Un "store" mínimo con `useSyncExternalStore`

`morph-source.ts` guarda **qué card se clicó** (explicado en la sección 6). Podría haber sido un Context
o Zustand, pero son ~20 líneas sin dependencias. `useSyncExternalStore` es el hook oficial de React para
leer un valor que vive fuera de React, y hace que **solo** la card afectada vuelva a renderizarse.

### 5.6 Carga diferida de la página de detalle

```ts
export async function loadMovieDetailRoute() {
  const { MovieDetailPage } = await import('./presentation/movie-detail-page');
  return { Component: MovieDetailPage };
}
```

El código del detalle se descarga solo cuando abres una película por primera vez. El inicio carga más
rápido.

---

## 6. View Transitions, paso a paso

### 6.1 La idea del navegador

Animar entre dos páginas es difícil porque, cuando aparece la página nueva, la vieja ya no existe. La
**View Transitions API** del navegador resuelve esto con un truco:

1. Toma una **foto** de la página actual.
2. Cambia el DOM (aparece la página nueva).
3. Toma una **foto** de la página nueva.
4. Anima de una foto a la otra. Por defecto, con un fundido.

Lo interesante: si un elemento tiene un **nombre** (`view-transition-name: poster-550`) en la foto vieja
y otro elemento tiene **el mismo nombre** en la foto nueva, el navegador los trata como "el mismo objeto"
y anima su **posición y tamaño** de un lugar al otro. Eso es el póster que "vuela" de la card al detalle.

```
Antes (lista)                     Después (detalle)
┌──────┐ ┌──────┐                ┌────────────┐
│poster│ │      │      ──▶       │            │  Mismo nombre "poster-550":
│ 550  │ │      │                │ poster 550 │  el navegador lo mueve y
└──────┘ └──────┘                │            │  agranda en vez de hacer
                                 └────────────┘  un fundido.
```

### 6.2 Qué hace React por ti

En React no llamas a `document.startViewTransition` tú mismo. Envuelves un elemento en
`<ViewTransition>` y React se encarga de las fotos y los nombres. Hay dos condiciones:

**A. El cambio debe ocurrir dentro de una _transition_ de React** (`startTransition`). Un `setState`
normal no anima. Por eso en `main.tsx`:

```tsx
<RouterProvider router={router} useTransitions />
```

`useTransitions` hace que React Router ejecute cada navegación dentro de `startTransition`. Sin esa
prop, no habría animación.

**B. Los dos elementos deben tener el mismo `name`.** En la card (`movie-card.tsx`):

```tsx
<ViewTransition name={isMorphSource ? `poster-${movie.id}` : undefined} share="morph" default="none">
  <PosterImage ... />
</ViewTransition>
```

Y en el detalle (`movie-detail-view.tsx`):

```tsx
<ViewTransition name={`poster-${movie.id}`} share="morph" default="none">
  <PosterImage ... />
</ViewTransition>
```

Las props:

- `name`: el nombre compartido. Al navegar, uno desaparece y el otro aparece con el mismo nombre:
  React lo detecta como un **share** (elemento compartido).
- `share="morph"`: cuando ocurre ese share, aplica la clase CSS `morph`.
- `default="none"`: en cualquier otra situación (por ejemplo, la card se re-renderiza), no animes nada.

### 6.3 El CSS: cómo se ve la animación

El navegador crea pseudo-elementos que puedes estilizar (`src/index.css`):

```css
/* El "grupo": el contenedor que se mueve y cambia de tamaño. */
::view-transition-group(.morph) {
  animation-duration: var(--duration-morph); /* 380 ms */
  animation-timing-function: var(--ease-morph);
}

/* Un desenfoque leve a mitad de camino, para disimular el cambio de imagen chica a grande. */
::view-transition-image-pair(.morph) {
  animation-name: via-blur;
}

/* El resto de la página: un fundido rápido. */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 180ms;
}

/* Accesibilidad: quien pidió menos movimiento en su sistema, no ve animaciones. */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) {
    animation-duration: 0s !important;
  }
}
```

`old` es la foto vieja, `new` es la foto nueva, `group` es la caja que viaja entre las dos posiciones.

### 6.4 Tres problemas reales que hubo que resolver

Esta es la parte más interesante, porque muestra lo que la documentación no siempre cuenta.

**Problema 1: la página de detalle debe tener el póster _en el mismo instante_.**
Si al navegar el detalle muestra primero un Skeleton (porque los datos aún no llegan), en la foto nueva
no hay ningún `poster-550` y no hay nada que emparejar: no hay morph. Solución: `useCachedMovie`
(`movie-queries.ts`) busca la película en la caché de la lista de la que vienes. Como la card ya tenía
título y póster, el detalle puede pintar el póster de inmediato y completar lo demás (reparto, tráiler)
después.

**Problema 2: los nombres deben ser únicos.**
En el inicio, una misma película puede aparecer en "Populares" y en "Acción" a la vez. Dos elementos con
`poster-550` en la misma página es un error y la animación se cancela. Solución: `morph-source.ts`
recuerda qué card exacta se clicó (`"action:550"`) y **solo esa** recibe el nombre. Las demás tienen
`name={undefined}`. Por eso `MovieCard` pide una prop `scope` ("browse", "action", "recommendations"…).
Al volver atrás, la misma card recupera el nombre y el póster regresa a su lugar.

**Problema 3: el botón "Atrás" no animaba.**
Al navegar con un clic todo funcionaba, pero con el botón Atrás del navegador, no. La causa: cuando el
navegador emite el evento `popstate` (Atrás/Adelante), React procesa esa actualización de forma
**síncrona** a propósito (para que la restauración del scroll sea inmediata), y en ese camino no ejecuta
View Transitions.

Solución: `app/defer-popstate.ts`. Le pasamos al router una versión "envuelta" de `window` (un
[`Proxy`](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Proxy)) que hace
una sola cosa distinta: cuando alguien escucha `popstate`, retrasa el aviso con `setTimeout`. Para ese
momento React ya no está dentro del evento, trata la navegación como una transición normal y la animación
se ejecuta.

```ts
// router.tsx
createBrowserRouter(routes, { window: deferPopstate(window) });
```

Es un ajuste fino que depende de cómo React funciona hoy; por eso tiene su propio test
(`src/test/app/defer-popstate.test.ts`).

### 6.5 Soporte de navegadores

Funciona en Chrome/Edge modernos, Safari 18.2+ y Firefox 144+. En navegadores sin soporte, la navegación
funciona igual, solo que sin animación. No hay que hacer nada especial: es una **mejora progresiva**.

### 6.6 Cómo experimentar

- Cambia `--duration-morph` en `index.css` a `2000ms` para ver la animación en cámara lenta.
- En Chrome DevTools: panel **Animations**, ahí puedes pausar y repetir la transición.
- Quita `useTransitions` de `main.tsx` y observa que la animación desaparece.
- Quita `deferPopstate(window)` del router y prueba el botón Atrás.

---

## 7. Tests

- Viven todos en `src/test/`, copiando la ruta del archivo que prueban. Así el código de producción queda
  limpio y es fácil encontrar el test de cada archivo.
- **Casos de uso** se prueban con el repositorio en memoria: rápidos, sin internet y sin mocks del propio
  código.
- **Componentes** se prueban como los usa una persona: "hay un enlace llamado Alien que lleva a
  `/peliculas/348`", no "el estado interno vale X". Si cambias cómo está hecho por dentro y el
  comportamiento sigue igual, el test no se rompe.
- `pnpm check` corre formato, lint (incluidas las reglas de capas), tipos, tests y build. Es lo mismo que
  correría un CI.

---

## 8. Ideas para practicar

Ordenadas de menor a mayor dificultad:

1. Agrega una sección "Comedia" al inicio (pista: `home-sections.ts`, género 35).
2. Muestra la duración de la película en la card (domain → mapper → componente).
3. Agrega una animación de entrada a las cards cuando cambia un filtro (`<ViewTransition>` con `enter`).
4. Crea una feature `favorites` que guarde películas en `localStorage`, con su propio repositorio, para
   practicar las 4 capas desde cero.
