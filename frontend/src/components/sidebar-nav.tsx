"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavLinkItem {
  href: string;
  label: string;
  badge?: string;
  icon: React.ReactNode;
}

export interface NavSectionItem {
  label: string;
  links: NavLinkItem[];
}

interface Props {
  sections: NavSectionItem[];
  userName: string;
  userRol: string;
  userInitials: string;
}

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
  BODEGUERO: "Bodeguero",
  CAJERO: "Cajero",
};

const ROL_COLOR: Record<string, string> = {
  ADMIN:     "bg-red-500/20 text-red-300 border-red-500/30",
  VENDEDOR:  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  BODEGUERO: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CAJERO:    "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

export function SidebarNav({ sections, userName, userRol, userInitials }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* User card */}
      <div className="mx-3 mb-3 p-3 rounded-2xl bg-white/5 border border-white/8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-crimson to-crimson/60 flex items-center justify-center shrink-0 shadow-lg">
          <span className="text-white font-bold text-sm">{userInitials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">{userName.split(" ")[0]}</p>
          <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full border mt-0.5 ${ROL_COLOR[userRol] ?? ROL_COLOR.VENDEDOR}`}>
            {ROL_LABEL[userRol] ?? userRol}
          </span>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-4 pb-3">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-150 group
                      ${active
                        ? "bg-white text-gray-900 shadow-md"
                        : "text-white/55 hover:text-white hover:bg-white/8"
                      }
                    `}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-crimson" />
                    )}

                    {/* Icon bubble */}
                    <span className={`
                      w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150
                      ${active
                        ? "bg-crimson text-white shadow-sm"
                        : "bg-white/8 text-white/40 group-hover:bg-white/15 group-hover:text-white/80"
                      }
                    `}>
                      {link.icon}
                    </span>

                    <span className="flex-1 truncate">{link.label}</span>

                    {link.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gold/25 text-gold shrink-0">
                        {link.badge}
                      </span>
                    )}

                    {active && (
                      <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}
