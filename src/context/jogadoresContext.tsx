import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

export interface JogadorRodada {
  nome: string;
  nota: number;
  rodada: number;
  time: string;
  goleiro?: boolean;
  gols: number;
}

interface JogadoresContextData {
  jogadores: JogadorRodada[];
  rodadas: number[];
  reloadJogadores: () => Promise<void>;
}

const JogadoresContext = createContext<JogadoresContextData>({
  jogadores: [],
  rodadas: [],
  reloadJogadores: async () => {},
});

export const JogadoresProvider = ({ children }: { children: ReactNode }) => {
  const [jogadores, setJogadores] = useState<JogadorRodada[]>([]);
  const [rodadas, setRodadas] = useState<number[]>([]);

  async function fetchJogadores() {
    try {
      const response = await axios.get(
        "https://campeonato-teste-default-rtdb.firebaseio.com/jogadores.json"
      );

      const dataArray = Object.values(response.data || {}) as JogadorRodada[];
      setJogadores(dataArray);

      const rodadasUnicas = Array.from(
        new Set(dataArray.map((j) => j.rodada))
      ).sort((a, b) => a - b);
      setRodadas(rodadasUnicas);
    } catch (error) {
      console.error("Erro ao buscar jogadores:", error);
    }
  }

  useEffect(() => {
    fetchJogadores();
  }, []);

  return (
    <JogadoresContext.Provider
      value={{ jogadores, rodadas, reloadJogadores: fetchJogadores }}
    >
      {children}
    </JogadoresContext.Provider>
  );
};

export const useJogadores = () => useContext(JogadoresContext);