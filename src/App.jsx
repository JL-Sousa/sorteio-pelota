import { useEffect, useMemo, useState } from "react";
import { PersonStanding, Shield } from "lucide-react";
import Titulo from "./components/Titulo";
import Nivel from "./components/Nivel";

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distribuirBalanceadoPorNivel(jogadores, totalTimes = 3) {
  // Separar por nível
  const n1 = jogadores.filter((j) => j.nivel === 1);
  const n2 = jogadores.filter((j) => j.nivel === 2);
  const n3 = jogadores.filter((j) => j.nivel === 3);

  // Embaralhar cada nível
  const s1 = shuffle(n1);
  const s2 = shuffle(n2);
  const s3 = shuffle(n3);

  // Inicializar times
  const times = Array.from({ length: totalTimes }, (_, i) => ({
    nome: `Time ${String.fromCharCode(65 + i)}`, // A, B, C...
    jogadores: [],
  }));

  // Função para rodadas de distribuição
  const distribuirRodada = (lista) => {
    let idxTime = 0;
    for (const jogador of lista) {
      times[idxTime % totalTimes].jogadores.push(jogador);
      idxTime++;
    }
  };

  // Distribui por nível para equilibrar
  distribuirRodada(s1);
  distribuirRodada(s2);
  distribuirRodada(s3);

  return times;
}

export default function App() {
  const [jogadores, setJogadores] = useState(() => {
    // carrega do localStorage (simples)
    try {
      const raw = localStorage.getItem("pelada-jogadores");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [nome, setNome] = useState("");
  const [nivel, setNivel] = useState(2);
  const [totalTimes, setTotalTimes] = useState(3);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("pelada-jogadores", JSON.stringify(jogadores));
  }, [jogadores]);

  const totaisPorNivel = useMemo(() => {
    return {
      n1: jogadores.filter((j) => j.nivel === 1).length,
      n2: jogadores.filter((j) => j.nivel === 2).length,
      n3: jogadores.filter((j) => j.nivel === 3).length,
    };
  }, [jogadores]);

  function adicionarJogador(e) {
    e.preventDefault();
    setError("");
    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      setError("Informe um nome.");
      return;
    }
    if (![1, 2, 3].includes(Number(nivel))) {
      setError("Nível inválido. Use 1, 2 ou 3.");
      return;
    }
    // evitar duplicado exato de nome
    if (
      jogadores.some((j) => j.nome.toLowerCase() === nomeTrim.toLowerCase())
    ) {
      setError("Já existe um jogador com esse nome.");
      return;
    }
    setJogadores((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome: nomeTrim, nivel: Number(nivel) },
    ]);
    setNome("");
    setNivel(2);
  }

  function removerJogador(id) {
    setJogadores((prev) => prev.filter((j) => j.id !== id));
  }

  function limparTudo() {
    if (confirm("Tem certeza que deseja limpar todos os jogadores?")) {
      setJogadores([]);
      setResultado(null);
    }
  }

  function sortearTimes() {
    setError("");
    if (jogadores.length < totalTimes) {
      setError(
        `É necessário pelo menos ${totalTimes} jogadores para formar ${totalTimes} times.`
      );
      return;
    }
    const times = distribuirBalanceadoPorNivel(jogadores, totalTimes);
    setResultado(times);
  }

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "24px auto",
        padding: 16,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <Titulo />

      <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <form onSubmit={adicionarJogador} className="form-jogador">
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PersonStanding size={18} color="#a78140ff" />
              Jogador
            </label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Sapita, Jhon, Garay"
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div>
            <Nivel />
            <select
              value={nivel}
              onChange={(e) => setNivel(Number(e.target.value))}
              style={{ width: "100%", padding: 8 }}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <button type="submit" className="btn-add">Adicionar</button>
        </form>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label>Total de times</label>{" "}
            <select
              value={totalTimes}
              onChange={(e) => setTotalTimes(Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <button onClick={sortearTimes}>Sortear times</button>

          <label
            style={{
              cursor: "pointer",
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
            }}
          ></label>
          <button
            onClick={limparTudo}
            style={{ marginLeft: "auto", color: "#b00020" }}
          >
            Limpar
          </button>
        </div>

        {error && <div style={{ color: "#b00020" }}>{error}</div>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          <div
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
          >
            <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Nível 1 <Shield color="#07f31eff" size={24} /> —{" "}
              {totaisPorNivel.n1} <PersonStanding size={24} color="#a78140ff" />
            </h3>
            <ListaJogadores
              jogadores={jogadores.filter((j) => j.nivel === 1)}
              onRemove={removerJogador}
            />
          </div>
          <div
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
          >
            <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Nível 2 <Shield color="#070ff3ff" size={24} /> —{" "}
              {totaisPorNivel.n2} <PersonStanding size={24} color="#a78140ff" />
            </h3>
            <ListaJogadores
              jogadores={jogadores.filter((j) => j.nivel === 2)}
              onRemove={removerJogador}
            />
          </div>
          <div
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
          >
            <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Nível 3 <Shield color="#f3eb07ff" size={24} /> —{" "}
              {totaisPorNivel.n3} <PersonStanding size={24} color="#a78140ff" />
            </h3>
            <ListaJogadores
              jogadores={jogadores.filter((j) => j.nivel === 3)}
              onRemove={removerJogador}
            />
          </div>
        </div>

        {resultado && (
          <div style={{ marginTop: 16 }}>
            <h2>Resultado do sorteio</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${resultado.length}, 1fr)`,
                gap: 16,
              }}
            >
              {resultado.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "2px solid #333",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <h3>{t.nome}</h3>
                  <ul>
                    {t.jogadores.map((j) => (
                      <li key={j.id}>
                        {j.nome}{" "}
                        <small style={{ color: "#666" }}>
                          (Nível {j.nivel})
                        </small>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ListaJogadores({ jogadores, onRemove }) {
  if (jogadores.length === 0)
    return <p style={{ color: "#777" }}>Sem jogadores neste nível.</p>;
  return (
    <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
      {jogadores
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        .map((j) => (
          <li
            key={j.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px dashed #eee",
            }}
          >
            <span>{j.nome}</span>
            <button
              onClick={() => onRemove(j.id)}
              title="Remover"
              style={{ color: "#b00020" }}
            >
              ×
            </button>
          </li>
        ))}
    </ul>
  );
}
