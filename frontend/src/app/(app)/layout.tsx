import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav, type NavSectionItem } from "@/components/sidebar-nav";

type Rol = "SUPERADMIN" | "ADMIN" | "VENDEDOR" | "BODEGUERO" | "CAJERO";

function decodeJwt(token: string): { nombre?: string; email?: string; rol?: string; sub?: number } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const ALL: Rol[]              = ["SUPERADMIN", "ADMIN", "VENDEDOR", "BODEGUERO", "CAJERO"];
const ADMIN_ONLY: Rol[]       = ["SUPERADMIN", "ADMIN"];
const SUPERADMIN_ONLY: Rol[]  = ["SUPERADMIN"];
const NO_CAJERO: Rol[]        = ["SUPERADMIN", "ADMIN", "VENDEDOR", "BODEGUERO"];
const NO_BODEGUERO: Rol[]     = ["SUPERADMIN", "ADMIN", "VENDEDOR", "CAJERO"];
const ADMIN_VENDEDOR: Rol[]   = ["SUPERADMIN", "ADMIN", "VENDEDOR"];

interface RawNavLink {
  href: string;
  label: string;
  badge?: string;
  roles: Rol[];
  icon: React.ReactNode;
}

interface RawNavSection {
  label: string;
  links: RawNavLink[];
}

const NAV_SECTIONS: RawNavSection[] = [
  {
    label: "Principal",
    links: [
      {
        href: "/dashboard", label: "Dashboard", roles: ALL,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      },
    ],
  },
  {
    label: "Inventario",
    links: [
      {
        href: "/conjuntos", label: "Conjuntos Folklóricos", roles: NO_CAJERO,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
      },
      {
        href: "/componentes", label: "Componentes", roles: NO_CAJERO,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
      },
      {
        href: "/instancias", label: "Inventario Físico", roles: NO_CAJERO,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
      },
      {
        href: "/sucursales/inventario", label: "Transferencias", roles: NO_CAJERO,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
      },
      {
        href: "/sucursales/gestion", label: "Sucursales", roles: SUPERADMIN_ONLY,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      },
    ],
  },
  {
    label: "Operaciones",
    links: [
      {
        href: "/eventos-folkloricos", label: "Eventos Folklóricos", roles: ADMIN_VENDEDOR,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      },
      {
        href: "/cliente", label: "Clientes", roles: NO_BODEGUERO,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      },
    ],
  },
  {
    label: "Finanzas",
    links: [
      {
        href: "/caja", label: "Caja", roles: ["ADMIN", "CAJERO", "VENDEDOR"],
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      },
      {
        href: "/garantias", label: "Garantías", roles: NO_BODEGUERO,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      },
      {
        href: "/reportes", label: "Reportes", roles: ALL,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      },
    ],
  },
  {
    label: "Administración",
    links: [
      {
        href: "/usuario", label: "Usuarios", roles: ADMIN_ONLY,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      },
      {
        href: "/configuracion", label: "Configuración", roles: ADMIN_ONLY,
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      },
    ],
  },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) redirect("/login");

  const jwtPayload = decodeJwt(token);
  const userRol = (jwtPayload?.rol ?? "VENDEDOR") as Rol;
  const userName = jwtPayload?.nombre ?? "Usuario";
  const userInitials = userName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  // Filter by role and strip the `roles` field before passing to client component
  const visibleSections: NavSectionItem[] = NAV_SECTIONS
    .map((section) => ({
      label: section.label,
      links: section.links
        .filter((link) => link.roles.includes(userRol))
        .map(({ href, label, badge, icon }) => ({ href, label, badge, icon })),
    }))
    .filter((section) => section.links.length > 0);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-60 flex-col bg-sidebar border-r border-sidebar-border">

        {/* Logo area */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-crimson flex items-center justify-center shrink-0 shadow-lg shadow-crimson/30">
              <span className="text-white font-black text-lg" style={{ fontFamily: "var(--font-outfit)" }}>F</span>
            </div>
            <div>
              <p className="font-black text-white text-base leading-none tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
                FOLCKLORE
              </p>
              <p className="text-[11px] text-white/35 mt-0.5 font-medium">Sistema de gestión</p>
            </div>
          </div>
          {/* Aguayo stripe accent */}
          <div className="aguayo-stripe h-0.5 w-full mt-4 rounded-full opacity-50" />
        </div>

        {/* User card + Nav (client component for active detection) */}
        <SidebarNav
          sections={visibleSections}
          userName={userName}
          userRol={userRol}
          userInitials={userInitials}
        />

        {/* Logout */}
        <div className="p-3 pt-0">
          <div className="aguayo-stripe h-0.5 w-full mb-3 rounded-full opacity-30" />
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white hover:bg-white/8 transition-all duration-150 group"
            >
              <span className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all duration-150">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TopBar */}
        <header className="h-14 shrink-0 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-crimson flex items-center justify-center">
              <span className="text-white font-black text-sm" style={{ fontFamily: "var(--font-outfit)" }}>F</span>
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: "var(--font-outfit)" }}>FOLCKLORE</span>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-1">
            <ThemeToggle />

            <Separator orientation="vertical" className="h-6 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-crimson text-white text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold leading-none">{userName.split(" ")[0]}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{userRol}</p>
                  </div>
                  <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Mi perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <form action="/api/logout" method="POST" className="w-full">
                    <button type="submit" className="w-full text-left">Cerrar sesión</button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
