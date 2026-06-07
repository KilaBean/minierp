export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div><div className="h-6 w-32 bg-muted rounded mb-1" /><div className="h-3 w-48 bg-muted/60 rounded" /></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({length:4}).map((_,i)=>(
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between mb-4"><div className="h-3 w-20 bg-muted rounded"/><div className="w-9 h-9 bg-muted rounded-xl"/></div>
            <div className="h-7 w-28 bg-muted rounded mb-2"/><div className="h-3 w-36 bg-muted rounded"/>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {Array.from({length:2}).map((_,i)=>(
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className="h-4 w-20 bg-muted rounded mb-1"/><div className="h-3 w-24 bg-muted rounded mb-6"/>
            <div className="h-[220px] bg-muted/50 rounded-xl"/>
          </div>
        ))}
      </div>
    </div>
  );
}
