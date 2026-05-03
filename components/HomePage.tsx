import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomePage = () => {
  const router = useRouter();
  const [joinId, setJoinId] = useState('');

  const onCreateDecision = useCallback(() => {
    router.push('/create');
  }, [router]);

  const onJoin = useCallback(() => {
    const id = joinId.trim();
    if (!id) {
      return;
    }
    router.push({ pathname: '/decision/[id]', params: { id } });
  }, [joinId, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>choosr</Text>
        <Text style={styles.tagline}>
          Fair group decisions—fast. No sign-up required.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create decision"
          onPress={onCreateDecision}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.primaryBtnPressed,
          ]}
        >
          <Text style={styles.primaryBtnText}>Create decision</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or join with ID</Text>
          <View style={styles.divider} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Paste decision ID"
          placeholderTextColor="#889"
          value={joinId}
          onChangeText={setJoinId}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open decision"
          onPress={onJoin}
          style={({ pressed }) => [
            styles.secondaryBtn,
            !joinId.trim() && styles.secondaryBtnDisabled,
            pressed && joinId.trim() && styles.secondaryBtnPressed,
          ]}
          disabled={!joinId.trim()}
        >
          <Text
            style={[
              styles.secondaryBtnText,
              !joinId.trim() && styles.secondaryBtnTextDisabled,
            ]}
          >
            Open decision
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.light.tint,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 36,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  primaryBtn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 10,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#c9d6df',
  },
  dividerText: {
    fontSize: 13,
    color: Colors.light.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#c9d6df',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  secondaryBtn: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnDisabled: {
    borderColor: '#b8c5ce',
  },
  secondaryBtnPressed: {
    backgroundColor: '#eef6fa',
  },
  secondaryBtnText: {
    color: Colors.light.tint,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtnTextDisabled: {
    color: '#b8c5ce',
  },
});
