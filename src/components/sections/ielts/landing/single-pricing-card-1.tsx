'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { SubscriptionPlans } from '@/components/subscription';

export function Pricing() {
  return (
    <section className="relative overflow-hidden py-24" id="pricing">
      <div className="mx-auto w-full max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
        >
          <SubscriptionPlans
            examId="ielts-academic"
          />
        </motion.div>
      </div>
    </section>
  );
}
