
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Send } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

interface ForgotPasswordFormProps {
  onBack?: () => void;
  onBackToLogin?: () => void;
}

export const ForgotPasswordForm = ({ onBack, onBackToLogin }: ForgotPasswordFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    }
  });

  const onSubmit = (data: FormValues) => {
    console.log('Reset password for:', data.email);
    
    // In a real app, you would call your API to send a password reset email
    setSubmittedEmail(data.email);
    setIsSubmitted(true);
    
    toast.success("Password reset link sent", {
      description: `We've sent a password reset link to ${data.email}`
    });
  };

  const handleBackClick = () => {
    if (onBack) onBack();
    if (onBackToLogin) onBackToLogin();
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Send className="h-8 w-8 text-green-600" />
        </div>
        
        <h3 className="text-lg font-medium mb-2">Check your email</h3>
        <p className="text-muted-foreground mb-4">
          We've sent a password reset link to:
          <br />
          <span className="font-medium text-foreground">{submittedEmail}</span>
        </p>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
          >
            Try another email
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleBackClick}
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Reset your password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col space-y-2">
            <Button type="submit">
              <Send className="mr-2 h-4 w-4" />
              Send reset link
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              className="text-xs"
              onClick={handleBackClick}
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Back to login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;