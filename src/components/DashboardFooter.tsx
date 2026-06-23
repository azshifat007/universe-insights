import { Link } from "react-router-dom";

const DashboardFooter = () => (
  <footer className="border-t border-border bg-muted/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-muted-foreground leading-relaxed">
      <p className="font-medium">
        Thesis Project by{" "}
        <span className="text-foreground">Md. Azizul Hakim</span>,{" "}
        <span className="text-foreground">Md. Ibrahim Hossain Sumon</span>.
      </p>
      <p className="mt-1">
        Supervised by{" "}
        <span className="text-foreground">Md. Parvez Hossain</span> &{" "}
        <span className="text-foreground">Mr. Romzan Alom</span>.
      </p>
      <p className="mt-3 text-muted-foreground/60">
        © 2026 Universe Analytics. All rights reserved.
        <Link to="/login" className="ml-2 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">
          ·
        </Link>
      </p>
    </div>
  </footer>
);

export default DashboardFooter;
