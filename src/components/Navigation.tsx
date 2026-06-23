export default function Navigation() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex gap-8">
        <a href="/" className="font-medium hover:text-amber-700">
          Home
        </a>

        <a href="/reviews" className="font-medium hover:text-amber-700">
          Reviews
        </a>

        <a href="/producers" className="font-medium hover:text-amber-700">
          Producers
        </a>

        <a href="/pickers" className="font-medium hover:text-amber-700">
          Pickers
        </a>

        <a href="/login" className="font-medium hover:text-amber-700">
          Login
        </a>
      </div>
    </nav>
  );
}