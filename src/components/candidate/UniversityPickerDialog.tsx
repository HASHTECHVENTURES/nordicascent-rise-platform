import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Loader2, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUniversities, useSaveCandidateUniversity } from "@/hooks/useData";
import { filterUniversities } from "@/lib/universities";

type Props = {
  open: boolean;
  candidateId: string;
  onComplete: () => void;
  onWaitlistComplete: () => void;
  onOpenChange?: (open: boolean) => void;
  required?: boolean;
};

export default function UniversityPickerDialog({
  open,
  candidateId,
  onComplete,
  onWaitlistComplete,
  onOpenChange,
  required = false,
}: Props) {
  const { toast } = useToast();
  const { data: universities, isLoading } = useUniversities();
  const saveUniversity = useSaveCandidateUniversity();
  const [search, setSearch] = useState("");
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistCity, setWaitlistCity] = useState("");
  const [confirmWaitlistOpen, setConfirmWaitlistOpen] = useState(false);

  const list = universities ?? [];
  const filtered = useMemo(() => filterUniversities(list, search), [list, search]);

  const resetState = () => {
    setSearch("");
    setShowWaitlistForm(false);
    setWaitlistName("");
    setWaitlistCity("");
    setConfirmWaitlistOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && required) return;
    if (!next) resetState();
    onOpenChange?.(next);
  };

  const handleSelect = async (universityId: string) => {
    try {
      await saveUniversity.mutateAsync({ candidateId, universityId });
      toast({ title: "University saved" });
      resetState();
      onComplete();
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const submitWaitlist = async () => {
    const name = waitlistName.trim();
    if (!name) return;
    try {
      await saveUniversity.mutateAsync({
        candidateId,
        waitlistName: name,
        institutionType: "university",
        city: waitlistCity.trim() || undefined,
      });
      setConfirmWaitlistOpen(false);
      resetState();
      onWaitlistComplete();
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const isSaving = saveUniversity.isPending;
  const searchTrimmed = search.trim();
  const noMatches = !isLoading && searchTrimmed.length > 0 && filtered.length === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => required && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Where did you study?
            </DialogTitle>
            <DialogDescription>
              Search and select your university. If it is not listed, submit the name for our waitlist.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!showWaitlistForm ? (
              <>
                <Command shouldFilter={false} className="rounded-lg border">
                  <CommandInput
                    placeholder="Search universities..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList className="max-h-[220px]">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>
                          {searchTrimmed
                            ? `No match for "${searchTrimmed}". You can submit it to our waitlist.`
                            : "Start typing to search."}
                        </CommandEmpty>
                        <CommandGroup>
                          {filtered.map((uni) => (
                            <CommandItem
                              key={uni.id}
                              value={uni.name}
                              onSelect={() => handleSelect(uni.id)}
                              disabled={isSaving}
                            >
                              <span>{uni.name}</span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {[uni.city, uni.country].filter(Boolean).join(", ")}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>

                {noMatches && (
                  <Button
                    type="button"
                    className="w-full"
                    variant="secondary"
                    onClick={() => {
                      setWaitlistName(searchTrimmed);
                      setConfirmWaitlistOpen(true);
                    }}
                  >
                    Submit "{searchTrimmed}" to waitlist
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setWaitlistName(search.trim());
                    setShowWaitlistForm(true);
                  }}
                >
                  My university isn't listed
                </Button>
              </>
            ) : (
              <div className="space-y-3 rounded-lg border p-4">
                <Label htmlFor="waitlist-name">University name</Label>
                <Input
                  id="waitlist-name"
                  value={waitlistName}
                  onChange={(e) => setWaitlistName(e.target.value)}
                  placeholder="Enter the full name"
                />
                <Label htmlFor="waitlist-city">City</Label>
                <Input
                  id="waitlist-city"
                  value={waitlistCity}
                  onChange={(e) => setWaitlistCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                />
                <p className="text-xs text-muted-foreground">
                  We'll keep your university on our waitlist. An admin will review it and make it selectable.
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowWaitlistForm(false)}>
                    Back to search
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={!waitlistName.trim() || isSaving}
                    onClick={() => setConfirmWaitlistOpen(true)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>

          {!required && (
            <div className="flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmWaitlistOpen} onOpenChange={setConfirmWaitlistOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit university to waitlist?</AlertDialogTitle>
            <AlertDialogDescription>
              We'll save <strong>{waitlistName.trim()}</strong> for admin review. An admin will add it to the
              directory when approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction disabled={isSaving} onClick={submitWaitlist}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit to waitlist"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
