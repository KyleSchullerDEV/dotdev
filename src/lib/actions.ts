"use server";

import { signOut } from "@workos-inc/authkit-nextjs";

export async function signOutAction() {
  return signOut();
}
