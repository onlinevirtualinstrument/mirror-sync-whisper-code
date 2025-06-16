
import { useState } from "react";
import { Link } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth/AuthLayout";

export default function Login() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  return ( 
    <AuthLayout
      title="Welcome back"
      subtitle={showForgotPassword ? "" : "Enter your credentials to access your account"}
    >
      {showForgotPassword ? (
        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
      ) : (
        <>
          <LoginForm />
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="p-0 h-auto font-normal text-sm text-muted-foreground hover:text-primary"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot your password?
            </Button>
          </div>
          
          {/* <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{" "}
            <Link to="/auth/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div> */}
        </>
      )}
    </AuthLayout>
  );
}
