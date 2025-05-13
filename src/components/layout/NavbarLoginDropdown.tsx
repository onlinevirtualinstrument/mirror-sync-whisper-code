
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
<<<<<<< HEAD
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '../../utils/auth/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

 export const loginWithGoogle = async () => {
   const googleProvider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;

    console.log("Google login success:", user);
    return user;
  } catch (error) {
    console.error("Google login failed:", error);
    alert("Google login failed: " + error.message);
  }
 };
 
export const loginWithFacebook = async () => {
   const facebookProvider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    const user = result.user;

    console.log("Facebook login success:", user);
    return user;
  } catch (error) {
    console.error("Facebook login failed:", error);
    alert("Facebook login failed: " + error.message);
  }
};

export const NavbarLoginDropdown = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return <p>Loading...</p>;
  
return user ? (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-4 py-2">
          {/* Avatar */}
          <Avatar className="w-6 h-6">
            <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
            <AvatarFallback>
              {user.displayName?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <span>{user.displayName?.split(" ")[0] || "User"}</span>

          {/* Dropdown Icon */}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      <DropdownMenuItem onClick={logout} className="text-red-600 hover:bg-red-100">
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
) : (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="flex items-center gap-1.5 px-4 py-2">
        <LogIn className="w-4 h-4" />
        Login
        <ChevronDown className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent sideOffset={8} className="z-50 w-60 space-y-2 p-2">
      <Button
        className="w-full justify-start bg-white text-black border border-gray-300 
                   hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-[1.02]"
        onClick={loginWithGoogle}
      >
        <FcGoogle className="w-4 h-4 mr-2" />
        Sign in with Google
      </Button>
=======
import { UserButton } from "@/components/auth/UserButton";
import { toast } from "sonner";

export function NavbarLoginDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleSignIn = () => {
    navigate('/auth/login');
  };
>>>>>>> 16fe0921b7f4fa4b469f25cb7bb087c1a18c33f0

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
