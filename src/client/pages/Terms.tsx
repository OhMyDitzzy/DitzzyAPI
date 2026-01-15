import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
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
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white">
                Terms of Service
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
              {/* Agreement to Terms */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">1.</span> Agreement to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By accessing or using DitzzyAPI ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
                </p>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-white mb-2"><strong>Service Provider:</strong></p>
                  <p className="text-sm text-muted-foreground">DitzzyAPI | Aditya Putra Priana</p>
                  <p className="text-sm text-muted-foreground">Email: ditzdevs@gmail.com</p>
                  <p className="text-sm text-muted-foreground">Jurisdiction: Indonesia</p>
                </div>
              </div>

              {/* Description of Service */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">2.</span> Description of Service
                </h2>
                <p className="text-muted-foreground mb-4">
                  DitzzyAPI is a free, open API service providing various endpoints including:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li><strong className="text-white">Downloader Services:</strong> TikTok and other social media content</li>
                  <li><strong className="text-white">AI Tools:</strong> Various AI-powered utilities</li>
                  <li><strong className="text-white">General Tools:</strong> Miscellaneous utility endpoints</li>
                  <li><strong className="text-white">Other Services:</strong> As documented in our API documentation</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  The Service is provided "as-is" without authentication or registration requirements.
                </p>
              </div>

              {/* Acceptable Use Policy */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">3.</span> Acceptable Use Policy
                </h2>
                
                <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Permitted Use</h3>
                <p className="text-muted-foreground mb-3">You may use the Service for:</p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc mb-6">
                  <li>Personal, educational, or commercial projects</li>
                  <li>Integration into your applications or websites</li>
                  <li>Testing and development purposes</li>
                  <li>Any lawful purpose compliant with applicable laws</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Prohibited Use</h3>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                  <p className="text-white font-semibold mb-2">⚠️ You may NOT use the Service to:</p>
                  <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                    <li>Violate any laws or regulations</li>
                    <li>Download copyrighted content without authorization</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Distribute malware or harmful code</li>
                    <li>Conduct illegal activities or fraud</li>
                    <li>Harass, abuse, or harm others</li>
                    <li>Bypass rate limiting measures</li>
                    <li>Access content involving minors inappropriately</li>
                    <li>Resell or redistribute the API as a competing service</li>
                  </ul>
                </div>
              </div>

              {/* Rate Limiting */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">4.</span> Rate Limiting and Usage Restrictions
                </h2>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li>The Service is limited to <strong className="text-white">25 requests per user</strong> (based on IP address)</li>
                  <li>Rate limits ensure fair usage for all users</li>
                  <li>Excessive use may result in temporary or permanent blocking</li>
                  <li>We reserve the right to modify rate limits at any time</li>
                </ul>
              </div>

              {/* Disclaimers */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">7.</span> Disclaimers and Limitations
                </h2>
                
                <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 Service Availability</h3>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc mb-6">
                  <li>The Service is provided "AS IS" and "AS AVAILABLE"</li>
                  <li>We do not guarantee uninterrupted or error-free service</li>
                  <li>We may modify, suspend, or discontinue the Service at any time</li>
                  <li>No uptime guarantees or SLAs are provided</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 No Warranties</h3>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-white font-semibold mb-2">WE MAKE NO WARRANTIES, INCLUDING:</p>
                  <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                    <li>Warranties of merchantability or fitness for a particular purpose</li>
                    <li>That the Service will meet your requirements</li>
                    <li>That results obtained will be accurate or reliable</li>
                    <li>That errors or bugs will be corrected</li>
                  </ul>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">8.</span> Limitation of Liability
                </h2>
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="text-white font-semibold mb-3">TO THE MAXIMUM EXTENT PERMITTED BY INDONESIAN LAW:</p>
                  <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                    <li>We are not liable for any direct, indirect, or consequential damages</li>
                    <li>We are not liable for loss of data, profits, or business opportunities</li>
                    <li>We are not liable for third-party claims arising from your use</li>
                    <li>Our total liability shall not exceed IDR 0 as this is a free service</li>
                  </ul>
                </div>
              </div>

              {/* Governing Law */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-primary">14.</span> Governing Law
                </h2>
                <p className="text-muted-foreground">
                  These Terms are governed by the laws of Indonesia. Any disputes shall be resolved in Indonesian courts with jurisdiction in the service provider's location.
                </p>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Contact Information</h2>
                    <p className="text-muted-foreground mb-3">
                      For questions, concerns, or reports of Terms violations:
                    </p>
                    <p className="text-sm text-white"><strong>Email:</strong> ditzdevs@gmail.com</p>
                    <p className="text-sm text-muted-foreground"><strong>Service Name:</strong> DitzzyAPI</p>
                    <p className="text-sm text-muted-foreground"><strong>Owner:</strong> Aditya Putra Priana</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                <h3 className="text-xl font-bold text-white mb-3">Acknowledgment</h3>
                <p className="text-muted-foreground mb-3">
                  By using DitzzyAPI, you acknowledge that:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li>You have read and understood these Terms</li>
                  <li>You agree to be bound by these Terms</li>
                  <li>You are legally able to enter into this agreement</li>
                  <li>You will use the Service responsibly and lawfully</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground text-center pt-8">
                <strong>Last Updated:</strong> January 15, 2026 | <strong>Version:</strong> 1.0
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}