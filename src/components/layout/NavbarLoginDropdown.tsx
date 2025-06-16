import { Button } from "@/components/ui/button";
import { DropdownMenu,  DropdownMenuLabel, DropdownMenuSeparator,  DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, ChevronDown, Facebook, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '../../utils/auth/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export const NavbarLoginDropdown = () => {

  const { user, loading, logout } = useAuth(); 

  const loginWithGoogle = async (): Promise<void> => {
    const googleProvider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      console.log("✅ Google login success:", user);
    } catch (error: any) {
      console.error("❌ Google login failed:", error);
      alert("Google login failed: " + error.message);
    }
  };

  const loginWithFacebook = async (): Promise<void> => {
    const facebookProvider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      const user = result.user;
      console.log("✅ Facebook login success:", user);
    } catch (error: any) {
      console.error("❌ Facebook login failed:", error);
      alert("Facebook login failed: " + error.message);
    }
  };



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
      <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName?.split(" ")[0] || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
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

      <Button
        className="w-full justify-start bg-[#3b5998] text-white 
                   hover:bg-[#334f88] transition-all duration-200 ease-in-out hover:scale-[1.02]"
        onClick={loginWithFacebook}
      >
        <Facebook className="w-4 h-4 mr-2" />
        Sign in with Facebook
      </Button>

    </DropdownMenuContent>
  </DropdownMenu>
);

};

