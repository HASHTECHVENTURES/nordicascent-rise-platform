import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Props = {
  title?: string;
  notesLabel?: string;
  notesRequired?: boolean;
  notesPlaceholder?: string;
  defaultDate?: string;
  defaultNotes?: string;
  canEdit?: boolean;
  isPending?: boolean;
  requiresAttachment?: boolean;
  attachmentLabel?: string;
  confirmLabel?: string;
  onConfirm: (data: { event_date: string; notes?: string; file?: File }) => void | Promise<void>;
};

/** Reusable checkpoint confirm — date + optional notes + confirm (Module 4 build note). */
export default function CheckpointConfirm({
  title = "Confirm checkpoint",
  notesLabel = "Notes",
  notesRequired = false,
  notesPlaceholder = "Optional notes…",
  defaultDate = new Date().toISOString().slice(0, 10),
  defaultNotes = "",
  canEdit = true,
  isPending = false,
  requiresAttachment = false,
  attachmentLabel = "Upload file",
  confirmLabel = "Confirm",
  onConfirm,
}: Props) {
  const [eventDate, setEventDate] = useState(defaultDate);
  const [notes, setNotes] = useState(defaultNotes);
  const [file, setFile] = useState<File | null>(null);

  if (!canEdit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate) return;
    if (notesRequired && !notes.trim()) return;
    if (requiresAttachment && !file) return;
    await onConfirm({
      event_date: eventDate,
      notes: notes.trim() || undefined,
      file: file ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t">
      {title && <p className="text-sm font-medium">{title}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cp-date">Date</Label>
          <Input
            id="cp-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>
        {requiresAttachment && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cp-file">
              {attachmentLabel}
              {" *"}
            </Label>
            <Input
              id="cp-file"
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
        )}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cp-notes">
            {notesLabel}
            {notesRequired ? " *" : " (optional)"}
          </Label>
          <Textarea
            id="cp-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={notesPlaceholder}
            required={notesRequired}
          />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
      </Button>
    </form>
  );
}
