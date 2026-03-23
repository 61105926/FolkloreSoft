import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3001";
      await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      });
    } catch {
      // Proceed with local logout even if backend call fails
    }
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  redirect("/login");
}
