import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { PluginCard } from "@/components/PluginCard";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { VisitorChart } from "@/components/VisitorChart";
import { usePlugins, useStats } from "@/client/hooks/usePlugin";
import { Activity, CheckCircle2, XCircle, TrendingUp, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Docs() {
  const { plugins, loading: pluginsLoading } = usePlugins();
  const { stats, loading: statsLoading } = useStats();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    plugins.forEach(plugin => {
      plugin.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [plugins]);

  const filteredPlugins = useMemo(() => {
    let filtered = plugins;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category.includes(selectedCategory));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.endpoint.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((p) => 
        selectedTags.every(tag => p.tags?.includes(tag))
      );
    }

    return filtered;
  }, [plugins, selectedCategory, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30">
      {/* Navbar with Categories in Hamburger Menu */}
      <Navbar onCategorySelect={setSelectedCategory} selectedCategory={selectedCategory} />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Statistics Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">API Statistics</h2>
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatsCard
                    title="Total Requests"
                    value={stats.totalRequests.toLocaleString()}
                    icon={Activity}
                    color="purple"
                  />
                  <StatsCard
                    title="Successful"
                    value={stats.totalSuccess.toLocaleString()}
                    icon={CheckCircle2}
                    color="green"
                  />
                  <StatsCard
                    title="Failed"
                    value={stats.totalFailed.toLocaleString()}
                    icon={XCircle}
                    color="red"
                  />
                  <StatsCard
                    title="Success Rate"
                    value={`${stats.successRate}%`}
                    icon={TrendingUp}
                    color="blue"
                  />
                </div>
                
                {/* Visitor Chart */}
                <VisitorChart />
              </>
            ) : (
              <div className="text-sm text-gray-500">Failed to load statistics</div>
            )}
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search endpoints, descriptions, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 h-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-400">Filter by Tags</h3>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      Clear tags
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`cursor-pointer transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-purple-500/30 text-purple-300 border-purple-500 hover:bg-purple-500/40"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                      } border`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters Summary */}
            {(selectedCategory || searchQuery || selectedTags.length > 0) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-400">Active filters:</span>
                {selectedCategory && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                    Category: {selectedCategory}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {selectedTags.map(tag => (
                  <Badge key={tag} className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                    Tag: {tag}
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white capitalize">
              {selectedCategory ? `${selectedCategory} Endpoints` : "All Endpoints"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Showing {filteredPlugins.length} of {plugins.length} endpoint{filteredPlugins.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Plugins List */}
          <div className="space-y-6">
            {pluginsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            ) : filteredPlugins.length > 0 ? (
              filteredPlugins.map((plugin) => (
                <PluginCard key={plugin.endpoint} plugin={plugin} />
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-400 text-lg mb-2">No endpoints found</div>
                <div className="text-gray-600 text-sm mb-4">
                  {searchQuery || selectedTags.length > 0
                    ? "Try adjusting your search or filters"
                    : selectedCategory
                    ? "No plugins available in this category"
                    : "No plugins available"}
                </div>
                {(searchQuery || selectedTags.length > 0 || selectedCategory) && (
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    className="border-white/10 text-purple-400 hover:bg-purple-500/10"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}