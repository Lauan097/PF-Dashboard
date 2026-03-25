'use client';

import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <h1 className="text-4xl font-bold text-red-500">Acesso Negado</h1>
      <p className="text-gray-400 max-w-md">
        Você não tem permissão para acessar o dashboard. É necessário ser administrador em pelo menos um servidor que o bot esteja presente.
      </p>
      <button
        onClick={() => router.replace("/login")}
        className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >
        Voltar ao Login
      </button>
    </div>
  );
}
