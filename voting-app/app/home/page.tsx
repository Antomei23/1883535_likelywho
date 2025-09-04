// frontend/app/home/page.tsx
import Link from "next/link";

type Group = { id: string; name: string };

const MOCK_GROUPS: Group[] = [
  { id: "1", name: "Group 1" },
  { id: "2", name: "Group 2" },
];

export const metadata = {
  title: "LikelyWho • Home",
};

export default function HomePage() {
  return (
    <main className="lxw-container">
      {/* Top bar */}
      <header className="lxw-topbar">
        <div className="lxw-logo">+</div>
        <Link href="/profile" className="lxw-profile" aria-label="Profile" />
      </header>

      {/* Title */}
      <h1 className="lxw-title">My groups</h1>

      {/* Groups list */}
      <section className="lxw-groups">
        {MOCK_GROUPS.map((g) => (
          <Link key={g.id} href={`/gruppo/${g.id}`} className="lxw-btn lxw-btn-group">
            {g.name}
          </Link>
        ))}
      </section>

      {/* Actions */}
      <section className="lxw-actions">
        <Link href="/crea-gruppo" className="lxw-btn lxw-btn-primary">
          <span className="lxw-plus">+</span> Create new group
        </Link>

        <Link href="/unisciti-gruppo" className="lxw-btn lxw-btn-secondary">
          Join a group
        </Link>
      </section>
    </main>
  );
}
