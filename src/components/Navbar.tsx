import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Terminal, X, Home, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/client/hooks/usePlugin";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface NavbarProps {
  onCategorySelect?: (category: string | null) => void;
  selectedCategory?: string | null;
}

export function Navbar({ onCategorySelect, selectedCategory }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { categories } = useCategories();

  const handleCategoryClick = (category: string) => {
    onCategorySelect?.(category);
    setIsOpen(false);
  };

  return (
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            DitzzyAPI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link to="/docs" className="text-purple-400 font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Documentation
            </Link>
          </div>

          {/* Hamburger Menu - Categories */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background border-white/10">
              <SheetHeader>
                <SheetTitle className="text-white">Categories</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-2">
                {/* All Endpoints */}
                <button
                  onClick={() => handleCategoryClick("")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition ${
                    !selectedCategory
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <span className="font-medium">All Endpoints</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Categories */}
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition ${
                      selectedCategory === cat.name
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="capitalize">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/10 px-2 py-1 rounded">{cat.count}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Mobile Navigation Links */}
              <div className="md:hidden mt-8 space-y-2 pt-6 border-t border-white/10">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link
                  to="/docs"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-purple-400 hover:bg-white/10 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  Documentation
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}