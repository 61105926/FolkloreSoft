"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: null as string | null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Correo electrónico
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="usuario@ejemplo.com"
          required
          disabled={isPending}
          className="h-11 rounded-xl border-2 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-crimson/30 focus-visible:border-crimson"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Contraseña
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          disabled={isPending}
          className="h-11 rounded-xl border-2 border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-crimson/30 focus-visible:border-crimson"
        />
      </div>

      {state?.error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-11 rounded-xl font-semibold text-base bg-crimson hover:bg-crimson-dark text-white shadow-md transition-all duration-200"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Iniciando sesión...
          </span>
        ) : (
          "Iniciar sesión"
        )}
      </Button>
    </form>
  );
}
