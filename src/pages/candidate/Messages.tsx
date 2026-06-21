import MessagesPanel from "@/components/MessagesPanel";
import { useLocation } from "react-router-dom";

const CandidateMessages = () => {
  const location = useLocation();
  const startWithProfileId = (location.state as { startWithProfileId?: string } | null)?.startWithProfileId;

  return (
    <MessagesPanel
      emptyHint="No conversations yet. Message an employer or Nordic Ascent support."
      allowNewConversation
      initialProfileId={startWithProfileId}
    />
  );
};

export default CandidateMessages;
