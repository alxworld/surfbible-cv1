import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-green-50 py-16 px-4">
      <SignUp />
    </main>
  );
}
