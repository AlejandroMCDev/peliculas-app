import { ChevronsUpDown, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Skeleton } from '@/shared/ui/skeleton';
import { MIN_PEOPLE_QUERY_LENGTH } from '../../application/search-people';
import type { Person } from '../../domain/movie';
import { formatDepartment } from '../format';
import { usePeopleSearch } from '../movie-queries';

type PersonPickerProps = {
  /** Accessible name of the trigger, e.g. "Añadir actor". */
  label: string;
  placeholder: string;
  excludeIds: number[];
  onSelect: (person: Person) => void;
  disabled?: boolean;
};

/** Combobox that searches people in TMDB while typing (Popover + Command, server-side search). */
export function PersonPicker({
  label,
  placeholder,
  excludeIds,
  onSelect,
  disabled,
}: PersonPickerProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const query = useDebouncedValue(text, 300);
  const search = usePeopleSearch(query);

  const tooShort = text.trim().length < MIN_PEOPLE_QUERY_LENGTH;
  const people = tooShort ? [] : (search.data ?? []).filter(({ id }) => !excludeIds.includes(id));
  const isSearching = !tooShort && (search.isFetching || text !== query) && people.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          disabled={disabled}
          className="w-full justify-between font-normal text-muted-foreground"
        >
          {placeholder}
          <ChevronsUpDown className="opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
        {/* shouldFilter={false}: TMDB already filtered; cmdk must not filter the results again. */}
        <Command shouldFilter={false}>
          <CommandInput placeholder="Escribe un nombre…" value={text} onValueChange={setText} />
          <CommandList>
            {isSearching ? (
              <div className="space-y-2 p-2" aria-label="Buscando">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <CommandEmpty>
                {tooShort ? 'Escribe al menos 2 letras.' : 'No encontramos a nadie con ese nombre.'}
              </CommandEmpty>
            )}
            <CommandGroup>
              {people.map((person) => (
                <CommandItem
                  key={person.id}
                  value={String(person.id)}
                  onSelect={() => {
                    onSelect(person);
                    setOpen(false);
                    setText('');
                  }}
                >
                  <Avatar className="size-8">
                    {person.photo && <AvatarImage src={person.photo.small} alt="" />}
                    <AvatarFallback>
                      <UserRound className="size-4" aria-hidden />
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">{person.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDepartment(person.department)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
