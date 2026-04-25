import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-green-50 py-16 px-4">
      <SignUp />
    </main>
  );
}
