import MessagesPanel from "@/components/MessagesPanel";
import { useLocation } from "react-router-dom";

const AdminMessages = () => {
  const location = useLocation();
  const startWithProfileId = (location.state as { startWithProfileId?: string } | null)?.startWithProfileId;

  return (
    <MessagesPanel
      emptyHint="No conversations yet. Start a conversation with any platform user."
      allowNewConversation
      initialProfileId={startWithProfileId}
    />
  );
};

export default AdminMessages;
