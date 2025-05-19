
import AppLayout from "@/components/layout/AppLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Mail } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      question: "How do I record my instrument performance?",
      answer: "Each instrument has recording controls at the top of its page. Click the red record button to start recording, play your music, then click stop. You can then download your recording or share it."
    },
    {
      question: "Can I use my computer keyboard to play instruments?",
      answer: "Yes! Most instruments support keyboard controls. Look for the keyboard guide icon on the instrument page or hover over keys to see their corresponding keyboard shortcuts."
    },
    {
      question: "How do I change instrument sounds or styles?",
      answer: "Each instrument has variant selectors that let you switch between different types or styles. These are typically shown as buttons or a dropdown menu above the instrument interface."
    },
    {
      question: "Can I play with others in real-time?",
      answer: "Yes! Use our 'Create New Room' feature from the footer to start a jam session, then share the link with friends. They can join and play different instruments together in real-time."
    },
    {
      question: "Are the instruments free to use?",
      answer: "Yes, all basic instruments are free to use. We offer premium versions with additional features, sound libraries, and advanced recording capabilities with a subscription."
    },
    {
      question: "How do I improve my skills on an instrument?",
      answer: "Check out our tutorial section for each instrument. We offer beginner, intermediate and advanced lessons with interactive guides to help you progress."
    },
    {
      question: "Can I use my MIDI controller?",
      answer: "Yes, MIDI controller support is available for most instruments. Connect your MIDI device to your computer before opening the app, and it should be automatically detected."
    },
    {
      question: "My instrument isn't making any sound. What should I do?",
      answer: "First, check if your device's sound is on and volume is up. Make sure you've allowed browser permissions for audio. Try refreshing the page, and if the issue persists, try a different browser."
    }
  ];
  
  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

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
      title="FAQs & Support | HarmonyHub"
      description="Get answers to frequently asked questions about HarmonyHub and find support for any issues you may encounter."
    >
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">FAQs & Support Center</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions or reach out to our support team for assistance.
          </p>
        </div>
        
        {/* Search bar */}
        <div className="mb-10 relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="text"
            placeholder="Search for answers..." 
            className="pl-10 py-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* FAQs */}
        <div className="mb-14">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <p>No results found. Try a different search term or contact support.</p>
            </div>
          )}
        </div>
        
        {/* Contact options */}
        <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4 mx-auto">
        
                    <motion.div variants={itemVariants}>
                      <Card className="overflow-hidden border-t-4 border-primary hover:shadow-lg transition-shadow">
                        <CardHeader className="bg-primary/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-full">
                              <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg">Email Support</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <p className="">
                            <a href="mailto:onlinevertualinstrument@gmail.com" className="hover:text-primary transition-colors">
                             onlinevertualinstrument@gmail.com
                            </a>
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Send us an email and we'll get back to you. We typically respond within 24 hours</p>
                          <Button variant="outline" className="w-full mt-6"><a href="mailto:onlinevertualinstrument@gmail.com" className="hover:text-primary transition-colors">Contact Support</a></Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                    </div>
        
      </div>
    </AppLayout>
  );
};

export default Help;
