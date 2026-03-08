import { Link, useLocation } from "react-router-dom";
import { BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Rankings", path: "/rankings" },
  { label: "Find My Match", path: "/find-my-match" },
  { label: "Methodology", path: "/methodology" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();

  const navItems = [
    ...NAV_ITEMS,
    ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground border-b border-primary-foreground/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <BarChart3 className="h-6 w-6 text-secondary" />
          <span className="font-display text-lg font-bold tracking-tight">Universe Analytics</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === item.path
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-primary-foreground/10 bg-primary px-4 pb-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname === item.path
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "text-primary-foreground/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
