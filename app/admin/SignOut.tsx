"use client";

import { useRouter } from "next/navigation";

export default function SignOut({ email }: { email: string }) {
  const router = useRouter();

  return (
    <>
      <span className="a-bar-who">{email}</span>
      <button
        type="button"
        className="a-btn"
        onClick={async () => {
          await fetch("/api/admin/logout", { method: "POST" });
          router.replace("/admin/login");
          router.refresh();
        }}
      >
        SIGN OUT
      </button>
    </>
  );
}
