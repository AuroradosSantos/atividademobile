import { cores } from "@/styles";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Contador() {
  const [valor, setValor] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityLabel="Diminuir contador" style={styles.botao} onPress={() => setValor((atual) => atual - 1)}>
        <Text style={styles.textoBotao}>-</Text>
      </Pressable>

      <Text style={styles.valor}>{valor}</Text>

      <Pressable accessibilityRole="button" accessibilityLabel="Aumentar contador" style={styles.botao} onPress={() => setValor((atual) => atual + 1)}>
        <Text style={styles.textoBotao}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    backgroundColor: cores.bgBrancoGelo,
  },
  botao: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.verde,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotao: {
    color: cores.branco,
    fontSize: 32,
    fontWeight: "700",
  },
  valor: {
    color: cores.preto,
    fontSize: 40,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "center",
  },
});
