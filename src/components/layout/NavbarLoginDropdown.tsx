
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserButton } from "@/components/auth/UserButton";
import { toast } from "sonner";

export function NavbarLoginDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleSignIn = () => {
    navigate('/auth/login');
  };

  const handleSignUp = () => {
    navigate('/auth/register');
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <UserButton />
      ) : (
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSignIn} 
            variant="outline" 
            className="rounded-lg"
            size="sm"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Log in
          </Button>
          <Button 
            onClick={handleSignUp} 
            className="rounded-lg"
            size="sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Sign up
          </Button>
        </div>
      )}
    </div>
  );
}
