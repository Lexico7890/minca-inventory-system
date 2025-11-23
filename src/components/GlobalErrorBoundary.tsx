import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorFallback";
import type { ReactNode, ErrorInfo } from "react";

interface GlobalErrorBoundaryProps {
    children: ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
    const logError = (error: Error, info: ErrorInfo) => {
        // Aquí podrías enviar el error a un servicio de reporte de errores como Sentry
        console.error("Error capturado por GlobalErrorBoundary:", error, info);
    };

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={logError}
            onReset={() => {
                // Opcional: Resetear el estado de la aplicación aquí si es necesario
                // Por ejemplo, window.location.reload() si el error es crítico
                window.location.reload();
            }}
        >
            {children}
        </ErrorBoundary>
    );
}
