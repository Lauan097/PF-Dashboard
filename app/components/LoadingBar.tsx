'use client';

import { motion } from "framer-motion";
import { ProgressBar} from "@heroui/react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  className?: string;
}

export default function LoadingBar({ 
  text = 'Carregando...',
  className
}: LoadingProps) {

  return (
    <motion.div className="container mx-auto min-h-screen px-4 max-w-7xl"  >
      <motion.section className="w-full overflow-hidden min-h-screen p-6 ">
        <div className={cn("flex flex-col h-screen items-center justify-center mx-auto gap-4",
          className
        )}>
          <p className="text-gray-400 font-medium">
            {text}
          </p>

          <div className="relative w-140 overflow-hidden">
            <ProgressBar isIndeterminate>
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>  
            </ProgressBar>       
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}