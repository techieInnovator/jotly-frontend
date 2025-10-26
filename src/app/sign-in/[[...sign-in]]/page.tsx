"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthenticationPage() {
    const { isSignedIn } = useUser();
    const router = useRouter();
    const [fade, setFade] = useState(false);

    useEffect(() => {
        if (isSignedIn) {
            setFade(true);
            const timeout = setTimeout(() => router.push("/"), 300);
            return () => clearTimeout(timeout);
        }
    }, [isSignedIn, router]);

    return (
        <div
            className={`min-h-screen flex flex-col lg:flex-row bg-gray-50 transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"
                }`}
        >
            <Image
                src="/jotlyLogo.png"
                alt="Jotly Logo"
                width={100}
                height={100}
                className="absolute top-4 left-4 cursor-pointer"
                onClick={() => (window.location.href = "/")}
                quality={100}
            />

            <div className="hidden lg:flex flex-1 items-center justify-center bg-white">
                <div className="max-w-md text-center px-6">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Your AI workspace for better notes & productivity
                    </h1>
                    <p className="text-gray-500">
                        Join thousands of users leveraging AI to take smarter notes.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-10">
                <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg">
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-2">Sign In to Jotly</h2>
                        <p className="text-gray-500">Access your workspace and AI notes.</p>
                    </div>
                    <SignIn />
                </div>
            </div>
        </div>
    );
}
