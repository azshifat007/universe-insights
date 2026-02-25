import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const LOGO_DEV_TOKEN = "pk_er9_2UKzSjCIV0vDETiJUA";

interface UniversityLogoProps {
  domain?: string;
  name: string;
  className?: string;
}

function getMonogram(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 2 || w === w.toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const UniversityLogo = ({ domain, name, className }: UniversityLogoProps) => {
  const logoUrl = domain
    ? `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=64`
    : undefined;

  return (
    <Avatar className={cn("h-8 w-8 shrink-0", className)}>
      {logoUrl && <AvatarImage src={logoUrl} alt={`${name} logo`} />}
      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
        {getMonogram(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UniversityLogo;
