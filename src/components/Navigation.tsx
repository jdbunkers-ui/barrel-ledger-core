import Link from "next/link";
import { getCurrentMember } from "@/lib/admin";
 
export default async function Navigation() {
  const member = await getCurrentMember();
  const isLoggedIn = !!member;
 
  return (
    <nav className="border-b border-stone-300 bg-white">
      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-4 text-lg">
        <Link href="/" className="hover:underline">
          Reviews
        </Link>
 
        <Link href="/producers" className="hover:underline">
          Producers
        </Link>
 
        <Link href="/pickers" className="hover:underline">
          Pickers
        </Link>
 
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
 
            <Link href="/logout" className="hover:underline">
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link href="/about" className="hover:underline">
              About
            </Link>
 
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}