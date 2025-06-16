
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "@/components/ui/use-toast";
import { Facebook, Twitter, Instagram, UserPlus } from 'lucide-react';
import { GoogleIcon } from '@/components/icons/GoogleIcon';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
});

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false
    }
  });

  const onSubmit = (data: FormValues) => {
    console.log('Register data:', data);
    
    // Show success toast
    toast({
      title: "Registration successful!",
      description: "Welcome to HarmonyHub! Your account has been created.",
    });
    
    // Redirect to home
    navigate('/');
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your full name" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                    placeholder="Create a password" 
                    type="password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link className="font-medium text-blue-600 hover:text-blue-500" to="#">
                      Terms & Conditions
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">
            <UserPlus className="mr-2" size={16} />
            Create Account
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="font-medium text-blue-600 hover:text-blue-500" to="/auth/login">
            Sign in
          </Link>
        </p>
      </div>
      
      <div className="mt-6 grid grid-cols-4 gap-3">
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
          <GoogleIcon className="h-4 w-4" />
         {/*  <span>Google</span>*/}
        </Button>
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
          <Facebook className="h-4 w-4" />
        {/*   <span>Facebook</span>*/}
        </Button>
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
          <Twitter className="h-4 w-4" />
        {/*   <span>Twitter</span>*/}
        </Button>
        <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
          <Instagram className="h-4 w-4" />
         {/*  <span>Instagram</span>*/}
        </Button>
      </div>
    </div>
  );
};

export default SignUpForm;
