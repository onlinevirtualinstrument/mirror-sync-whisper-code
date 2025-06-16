
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare, Send, LucideMessageCircleQuestion } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you soon."
      });
    }, 1500);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <AppLayout
      title="Contact Us | HarmonyHub"
      description="Get in touch with the HarmonyHub team for support, feedback, or partnership inquiries."
    >
      <div className="container mx-auto px-4 py-12">
        {/* Hero section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Have questions about our instruments? Want to collaborate? 
            We'd love to hear from you!
          </p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-10 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <motion.div 
            className="w-full lg:w-1/3 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-t-4 border-primary hover:shadow-lg transition-shadow">
                <CardHeader className="bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Email Us</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    <a href="mailto:onlinevertualinstrument@gmail.com" className="hover:text-primary transition-colors">
                    onlinevertualinstrument@gmail.com
                    </a>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">We typically respond within 24 hours</p>
                </CardContent>
              </Card>
            </motion.div>
            
          
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-t-4 border-amber-500 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-amber-500/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-full">
                      <Phone className="h-5 w-5 text-amber-500" />
                    </div>
                    <CardTitle className="text-lg">Call Us</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    <a href="tel:+18005551234" className="hover:text-secondary transition-colors">
                      +1 (800) 555-1234
                    </a>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Mon-Fri, 9am-5pm PT</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-orange-500/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-full">
                      <LucideMessageCircleQuestion className="h-5 w-5 text-amber-500" />
                    </div>
                    <CardTitle className="text-lg">Still Have Questions?</CardTitle>
                  </div>
                </CardHeader>
              
                <CardContent className="pt-6">
                  <p className="text-gray-600 dark:text-gray-300">
                  Check out our frequently asked questions or reach out to us directly.
                  </p>
                  <Button asChild className="mt-4 animate-bounce">
            <a href="/help">View FAQs</a>
          </Button>
                </CardContent>
              </Card>
            </motion.div> */}
          </motion.div>
          
          
          {/* Contact Form */}
          <motion.div 
            className="w-full lg:w-2/3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
             <motion.div variants={itemVariants}>
            <Card className="border border-indigo-200 dark:border-indigo-800 shadow-md">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Type your message here..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end border-t bg-gray-50 dark:bg-gray-900">
                <Button 
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                      Send Message
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Map section */}
        {/* <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Visit Our Office</h2>
            <p className="text-gray-600 dark:text-gray-300">
              123 Music Avenue, Suite 100, San Francisco, CA 94107
            </p>
          </div>
          
          <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center p-6">
                <MapPin size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Interactive Map</p>
                <p className="text-sm text-gray-500">Map would be embedded here</p>
              </div>
            </div>
          </div>
        </motion.div> */}
        
        
        {/* FAQ section */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Check out our frequently asked questions or reach out to us directly.
          </p>
          <Button asChild className="animate-bounce">
            <a href="/help">View FAQs</a>
          </Button>
        </motion.div>

        
      </div>
    </AppLayout>
  );
};

export default Contact;
