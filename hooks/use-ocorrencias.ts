import { Coordenadas } from "@/context/cidade-context";
import { buscarOcorrencias } from "@/services/ocorrencias";
import { Ocorrencia } from "@/types/ocorrencia";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

/** Recarrega ao entrar na tela ou ao voltar para ela depois de criar um reporte. */
export function useOcorrencias(
  coordenadas: Coordenadas | null,
  idNotificante?: string | null,
) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [carregando, setCarregando] = useState(false);
  const telaAtiva = useRef(false);

  const atualizar = useCallback(async () => {
    if (!coordenadas) {
      if (telaAtiva.current) {
        setOcorrencias([]);
        setCarregando(false);
      }
      return;
    }
    if (telaAtiva.current) setCarregando(true);
    try {
      const lista = await buscarOcorrencias(coordenadas, idNotificante);
      if (telaAtiva.current) setOcorrencias(lista);
    } catch (erro) {
      console.warn("Falha ao carregar reportes", erro);
    } finally {
      if (telaAtiva.current) setCarregando(false);
    }
  }, [coordenadas, idNotificante]);

  useFocusEffect(
    useCallback(() => {
      telaAtiva.current = true;
      void atualizar();
      return () => {
        telaAtiva.current = false;
      };
    }, [atualizar]),
  );

  return { ocorrencias, carregando, atualizar };
}
