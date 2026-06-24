export default function Navigation() {
  return (
    <nav className="border-b border-stone-300 bg-white">
      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-4 text-lg">
        <a href="/" className="hover:underline">
          Reviews
        </a>

        <a href="/producers" className="hover:underline">
          Producers
        </a>

        <a href="/pickers" className="hover:underline">
          Pickers
        </a>

        <a href="/about" className="hover:underline">
          About
        </a>

        <a href="/login" className="hover:underline">
          Login
        </a>
      </div>
    </nav>
  );
}