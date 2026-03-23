import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* Left panel — atmospheric Bolivian folklore */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center bg-graphite">
        {/* Aguayo stripe band top */}
        <div className="aguayo-stripe absolute top-0 left-0 w-full h-2" />

        {/* Background gradient evoking night sky over Andes */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, #3D0A0A 0%, #18181B 50%, #0D0D0F 100%)",
          }}
        />

        {/* Decorative circle (evokes full moon / spotlight on dancers) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-md">
          {/* Logo mark */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-crimson flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-3xl" style={{ fontFamily: "var(--font-outfit)" }}>
                F
              </span>
            </div>
          </div>

          <h1
            className="text-5xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            FOLCKLORE
          </h1>

          <div className="aguayo-stripe w-24 h-1 mx-auto mb-6 rounded-full" />

          <p className="text-gray-300 text-lg leading-relaxed">
            Sistema de gestión de ropa folklórica boliviana.
            <br />
            <span className="text-gold font-semibold">Tradición y profesionalismo</span> en un solo lugar.
          </p>

          {/* Decorative dances list */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {["Caporales", "Morenada", "Tinku", "Diablada", "Saya", "Kullawada"].map(
              (danza) => (
                <span
                  key={danza}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-white/60 bg-white/5"
                >
                  {danza}
                </span>
              )
            )}
          </div>
        </div>

        {/* Aguayo stripe band bottom */}
        <div className="aguayo-stripe absolute bottom-0 left-0 w-full h-2" />
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-cream px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="inline-flex w-14 h-14 rounded-xl bg-crimson items-center justify-center mb-3">
            <span className="text-white font-bold text-2xl" style={{ fontFamily: "var(--font-outfit)" }}>
              F
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-graphite" style={{ fontFamily: "var(--font-outfit)" }}>
            FOLCKLORE
          </h1>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-graphite"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Bienvenido de vuelta
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} FOLCKLORE · Bolivia
          </p>
        </div>
      </div>
    </main>
  );
}
