import { Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Ditzzy<span className="text-primary">API</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              The developer-first API platform. Secure, scalable, and effortless integration for modern applications.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/docs" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="https://whatsapp.com/channel/0029Vb7AafUL7UVRIpg1Fy24" className="hover:text-primary transition-colors">WhatsApp Channel</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DitzzyAPI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
