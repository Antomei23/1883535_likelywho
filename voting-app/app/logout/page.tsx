"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
    }
    router.replace("/login");
  }, [router]);

  return (
    <div style={{ padding: 24 }}>
      Logging out…
    </div>
  );
}
