import { bancoDeDados } from "@/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export type TipoReporte = "buraco" | "calçada" | "iluminação" | "outro";

export type DadosDoReporte = {
  idNotificante: string;
  titulo: string;
  descricao: string;
  tipo: TipoReporte;
  endereco?: string;
  latitude: number;
  longitude: number;
};

/**
 * Cria um documento com ID automático na coleção ocorrencias.
 * O status inicial e a data do servidor são definidos aqui para manter os registros consistentes.
 */
export async function criarReporte(dados: DadosDoReporte): Promise<string> {
  const documento = await addDoc(collection(bancoDeDados, "ocorrencias"), {
    idNotificante: dados.idNotificante,
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim() || null,
    tipo: dados.tipo,
    endereco: dados.endereco?.trim() || null,
    status: "aberto",
    latitude: dados.latitude,
    longitude: dados.longitude,
    criadoEm: serverTimestamp(),
  });

  return documento.id;
}
