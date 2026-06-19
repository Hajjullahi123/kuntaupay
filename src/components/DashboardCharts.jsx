import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export const CollectionTrendChart = ({ data }) => (
  <div className="h-80 w-full bg-white sophisticated-shadow border-slate-200 p-6 rounded-[32px]">
    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
      Monthly Collection Trend
    </h3>
    <ResponsiveContainer width="100%" height="90%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} tickFormatter={(v) => `₦${v/1000}k`} />
        <Tooltip 
          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)'}}
          formatter={(v) => [`₦${v.toLocaleString()}`, 'Amount']}
        />
        <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const ClassPerformanceChart = ({ data }) => (
  <div className="h-80 w-full bg-white sophisticated-shadow border-slate-200 p-6 rounded-[32px]">
    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      Revenue Breakdown by Class
    </h3>
    <ResponsiveContainer width="100%" height="90%">
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
        <Tooltip 
          cursor={{fill: '#f8fafc'}}
          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)'}}
        />
        <Bar dataKey="paid" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="debt" fill="#ef4444" stackId="a" radius={[0, 10, 10, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const ScholarshipPieChart = ({ data }) => (
  <div className="h-80 w-full bg-white sophisticated-shadow border-slate-200 p-6 rounded-[32px]">
    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
      Scholarship Distribution
    </h3>
    <ResponsiveContainer width="100%" height="90%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={8}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)'}}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  </div>
);
