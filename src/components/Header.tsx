import React from 'react';
import { motion } from 'framer-motion';
// import { Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="Delphi TVS Logo" className="h-10 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Smart Power Analytics
              </h1>
              <p className="text-xs text-muted-foreground">
                Industrial Energy Intelligence
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <span className="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg">
              Dashboard
            </span>
          </nav>
        </div>
      </div>
    </motion.header>
  );
};
