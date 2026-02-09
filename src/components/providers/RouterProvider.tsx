"use client";

import { RouterProvider as AriaRouterProvider } from "react-aria-components";
import { useRouter } from "next/navigation";

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return <AriaRouterProvider navigate={router.push}>{children}</AriaRouterProvider>;
}
