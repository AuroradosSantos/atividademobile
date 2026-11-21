import { auth } from "@/firebase-config";
import Constants, { AppOwnership } from "expo-constants";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { Platform } from "react-native";
import { useEffect, useState } from "react";

// Necessário para o popup/browser de login fechar e devolver o resultado pro app.
WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  // O Google exige um cliente OAuth específico para cada plataforma.
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const clientIdDaPlataforma =
    Platform.OS === "android"
      ? androidClientId
      : Platform.OS === "ios"
        ? iosClientId
        : webClientId;
  const clienteAusente = !clientIdDaPlataforma;
  const usandoExpoGo =
    Platform.OS !== "web" && Constants.appOwnership === AppOwnership.Expo;

  // O Expo Go usa um esquema reservado que o Google não aceita com cliente Web.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
    // Sem ID nativo, não deixa a biblioteca reaproveitar o cliente Web.
    clientId: clientIdDaPlataforma ?? "",
  });

  // Erro do próprio login com o Google (ex: usuário cancelou, client id errado).
  const [error, setError] = useState<string | null>(null);

  // TEMPORÁRIO: mostra no terminal a redirect URI exata que está sendo usada,
  // pra cadastrar certinho em Authorized redirect URIs / JavaScript origins
  // no Google Cloud Console. Pode remover depois de resolver o redirect_uri_mismatch.
  useEffect(() => {
    if (request?.redirectUri) {
      console.log("Google OAuth redirectUri:", request.redirectUri);
    }
  }, [request?.redirectUri]);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      // Troca o id_token do Google por uma credencial que o Firebase entende,
      // e loga o usuário no Firebase Auth. Isso é o que dispara o
      // onAuthStateChanged no AuthProvider e atualiza o `user` global.
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch((err) => {
        setError(err.message);
      });
    } else if (response?.type === "error") {
      setError(response.error?.message ?? "Erro ao logar com o Google");
    }
  }, [response]);

  const erroConfiguracao = usandoExpoGo
    ? "O login Google não funciona pelo Expo Go. Instale um development build do app para testar no celular."
    : clienteAusente
    ? Platform.OS === "android"
      ? "No Android, o login Google precisa de um cliente OAuth Android e de um development build; não funciona pelo Expo Go."
      : Platform.OS === "ios"
        ? "No iPhone, o login Google precisa de um cliente OAuth iOS e de um development build."
        : "Configure o cliente OAuth Web para entrar com Google."
    : null;

  return {
    request,
    promptAsync,
    error: error ?? erroConfiguracao,
    loginDisponivel: !!request && !clienteAusente && !usandoExpoGo,
  };
}
