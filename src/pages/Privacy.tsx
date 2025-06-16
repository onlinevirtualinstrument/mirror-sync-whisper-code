
import AppLayout from "@/components/layout/AppLayout";
import { Separator } from "@/components/ui/separator";

const Privacy = () => {
  const lastUpdated = "May 5, 2025";

  return (
    <AppLayout
      title="Privacy Policy | HarmonyHub"
      description="Review HarmonyHub's privacy policy to understand how we collect, use, and protect your data."
    >
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="lead">
            At HarmonyHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our virtual instrument services.
          </p>
          
          <Separator className="my-8" />
          
          <section>
            <h2>Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul>
              <li>Create an account</li>
              <li>Use our virtual instruments</li>
              <li>Save or share recordings</li>
              <li>Participate in community features</li>
              <li>Contact our customer support</li>
              <li>Subscribe to our newsletter</li>
            </ul>
            
            <p>
              This information may include your name, email address, password, preferences, and any musical content you create using our services.
            </p>
            
            <h3>Information Collected Automatically</h3>
            <p>
              When you access our services, we may automatically collect certain information about your device and usage patterns, including:
            </p>
            <ul>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Device information</li>
              <li>Usage data (features used, time spent, etc.)</li>
              <li>Performance data (to improve service quality)</li>
            </ul>
          </section>
          
          <Separator className="my-8" />
          
          <section>
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new features and services</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Prevent fraudulent transactions and monitor against theft</li>
              <li>Send you marketing communications (with your consent)</li>
            </ul>
          </section>
          
          <Separator className="my-8" />
          
          <section>
            <h2>Sharing of Information</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
            </p>
            <ul>
              <li>With third-party service providers who help us operate our business</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer (merger, acquisition, etc.)</li>
              <li>With your consent</li>
            </ul>
            <p>
              When you choose to share your musical creations publicly, those recordings and associated information will be viewable by other users according to your sharing settings.
            </p>
          </section>
          
          <Separator className="my-8" />
          
          <section>
            <h2>Data Security</h2>
            <p>
              We implement a variety of security measures to protect your personal information:
            </p>
            <ul>
              <li>Encryption of sensitive data</li>
              <li>Secure servers and networks</li>
              <li>Regular security assessments</li>
              <li>Employee training on privacy practices</li>
              <li>Limited access to personal information</li>
            </ul>
            <p>
              However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security of your data.
            </p>
          </section>
          
          <Separator className="my-8" />
          
          <section>
            <h2>Your Choices</h2>
            <p>You have several choices regarding the information you provide to us:</p>
            <ul>
              <li>Update or correct your account information at any time</li>
              <li>Opt-out of marketing communications</li>
              <li>Request deletion of your account and personal data</li>
              <li>Set privacy options for your created content</li>
              <li>Use browser controls to manage cookies and tracking technologies</li>
            </ul>
          </section>
          
          <Separator className="my-8" />
          
          <section>
            <h2>Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will promptly delete that information.
            </p>
          </section>
          
          <Separator className="my-8" />
          
          <section>
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>
          
          <Separator className="my-8" />
          
          <section>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="">
                            <a href="mailto:onlinevertualinstrument@gmail.com" className="hover:text-primary transition-colors">
                             onlinevertualinstrument@gmail.com
                            </a>
                          </p>
            <p>Address: Mumbai, Maharashtra, India</p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Privacy;
