"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface LoginState {
  error: string | null;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos." };
  }

  try {
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3001";

    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Email o contraseña incorrectos." };
      }
      return { error: "Ocurrió un error inesperado. Por favor intenta de nuevo." };
    }

    const data = (await response.json()) as { accessToken: string };

    const setCookieHeader = response.headers.get("set-cookie");
    const cookieStore = await cookies();

    if (setCookieHeader) {
      const match = setCookieHeader.match(/refreshToken=([^;]+)/);
      if (match) {
        cookieStore.set("refreshToken", match[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }
    }

    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15,
      path: "/",
    });
  } catch {
    return { error: "No se pudo conectar al servidor. Por favor intenta de nuevo." };
  }

  redirect("/dashboard");
}
