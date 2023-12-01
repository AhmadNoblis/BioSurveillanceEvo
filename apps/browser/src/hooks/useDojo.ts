import { useLocalStorage } from "./useLocalStorage";
import { useState } from "react";

export interface DojoConfig {
  openAiApiKey: string | null;
  allowTelemetry: boolean;
  loaded: boolean;
  complete: boolean;
}

export interface Dojo {
  config: DojoConfig;
  error?: string;
}

export function useDojo() {
  const [localOpenAiApiKey, setLocalOpenAiApiKey] = useLocalStorage<
    string | null
  >("openai-api-key", null);
  const [allowTelemetry, setAllowTelemetry] = useLocalStorage(
    "allow-telemetry",
    false
  );

  const [dojo, setDojo] = useState<Dojo>({
    config: {
      openAiApiKey: localOpenAiApiKey,
      allowTelemetry,
      loaded: false,
      complete: false,
    },
    error: undefined,
  });

  const setDojoError = (error: string) => {
    setDojo({
      config: dojo.config,
      error
    })
  }

  const saveConfig = (apiKey: string, allowTelemetry: boolean) => {
    let complete = true;

    if (!apiKey) {
      complete = false;
      setLocalOpenAiApiKey(null);
    } else {
      setLocalOpenAiApiKey(apiKey);
    }

    setAllowTelemetry(allowTelemetry);

    setDojo({
      config: {
        openAiApiKey: apiKey,
        allowTelemetry,
        loaded: true,
        complete,
      },
      error: dojo.error
    });
  };

  return { dojo, setDojo, saveConfig, setDojoError };
}
