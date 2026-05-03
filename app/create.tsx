import { Colors } from '@/constants/theme';
import { createDecision } from '@/utils/apiUtils';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MIN_OPTIONS = 2;

type DurationUnit = 'seconds' | 'minutes' | 'hours';

function durationToMs(amount: number, unit: DurationUnit): number {
  switch (unit) {
    case 'seconds':
      return amount * 1000;
    case 'minutes':
      return amount * 60 * 1000;
    case 'hours':
      return amount * 60 * 60 * 1000;
    default:
      return 0;
  }
}

const UNIT_LABEL: Record<DurationUnit, string> = {
  seconds: 'Seconds',
  minutes: 'Minutes',
  hours: 'Hours',
};

const CreateScreen = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [optionInputs, setOptionInputs] = useState<string[]>(['', '']);
  const [closeAfterAmount, setCloseAfterAmount] = useState('');
  const [closeAfterUnit, setCloseAfterUnit] = useState<DurationUnit>('minutes');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addOption = useCallback(() => {
    setOptionInputs((prev) => [...prev, '']);
  }, []);

  const removeOption = useCallback((index: number) => {
    setOptionInputs((prev) =>
      prev.length <= MIN_OPTIONS ? prev : prev.filter((_, i) => i !== index)
    );
  }, []);

  const setOptionAt = useCallback((index: number, value: string) => {
    setOptionInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const onSubmit = useCallback(async () => {
    setError(null);
    const trimmedTitle = title.trim();
    const options = optionInputs.map((o) => o.trim()).filter(Boolean);
    if (!trimmedTitle) {
      setError('Please enter a title.');
      return;
    }
    if (options.length < MIN_OPTIONS) {
      setError(`Add at least ${MIN_OPTIONS} options.`);
      return;
    }

    let closesAt: string | undefined;
    const durationRaw = closeAfterAmount.trim();
    if (durationRaw) {
      const n = Number(durationRaw);
      if (!Number.isFinite(n) || n <= 0) {
        setError('Close time must be a positive number.');
        return;
      }
      const ms = durationToMs(n, closeAfterUnit);
      if (ms <= 0 || !Number.isFinite(ms)) {
        setError('Close time is too small or invalid.');
        return;
      }
      closesAt = new Date(Date.now() + ms).toISOString();
    }

    setSubmitting(true);
    try {
      const created = await createDecision({
        title: trimmedTitle,
        options,
        closesAt,
      });
      router.replace({
        pathname: '/decision/[id]',
        params: { id: created.id },
      });
    } catch {
      setError('Could not create the decision. Check your network and API URL.');
    } finally {
      setSubmitting(false);
    }
  }, [title, optionInputs, closeAfterAmount, closeAfterUnit, router]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>New decision</Text>
        <Text style={styles.hint}>
          Add a short question and at least two choices. Others can join with the
          decision ID.
        </Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Where should we eat?"
          placeholderTextColor="#889"
          value={title}
          onChangeText={setTitle}
          editable={!submitting}
        />

        <Text style={styles.label}>Options</Text>
        {optionInputs.map((opt, index) => (
          <View key={index} style={styles.optionRow}>
            <TextInput
              style={[styles.input, styles.optionInput]}
              placeholder={`Option ${index + 1}`}
              placeholderTextColor="#889"
              value={opt}
              onChangeText={(v) => setOptionAt(index, v)}
              editable={!submitting}
            />
            {optionInputs.length > MIN_OPTIONS ? (
              <Pressable
                onPress={() => removeOption(index)}
                style={styles.removeBtn}
                disabled={submitting}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        ))}

        <Pressable
          onPress={addOption}
          style={styles.secondaryBtn}
          disabled={submitting}
        >
          <Text style={styles.secondaryBtnText}>+ Add option</Text>
        </Pressable>

        <Text style={styles.label}>Close after (optional)</Text>
        <Text style={styles.fieldHint}>
          Leave empty for no auto-close. Choose seconds, minutes, or hours.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 30"
          placeholderTextColor="#889"
          value={closeAfterAmount}
          onChangeText={setCloseAfterAmount}
          keyboardType="decimal-pad"
          editable={!submitting}
        />
        <View style={styles.unitRow}>
          {(['seconds', 'minutes', 'hours'] as const).map((unit) => {
            const selected = closeAfterUnit === unit;
            return (
              <Pressable
                key={unit}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={UNIT_LABEL[unit]}
                onPress={() => setCloseAfterUnit(unit)}
                disabled={submitting}
                style={[
                  styles.unitChip,
                  selected && styles.unitChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    selected && styles.unitChipTextSelected,
                  ]}
                >
                  {UNIT_LABEL[unit]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={onSubmit}
          style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Create</Text>
          )}
        </Pressable>

        <Pressable onPress={onBack} style={styles.linkBtn} disabled={submitting}>
          <Text style={styles.linkBtnText}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  hint: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 20,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
    marginTop: 12,
  },
  fieldHint: {
    fontSize: 13,
    color: Colors.light.icon,
    marginBottom: 8,
    lineHeight: 18,
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c9d6df',
    backgroundColor: '#fff',
  },
  unitChipSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: '#eef6fa',
  },
  unitChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  unitChipTextSelected: {
    color: Colors.light.tint,
  },
  input: {
    borderWidth: 1,
    borderColor: '#c9d6df',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
  },
  removeBtn: {
    padding: 10,
  },
  removeBtnText: {
    fontSize: 18,
    color: Colors.light.icon,
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  error: {
    color: '#c0392b',
    marginTop: 12,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  linkBtn: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  linkBtnText: {
    fontSize: 16,
    color: Colors.light.tint,
  },
});
