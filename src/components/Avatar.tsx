export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  color,
  size = 28,
  ring,
  className = "",
}: {
  name: string;
  color: string;
  size?: number;
  ring?: string;
  className?: string;
}) {
  return (
    <span
      title={name}
      aria-label={name}
      className={`inline-grid shrink-0 select-none place-items-center rounded-full font-semibold leading-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: `color-mix(in oklab, ${color} 22%, transparent)`,
        color,
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
    >
      {initialsOf(name)}
    </span>
  );
}
