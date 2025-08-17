import { JogadoresProvider } from "@/context/jogadoresContext";
import { SnackbarProvider } from "@/context/SnackbarContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider>
      <JogadoresProvider>
        <Component {...pageProps} />
      </JogadoresProvider>
    </SnackbarProvider>
  );

}
