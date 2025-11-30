import React from 'react';
import { motion } from 'framer-motion';

interface SideNavProps {
  initials: string[];
}

export default function SideNav({ initials }: SideNavProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="hidden lg:flex flex-col gap-3
                 fixed top-1/2 right-8 -translate-y-1/2
                 bg-white/40 backdrop-blur-xl border border-white/50
                 rounded-full p-2 shadow-2xl z-50"
    >
      {initials.map((ch) => (
        <motion.a
          key={ch}
          href={`#${ch} `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center
                     text-sm font-bold text-gray-600
                     bg-white/50 hover:bg-white hover:text-blue-600
                     rounded-full transition-colors duration-200 shadow-sm"
        >
          {ch}
        </motion.a>
      ))}
    </motion.nav>
  );
}
