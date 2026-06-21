import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PortalUserMenu({
  profilePath,
  messagesPath,
}: {
  profilePath: string;
  messagesPath: string;
}) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const role = profile?.role;
    await signOut();
    navigate(role === "admin" ? "/admin/login" : "/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>{initials(profile?.full_name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{profile?.full_name ?? "Account"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={profilePath}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={messagesPath}>Messages</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PortalUserSidebar({
  profilePath,
  roleLabel,
}: {
  profilePath: string;
  roleLabel: string;
}) {
  const { profile } = useAuth();

  return (
    <Link
      to={profilePath}
      className="flex items-center gap-3 p-2 rounded transition-colors bg-muted hover:bg-muted/80"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile?.avatar_url ?? undefined} />
        <AvatarFallback className="bg-nordic-orange text-white">
          {initials(profile?.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-foreground">
          {profile?.full_name ?? "User"}
        </p>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
      </div>
    </Link>
  );
}
