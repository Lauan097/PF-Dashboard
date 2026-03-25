'use client'; 

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FaDiscord } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiAlertTriangle } from "react-icons/fi";
import Image from 'next/image';
import Link from 'next/link';

export default function LoginForm() {
  
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div className='w-fit h-fit font-rajdhani'>
      
      <div className="mb-6 flex justify-center">
        <Image    
          className="w-16 h-16 rounded-full"
          src="/logo0.png"
          alt="Logo PF"
          width={150}
          height={150}
        />
      </div>

      <h1 className="text-center text-3xl font-bold">Bem-vindo de volta</h1>
      <p className="mt-2 text-center text-gray-400">
        Faça Login para continuar:
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="flex w-full items-center cursor-pointer justify-center gap-3 rounded-lg bg-[#3d3d3d] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#474747]"
        >
          <FcGoogle className="h-5 w-5" /> 
          Continuar com Google
        </button>
        
        <button
          onClick={() => signIn('discord', { callbackUrl })}
          className="flex w-full items-center cursor-pointer justify-center gap-3 rounded-lg bg-[#3d3d3d] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#474747]"
        >
          <FaDiscord className="h-5 w-5 text-[#7c87fd]" />
          Continuar com Discord
        </button>
      </div>

      <div className="my-6 flex items-center gap-4">
        <hr className="grow border-neutral-700" />
      </div>

      <div
        className="flex w-full items-center gap-3 rounded-lg
        border border-yellow-500/50 px-4 py-3 bg-yellow-500/5
        text-gray-200 text-xs font-sans font-normal"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/30 shrink-0">
          <FiAlertTriangle className="h-4 w-4 text-yellow-500" />
        </div>

        <div className="flex flex-col gap-1">
          <span>
            Recomendamos o login via Discord.
            O acesso pelo Google é uma alternativa temporária e provisória.
          </span>
        </div>
      </div>


      <p className="mt-8 text-center text-xs text-gray-500">
        Ao continuar, você concorda com nossos{' '}
        <Link href="/termos" className="text-gray-400 hover:underline">
          Termos de Serviço
        </Link>{' '}
        e{' '}
        <Link href="/privacidade" className="text-gray-400 hover:underline">
          Política de Privacidade
        </Link>
      </p>
    </div>
  );
}