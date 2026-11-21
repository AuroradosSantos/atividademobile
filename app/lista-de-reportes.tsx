import { STATUS } from "@/constants/status";
import { useAuth } from "@/hooks/use-auth";
import { useCidade } from "@/hooks/use-cidade";
import { useOcorrencias } from "@/hooks/use-ocorrencias";
import { cores } from "@/styles";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListaDeReportes() {
  const { coordenadas } = useCidade();
  const { user } = useAuth();
  const { ocorrencias, carregando, atualizar } = useOcorrencias(coordenadas, user?.uid ?? null);

  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Reportes</Text>
      {carregando && ocorrencias.length === 0 && <ActivityIndicator color={cores.verde} />}
      <FlatList
        data={ocorrencias}
        keyExtractor={(ocorrencia) => ocorrencia.id}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={atualizar} tintColor={cores.verde} colors={[cores.verde]} />}
        ListEmptyComponent={!carregando ? <Text style={estilos.vazio}>{user ? "Você ainda não criou reportes." : "Entre na sua conta para ver seus reportes."}</Text> : undefined}
        renderItem={({ item }) => (
          <View style={estilos.cartao}>
            <View style={[estilos.bolinha, { backgroundColor: STATUS[item.status]?.cor ?? cores.cinzaClaro }]} />
            <View style={estilos.textos}>
              <Text style={estilos.tituloReporte}>{item.titulo}</Text>
              {item.tipo && <Text style={estilos.detalhe}>Tipo: {item.tipo}</Text>}
              {item.descricao && <Text style={estilos.descricao}>{item.descricao}</Text>}
              {item.endereco && <Text style={estilos.detalhe}>{item.endereco}</Text>}
              <Text style={estilos.situacao}>{STATUS[item.status]?.rotulo ?? "Aberto"}</Text>
              {item.criadoEm && <Text style={estilos.data}>{item.criadoEm.toLocaleString("pt-BR")}</Text>}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: cores.bgBrancoGelo },
  titulo: { fontSize: 22, fontWeight: "700", color: cores.preto, marginBottom: 12 },
  vazio: { textAlign: "center", color: cores.cinzaEscuro, marginTop: 24 },
  cartao: { flexDirection: "row", gap: 12, backgroundColor: cores.branco, borderRadius: 12, padding: 14, marginBottom: 10 },
  bolinha: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  textos: { flex: 1 },
  tituloReporte: { fontSize: 16, fontWeight: "700", color: cores.preto },
  descricao: { fontSize: 14, color: cores.cinzaEscuro, marginTop: 4 },
  detalhe: { fontSize: 13, color: cores.cinzaEscuro, marginTop: 4 },
  situacao: { fontSize: 12, color: cores.cinzaClaro, marginTop: 6 },
  data: { fontSize: 12, color: cores.cinzaClaro, marginTop: 3 },
});
