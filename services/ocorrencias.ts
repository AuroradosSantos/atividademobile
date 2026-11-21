import { Coordenadas } from "@/context/cidade-context";
import { bancoDeDados } from "@/firebase-config";
import { Ocorrencia, StatusOcorrencia } from "@/types/ocorrencia";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";

/** Busca os últimos 50 reportes gerais ou os reportes de uma pessoa autenticada. */
export async function buscarOcorrencias(
  _centro: Coordenadas,
  idNotificante?: string | null,
): Promise<Ocorrencia[]> {
  if (idNotificante === null) return [];

  const referencia = collection(bancoDeDados, "ocorrencias");
  // O mapa recebe a consulta global mais recente; a lista pode pedir só os do usuário.
  const consulta = idNotificante
    ? query(referencia, where("idNotificante", "==", idNotificante))
    : query(referencia, orderBy("criadoEm", "desc"), limit(50));
  const resultado = await getDocs(consulta);

  // Convertemos os documentos do Firestore para o tipo usado pelas telas e pelo mapa.
  const ocorrencias = resultado.docs.map((documento) => {
    const dados = documento.data();
    const criadoEm = dados.criadoEm?.toDate?.();
    return {
      id: documento.id,
      titulo: typeof dados.titulo === "string" ? dados.titulo : "Reporte sem título",
      descricao: typeof dados.descricao === "string" ? dados.descricao : undefined,
      tipo: typeof dados.tipo === "string" ? dados.tipo : undefined,
      endereco: typeof dados.endereco === "string" ? dados.endereco : undefined,
      status: (dados.status ?? "aberto") as StatusOcorrencia,
      latitude: Number(dados.latitude),
      longitude: Number(dados.longitude),
      criadoEm: criadoEm instanceof Date ? criadoEm : undefined,
    };
  });

  if (!idNotificante) return ocorrencias;

  // Ordenar no app evita exigir um índice composto entre idNotificante e criadoEm.
  return ocorrencias
    .sort((a, b) => (b.criadoEm?.getTime() ?? 0) - (a.criadoEm?.getTime() ?? 0))
    .slice(0, 50);
}
