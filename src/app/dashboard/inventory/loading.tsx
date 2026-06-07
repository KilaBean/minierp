export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div><div className="h-6 w-40 bg-muted rounded mb-1" /><div className="h-3 w-24 bg-muted/60 rounded" /></div>
        <div className="h-10 w-28 bg-muted rounded-xl" />
      </div>
      <div className="flex gap-3"><div className="h-10 flex-1 bg-muted rounded-xl" /><div className="h-10 w-36 bg-muted rounded-xl" /><div className="h-10 w-36 bg-muted rounded-xl" /></div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex gap-4">
          {Array.from({length:5}).map((_,i)=><div key={i} className="h-3 w-20 bg-muted rounded"/>)}
        </div>
        {Array.from({length:8}).map((_,i)=>(
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
            <div className="w-9 h-9 bg-muted rounded-xl flex-shrink-0" />
            <div className="flex-1"><div className="h-3.5 w-32 bg-muted rounded mb-1" /><div className="h-2.5 w-20 bg-muted/60 rounded" /></div>
            <div className="h-3.5 w-20 bg-muted rounded" />
            <div className="h-3.5 w-16 bg-muted rounded" />
            <div className="h-5 w-14 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
