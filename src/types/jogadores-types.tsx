export interface JogadorRodada {
  nota: string;
  goleiro: boolean;
  gols: number;
}

export interface JogadoresPorNome {
  [nome: string]: JogadorRodada;
}


export interface SnackbarProps {
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose?: () => void;
}