"use client";

import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const handleLogin = () => {
    // Temporary login (no auth yet)
    router.push("/admin/dashboard");
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="border p-6 rounded w-80">
        <h2 className="text-xl font-bold mb-4">
          Hospital Admin Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="border w-full mb-3 p-2"
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full mb-4 p-2"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
