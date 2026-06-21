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
import { CheckCircle, Clock, ArrowRight } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
};

export default function ApplicationSubmittedDialog({ open, onOpenChange, jobTitle }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
          </div>
          <DialogTitle className="text-center">Application submitted</DialogTitle>
          <DialogDescription className="text-center">
            Your application for <strong>{jobTitle}</strong> was sent to the employer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-muted-foreground border rounded-lg p-4 bg-muted/30">
          <p className="font-medium text-foreground">What happens next</p>
          <div className="flex gap-3">
            <Clock className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <p>The employer reviews your profile. This can take a few days.</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <p>We'll notify you here when your status changes.</p>
          </div>
          <div className="flex gap-3">
            <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <p>You can apply to other open roles anytime — track everything in My Applications.</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button className="w-full" asChild>
            <Link to="/candidate/applications" onClick={() => onOpenChange(false)}>
              My Applications
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/candidate/jobs" onClick={() => onOpenChange(false)}>
              Browse more jobs
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
