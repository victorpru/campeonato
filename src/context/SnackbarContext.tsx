import { createContext, useContext, useState, ReactNode } from "react";

interface SnackbarContextType {
    showSnackbar: (message: string, type?: "success" | "error") => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) throw new Error("useSnackbar must be used within SnackbarProvider");
    return context;
};

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
    const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showSnackbar = (message: string, type: "success" | "error" = "success") => {
        setSnackbar({ message, type });
        setTimeout(() => setSnackbar(null), 5000);
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            {snackbar && (
                <div style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    padding: "12px 24px",
                    borderRadius: 8,
                    color: "#fff",
                    backgroundColor: snackbar.type === "success" ? "#4caf50" : "#f44336",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    zIndex: 1000,
                    fontWeight: "600",
                }}>
                    {snackbar.message}
                </div>
            )}
        </SnackbarContext.Provider>
    );
};
