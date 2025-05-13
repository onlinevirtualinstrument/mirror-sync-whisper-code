
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, X } from 'lucide-react';
import SignUpForm from '@/components/auth/SignUpForm';

const Register = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleClose = () => {
    navigate('/'); // Navigate to home
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed top-4 left-4 z-10 flex gap-4">
        <Button onClick={handleBack} variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <Button onClick={handleClose} variant="ghost" size="icon" className="rounded-full">
          <X size={20} />
        </Button>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Sign up for HarmonyHub to access our collection of premium instruments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:block relative w-1/2 bg-gray-900">
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white bg-black/70 p-8">
            <h2 className="text-4xl font-bold mb-4">Join HarmonyHub Today</h2>
            <p className="text-xl max-w-md mx-auto">
              Create an account to explore our premium instruments, save your favorites, and enjoy a personalized musical experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
