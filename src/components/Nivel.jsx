import { Shield } from "lucide-react";

export default function Nivel() {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
      Nível:
      <Shield color="#07f31eff" size={18} />
      1=forte, <Shield color="#070ff3ff" size={18} /> 2=médio, <Shield color="#f3eb07ff" size={18} /> 3=iniciante
    </label>
  );
}