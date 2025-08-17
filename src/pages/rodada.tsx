import Link from "next/link";
import { useJogadores } from "../context/jogadoresContext";
import Image from "next/image";
import { useState } from "react";

export default function MelhoresJogadores() {
    const { jogadores, rodadas } = useJogadores();

    const jogadoresMap = jogadores.reduce<
        Record<
            string,
            {
                nome: string;
                time: string;
                notasPorRodada: Record<number, number>;
                golsPorRodada: Record<number, number>;
                goleiro: boolean;
            }
        >
    >((acc, jogador) => {
        if (!acc[jogador.nome]) {
            acc[jogador.nome] = {
                nome: jogador.nome,
                time: jogador.time,
                notasPorRodada: {},
                golsPorRodada: {},
                goleiro: jogador.goleiro ?? false,
            };
        }
        acc[jogador.nome].notasPorRodada[jogador.rodada] = jogador.nota;
        acc[jogador.nome].golsPorRodada[jogador.rodada] = jogador.gols;
        acc[jogador.nome].goleiro = acc[jogador.nome].goleiro || Boolean(jogador.goleiro);
        return acc;
    }, {});

    const jogadoresAgrupados = Object.values(jogadoresMap);

    const jogadoresComMedia = jogadoresAgrupados.map((jogador) => {
        const notas = Object.values(jogador.notasPorRodada);
        const media = notas.length > 0 ? notas.reduce((acc, val) => acc + val, 0) / notas.length : 0;
        return { ...jogador, media };
    });

    const melhoresPorRodada: Record<number, typeof jogadoresComMedia> = {};
    rodadas.forEach((rodada) => {
        const ordenados = jogadoresComMedia
            .filter((j) => j.notasPorRodada[rodada] !== undefined)
            .sort((a, b) => b.notasPorRodada[rodada] - a.notasPorRodada[rodada])
            .slice(0, 5);
        melhoresPorRodada[rodada] = ordenados;
    });

    function JogadorFoto({ nome }: { nome: string }) {
        const [imgSrc, setImgSrc] = useState(`/fotos/${nome.toLowerCase().replace(/ /g, "-")}.jpg`);
        return (
            <Image
                src={imgSrc}
                alt={nome}
                width={100}
                height={100}
                style={styles.jogadorImagem}
                onError={() => setImgSrc("/fotos/nao-ha-fotos.png")}
            />
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🏆 Melhores Jogadores por Rodada</h1>

            <div style={styles.buttonContainer}>
                <Link href="/" style={styles.button}>
                    ← Voltar
                </Link>
            </div>

            {Object.entries(melhoresPorRodada).map(([rodada, lista]) => (
                <div key={rodada} style={styles.rodadaCard}>
                    <h2 style={styles.rodadaTitle}>Rodada {rodada}</h2>
                    <div style={styles.jogadoresGrid}>
                        {lista
                            .sort((a, b) => (b.goleiro ? 1 : 0) - (a.goleiro ? 1 : 0))
                            .map((j) => (
                                <div key={j.nome} style={styles.jogadorCard}>
                                    <div style={styles.jogadorInfo}>
                                        <JogadorFoto nome={j.nome} />
                                        <div style={styles.jogadorTexto}>
                                            <h3 style={styles.jogadorNome}>{j.nome}</h3>
                                            <p style={styles.jogadorDetalhe}>Time: {j.time}</p>
                                            <p style={styles.jogadorDetalhe}>
                                                Nota: {j.notasPorRodada[Number(rodada)].toFixed(2)}
                                            </p>
                                            {!j.goleiro && (
                                                <p style={styles.jogadorDetalhe}>
                                                    Gols: {j.golsPorRodada[Number(rodada)]}
                                                </p>
                                            )}
                                            <p style={styles.jogadorDetalhe}>{j.goleiro ? "Goleiro" : "Jogador"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 900,
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
    },
    title: {
        textAlign: "center" as const,
        marginBottom: 20,
        fontSize: 28,
        color: "#0070f3",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 20,
    },
    button: {
        display: "inline-block",
        backgroundColor: "#0070f3",
        color: "white",
        padding: "10px 18px",
        borderRadius: 6,
        textDecoration: "none",
        fontWeight: "600",
        transition: "background-color 0.3s ease",
    },
    rodadaCard: {
        marginBottom: 30,
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
    },
    rodadaTitle: {
        marginBottom: 10,
    },
    jogadoresGrid: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 10,
        marginTop: 10,
    },
    jogadorCard: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "1px solid #ccc",
        borderRadius: 6,
        padding: 10,
        backgroundColor: "#fff",
    },
    jogadorInfo: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    jogadorImagem: {
        objectFit: "cover" as const,
    },
    jogadorTexto: {
        display: "flex",
        flexDirection: "column" as const,
    },
    jogadorNome: {
        margin: 0,
    },
    jogadorDetalhe: {
        margin: 2,
    },
};
