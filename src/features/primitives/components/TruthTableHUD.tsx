import { Html } from "@react-three/drei";

interface TruthTableHUDProps {
  lastResult?: { a: 0 | 1; b: 0 | 1; out: 0 | 1 } | null;
}

export function TruthTableHUD({ lastResult }: TruthTableHUDProps) {
  const rows = [
    { a: 0, b: 0, out: 0 },
    { a: 0, b: 1, out: 1 },
    { a: 1, b: 0, out: 1 },
    { a: 1, b: 1, out: 0 },
  ];

  return (
    <Html position={[6, 5, 0]} transform>
      <div className="bg-black/90 border border-neon-cyan p-4 rounded-lg font-mono text-xs w-48 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
        <h3 className="text-neon-cyan mb-2 font-bold text-center border-b border-neon-cyan/30 pb-1">XOR TRUTH TABLE</h3>
        <div className="grid grid-cols-3 gap-2 mb-2 text-neon-purple/70 font-bold">
          <div>A</div>
          <div>B</div>
          <div>OUT</div>
        </div>
        <div className="flex flex-col gap-1">
          {rows.map((row, i) => {
            const isActive =
              lastResult &&
              lastResult.a === row.a &&
              lastResult.b === row.b;

            return (
              <div
                key={i}
                className={`grid grid-cols-3 gap-2 p-1 rounded transition-colors duration-200 ${
                  isActive ? "bg-neon-cyan/20 text-white font-bold" : "text-gray-400"
                }`}
              >
                <div>{row.a}</div>
                <div>{row.b}</div>
                <div className={row.out === 1 ? "text-neon-green" : "text-red-500"}>
                  {row.out}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Html>
  );
}
