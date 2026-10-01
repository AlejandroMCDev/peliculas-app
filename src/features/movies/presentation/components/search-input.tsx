import { Search, X } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/shared/ui/input-group';

type SearchInputProps = {
  /** The committed query (from the URL). */
  value: string;
  onChange: (query: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  // The input keeps its own text so typing is instant; the URL only updates after a pause.
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  // The URL changed from outside (a chip, "Limpiar", back button): show it in the input.
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== text.trim()) setText(value);
  }

  const debounced = useDebouncedValue(text, 350);
  const commit = useEffectEvent((next: string) => {
    if (next !== value) onChange(next);
  });
  useEffect(() => commit(debounced.trim()), [debounced]);

  return (
    <InputGroup className="h-10">
      <InputGroupAddon>
        <Search aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label="Buscar película por título"
        placeholder="Buscar por título…"
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Borrar búsqueda" onClick={() => setText('')}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
