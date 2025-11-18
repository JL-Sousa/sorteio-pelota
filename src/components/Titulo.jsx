import { Trophy } from "lucide-react";

export default function Titulo() {
  return (
    <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, lineHeight: 1.1 }}>
      <Trophy size={64} color="#a78140ff" />
      Pelota das 18hs
    </h1>
  );
}
