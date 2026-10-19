import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 font-sans select-none">
      <h1 className="text-6xl font-black text-[#1ed760] mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-[#b3b3b3] text-sm mb-6 text-center max-w-sm">
        We couldn&apos;t find the page or track you were looking for.
      </p>
      <Link
        href="/"
        className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition active:scale-95 shadow-lg"
      >
        Go to Home
      </Link>
    </div>
  );
}
