import { CodeSnippet } from "@/components/CodeSnippet";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DollarSign, Code2, Key, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getBaseUrl } from "@/lib/api-url";

export default function Home() {
  const exampleFetchCode = `// Completely easy to use API!
const res = await fetch("${getBaseUrl()}/api/data");
const json = await res.json();

console.log(json)
// Check out your console!
`;

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Do I need an API key to use DitzzyAPI?",
      answer: "No! DitzzyAPI is completely free and doesn't require any API key. Just start making requests right away."
    },
    {
      question: "Is there really no usage limit?",
      answer: "DitzzyAPI is free and unlimited for everyone. However, we implement rate limiting to ensure fair usage and keep our servers stable for all users."
    },
    {
      question: "What are the rate limits?",
      answer: "We apply reasonable rate limits per IP address to prevent abuse and maintain server stability. Normal usage patterns are well within these limits."
    },
    {
      question: "How do you keep the service free?",
      answer: "We're passionate about supporting the developer community. Rate limits help us manage costs while keeping the service free for everyone."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30">
      <main className="flex-grow pt-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full opacity-30 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <a href="https://github.com/OhMyDitzzy/Yuki">DitzzyAPI has an official bot script, Click here to check now!</a>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-7xl font-display font-bold tracking-tight text-white mb-6 max-w-4xl"
            >
              Build faster with the <br />
              <span className="text-gradient-primary">ultimate developer API</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
            >
              Free, unlimited, open-source API, and no API key required. Start building instantly with our 
              developer-friendly API.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link to="/docs">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-xl">
                  View Documentation
                </Button>
              </Link>
              <a href="https://github.com/OhMyDitzzy/DitzzyAPI" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-xl border-white/10 hover:bg-white/5">
                  View on GitHub
                </Button>
              </a>
            </motion.div>

            <div className="mt-20 w-full flex justify-center">
              <CodeSnippet
                filename="api_example.ts"
                language="typescript"
                code={exampleFetchCode}
                delay={0.5}
                showLineNumbers={true}
                copyable={true}
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "100%", label: "Free Forever" },
                { value: "No Keys", label: "Just Start Coding" },
                { value: "<100ms", label: "Avg Response" },
                { value: "24/7", label: "Always Online" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl font-bold text-gradient-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-black/20 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why choose DitzzyAPI?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No registration, no API keys, no hidden fees. Just pure simplicity.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Key, title: "No API Key Needed", desc: "Start using immediately. No sign-ups, no authentication hassles." },
                { icon: DollarSign, title: "Free Unlimited", desc: "Completely free with unlimited requests. No credit card required." },                
                { icon: Code2, title: "Developer Friendly", desc: "Simple endpoints, clear documentation, and 24/7 availability." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about DitzzyAPI
              </p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl bg-white/5 border border-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg font-semibold text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-primary transition-transform ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none blur-[120px] opacity-50" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of developers using DitzzyAPI. No registration needed, 
                just pick an endpoint and start coding!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/docs">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-xl">
                    Start Building Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}