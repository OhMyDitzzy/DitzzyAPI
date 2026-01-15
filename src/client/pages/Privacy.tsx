import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30">
      <main className="flex-grow pt-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-8 hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white">
                Privacy Policy
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground mb-4"
            >
              <strong>Effective Date:</strong> January 15, 2026<br />
              <strong>Last Updated:</strong> January 15, 2026
            </motion.p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Introduction */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">1.</span> Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Welcome to DitzzyAPI ("we," "our," or "us"). This Privacy Policy explains how we collect, use, and protect information when you use our API services.
                </p>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-white mb-2"><strong>Service Provider:</strong></p>
                  <p className="text-sm text-muted-foreground">DitzzyAPI | Aditya Putra Priana</p>
                  <p className="text-sm text-muted-foreground">Email: ditzdevs@gmail.com</p>
                  <p className="text-sm text-muted-foreground">Jurisdiction: Indonesia</p>
                </div>
              </div>

              {/* Information We Collect */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">2.</span> Information We Collect
                </h2>
                
                <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Automatically Collected Information</h3>
                <p className="text-muted-foreground mb-4">When you use our API services, we automatically collect:</p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li><strong className="text-white">IP Address:</strong> Collected for rate limiting purposes and security monitoring</li>
                  <li><strong className="text-white">API Request Logs:</strong> Including endpoint accessed, timestamp, and response status codes</li>
                  <li><strong className="text-white">Usage Statistics:</strong> Aggregated data about API endpoint usage and request patterns</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Information We DO NOT Collect</h3>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li>Personal identification information (name, email, phone number)</li>
                  <li>User registration or account information</li>
                  <li>API keys or authentication tokens</li>
                  <li>Payment information</li>
                  <li>Cookies or tracking technologies for marketing</li>
                  <li>Content of URLs you submit to our services</li>
                </ul>
              </div>

              {/* How We Use Your Information */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">3.</span> How We Use Your Information
                </h2>
                <p className="text-muted-foreground mb-4">We use the collected information solely for:</p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li><strong className="text-white">Rate Limiting:</strong> IP addresses enforce our 25 requests per user limit</li>
                  <li><strong className="text-white">Service Improvement:</strong> Analyzing usage patterns to improve performance</li>
                  <li><strong className="text-white">Security:</strong> Detecting and preventing abuse or malicious activities</li>
                  <li><strong className="text-white">Statistics:</strong> Generating anonymous, aggregated statistics</li>
                </ul>
              </div>

              {/* Data Retention */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">4.</span> Data Retention
                </h2>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li><strong className="text-white">IP Addresses:</strong> Retained temporarily for rate limiting (cleared periodically)</li>
                  <li><strong className="text-white">Request Logs:</strong> Stored for operational purposes and deleted regularly</li>
                  <li><strong className="text-white">Aggregated Statistics:</strong> Retained indefinitely in anonymized form</li>
                </ul>
              </div>

              {/* Data Sharing */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">5.</span> Data Sharing and Disclosure
                </h2>
                <p className="text-muted-foreground mb-4">
                  We do NOT sell, trade, or rent your information to third parties. We may disclose information only when:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li>Required by Indonesian law or legal process</li>
                  <li>Necessary to protect our rights, property, or safety</li>
                  <li>To prevent fraud or abuse of our services</li>
                </ul>
              </div>

              {/* Third-Party Services */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">6.</span> Third-Party Services
                </h2>
                <p className="text-muted-foreground mb-4">
                  Our API may retrieve content from third-party services (e.g., TikTok). When you use our downloader services:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li>You are subject to the terms and privacy policies of those platforms</li>
                  <li>We do not control third-party privacy practices</li>
                  <li>Content is fetched in real-time and not stored on our servers</li>
                </ul>
              </div>

              {/* Your Rights */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">9.</span> Your Rights
                </h2>
                <p className="text-muted-foreground mb-4">
                  Under applicable Indonesian data protection laws, you have the right to:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li>Request information about data we hold about you</li>
                  <li>Request deletion of your data (IP address from rate limit records)</li>
                  <li>Object to processing of your data</li>
                  <li>Contact us with privacy concerns</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, email us at <a href="mailto:ditzdevs@gmail.com" className="text-primary hover:underline">ditzdevs@gmail.com</a>.
                </p>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Contact Us</h2>
                    <p className="text-muted-foreground mb-3">
                      For privacy-related questions or concerns:
                    </p>
                    <p className="text-sm text-white"><strong>Email:</strong> ditzdevs@gmail.com</p>
                    <p className="text-sm text-muted-foreground"><strong>Service Name:</strong> DitzzyAPI</p>
                    <p className="text-sm text-muted-foreground"><strong>Owner:</strong> Aditya Putra Priana</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center pt-8">
                By using DitzzyAPI, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}