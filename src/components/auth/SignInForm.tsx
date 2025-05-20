
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Facebook, Twitter, Instagram, LogIn } from 'lucide-react';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import ForgotPasswordForm from './ForgotPasswordForm';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional()
});

type FormValues = z.infer<typeof formSchema>;

const SignInForm = () => {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  const onSubmit = (data: FormValues) => {
    console.log('Login data:', data);
    
    // Show success toast
    toast({
      title: "Login successful!",
      description: "Welcome back to HarmonyHub.",
    });
    
    // Redirect to home
    navigate('/');
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    type="email" 
                    {...field} 
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your password" 
                    type="password" 
                    {...field} 
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                {...form.register("rememberMe")}
              />
              <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                Remember me
              </Label>
            </div>
            <div className="text-sm">
              <button 
                type="button"
                onClick={() => setShowForgotPassword(true)} 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>
          
          <Button type="submit" className="w-full transition-all duration-300 hover:scale-[1.02]">
            <LogIn className="mr-2" size={16} />
            Sign In
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link className="font-medium text-blue-600 hover:text-blue-500 transition-colors" to="/auth/register">
            Sign up
          </Link>
        </p>
      </div>
      
      <div className="mt-6 grid grid-cols-4 gap-3">
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
          <GoogleIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
          <Facebook className="h-4 w-4" />
        </Button>
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
          <Twitter className="h-4 w-4" />
        </Button>
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
          <Instagram className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SignInForm;
