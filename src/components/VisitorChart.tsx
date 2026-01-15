import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Loader2 } from "lucide-react";

interface VisitorData {
  timestamp: number;
  count: number;
}

export function VisitorChart() {
  const [data, setData] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchVisitorData();
    const interval = setInterval(fetchVisitorData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [days]);

  const fetchVisitorData = async () => {
    try {
      const res = await fetch(`/api/stats/visitors?days=${days}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch visitor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    if (days <= 7) {
      return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    } else if (days <= 30) {
      return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.timestamp);
      const dateStr = date.toLocaleDateString('id-ID', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs text-gray-400 mb-1">{dateStr}</p>
          <p className="text-sm font-semibold text-purple-400">
            {data.count} visitor{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalVisitors = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-6 bg-white/[0.02] border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Visitor Activity</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setDays(7)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              days === 7
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              days === 30
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setDays(90)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              days === 90
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            90D
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-white">{totalVisitors}</p>
        <p className="text-sm text-gray-400">Total visitors in last {days} days</p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ fill: '#a855f7', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}