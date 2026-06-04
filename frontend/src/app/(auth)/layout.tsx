import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Section - Illustration */}
      <div className="hidden flex-1 items-center justify-center bg-white p-8 lg:flex">
        <div className="relative h-[600px] w-full max-w-[600px]">
          <Image
            src="/images/auth-illustration.jpg"
            alt="Authentication Illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="bg-dark-gray flex flex-1 items-center justify-center p-4 md:p-12 lg:p-24">
        <div className="w-full max-w-[450px]">{children}</div>
      </div>
    </div>
  );
}
