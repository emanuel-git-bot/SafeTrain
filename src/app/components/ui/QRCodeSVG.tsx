// ─── QRCode SVG Generator ────────────────────────────────────────────────────

export function QRCodeSVG({ value }: { value: string }) {
  const size = 9;
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: size * size }, (_, i) => {
    const x = i % size;
    const y = Math.floor(i / size);
    const corner =
      (x < 3 && y < 3) ||
      (x >= size - 3 && y < 3) ||
      (x < 3 && y >= size - 3);
    if (corner) return true;
    return ((seed * (i + 7) * 2654435761) >>> 0) % 3 !== 0;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="white" />
      {cells.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i % size}
            y={Math.floor(i / size)}
            width={1}
            height={1}
            fill="#090D18"
          />
        ) : null
      )}
    </svg>
  );
}
