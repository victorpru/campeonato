import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useJogadores } from "../context/jogadoresContext";
import { jogadoresPorTime, Times } from "../constantes/times";
import Link from "next/link";
import { JogadoresPorNome } from "@/types/jogadores-types";
import { useSnackbar } from "@/context/SnackbarContext";

const STORAGE_KEY = "autorizadoParaCadastro";

export default function Cadastrar() {
  const [time, setTime] = useState<Times | "">("");
  const [rodada, setRodada] = useState<number>(1);
  const [jogadores, setJogadores] = useState<JogadoresPorNome>({});
  const [senha, setSenha] = useState("");
  const [senhaValida, setSenhaValida] = useState(false);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { reloadJogadores } = useJogadores();

  useEffect(() => {
    const autorizado = localStorage.getItem(STORAGE_KEY);
    if (autorizado === "true") {
      setSenhaValida(true);
    }
  }, []);

  function validarSenha() {
    if (senha === "1234") {
      localStorage.setItem(STORAGE_KEY, "true");
      setSenhaValida(true);
      showSnackbar("Você tem autorização para cadastrar jogadores, não faça merda porque não temos backup", "success");
    } else {
      showSnackbar("Você não tem autorização para cadastrar jogadores", "error");
      router.push("/");
    }
  }

  useEffect(() => {
    if (time) {
      const nomes = jogadoresPorTime[time] || [];
      const inicial = nomes.reduce((acc, nome) => {
        acc[nome] = { nota: "0", goleiro: false, gols: 0 };
        return acc;
      }, {} as JogadoresPorNome);
      setJogadores(inicial);
    }
  }, [time]);

  async function cadastrarTodos() {
    if (!time) {
      showSnackbar("Selecione um time!", "error");
      return;
    }

    const promessas = Object.entries(jogadores).map(([nome, { nota, goleiro, gols }]) => {
      const notaNumber = parseFloat(nota.replace(",", "."));
      return axios.post(
        "https://campeonato-teste-default-rtdb.firebaseio.com/jogadores.json",
        { nome, time, rodada, nota: isNaN(notaNumber) ? 0 : notaNumber, goleiro, gols }
      );
    });

    try {
      await Promise.all(promessas);
      showSnackbar("Cadastro realizado com sucesso!", "success");
      await reloadJogadores();
      router.push("/");
    } catch (error) {
      console.error("Erro ao cadastrar jogadores:", error);
      showSnackbar("Erro ao cadastrar, tente novamente.", "error");
    }
  }

  return (
    <div style={styles.container}>
      {!senhaValida ? (
        <div style={styles.modal}>
          <h2>Digite a senha para acessar</h2>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
          />
          <button onClick={validarSenha} style={styles.button}>
            Acessar
          </button>
        </div>
      ) : (
        <>
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
              <div key={nome} style={styles.jogadorLinha}>
                <span style={styles.jogadorNome}>{nome}</span>
                <input
                  type="number"
                  value={data.nota}
                  step={0.1}
                  style={styles.input}
                  onChange={(e) => setJogadores(prev => ({ ...prev, [nome]: { ...prev[nome], nota: e.target.value } }))}
                />
                <label style={styles.labelInline}>
                  Gols
                  <input
                    type="number"
                    value={data.gols}
                    min={0}
                    step={1}
                    style={styles.input}
                    onChange={(e) =>
                      setJogadores(prev => ({
                        ...prev,
                        [nome]: { ...prev[nome], gols: Math.floor(Number(e.target.value)) }
                      }))
                    }
                  />
                </label>
                <label style={styles.labelInline}>
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
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  modal: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    backgroundColor: "rgba(0,0,0,0.05)",
    gap: 12,
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
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
    gap: 10,
  },
  label: {
    display: "flex",
    flexDirection: "column" as const,
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
    marginTop: 6,
  },
  select: {
    marginTop: 6,
    padding: "8px 12px",
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
  },
  input: {
    width: 80,
    marginTop: 6,
    padding: "8px 12px",
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
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
  },
  link: {
    color: "#0070f3",
    textDecoration: "none",
    fontWeight: "600",
  },
  jogadorLinha: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: 6,
  },
  jogadorNome: {
    flex: 1,
  },
  labelInline: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
};
