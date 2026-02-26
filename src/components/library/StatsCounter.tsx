import { useState, useEffect, useRef } from "react";

interface StatsCounterProps {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
}

const StatsCounter = ({ end, label, suffix = "", duration = 2000 }: StatsCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  const formatNumber = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return n.toLocaleString();
  };

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
        {formatNumber(count)}
        {suffix}
      </div>
      <div className="text-primary-foreground/70 text-sm">{label}</div>
    </div>
  );
};

export default StatsCounter;
