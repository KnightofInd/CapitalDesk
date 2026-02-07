export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-700 bg-slate-900 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
          <p className="font-medium">© 2026 CapitalDesk. Data for informational purposes only.</p>
          <p className="text-xs font-medium">
            Market data delayed by 15 seconds. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
