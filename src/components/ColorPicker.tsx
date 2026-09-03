import { PROJECT_COLORS } from "@/lib/constants";

export function ColorPicker({
  name,
  value,
  colors = PROJECT_COLORS,
}: {
  name: string;
  value?: string;
  colors?: string[];
}) {
  const current = value && colors.includes(value) ? value : colors[0];
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Farbe">
      {colors.map((color) => (
        <label
          key={color}
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border-2 border-transparent transition-colors has-checked:border-paper has-focus-visible:border-paper"
          title={color}
        >
          <input type="radio" name={name} value={color} defaultChecked={color === current} className="sr-only" />
          <span className="h-4 w-4 rounded-full" style={{ background: color }} />
        </label>
      ))}
    </div>
  );
}
