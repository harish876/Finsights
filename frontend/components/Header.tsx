import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const navItems = [
  { name: "Solutions", href: "#" },
  { name: "Platform", href: "#" },
  { name: "Why Finsights", href: "#" },
  { name: "About us", href: "#" },
];

export function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="font-bold text-2xl text-casca-600">
              Finsights
            </Link>
          </div>
          <nav className="hidden md:flex space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-medium text-gray-500 hover:text-gray-900 flex items-center"
              >
                {item.name}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <Button className="ml-8 bg-casca-500 hover:bg-casca-600 text-white">
              Request a demo
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
