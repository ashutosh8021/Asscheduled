import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { currentAdmin, adminConfigured } from "@/lib/admin";
import LoginForm from "./LoginForm";
import "../admin.css";

export const metadata: Metadata = {
  title: "Sign in",
  /* Unlisted: nothing links here, it is absent from the sitemap, and
     crawlers are told to skip it. It exists only if you type the URL. */
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  /* Already signed in — no reason to show a login form. */
  if (await currentAdmin()) redirect("/admin");

  return (
    <div className="a-login-page">
      <div className="a-login-card">
        <Image
          src="/img/logo-ink.png"
          alt="AS SCHEDULED"
          width={816}
          height={94}
          className="a-login-logo"
          priority
        />

        <h1 className="a-login-h">Admin Login</h1>

        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="a-note">
            Not configured on this deployment — it needs a Supabase project and{" "}
            <code>ADMIN_EMAILS</code>. See <code>docs/admin.md</code>.
          </p>
        )}
      </div>
    </div>
  );
}
