import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { INDIAN_STATES } from "@/lib/candidateLocation";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

/** Searchable state picker — avoids fast wheel-scroll in long Radix Select lists. */
export default function IndianStateSelect({ id, value, onChange, invalid }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            invalid && "border-destructive text-destructive ring-1 ring-destructive"
          )}
        >
          {value || "Select state"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[200]" align="start">
        <Command>
          <CommandInput placeholder="Search states..." />
          <CommandList className="max-h-[240px] overscroll-contain">
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandGroup>
              {INDIAN_STATES.map((state) => (
                <CommandItem
                  key={state}
                  value={state}
                  onSelect={() => {
                    onChange(state);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === state ? "opacity-100" : "opacity-0")} />
                  {state}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
