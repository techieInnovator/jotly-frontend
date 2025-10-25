"use client";
import { Waitlist } from "@clerk/nextjs";
import Image from "next/image";

export default function WaitlistPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      <Image
        src="/jotlyLogo.png"
        alt="Jotly Logo"
        width={120}
        height={120}
        className="absolute top-4 left-4 cursor-pointer"
        quality={100}
        placeholder="blur"
        blurDataURL="/jotlyLogo.png"
        onClick={() => window.location.href = '/'}
      />
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <h1 className="text-4xl font-bold max-w-sm text-gray-700">
          Your AI workspace for better notes & productivity.
        </h1>
      </div>

      {/* Right section — Waitlist Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-semibold">Join Jotly Waitlist</h2>
            <p className="text-gray-500">
              Be the first to access the future of note-taking.
            </p>
          </div>

          <Waitlist />
        </div>
      </div>
    </div>
  );
}
