import type { Metadata } from "next";

import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create an account | StudioSpace",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#0A0A0A] px-4 py-12 text-white sm:px-6 sm:py-16">
      <RegisterForm />
    </div>
  );
}
