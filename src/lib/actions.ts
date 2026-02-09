"use server";

import { signOut } from "@workos-inc/authkit-nextjs";
import { headers } from "next/headers";

export async function signOutAction() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return signOut({ returnTo: `${protocol}://${host}` });
}
