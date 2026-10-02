# Cartelera

Explorador de películas construido sobre la API de [TMDB](https://www.themoviedb.org/), hecho como
proyecto de estudio para practicar **Clean Architecture en el frontend**, manejo de estado del servidor,
diseño de interfaces y animaciones nativas entre páginas con **React View Transitions**.

La interfaz y los datos están en español (es-MX); el código, en inglés.

> ¿Quieres entender el **por qué** de cada decisión? Lee la guía: [`docs/guia.md`](docs/guia.md).

---

## Contenido

- [Funcionalidades](#funcionalidades)
- [Rutas](#rutas)
- [Stack](#stack)
- [Arquitectura](#arquitectura)
- [Decisiones técnicas destacadas](#decisiones-técnicas-destacadas)
- [Diseño](#diseño)
- [Tests y calidad](#tests-y-calidad)
- [Puesta en marcha](#puesta-en-marcha)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Documentación del proyecto](#documentación-del-proyecto)

---

## Funcionalidades

### Inicio (`/`)

- **Hero con las películas en cartelera en Perú**: hasta 6, solo de Perú (no se completa con otros
  países); si TMDB no tiene ninguna, el hero no se muestra.
  - Avanza solo cada 6 s y se pausa al pasar el mouse, al navegar con teclado, con el tráiler abierto o
    si el sistema pide menos movimiento (`prefers-reduced-motion`).
  - Flechas, puntos, botón **Ver detalles** y **Ver tráiler** (el tráiler se pide solo para la película
    visible).
  - En pantallas anchas la imagen se muestra completa, sin recorte, con una copia difuminada de fondo.
- **Secciones en carrusel**, en este orden: Populares en Perú, Próximos estrenos (Perú), Acción,
  Misterio, Terror, Ciencia ficción, Comedia y Mejor valoradas.
  - Las secciones de género y "Mejor valoradas" tienen **Ver todas**, que abre `/peliculas` con ese filtro
    ya aplicado.

### Explorar (`/peliculas`)

- Cuadrícula con **scroll infinito**.
- **Búsqueda por título** (con _debounce_).
- **Filtros**: géneros (deben cumplirse todos), actores, director, rango de años, nota mínima, duración y
  orden. En móvil los filtros viven en un panel lateral (_sheet_).
- **Chips de filtros activos**, cada uno con su botón para quitarlo, y un "Limpiar todo".
- Los filtros viven en la URL: se pueden **compartir**, sobreviven a recargar y el botón **Atrás** los
  restaura.

### Detalle (`/peliculas/:id`)

- Póster, título, eslogan, año, duración, géneros, nota y votos, sinopsis, director, reparto principal,
  presupuesto y recaudación, tráiler (YouTube en un diálogo) y recomendaciones en carrusel.
- **Animación del póster**: al abrir una película, el póster de la card "vuela" y crece hasta su lugar en
  el detalle; al volver, regresa a la card. Funciona también con el botón Atrás del navegador.

### En toda la app

- Barra de navegación con **Inicio** y **Películas** (el enlace activo se resalta).
- Tema **claro, oscuro o del sistema**.
- Estados de **carga** (skeletons con la forma del contenido), **vacío** y **error** con opción de
  reintentar, en todas las pantallas.
- Accesible por teclado, con etiquetas para lectores de pantalla y contraste revisado en ambos temas.
- Las URLs antiguas `/movies/:id` redirigen a `/peliculas/:id`.

---

## Rutas

| Ruta             | Página                                   | Carga                                      |
| ---------------- | ---------------------------------------- | ------------------------------------------ |
| `/`              | Inicio: hero + secciones                 | Incluida en el bundle principal            |
| `/peliculas`     | Explorar: búsqueda, filtros y cuadrícula | Incluida en el bundle principal            |
| `/peliculas/:id` | Detalle de una película                  | Diferida (se descarga al abrir la primera) |
| `/movies/:id`    | Redirección a `/peliculas/:id`           | —                                          |

---

## Stack

| Herramienta                        | Uso                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| **Vite 8** + **React 19**          | Build y UI. React 19 aporta `<ViewTransition>` y `<title>` dentro de componentes.   |
| **React Router 7** (modo datos)    | Rutas, redirecciones, carga diferida y navegaciones dentro de transitions.          |
| **TanStack Query 5**               | Caché, carga, errores, reintentos, scroll infinito y _prefetch_.                    |
| **axios**                          | Cliente HTTP de TMDB con URL base, idioma y token configurados una vez.             |
| **Zod 4**                          | Validación en tiempo de ejecución de la API, la URL (filtros) y el `.env`.          |
| **Tailwind CSS 4** + **shadcn/ui** | Estilos con tokens de diseño y componentes accesibles (Radix) copiados al proyecto. |
| **Embla Carousel**                 | Carruseles del hero y de las secciones (vía shadcn).                                |
| **TypeScript 6** (strict)          | Tipado estricto en todo el código.                                                  |
| **Vitest 5** + **Testing Library** | Tests de casos de uso, dominio, infraestructura y componentes.                      |
| **ESLint** + **Prettier**          | Calidad y formato; ESLint además **hace cumplir las capas** de la arquitectura.     |
| **pnpm** · **Node 22**             | Gestor de paquetes y runtime.                                                       |

---

## Arquitectura

Clean Architecture **por feature**: todo lo de películas vive junto, separado en cuatro capas.

```
src/
├── app/                      Arranque: router, layout, navegación, cliente de Query
├── shared/                   Código genérico, sin conocimiento de películas
│   ├── ui/                   Componentes shadcn (código propio, editable)
│   ├── components/           ErrorState, selector de tema…
│   ├── hooks/                useInView, useDebouncedValue, usePrefersReducedMotion
│   ├── config/               Variables de entorno validadas con Zod
│   └── lib/                  AppError, mensajes de error, utilidades
├── features/movies/
│   ├── domain/               Qué es una película: tipos, filtros y reglas puras
│   ├── application/          Casos de uso: browseMovies, getFeaturedMovies, listMovieShelf…
│   ├── infrastructure/       TMDB: cliente axios, esquemas Zod (DTOs), mappers, repositorio
│   ├── presentation/         Páginas, componentes, hooks de Query, rutas y animaciones
│   ├── movies.composition.ts Único lugar que elige la implementación (TMDB)
│   └── index.ts              API pública: lo único que el resto de la app puede importar
└── test/                     Todos los tests, con la misma estructura que src/
```

**Las dependencias apuntan hacia adentro:**

```
presentation ──▶ application ──▶ domain ◀── infrastructure
```

- `domain` y `application` no importan React ni hacen peticiones HTTP.
- Los casos de uso reciben el repositorio como primer argumento. En la app es el de TMDB; en los tests,
  uno en memoria, sin red.
- Los DTOs de TMDB (`vote_average`, `poster_path`…) nunca salen de `infrastructure/`: los _mappers_ los
  traducen a entidades del dominio (`rating`, `poster`).
- Estas reglas no son solo un acuerdo: `eslint.config.js` las verifica y `pnpm lint` falla si se rompen.

**Ejemplo del recorrido de un dato (el hero):**

```
HomePage
 └─ useFeaturedMovies('PE')                 presentation · TanStack Query (caché)
     └─ getFeaturedMovies(repo, 'PE')       application · caso de uso
         ├─ repo.listNowPlaying('PE')       infrastructure · GET /movie/now_playing?region=PE
         │                                  → valida con Zod → mapea a entidades
         └─ pickFeatured(movies, 6)         domain · regla pura (solo con imagen ancha)
```

---

## Decisiones técnicas destacadas

### Datos

- **Validación tolerante con Zod.** Cada campo opcional de TMDB tiene un valor de respaldo
  (`.catch(null)`): una película con datos raros no rompe toda la lista.
- **Fábrica de _query keys_.** Todas las llaves de caché se definen en un solo objeto (`movieKeys`), así
  el detalle puede reutilizar una película que ya estaba en la caché de una lista.
- **Prefetch al pasar el mouse.** Al hacer hover o foco en una card, el detalle empieza a cargarse antes
  del clic.
- **Datos regionales de Perú.** "En cartelera" usa `/movie/now_playing?region=PE`. "Populares" y
  "Próximos estrenos" usan `/discover/movie` con `region=PE`, estreno en cines (`with_release_type=2|3`)
  y la fecha de hoy como límite. El _trending_ de TMDB no acepta región, por eso se usa popularidad local.
- **Todas las secciones del inicio cargan de una vez.** Al principio cargaban al acercarse con el scroll,
  pero al recargar la página estando abajo, las secciones "saltadas" quedaban como skeleton. Cada sección
  es una petición pequeña y los pósters ya usan `loading="lazy"`, así que la carga diferida no aportaba.

### Estado y navegación

- **Los filtros son la URL.** `useMovieFilters` lee y escribe los _search params_; ningún componente copia
  los filtros a `useState`. Cambiar un filtro usa `replace` para no llenar el historial.
- **Página de detalle diferida** (`lazy`): su código se descarga solo cuando se abre una película.

### View Transitions

- `RouterProvider useTransitions` ejecuta cada navegación dentro de `startTransition`, que es lo que activa
  `<ViewTransition>`.
- La card y el detalle envuelven el póster en `<ViewTransition name="poster-<id>">`: el navegador ve el
  mismo nombre antes y después y anima posición y tamaño entre ambos.
- **Nombres únicos:** una película puede estar en varias secciones a la vez, así que solo la card clicada
  recibe el nombre (`morph-source.ts`, un _store_ mínimo con `useSyncExternalStore`).
- **El póster debe existir al instante en el detalle:** `useCachedMovie` toma la película de la caché de
  la lista para pintar el póster sin esperar a la red.
- **Botón Atrás:** React procesa de forma síncrona las actualizaciones que nacen en `popstate` y en ese
  camino no anima. `defer-popstate.ts` entrega `popstate` al router un instante después, para que Atrás
  sea una transition normal.
- Con `prefers-reduced-motion`, todas las animaciones se desactivan.

### Componentes

- **Contenedor y pantalla:** las páginas obtienen datos y callbacks; los componentes visuales son puros
  (props → JSX), fáciles de probar y reutilizar.
- **Composición en vez de flags:** el hero recibe `renderActions` en lugar de props como
  `showTrailerButton`.
- **Todos los estados diseñados:** carga, vacío, error y éxito en cada pantalla.

---

## Diseño

Dirección **"Cine nocturno"**: superficies casi negras y cálidas, un único acento ámbar y títulos
condensados tipo cartel. El modo claro es el "programa impreso": papel marfil y tinta grafito.

- Tipografías: **Oswald** (títulos, en mayúsculas) y **Manrope** (interfaz).
- Colores solo mediante tokens (`bg-primary`, `text-muted-foreground`…), definidos en `src/index.css`
  con `oklch`.
- Pósters siempre en 2:3; las imágenes de TMDB llegan en tres anchos y cada componente indica `sizes` para
  que el navegador descargue la más pequeña posible.

Detalle completo en [`docs/design.md`](docs/design.md).

---

## Tests y calidad

- **47 tests** en 11 archivos, todos en `src/test/` imitando la ruta del archivo que prueban.
- **Casos de uso:** con un repositorio en memoria, sin red ni mocks del propio código.
- **Infraestructura:** el repositorio de TMDB con un cliente HTTP simulado (parámetros, mapeo, errores).
- **Componentes:** se prueban como los usa una persona, por rol y nombre accesible
  (`getByRole('link', { name: 'Alien' })`).
- **`pnpm check`** ejecuta formato, lint, tipos, tests y build. Es lo mismo que corre el **CI de GitHub
  Actions** en cada push a `main` y en cada pull request.

---

## Puesta en marcha

**Requisitos:** Node 22 (ver `.node-version`) y pnpm.

1. Consigue un **API Read Access Token (v4)** de TMDB en
   <https://www.themoviedb.org/settings/api>.
2. Copia `.env.example` a `.env.local` y pega el token después de `VITE_TMDB_TOKEN=`.
   Los archivos `.env*` están ignorados por git: nunca los subas.
3. Instala y arranca:

```bash
pnpm install
pnpm dev
```

| Script            | Qué hace                                              |
| ----------------- | ----------------------------------------------------- |
| `pnpm dev`        | Servidor de desarrollo en <http://localhost:5173>     |
| `pnpm build`      | Typecheck + build de producción en `dist/`            |
| `pnpm preview`    | Sirve el build de producción                          |
| `pnpm check`      | Formato, lint, tipos, tests y build (igual que el CI) |
| `pnpm test:watch` | Tests en modo observador                              |
| `pnpm format`     | Formatea todo con Prettier                            |

**Despliegue:** preparado para Vercel. `vercel.json` redirige todas las rutas a `index.html` para que
React Router las resuelva. Configura `VITE_TMDB_TOKEN` en las variables de entorno del proyecto.

---

## Limitaciones conocidas

- **El token viaja en el bundle del navegador** (toda variable `VITE_*` lo hace). Es aceptable para un
  proyecto de estudio con un token de solo lectura; una app en producción llamaría a TMDB a través de su
  propio backend.
- **Datos de Perú escasos:** TMDB tiene menos información regional de Perú, así que el hero o las
  secciones de Perú pueden mostrar pocas películas según la semana.
- **La duración no viene en las listas de TMDB.** Solo el detalle (`/movie/{id}`) la incluye; mostrarla en
  las cards exigiría una petición por película.
- **View Transitions:** funcionan en Chrome/Edge modernos, Safari 18.2+ y Firefox 144+. En otros
  navegadores la app funciona igual, sin animación.
- **Tamaño del bundle:** el build avisa de un chunk principal de más de 500 kB (unos 228 kB comprimido).

---

## Documentación del proyecto

| Archivo                            | Contenido                                                           |
| ---------------------------------- | ------------------------------------------------------------------- |
| [`docs/guia.md`](docs/guia.md)     | Guía educativa: por qué cada herramienta, patrón y decisión         |
| [`docs/design.md`](docs/design.md) | Sistema de diseño: paleta, tipografía, imágenes y movimiento        |
| [`CLAUDE.md`](CLAUDE.md)           | Convenciones del proyecto para trabajar con Claude Code             |
| `.claude/`                         | Reglas (arquitectura, componentes, diseño, tests), agentes y skills |

---

Este producto usa la API de TMDB, pero no está respaldado ni certificado por TMDB.
