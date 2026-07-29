import Link from "next/link";
import { signOut } from "@/app/login/actions";

export function NavBar({ active }: { active: "schedule" | "library" }) {
  const linkClass = (tab: "schedule" | "library") =>
    tab === active
      ? "text-sm font-medium text-neutral-900"
      : "text-sm font-medium text-neutral-400 hover:text-neutral-700";

  return (
    <div className="mb-8 flex items-center justify-between">
      <nav className="flex items-center gap-5">
        <Link href="/" className={linkClass("schedule")}>
          This Week
        </Link>
        <Link href="/library" className={linkClass("library")}>
          Recipes
        </Link>
      </nav>
      <form action={signOut}>
        <button className="text-sm text-neutral-500 hover:text-neutral-800">Sign out</button>
      </form>
    </div>
  );
}
