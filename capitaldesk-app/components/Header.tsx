import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#29298e] to-[#1f1f6e] shadow-lg shadow-[#29298e]/20 transition-transform group-hover:scale-105">
            <span className="text-xl font-bold text-white">₹</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            CapitalDesk
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-300 transition-colors hover:text-white border-b-2 border-transparent hover:border-[#29298e] pb-1"
          >
            Portfolio
          </Link>
          <Link
            href="/browse"
            className="text-sm font-semibold text-slate-300 transition-colors hover:text-white border-b-2 border-transparent hover:border-[#29298e] pb-1"
          >
            Browse Stocks
          </Link>
          <Link
            href="/sectors"
            className="text-sm font-semibold text-slate-300 transition-colors hover:text-white border-b-2 border-transparent hover:border-[#29298e] pb-1"
          >
            Sectors
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold text-slate-300 transition-colors hover:text-white border-b-2 border-transparent hover:border-[#29298e] pb-1"
          >
            About
          </Link>
          <Link
            href="/browse"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#29298e] to-[#3d3daa] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#29298e]/25 transition-all hover:shadow-xl hover:shadow-[#29298e]/30 hover:scale-105"
          >
            <span className="text-lg">+</span>
            <span>Add Stock</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
