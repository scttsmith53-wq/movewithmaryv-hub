'use client';

// Full-width, auto-scrolling strip of short inspirational lines. Loops seamlessly
// (content duplicated) and pauses on hover. Client testimonials are intentionally
// omitted until Mary's own verified reviews are added — do not display another
// professional's reviews here.

import { Sparkles } from 'lucide-react';

const quotes = [
  'The best time to plant a tree was 20 years ago. The second best time is today.',
  'Owning your home turns rent receipts into building blocks of wealth.',
  'A house is made of walls and beams; a home is built with love and dreams.',
  "Don't wait to buy a home — buy a home and let time do the work.",
  'Confidence is knowing your numbers before you make your move.',
  'Every expert buyer was once a beginner who asked good questions.',
  'Home is where your story begins.',
  'Small steps, taken consistently, unlock big doors.',
  'Your equity is a tool — the first step is knowing what you have.',
];

export default function TestimonialTicker() {
  const loop = [...quotes, ...quotes];
  return (
    <div className="group relative overflow-hidden border-y border-white/10 bg-[#0b0f10] py-3">
      <div className="flex w-max animate-[bch-ticker_90s_linear_infinite] gap-10 whitespace-nowrap px-5 group-hover:[animation-play-state:paused]">
        {loop.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm">
            <Sparkles size={13} className="shrink-0 text-gold/70" />
            <span className="italic text-ice/60">{t}</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes bch-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
