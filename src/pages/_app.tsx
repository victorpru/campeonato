import { JogadoresProvider } from "@/context/jogadoresContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <JogadoresProvider>
      <Component {...pageProps} />
    </JogadoresProvider>
  );

}
