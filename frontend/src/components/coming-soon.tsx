import { Badge } from "@/components/ui/badge";

interface Props {
  modulo: string;
  descripcion?: string;
}

export function ComingSoon({ modulo, descripcion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
        <svg className="h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
          {modulo}
        </h1>
        {descripcion && (
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {descripcion}
          </p>
        )}
      </div>

      <Badge variant="outline" className="border-gold/30 text-gold/80 bg-gold/5 px-4 py-1">
        Próximamente
      </Badge>

      <p className="text-xs text-muted-foreground/50 max-w-xs">
        Este módulo está en desarrollo activo. Será habilitado en una próxima versión del sistema.
      </p>
    </div>
  );
}
