
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { Users, Music, LucideMessageCircleQuestion, Sparkles, Mail } from "lucide-react";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const About = () => {
  const [activeTab, setActiveTab] = useState("story");

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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

  const scrollToSection = () => {
    const section = document.getElementById("OutStory");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AppLayout
      title="About Us | HarmonyHub"
      description="Learn about HarmonyHub's mission to make music accessible to everyone through our interactive virtual instruments."
    >
      {/* Hero section with parallax effect */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
        <div
          className="absolute inset-0 -z-10 opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <motion.div
          className="container mx-auto px-4 py-20 md:py-32 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Making Music Accessible to Everyone
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            HarmonyHub is dedicated to breaking down barriers in music education and creation
            through innovative, interactive digital instruments.
          </p>

          <motion.div
            className="mt-10 flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/explore"><Button size="lg" className="rounded-full">
              Explore Instruments
            </Button></Link>
            <Button size="lg" variant="outline" onClick={scrollToSection} className="rounded-full">
              Watch Our Story
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Tab navigation */}
      <div className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-none py-4 gap-8 justify-center">
            <button id="OutStory"
              className={`whitespace-nowrap font-medium pb-2 px-1 border-b-2 transition-colors ${activeTab === "story" ? 'border-primary text-primary' : 'border-transparent hover:border-gray-300'}`}
              onClick={() => setActiveTab("story")}
            >
              Our Story
            </button>
            <button
              className={`whitespace-nowrap font-medium pb-2 px-1 border-b-2 transition-colors ${activeTab === "mission" ? 'border-primary text-primary' : 'border-transparent hover:border-gray-300'}`}
              onClick={() => setActiveTab("mission")}
            >
              Mission & Values
            </button>
            <button
              className={`whitespace-nowrap font-medium pb-2 px-1 border-b-2 transition-colors ${activeTab === "team" ? 'border-primary text-primary' : 'border-transparent hover:border-gray-300'}`}
              onClick={() => setActiveTab("team")}
            >
              Our Team
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Our Story section */}
        {activeTab === "story" && (
          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="mb-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/2 space-y-4">
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <div className="prose prose-lg dark:prose-invert">
                  <p>
                    HarmonyHub began as a passion project by a small team of musicians and developers who shared
                    a common belief: <span className="font-semibold text-primary">everyone should have the opportunity to experience the joy of making music</span>,
                    regardless of economic barriers or physical limitations.
                  </p>
                  <p>
                    Traditional instruments can be expensive, difficult to learn, and inaccessible to many.
                    We set out to change that by creating high-quality virtual instruments that capture the
                    essence and authenticity of their physical counterparts, while being instantly accessible
                    to anyone with an internet connection.
                  </p>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="relative rounded-lg overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=2070"
                    alt="Musicians collaborating"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <p className="text-lg font-semibold">Founded in 2022</p>
                      <p>From a single piano to 18+ virtual instruments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 space-y-6">
              <h3 className="text-2xl font-semibold">Our Journey</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { year: "2022", title: "The Beginning", description: "Started with a virtual piano prototype" },
                  { year: "2023", title: "Growth", description: "Expanded to 10 instruments and launched our first mobile app" },
                  { year: "2024", title: "Innovation", description: "Introduced collaborative jam sessions and AI-assisted learning" },
                  { year: "2025", title: "Global Impact", description: "Reaching musicians in over 150 countries" }
                ].map((milestone, index) => (
                  <motion.div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xl font-bold text-primary mb-2">{milestone.year}</div>
                    <h4 className="text-lg font-medium mb-2">{milestone.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mission & Values */}
        {activeTab === "mission" && (
          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-primary">Our Mission & Values</h2>

              <div className="prose dark:prose-invert max-w-none mb-6">
                <p>
                  At HarmonyHub, we believe that music is a universal language that should be accessible to everyone. Our mission is to break down barriers to musical expression and education through technology.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg shadow-sm border border-purple-100 dark:border-purple-900/30"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="font-bold text-xl mb-2">Accessibility</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    We're committed to making music education and creation accessible to people of all abilities, backgrounds, and resources.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900/30"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="font-bold text-xl mb-2">Innovation</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    We continuously push the boundaries of what's possible in digital music creation, leveraging cutting-edge web technologies.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900/30"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="font-bold text-xl mb-2">Community</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    We foster a supportive environment where musicians of all skill levels can connect, collaborate, and inspire each other.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-lg shadow-sm border border-pink-100 dark:border-pink-900/30"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(236, 72, 153, 0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="font-bold text-xl mb-2">Education</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    We believe in lifelong musical learning and provide free resources for beginners and advanced musicians alike.
                  </p>
                </motion.div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <blockquote className="italic border-l-4 border-primary pl-4">
                  "We envision a world where anyone with internet access can learn, create, and share music, regardless of their economic circumstances or geographical location."
                  <footer className="text-right mt-2 font-medium">— The HarmonyHub Team</footer>
                </blockquote>
              </div>
            </motion.div>

            <div className="bg-gradient-to-r from-primary/20 to-gray-300/20 rounded-2xl p-8 mt-12 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/3 flex justify-center">
                  <motion.div
                    initial={{ rotate: -5 }}
                    animate={{ rotate: 5 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <Music size={120} className="text-primary" />
                  </motion.div>
                </div>

                <div className="w-full md:w-2/3">
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-lg mb-6">
                    We envision a world where everyone can experience the joy of making music, where
                    virtual instruments aren't merely simulations but powerful tools for creative expression
                    and musical education.
                  </p>
                  {/* <div className="flex flex-wrap gap-4">
                    <Button>Join Our Journey</Button>
                    <Button variant="outline">Learn More</Button>
                  </div> */}
                </div>
              </div>
            </div>

            <motion.div
              className="text-center mt-16 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-8 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4">Start Your Musical Journey Today</h2>
              <p className="text-lg max-w-2xl mx-auto mb-6">
                Whether you're a beginner looking to learn your first instrument or an experienced musician wanting to collaborate with others, HarmonyHub has something for you.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/explore">
                  <Button size="lg">
                    Explore Instruments
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button variant="outline" size="lg">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </motion.div>

          </motion.div>


        )}

        {/* Team section */}
        {activeTab === "team" && (
          <motion.div
            className="max-w-5xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our diverse team of musicians, developers, and designers are passionate about
                making music more accessible to everyone.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
              variants={staggerContainer}
            >
              {[
                { name: "Kamlesh Gupta", title: "Founder & CEO", image: "https://i.pravatar.cc/300?img=1" },
                { name: "Sam Chen", title: "Lead Developer", image: "https://i.pravatar.cc/300?img=2" },
                { name: "Preeti Gupta", title: "Marketing Lead", image: "https://i.pravatar.cc/300?img=2" },
                { name: "Jamie Wong", title: "Community Lead", image: "https://i.pravatar.cc/300?img=8" }
              ].map((member, index) => (
                <motion.div
                  key={index}
                  className="text-center group"
                  variants={fadeIn}
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 relative overflow-hidden rounded-full bg-gray-200">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-2">
                        <button className="p-2 bg-white/90 rounded-full">
                          <Users size={16} />
                        </button>
                        <button className="p-2 bg-white/90 rounded-full">
                          <Mail size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-lg">{member.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{member.title}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/5 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-6">
              <Sparkles size={40} className="text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Musical Journey</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Become part of our growing community of music enthusiasts and help us make music
              more accessible to people around the world.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/auth/register"> <Button size="lg" className="rounded-full">Create Account</Button> </Link>
              <Link to="/explore"><Button size="lg" variant="outline" className="rounded-full">Explore Instruments</Button></Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4 mx-auto px-4 py-16">

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-t-4 border-primary hover:shadow-lg transition-shadow">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Contact Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 dark:text-gray-300">
                <a href="mailto:onlinevertualinstrument@gmail.com" className="hover:text-primary transition-colors">
                  onlinevertualinstrument@gmail.com
                </a>
              </p>
              <p className="text-xs text-gray-500 mt-2">We typically respond within 24 hours</p>
              <Button variant="outline" className="w-full mt-6"><a href="mailto:onlinevertualinstrument@gmail.com" className="hover:text-primary transition-colors">Contact US</a></Button>

            </CardContent>
          </Card>
        </motion.div>


        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-t-4 border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gray-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-500/20 rounded-full">
                  <LucideMessageCircleQuestion className="h-5 w-5 text-gray-500" />
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
        </motion.div>

      </div>

    </AppLayout>
  );
};

export default About;