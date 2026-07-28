import { Link, useLocation } from "wouter";
import { Activity, BarChart2, MessageSquare, History, Settings } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/quotes", icon: Activity, label: "Quotes" },
    { href: "/", icon: BarChart2, label: "Chart" },
    { href: "/ai", icon: MessageSquare, label: "AI" },
    { href: "/history", icon: History, label: "History" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-secondary/80 backdrop-blur-md border-t border-border z-50 flex items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
