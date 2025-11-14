export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </div>
  );
}
