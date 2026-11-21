import { useAuth } from "@/hooks/use-auth";
import { useCidade } from "@/hooks/use-cidade";
import { criarReporte, TipoReporte } from "@/services/reportes";
import { cores } from "@/styles";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TIPOS: { valor: TipoReporte; rotulo: string }[] = [
  { valor: "buraco", rotulo: "Buraco" },
  { valor: "calçada", rotulo: "Calçada" },
  { valor: "iluminação", rotulo: "Iluminação" },
  { valor: "outro", rotulo: "Outro" },
];

export default function NovoReporte() {
  const roteador = useRouter();
  const { user: usuario } = useAuth();
  const { coordenadas } = useCidade();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<TipoReporte>("buraco");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!titulo.trim()) {
      Alert.alert("Título obrigatório", "Diga onde está o problema.");
      return;
    }
    if (!usuario) {
      Alert.alert("Login necessário", "Entre com a sua conta para reportar.");
      return;
    }
    if (!coordenadas) {
      Alert.alert("Localização indisponível", "Ative a localização do aparelho.");
      return;
    }

    setEnviando(true);
    try {
      // As coordenadas do GPS localizam o problema; a geocodificação reversa acrescenta um endereço legível.
      let endereco: string | undefined;
      try {
        const [local] = await Location.reverseGeocodeAsync(coordenadas);
        endereco = [local?.street, local?.streetNumber, local?.district, local?.city]
          .filter(Boolean)
          .join(", ") || undefined;
      } catch (erroEndereco) {
        console.warn("Não foi possível obter o endereço do reporte", erroEndereco);
      }

      await criarReporte({
        idNotificante: usuario.uid,
        titulo,
        descricao,
        tipo,
        endereco,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,
      });
      Alert.alert("Reporte enviado", "Obrigado por ajudar a cidade!", [
        { text: "OK", onPress: () => roteador.back() },
      ]);
    } catch (erro) {
      console.warn("Falha ao gravar o reporte", erro);
      Alert.alert("Não foi possível enviar", "Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Novo reporte</Text>
      <TextInput
        style={estilos.campo}
        placeholder="Título (ex.: Buraco na Rua das Palmeiras)"
        value={titulo}
        onChangeText={setTitulo}
        maxLength={100}
        accessibilityLabel="Título do reporte"
      />
      <Text style={estilos.rotulo}>Tipo do problema</Text>
      <View style={estilos.tipos}>
        {TIPOS.map((item) => (
          <Pressable
            key={item.valor}
            onPress={() => setTipo(item.valor)}
            accessibilityRole="radio"
            accessibilityState={{ selected: tipo === item.valor }}
            style={[estilos.tipo, tipo === item.valor && estilos.tipoSelecionado]}
          >
            <Text style={[estilos.textoTipo, tipo === item.valor && estilos.textoTipoSelecionado]}>{item.rotulo}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={[estilos.campo, estilos.campoGrande]}
        placeholder="Descrição (opcional)"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        maxLength={500}
        textAlignVertical="top"
        accessibilityLabel="Descrição do reporte"
      />
      <Pressable style={[estilos.botao, enviando && estilos.botaoDesabilitado]} onPress={enviar} disabled={enviando}>
        {enviando ? <ActivityIndicator color={cores.branco} /> : <Text style={estilos.textoBotao}>Enviar reporte</Text>}
      </Pressable>
      <Pressable onPress={() => roteador.back()} disabled={enviando}>
        <Text style={estilos.cancelar}>Cancelar</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, backgroundColor: cores.bgBrancoGelo },
  titulo: { fontSize: 22, fontWeight: "700", color: cores.preto },
  rotulo: { fontSize: 15, fontWeight: "600", color: cores.preto },
  campo: { backgroundColor: cores.branco, borderRadius: 12, padding: 14, fontSize: 15 },
  campoGrande: { minHeight: 100 },
  tipos: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tipo: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: cores.branco },
  tipoSelecionado: { borderColor: cores.verde, backgroundColor: "#e8f5ed" },
  textoTipo: { color: cores.preto, fontWeight: "500" },
  textoTipoSelecionado: { color: cores.verde, fontWeight: "700" },
  botao: { backgroundColor: cores.verde, borderRadius: 12, padding: 16, minHeight: 54, alignItems: "center", justifyContent: "center" },
  botaoDesabilitado: { opacity: 0.7 },
  textoBotao: { color: cores.branco, fontWeight: "700", fontSize: 16 },
  cancelar: { textAlign: "center", color: cores.cinzaEscuro, padding: 8 },
});
