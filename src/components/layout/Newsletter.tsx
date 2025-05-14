
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Check, Mail, MailIcon, MailPlus, MailOpen, MailSearch } from 'lucide-react';

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideMail } from "lucide-react"; // You can replace with any icon you prefer

interface NewsletterProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

const Newsletter = ({ variant = 'default', className = '' }: NewsletterProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call to subscribe user and send welcome email
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      
       // Send confirmation to user
       const emailContent = generateUserEmail();
      
       // Send notification to admin
       const adminEmailContent = generateAdminEmail(email);
       
       // Log email content to console (in a real app this would be sent via a backend service)
       console.log("Sending welcome email to user:", emailContent);
       console.log("Sending notification email to admin:", adminEmailContent);
      
      setEmail('');
      
      toast({
        title: "Subscribed!",
        description: "You've been added to our newsletter. Check your inbox for a welcome email!",
      });
      
      // Reset success message after delay
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }, 1500);
  };


  const generateUserEmail = () => {
    return `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            body { 
              font-family: 'Poppins', Arial, sans-serif; 
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 0;
              background-color: #fff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%);
              padding: 30px 20px; 
              text-align: center; 
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content { 
              background-color: #fff; 
              padding: 40px 30px;
            }
            .footer { 
              background-color: #f5f5f7;
              padding: 20px; 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%);
              color: white; 
              text-decoration: none; 
              padding: 14px 30px; 
              border-radius: 50px; 
              font-weight: 600; 
              margin: 25px 0; 
              text-align: center;
              box-shadow: 0 4px 10px rgba(126, 105, 171, 0.3);
              transition: transform 0.2s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 15px rgba(126, 105, 171, 0.4);
            }
            .instrument-section {
              margin: 30px 0;
              padding: 25px;
              background-color: #F1F0FB;
              border-radius: 12px;
              position: relative;
              overflow: hidden;
            }
            .instrument-section::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 150px;
              height: 150px;
              background-image: url('https://i.imgur.com/JHy8CAP.png');
              background-size: contain;
              background-repeat: no-repeat;
              opacity: 0.1;
            }
            .feature-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 25px 0;
            }
            .feature-item {
              background-color: #f9f9fc;
              padding: 15px;
              border-radius: 8px;
              border-left: 3px solid #9b87f5;
            }
            .social-links {
              margin-top: 25px;
              text-align: center;
            }
            .social-link {
              display: inline-block;
              margin: 0 10px;
              color: #7E69AB;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to HarmonyHub!</h1>
              <p>Your Musical Journey Begins Now</p>
            </div>
            <div class="content">
              <p>Hello music enthusiast,</p>
              <p>Thank you for subscribing to the HarmonyHub newsletter! We're thrilled to have you join our growing community of music lovers and creators.</p>
              
              <p>Here's what you can look forward to as part of our community:</p>
              <div class="feature-grid">
                <div class="feature-item">
                  <strong>Weekly Updates</strong>
                  <p>New instruments and features</p>
                </div>
                <div class="feature-item">
                  <strong>Expert Tutorials</strong>
                  <p>From professional musicians</p>
                </div>
                <div class="feature-item">
                  <strong>Community Events</strong>
                  <p>Collaborative jam sessions</p>
                </div>
                <div class="feature-item">
                  <strong>Exclusive Content</strong>
                  <p>Early access to new features</p>
                </div>
              </div>
              
              <div class="instrument-section">
                <h3>This Month's Featured Instrument: The Marimba</h3>
                <p>Discover the rich, resonant tones of our newly enhanced marimba collection. From traditional rosewood to contemporary synthetic designs, explore different playing styles and techniques.</p>
                <a href="#" class="button">Try It Now</a>
              </div>
              
              <p>Ready to start making music? Check out our most popular instruments:</p>
              <ul>
                <li><strong>Piano</strong> - Perfect for beginners and professionals alike</li>
                <li><strong>Guitar</strong> - Acoustic, electric, and classical variations</li>
                <li><strong>Drums</strong> - From basic beats to complex rhythms</li>
                <li><strong>Kalimba</strong> - Our newest addition with unique ethereal tones</li>
              </ul>
              
              <p>Join one of our virtual jam sessions to collaborate with musicians worldwide!</p>
              <a href="#" class="button">Join a Music Room</a>
              
              <p>Happy music-making!</p>
              <p>The HarmonyHub Team</p>
              
              <div class="social-links">
                <a href="#" class="social-link">Facebook</a>
                <a href="#" class="social-link">Twitter</a>
                <a href="#" class="social-link">Instagram</a>
                <a href="#" class="social-link">YouTube</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 HarmonyHub | <a href="#">Privacy Policy</a> | <a href="#">Unsubscribe</a></p>
              <p>123 Music Avenue, Suite 100, San Francisco, CA 94107</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };
  
  const generateAdminEmail = (userEmail: string) => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #7E69AB; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; color: white; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
            .info-row { margin-bottom: 10px; padding: 10px; background-color: #fff; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Newsletter Subscription</h2>
            </div>
            <div class="content">
              <p>A new user has subscribed to the HarmonyHub newsletter.</p>
              
              <div class="info-row">
                <strong>Email:</strong> ${userEmail}
              </div>
              <div class="info-row">
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
              </div>
              <div class="info-row">
                <strong>Time:</strong> ${new Date().toLocaleTimeString()}
              </div>
              
              <p>The welcome email has been automatically sent to the subscriber.</p>
            </div>
            <div class="footer">
              <p>© 2025 HarmonyHub Admin System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex gap-2 ${className} `}>
        <Input 
          placeholder="Your email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9"
        />
        {isSubscribed ? (
          <Button size="sm" variant="secondary" className="h-9 bg-green-500 hover:bg-green-600">
            <Check size={14} className="mr-1" /> Joined
          </Button>
        ) : (
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="h-9"
          >
            {isSubmitting ? 'Joining...' : 'Join'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 p-6 rounded-lg overflow-hidden border-t-4 border-b border-l border-r border-gray-700 hover:shadow-lg transition-shadow ${className}`}>
      <h3 className="text-xl font-medium mb-3">Join Our Newsletter</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Get updates on new instruments, features, and musical tips.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        {isSubscribed ? (
          <Button className="w-full bg-green-500 hover:bg-green-600" type="button">
            <Check size={16} className="mr-2" /> Successfully subscribed!
          </Button>
        ) : (
          <Button className="w-full relative overflow-hidden group" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Subscribing...
              </span>
            ) : (
              <span className="flex items-center">
                <Mail size={16} className="mr-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                Subscribe
              </span>
            )}
          </Button>
        )}
        
        <p className="text-xs text-gray-500">
          By subscribing, you agree to our <a href="/privacy" className="underline">Privacy Policy</a>.
          We'll never share your email address.
        </p>
      </form>
    </div>
  );
};

export default Newsletter;


export const Unsubscribe = () => {
  return (
    <div style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', maxWidth: '100%' }}>
      <iframe
        width="540"
        height="305"
        src="https://a7aeae7f.sibforms.com/serve/MUIFAApKWmjBc6zM5Ache_7O4xvjZdna4Qp-MHOzxZCbMDVh1IKXdzs7pMxDMGQs2ZCPLY54qx2uFVGtXKTdOhv28ZJV5E-muPg7YQd07huO-wfaEQJY32hRTNZMIxEFzhjHnXptotH7RNAHz3NgJ-HPO9cUb0glPMrhag_v4OIb_jVyyeYzo1OxQVqpGcVSnGfDfmgh98OTUQUW"
        frameBorder="0"
        scrolling="auto"
        allowFullScreen
        style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', maxWidth: '100%' }}
        title="Newsletter Subscription"
      ></iframe>
    </div>
  );
};






// useEffect(() => {
//   const styleLink = document.createElement("link");
//   styleLink.rel = "stylesheet";
//   styleLink.href = "https://sibforms.com/forms/end-form/build/sib-styles.css";
//   document.head.appendChild(styleLink);

//   const script = document.createElement("script");
//   script.src = "https://sibforms.com/forms/end-form/build/main.js";
//   script.defer = true;
//   document.body.appendChild(script);

//   return () => {
//     document.head.removeChild(styleLink);
//     document.body.removeChild(script);
//   };
// }, []);



export const Subscribe = () => {
  // return (
  //   <iframe
  //     width="540"
  //     height="305"
  //     src="https://sibforms.com/serve/MUIFAL1ywyYJO-C7ZfxidbS2Wjn4gwurHSTQWlFMR3aOvfnN9qpB-pOG7uKdbwSsl3D67iG2eCFp0w0rtyfHgiE35Bh_PyYPIO3FjF-U2EPXMmt9eElxXZ9H32X4gSHWnpbjotcx7ZZdTT3R3RmEiEqike9lL-Zg9wA4jnHTIMUpg2n6wIoM6ULJDBq2ZenhtGnumEcJkvL54qU1"
  //     frameBorder="0"
  //     scrolling="auto"
  //     allowFullScreen
  //     style={{
  //       display: 'block',
  //       marginLeft: 'auto',
  //       marginRight: 'auto',
  //       maxWidth: '100%',
  //     }}
  //   ></iframe>
  // );








  return (
    <Card className="overflow-hidden border-t-4 border-gray-700 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gray-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-500/20 rounded-full">
            <Mail className="h-5 w-5 text-gray" />
          </div>
          <CardTitle className="text-lg">Join Our Newsletter</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div
          
         
          dangerouslySetInnerHTML={{
            __html: `
            <div class="sib-form-container">
             
                <form id="sib-form" method="POST" action="https://sibforms.com/serve/MUIFAC6c7UzwZhoWxUljUDxKetK--Hkk841fC0p3rV4dmw9un-T9yTdndDXr13CIe91KGKaW-vFZJN89JlZgCWGPoJk0NRp8Us6UC-k6GzeNSv3ys5uRWDj6Lz4cCbzBqMNsukNd2X4aG__5cSTEI4uWsXyxGVhnUFJPUkf81K8ISYGb2diebw01UJwmoHuAbwZ3nwiMaXJv_75g" data-type="subscription">
                  <div style="">
                   <p className="text-gray-600 dark:text-gray-300">Get updates on new instruments, features, and musical tips.</p>
                  </div>
                  <div style="padding: 8px 0;">
                    <input type="text" id="EMAIL" name="EMAIL" placeholder="Enter your email address" data-required="true" required style="padding:10px;width:100%;border:1px solid black;border-radius:10px;" />
                  </div>
                  <div style="padding: 8px 0;">
                    <button type="submit" style="background-color:black;color:#fff;padding:10px 20px;border:1px solid black; border-radius:10px;font-weight:bold;">Join</button>
                  </div>
                  <input type="text" name="email_address_check" value="" class="input--hidden" />
                  <input type="hidden" name="locale" value="en" />
                </form>

            </div>
          `,
          }}
        />
      </CardContent>
    </Card>
  );
};


export const SubscribeInFooter = () => {

  return (
         <div

          dangerouslySetInnerHTML={{
            __html: `
            <div class="sib-form-container">
             
                <form id="sib-form" method="POST" action="https://sibforms.com/serve/MUIFAC6c7UzwZhoWxUljUDxKetK--Hkk841fC0p3rV4dmw9un-T9yTdndDXr13CIe91KGKaW-vFZJN89JlZgCWGPoJk0NRp8Us6UC-k6GzeNSv3ys5uRWDj6Lz4cCbzBqMNsukNd2X4aG__5cSTEI4uWsXyxGVhnUFJPUkf81K8ISYGb2diebw01UJwmoHuAbwZ3nwiMaXJv_75g" data-type="subscription">
                 
                  <div style="padding: 8px 0; display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="EMAIL" name="EMAIL" placeholder="Your email" data-required="true" required style="padding:10px;width:100%;border:1px solid #ccc ;border-radius:10px;" />
                 
                    <button type="submit" style="background-color:black;color:#fff;padding:10px 20px;border:1px solid black; border-radius:10px;font-weight:bold;">Join</button>
                  </div>
                  <input type="text" name="email_address_check" value=""  style="display: none;" class="input--hidden" />
                  <input type="hidden" name="locale" value="en" />
                </form>

            </div>
          `,
          }}
        />
  

  );
};


