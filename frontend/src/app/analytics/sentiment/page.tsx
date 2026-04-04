'use client';

import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  MessageSquare, Brain, TrendingUp, AlertCircle, 
  Smile, Frown, Minus, User, Calendar
} from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SentimentAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/analytics/sentiment');
      setData(res.data || []);
    } catch (err) {
      console.error('Failed to fetch sentiment data', err);
    } finally {
      setLoading(false);
    }
  };

  const sentimentStats = {
    POSITIVE: data.filter(d => d.sentiment === 'POSITIVE').length,
    NEGATIVE: data.filter(d => d.sentiment === 'NEGATIVE').length,
    NEUTRAL: data.filter(d => d.sentiment === 'NEUTRAL').length,
  };

  const chartData = [
    { name: 'Positive', count: sentimentStats.POSITIVE, color: '#22c55e' },
    { name: 'Neutral', count: sentimentStats.NEUTRAL, color: '#94a3b8' },
    { name: 'Negative', count: sentimentStats.NEGATIVE, color: '#ef4444' },
  ];

  return (
    <div className="p-8 space-y-8 bg-zinc-950 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AI Sentiment Wallboard
          </h1>
          <p className="text-zinc-400 mt-2">Real-time emotional intelligence from your communication channels.</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-zinc-800 hover:bg-zinc-900">
          Refresh Analytics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Total Analyzed</CardTitle>
            <Brain className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-zinc-500">Transcribed calls & chats</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Positive Sentiment</CardTitle>
            <Smile className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {data.length ? Math.round((sentimentStats.POSITIVE / data.length) * 100) : 0}%
            </div>
            <p className="text-xs text-zinc-500">Of total interactions</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Alerts Triggered</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {data.filter(d => d.sentiment === 'NEGATIVE').length}
            </div>
            <p className="text-xs text-zinc-500">High-priority follow-ups</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-910 border-zinc-800 bg-opacity-50">
          <CardHeader>
            <CardTitle className="text-zinc-200">Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-200">Real-time Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {data.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className={`p-2 rounded-full ${
                  item.sentiment === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                  item.sentiment === 'NEGATIVE' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-500/10 text-zinc-500'
                }`}>
                  {item.sentiment === 'POSITIVE' ? <Smile size={18} /> : 
                   item.sentiment === 'NEGATIVE' ? <Frown size={18} /> : <Minus size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold truncate capitalize">
                      {item.call?.lead?.name || 'Unknown Contact'} 
                    </p>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 italic">
                    "{item.summary || item.text.substring(0, 100)}..."
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-200 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          Recent Transcript Deep Dive
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.slice(0, 6).map((item, idx) => (
            <Card key={idx} className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-all">
              <div className={`h-1 w-full ${
                item.sentiment === 'POSITIVE' ? 'bg-emerald-500' :
                item.sentiment === 'NEGATIVE' ? 'bg-red-500' : 'bg-zinc-500'
              }`} />
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold flex items-center gap-2">
                      <User size={14} className="text-zinc-500" />
                      {item.call?.lead?.name || 'Contact'}
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={`
                    ${item.sentiment === 'POSITIVE' ? 'border-emerald-500 text-emerald-500' :
                      item.sentiment === 'NEGATIVE' ? 'border-red-500 text-red-500' : 'border-zinc-500 text-zinc-500'}
                  `}>
                    {item.sentiment}
                  </Badge>
                </div>
                
                <div className="p-3 bg-zinc-950 rounded border border-zinc-800 text-xs text-zinc-300 line-clamp-4 min-h-[5rem]">
                  {item.summary || item.text}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(item.keywordsFound || []).map((kw: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
