export type StatusOcorrencia = "aberto" | "em_execucao" | "resolvido";

export type Ocorrencia = {
  id: string;
  titulo: string;
  descricao?: string;
  tipo?: string;
  endereco?: string;
  status: StatusOcorrencia;
  latitude: number;
  longitude: number;
  criadoEm?: Date;
};
