import { Feather } from "@expo/vector-icons";
import { useSignIn, useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { useTopInset } from "@/components/ui";

WebBrowser.maybeCompleteAuthSession();

const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function SignInScreen() {
  useWarmUpBrowser();
  const colors = useColors();
  const topInset = useTopInset();
  const router = useRouter();
  const { signIn, errors: errorsRaw, fetchStatus } = useSignIn();
  const errors = errorsRaw as any;
  const { startSSOFlow } = useSSO();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  const finishNavigate = () => {
    // @ts-ignore
    const url = "/(tabs)";
    router.replace(url as Href);
  };

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: finishNavigate });
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const onGoogle = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      if (createdSessionId && setActive) {
        await setActive({
          session: createdSessionId,
          navigate: async () => finishNavigate(),
        });
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const busy = fetchStatus === "fetching";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topInset + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.closeBtn}
          testID="close-auth"
        >
          <Feather name="x" size={24} color={colors.mutedForeground} />
        </Pressable>

        <LinearGradient
          colors={[colors.gradientFrom, colors.gradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <Feather name="box" size={28} color="#fff" />
        </LinearGradient>

        <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Sign in to your BuildHub account
        </Text>

        <Pressable
          onPress={onGoogle}
          style={({ pressed }) => [
            styles.googleBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
            pressed && { opacity: 0.7 },
          ]}
          testID="google-signin"
        >
          <Feather name="chrome" size={18} color={colors.foreground} />
          <Text style={[styles.googleText, { color: colors.foreground }]}>Continue with Google</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="you@example.com"
          placeholderTextColor={colors.mutedForeground}
          onChangeText={setEmailAddress}
          keyboardType="email-address"
          testID="email-input"
        />
        {errors?.fields?.identifier ? (
          <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.identifier.message}</Text>
        ) : null}

        <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          onChangeText={setPassword}
          testID="password-input"
        />
        {errors?.fields?.password ? (
          <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.password.message}</Text>
        ) : null}
        {errors?.raw?.[0]?.message ? (
          <Text style={[styles.error, { color: colors.destructive }]}>{errors.raw[0].message}</Text>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={!emailAddress || !password || busy}
          style={({ pressed }) => [{ opacity: !emailAddress || !password || busy ? 0.5 : pressed ? 0.9 : 1, marginTop: 8 }]}
          testID="submit-signin"
        >
          <LinearGradient
            colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign in</Text>}
          </LinearGradient>
        </Pressable>

        <View style={styles.linkRow}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            Don&apos;t have an account?{" "}
          </Text>
          <Link href={"/(auth)/sign-up" as Href} replace>
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingBottom: 60, alignItems: "stretch" },
  closeBtn: { position: "absolute", right: 20, top: 8, zIndex: 10 },
  logo: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, textAlign: "center", marginTop: 20 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", marginTop: 6, marginBottom: 28 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  googleText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 22 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 7, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontFamily: "Inter_400Regular", fontSize: 15, marginBottom: 12 },
  error: { fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: -6, marginBottom: 10 },
  primaryBtn: { paddingVertical: 15, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 16 },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
});
