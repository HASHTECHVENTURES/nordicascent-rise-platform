import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentPrivacyNoticeVersion, useRecordPrivacyConsent } from "@/hooks/useGdpr";
import { DEFAULT_PRIVACY_NOTICE_VERSION } from "@/lib/gdpr";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onAccepted: () => void;
};

export function PrivacyConsentDialog({ open, onAccepted }: Props) {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { data: version } = useCurrentPrivacyNoticeVersion();
  const recordConsent = useRecordPrivacyConsent();
  const [accepted, setAccepted] = useState(false);
  const noticeVersion = version ?? DEFAULT_PRIVACY_NOTICE_VERSION;

  const onConfirm = async () => {
    if (!accepted) {
      toast({ title: "Please accept the Privacy Notice to continue", variant: "destructive" });
      return;
    }
    try {
      await recordConsent.mutateAsync(noticeVersion);
      onAccepted();
    } catch (err) {
      toast({
        title: "Could not save consent",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Privacy Notice update</DialogTitle>
          <DialogDescription>
            Please read and accept the current Privacy Notice (version {noticeVersion}) to continue
            using Nordic Ascent.
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          <Link to="/privacy" target="_blank" className="text-primary hover:underline">
            Read the Privacy Notice
          </Link>
        </p>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy-consent-gate"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <Label htmlFor="privacy-consent-gate" className="text-sm font-normal leading-tight">
            I have read and accept the Privacy Notice (required)
          </Label>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={() => signOut()}>
            Sign out
          </Button>
          <Button type="button" onClick={onConfirm} disabled={recordConsent.isPending}>
            {recordConsent.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Blocks authenticated users who have not accepted the current privacy notice. */
export default function PrivacyConsentGate({ children }: { children: React.ReactNode }) {
  const { session, profile, loading, refreshProfile } = useAuth();
  const { data: version } = useCurrentPrivacyNoticeVersion();
  const noticeVersion = version ?? DEFAULT_PRIVACY_NOTICE_VERSION;
  const [dismissed, setDismissed] = useState(false);

  const needsConsent =
    Boolean(session && profile) &&
    !dismissed &&
    (profile?.privacy_consent_at == null ||
      profile?.privacy_notice_version !== noticeVersion);

  if (loading || !session) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <PrivacyConsentDialog
        open={needsConsent}
        onAccepted={async () => {
          setDismissed(true);
          await refreshProfile();
        }}
      />
    </>
  );
}
