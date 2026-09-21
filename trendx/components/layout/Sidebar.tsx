import { Film, Gamepad2, Home, Newspaper, Sparkles, Trophy } from "lucide-react";

const menu = [
  { name: "Home", icon: Home },
  { name: "Movies", icon: Film },
  { name: "Tech", icon: Sparkles },
  { name: "Gaming", icon: Gamepad2 },
  { name: "News", icon: Newspaper },
  { name: "Sports", icon: Trophy },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 border-r border-cyan-400/10 bg-black/60 p-4">
      <div className="mb-8 text-xl font-black">
        T<span className="text-cyan-400">X</span>
      </div>

      <nav className="space-y-4">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/10 text-cyan-200 hover:bg-cyan-400/10"
            >
              <Icon size={20} />
            </div>
          );
        })}
      </nav>
    </aside>
  );
}