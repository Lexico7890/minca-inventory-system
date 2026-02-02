import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/shared/api/supabase";
import type {
  VoiceAgentStatus,
  VoiceAgentResponse,
  VoiceAgentHookError,
  UseVoiceAgentReturn,
  VoiceAgentErrorType,
} from "../model/types";

// Tipos para Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onspeechend: (() => void) | null;
  onnomatch: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// URL de la Edge Function
const EDGE_FUNCTION_URL =
  "https://xeypfdmbpkzkkfmthqwb.supabase.co/functions/v1/agent-voice";

// Helper para crear errores
function createError(
  type: VoiceAgentErrorType,
  message: string,
  recoverable = true
): VoiceAgentHookError {
  return { type, message, recoverable };
}

// Verificar soporte del navegador
function checkBrowserSupport(): boolean {
  const hasSpeechRecognition =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const hasSpeechSynthesis =
    typeof window !== "undefined" && "speechSynthesis" in window;

  return hasSpeechRecognition && hasSpeechSynthesis;
}

// Obtener la clase SpeechRecognition
function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useVoiceAgent(): UseVoiceAgentReturn {
  // Estados
  const [status, setStatus] = useState<VoiceAgentStatus>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [error, setError] = useState<VoiceAgentHookError | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Referencias
  const sessionIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isUnmountedRef = useRef(false);
  const isListeningRef = useRef(false);

  // Estados derivados
  const isListening = status === "listening";
  const isProcessing = status === "processing";
  const isSpeaking = status === "speaking";
  const isIdle = status === "idle";

  // Verificar soporte al montar
  useEffect(() => {
    const supported = checkBrowserSupport();
    setIsSupported(supported);

    if (!supported) {
      setError(
        createError(
          "speech_not_supported",
          "Tu navegador no soporta las APIs de voz. Prueba con Chrome, Edge o Safari.",
          false
        )
      );
    }

    return () => {
      isUnmountedRef.current = true;
      // Cleanup al desmontar
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Llamar a la Edge Function
  const callEdgeFunction = useCallback(
    async (pregunta: string): Promise<VoiceAgentResponse> => {
      // Obtener el token del usuario
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No hay sesión de usuario activa");
      }

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pregunta,
          session_id: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const data: VoiceAgentResponse = await response.json();

      // Guardar session_id para la siguiente petición
      if (data.session_id) {
        sessionIdRef.current = data.session_id;
      }

      return data;
    },
    []
  );

  // Text-to-Speech
  const speakResponse = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isUnmountedRef.current) {
        resolve();
        return;
      }

      // Cancelar cualquier síntesis anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Intentar usar una voz en español
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(
        (voice) =>
          voice.lang.startsWith("es") &&
          (voice.name.includes("Google") || voice.name.includes("Microsoft"))
      );
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      synthUtteranceRef.current = utterance;

      utterance.onend = () => {
        if (!isUnmountedRef.current) {
          setStatus("idle");
        }
        resolve();
      };

      utterance.onerror = (event) => {
        console.error("Error en síntesis de voz:", event);
        reject(new Error("Error al reproducir la respuesta"));
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Procesar el transcript
  const processTranscript = useCallback(
    async (text: string) => {
      if (isUnmountedRef.current || !text.trim()) {
        setStatus("idle");
        if (!text.trim()) {
          setError(
            createError(
              "no_speech_detected",
              "No te escuché, intenta de nuevo",
              true
            )
          );
        }
        return;
      }

      try {
        setStatus("processing");
        setTranscript(text);
        setError(null);

        // Llamar a la Edge Function
        const response = await callEdgeFunction(text);

        if (isUnmountedRef.current) return;

        // Guardar la respuesta
        setLastResponse(response.respuesta);

        // Mostrar errores del backend si los hay (pero continuar)
        if (response.errores && response.errores.length > 0) {
          console.warn("Errores del agente:", response.errores);
        }

        // Reproducir la respuesta
        setStatus("speaking");
        await speakResponse(response.respuesta);
      } catch (err) {
        if (isUnmountedRef.current) return;

        console.error("Error procesando:", err);

        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";

        if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
          setError(
            createError(
              "network_error",
              "Error de conexión. Verifica tu internet.",
              true
            )
          );
        } else if (errorMessage.includes("servidor") || errorMessage.includes("500")) {
          setError(
            createError(
              "api_error",
              "Error del servidor. Intenta de nuevo.",
              true
            )
          );
        } else {
          setError(createError("api_error", errorMessage, true));
        }

        setStatus("idle");
      }
    },
    [callEdgeFunction, speakResponse]
  );

  // Iniciar reconocimiento de voz
  const startListening = useCallback(() => {
    if (!isSupported || isListeningRef.current || status !== "idle") {
      return;
    }

    setError(null);
    setTranscript(null);

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      setError(
        createError(
          "speech_not_supported",
          "Tu navegador no soporta reconocimiento de voz",
          false
        )
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      let finalTranscript = "";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Mostrar transcript en tiempo real
        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Error de reconocimiento:", event.error);
        isListeningRef.current = false;

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setError(
            createError(
              "microphone_not_available",
              "No tienes permisos para usar el micrófono. Activa los permisos en tu navegador.",
              false
            )
          );
        } else if (event.error === "no-speech") {
          setError(
            createError(
              "no_speech_detected",
              "No te escuché, intenta de nuevo",
              true
            )
          );
        } else if (event.error === "network") {
          setError(
            createError(
              "network_error",
              "Error de conexión para reconocimiento de voz",
              true
            )
          );
        } else {
          setError(
            createError(
              "unknown_error",
              `Error de reconocimiento: ${event.error}`,
              true
            )
          );
        }

        setStatus("idle");
      };

      recognition.onend = () => {
        const wasListening = isListeningRef.current;
        isListeningRef.current = false;

        if (isUnmountedRef.current) return;

        // Si tenemos transcript, procesarlo
        if (finalTranscript.trim()) {
          processTranscript(finalTranscript);
        } else if (wasListening) {
          // No se detectó habla
          setError(
            createError(
              "no_speech_detected",
              "No te escuché, intenta de nuevo",
              true
            )
          );
          setStatus("idle");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      isListeningRef.current = true;
      setStatus("listening");
    } catch (err) {
      console.error("Error iniciando reconocimiento:", err);
      setError(
        createError(
          "microphone_not_available",
          "No se pudo acceder al micrófono",
          true
        )
      );
    }
  }, [isSupported, processTranscript]);

  // Detener reconocimiento de voz
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Cancelar síntesis de voz
  const cancelSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setStatus("idle");
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Resetear sesión
  const resetSession = useCallback(() => {
    sessionIdRef.current = null;
    setTranscript(null);
    setLastResponse(null);
    setError(null);
    setStatus("idle");
  }, []);

  // Cargar voces cuando estén disponibles
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Las voces pueden no estar disponibles inmediatamente
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  return {
    // Estados
    status,
    isListening,
    isProcessing,
    isSpeaking,
    isIdle,

    // Datos
    transcript,
    lastResponse,
    error,

    // Compatibilidad
    isSupported,

    // Acciones
    startListening,
    stopListening,
    cancelSpeaking,
    clearError,
    resetSession,
  };
}
