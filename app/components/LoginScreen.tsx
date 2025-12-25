'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authenticate } from '@/app/actions';
import { useIMask } from 'react-imask';
import { motion, AnimatePresence } from "motion/react";
import IMask from 'imask';

export default function LoginScreen() {
  const router = useRouter();
  const [credential, setCredential] = useState('');
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Configure a smart Date mask with hooks
  const { ref, maskRef } = useIMask({
    mask: 'DD-MM-YYYY',
    blocks: {
      DD: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 31,
        maxLength: 2,
      },
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
        maxLength: 2,
      },
      YYYY: {
        mask: IMask.MaskedRange,
        from: 1900,
        to: 2099,
        maxLength: 4,
      }
    },
    lazy: false,
    overwrite: true,
    autofix: false, // Prevents cursor jumps and automatic changes during backspace
  } as any, 
  {
    onAccept: (value: string) => {
      setCredential(value);
    },
    onComplete: (value: string) => {
      handleAuth(value);
    }
  });

  const handleAuth = async (value: string) => {
    if (value.length === 10) {
      const result = await authenticate(value);
      if (result.success) {
        setError(false);
        setIsSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setError(true);
        setTimeout(() => setError(false), 500);
      }
    } else {
      setError(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const currentVal = maskRef.current?.value || credential;
      handleAuth(currentVal);
    }
  };

  return (
    <AnimatePresence>
      {!isSuccess && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.7 }}
            className="w-full max-w-md"
          >
            <Card className="glass-card border-none bg-white/30 p-8 rounded-3xl w-full text-center shadow-2xl">
              <CardContent className="p-0">
                <motion.div 
                  className="mb-6 flex justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <img 
                    src="/img/chibi-logo.png" 
                    alt="Chibi Logo" 
                    className="w-20 h-20 object-cover rounded-full border-2 border-white shadow-lg"
                  />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-pink-600 mb-2 script-font">
                  Welcome, my Love
                </h2>
                <p className="text-gray-700 mb-6">
                  Please enter our special date to verify it's you ❤️
                </p>
                
                <div className="relative">
                  <motion.div
                    animate={error ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Input 
                      ref={ref as any}
                      placeholder='DD-MM-YYYY'
                      onKeyDown={handleKeyDown}
                      className={`w-full bg-white/50 border-2 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus-visible:ring-2 focus-visible:ring-pink-200 focus-visible:ring-offset-0 placeholder:text-pink-300 transition-all font-mono h-16 ${
                        error ? 'border-red-400 text-red-500' : 'border-pink-200 text-pink-600'
                      }`}
                    />
                  </motion.div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                     <i className="fas fa-key text-pink-400"></i>
                  </div>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: error ? 1 : 0, height: error ? 'auto' : 0 }}
                  className="text-red-500 text-sm mt-3"
                >
                  Incorrect date, please try again
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
      
      {isSuccess && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-center"
          >
             <motion.div 
                className="mb-4 flex justify-center"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
             >
                <img 
                  src="/img/chibi-logo.png" 
                  alt="Chibi Logo" 
                  className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-2xl"
                />
             </motion.div>
             <h2 className="text-4xl font-bold text-pink-600 mb-2 script-font">
               Welcome Home ❤️
             </h2>
             <p className="text-xl text-gray-700">
               Unlocking our memories...
             </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
