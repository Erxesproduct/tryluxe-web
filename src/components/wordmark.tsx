/** tryLuxé set in the headline serif: «try» light italic, «Luxé» upright. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`serif inline-flex items-baseline leading-none ${className}`}>
      <span className="font-light italic">try</span>
      <span className="font-medium tracking-[0.02em]">Luxé</span>
    </span>
  );
}
