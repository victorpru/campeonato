import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useJogadores } from "../context/jogadoresContext";
import { jogadoresPorTime, Times } from "../constantes/times";
import Link from "next/link";

const STORAGE_KEY = "autorizadoParaCadastro";

export default function Cadastrar() {
  const [time, setTime] = useState<Times | "">("");
  const [rodada, setRodada] = useState<number>(1);
  const [jogadores, setJogadores] = useState<{ [nome: string]: { nota: string; goleiro: boolean } }>({});

  const router = useRouter();
  const { reloadJogadores } = useJogadores();

  useEffect(() => {
    const autorizado = localStorage.getItem(STORAGE_KEY);
    if (autorizado !== "true") {
      const senha = prompt("Digite a senha para acessar esta página:");
      if (senha !== "1234") {
        alert("Senha incorreta! Voltando para a página inicial.");
        router.push("/");
      } else {
        localStorage.setItem(STORAGE_KEY, "true");
      }
    }
  }, [router]);

  useEffect(() => {
    if (time) {
      const nomes = jogadoresPorTime[time] || [];
      const inicial = nomes.reduce((acc, nome) => {
        acc[nome] = { nota: "0", goleiro: false };
        return acc;
      }, {} as { [nome: string]: { nota: string; goleiro: boolean } });
      setJogadores(inicial);
    }
  }, [time]);

  async function cadastrarTodos() {
    if (!time) {
      alert("Selecione um time!");
      return;
    }

    const promessas = Object.entries(jogadores).map(([nome, { nota, goleiro }]) => {
      const notaNumber = parseFloat(nota.replace(",", "."));
      return axios.post(
        "https://sistema-fut-ibav-default-rtdb.firebaseio.com/jogadores.json",
        { nome, time, rodada, nota: isNaN(notaNumber) ? 0 : notaNumber, goleiro }
      );
    });

    try {
      await Promise.all(promessas);
      alert("Cadastro de todos os jogadores realizado com sucesso!");
      await reloadJogadores();
      router.push("/");
    } catch (error) {
      console.error("Erro ao cadastrar jogadores:", error);
      alert("Erro ao cadastrar, tente novamente.");
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>➕ Cadastrar rodada por time</h1>

      <div style={styles.form}>
        <label style={styles.label}>
          Time:
          <select
            value={time}
            onChange={(e) => setTime(e.target.value as Times)}
            style={styles.select}
          >
            <option value="">-- Selecione o time --</option>
            {Object.values(Times).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Rodada:
          <input
            type="number"
            value={rodada}
            min={1}
            onChange={(e) => setRodada(Number(e.target.value))}
            style={styles.input}
          />
        </label>

        {time && Object.entries(jogadores).map(([nome, data]) => (
          <div key={nome} style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <span style={{ flex: 1 }}>{nome}</span>
            <input
              type="number"
              value={data.nota}
              step={0.1}
              style={styles.input}
              onChange={(e) => setJogadores(prev => ({ ...prev, [nome]: { ...prev[nome], nota: e.target.value } }))}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
              Goleiro
              <input
                type="checkbox"
                checked={data.goleiro}
                onChange={(e) => setJogadores(prev => ({ ...prev, [nome]: { ...prev[nome], goleiro: e.target.checked } }))}
                style={styles.checkbox}
                />
            </label>
          </div>
        ))}

        {time && (
          <button onClick={cadastrarTodos} style={styles.button}>
            Cadastrar todos
          </button>
        )}
      </div>

      <br />
      <Link href="/" style={styles.link}>
        ← Voltar para tabela
      </Link>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  title: {
    textAlign: "center" as const,
    marginBottom: 30,
    fontSize: 26,
    color: "#0070f3",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 15,
  },
  label: {
    display: "flex",
    flexDirection: "column" as const,
    fontWeight: "600",
    fontSize: 14,
    color: "#ddd",
  },
  select: {
    marginTop: 6,
    padding: "8px 12px",
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
    transition: "border-color 0.3s",
  },
  input: {
    width: 80,
    marginTop: 6,
    padding: "8px 12px",
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
    transition: "border-color 0.3s",
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer",
  },
  button: {
    marginTop: 10,
    padding: "12px",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  link: {
    color: "#0070f3",
    textDecoration: "none",
    fontWeight: "600",
  },
};