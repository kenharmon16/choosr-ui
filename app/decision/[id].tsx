import { Colors } from '@/constants/theme';
import type { Decision } from '@/types/decision';
import { getDecision, submitVote } from '@/utils/apiUtils';
import { formatDecisionResultsForShare } from '@/utils/shareResults';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DecisionScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const pollFailRef = useRef(0);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!id) {
        return;
      }
      const silent = opts?.silent ?? false;
      if (!silent) {
        setError(null);
      }
      try {
        const d = await getDecision(id);
        setDecision(d);
        setLastSyncedAt(new Date());
        pollFailRef.current = 0;
      } catch {
        if (!silent) {
          setError('Could not load this decision.');
          setDecision(null);
        } else {
          pollFailRef.current += 1;
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const POLL_MS = 3000;
  useEffect(() => {
    if (decision?.status !== 'OPEN' || !id) {
      return;
    }
    const t = setInterval(() => {
      if (pollFailRef.current > 5) {
        return;
      }
      load({ silent: true });
    }, POLL_MS);
    return () => clearInterval(t);
  }, [decision?.status, id, load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const totalVotes = decision?.options.reduce(
    (s, o) => s + (o.voteCount ?? 0),
    0
  );

  const onVote = useCallback(
    async (optionId: string) => {
      if (!id || voting) {
        return;
      }
      setVoteError(null);
      setVoting(true);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const updated = await submitVote(id, optionId);
        setDecision(updated);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        setVoteError('Could not record your vote. It may already be recorded or the poll closed.');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setVoting(false);
      }
    },
    [id, voting]
  );

  const onShareId = useCallback(async () => {
    if (!id) {
      return;
    }
    try {
      await Share.share({
        message: `Join my Choosr decision.\nDecision ID: ${id}`,
      });
    } catch {
      /* user dismissed */
    }
  }, [id]);

  const onShareResults = useCallback(async () => {
    if (!decision || decision.status !== 'CLOSED') {
      return;
    }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        title: `Results: ${decision.title}`,
        message: formatDecisionResultsForShare(decision),
      });
    } catch {
      /* user dismissed */
    }
  }, [decision]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  if (loading && !decision) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </SafeAreaView>
    );
  }

  if (error || !decision) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.centeredScroll}>
          <Text style={styles.errorTitle}>{error ?? 'Not found'}</Text>
          <Pressable onPress={onBack} style={styles.linkBtn}>
            <Text style={styles.linkBtnText}>Go back</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const isOpen = decision.status === 'OPEN';
  const showResults = decision.status === 'CLOSED';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Pressable onPress={onBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>{decision.title}</Text>
        <Text style={styles.meta}>
          {isOpen ? 'Open · Live updates' : 'Closed'}
          {decision.closesAt
            ? ` · Closes ${new Date(decision.closesAt).toLocaleString()}`
            : ''}
        </Text>
        {isOpen && lastSyncedAt ? (
          <Text style={styles.syncedHint}>
            Last refreshed {lastSyncedAt.toLocaleTimeString()}
          </Text>
        ) : null}

        <View style={styles.idCard}>
          <Text style={styles.idLabel}>Decision ID</Text>
          <Text style={styles.idValue} selectable>
            {decision.id}
          </Text>
          <Text style={styles.idCardHint}>
            Share this ID so others can open the same poll in Choosr.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share decision ID"
            onPress={onShareId}
            style={styles.shareBtn}
          >
            <Text style={styles.shareBtnText}>Share ID</Text>
          </Pressable>
        </View>

        {isOpen ? (
          <View style={styles.liveCard}>
            <Text style={styles.liveHeading}>Live results</Text>
            <Text style={styles.liveSub}>
              {totalVotes === 0
                ? 'No votes yet'
                : `${totalVotes} total ${totalVotes === 1 ? 'vote' : 'votes'}`}
            </Text>
            {decision.options.map((o) => {
              const c = o.voteCount ?? 0;
              const pct =
                totalVotes && totalVotes > 0
                  ? Math.round((c / totalVotes) * 100)
                  : 0;
              return (
                <View key={o.id} style={styles.liveRow}>
                  <View style={styles.liveRowTop}>
                    <Text style={styles.liveLabel}>{o.label}</Text>
                    <Text style={styles.liveCount}>
                      {c} ({pct}%)
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[styles.barFill, { width: `${pct}%` }]}
                    />
                  </View>
                </View>
              );
            })}

            {decision.voteActivity && decision.voteActivity.length > 0 ? (
              <>
                <Text style={styles.feedHeading}>Recent activity</Text>
                {decision.voteActivity.map((row, index) => (
                  <View
                    key={`${row.votedAt}-${index}`}
                    style={styles.feedRow}
                  >
                    <View style={styles.feedDot} />
                    <Text style={styles.feedText}>
                      <Text style={styles.feedOption}>{row.optionLabel}</Text>
                      {' · '}
                      {new Date(row.votedAt).toLocaleTimeString()}
                    </Text>
                  </View>
                ))}
              </>
            ) : totalVotes === 0 ? (
              <Text style={styles.feedEmpty}>Votes will appear here.</Text>
            ) : null}
          </View>
        ) : null}

        {showResults && decision.result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultHeading}>Result</Text>
            <Text style={styles.resultExplanation}>{decision.result.explanation}</Text>
            {decision.options.map((o) => (
              <View key={o.id} style={styles.tallyRow}>
                <Text style={styles.tallyLabel}>{o.label}</Text>
                <Text style={styles.tallyCount}>
                  {o.voteCount ?? 0} {o.voteCount === 1 ? 'vote' : 'votes'}
                </Text>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share results"
              onPress={onShareResults}
              style={styles.shareResultsBtn}
            >
              <Text style={styles.shareResultsBtnText}>Share results</Text>
            </Pressable>
          </View>
        ) : null}

        {isOpen && !decision.hasVoted ? (
          <View style={styles.voteSection}>
            <Text style={styles.voteHeading}>Cast your vote</Text>
            {voteError ? <Text style={styles.voteError}>{voteError}</Text> : null}
            {decision.options.map((o) => (
              <Pressable
                key={o.id}
                onPress={() => onVote(o.id)}
                disabled={voting}
                style={({ pressed }) => [
                  styles.optionBtn,
                  pressed && styles.optionBtnPressed,
                  voting && styles.optionBtnDisabled,
                ]}
              >
                <Text style={styles.optionBtnText}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {isOpen && decision.hasVoted ? (
          <View style={styles.recordedCard}>
            <Text style={styles.recordedText}>Your vote is recorded.</Text>
            <Text style={styles.recordedHint}>
              Live tallies above update as others vote.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DecisionScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  centeredScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  backLink: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  backLinkText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 6,
  },
  syncedHint: {
    fontSize: 12,
    color: Colors.light.icon,
    marginBottom: 16,
  },
  liveCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dfe7ee',
    marginBottom: 20,
  },
  liveHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  liveSub: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 14,
  },
  liveRow: {
    marginBottom: 12,
  },
  liveRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  liveLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    paddingRight: 8,
  },
  liveCount: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e8eef2',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.light.tint,
    minWidth: 2,
  },
  feedHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eef2f5',
  },
  feedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.tint,
    marginTop: 7,
  },
  feedText: {
    fontSize: 14,
    color: Colors.light.icon,
    flex: 1,
  },
  feedOption: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  feedEmpty: {
    fontSize: 13,
    color: Colors.light.icon,
    fontStyle: 'italic',
    marginTop: 4,
  },
  idCard: {
    backgroundColor: '#eef6fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#c9d6df',
  },
  idLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  idValue: {
    fontSize: 15,
    color: Colors.light.text,
    marginTop: 6,
    fontFamily: 'monospace',
  },
  idCardHint: {
    fontSize: 13,
    color: Colors.light.icon,
    marginTop: 10,
    lineHeight: 18,
  },
  shareBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  shareResultsBtn: {
    alignSelf: 'stretch',
    marginTop: 16,
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareResultsBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dfe7ee',
    marginBottom: 20,
  },
  resultHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  resultExplanation: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dfe7ee',
  },
  tallyLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  tallyCount: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  voteSection: {
    marginTop: 8,
  },
  voteHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  voteError: {
    color: '#c0392b',
    marginBottom: 10,
    fontSize: 14,
  },
  optionBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#20232a',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optionBtnPressed: {
    backgroundColor: '#eef6fa',
  },
  optionBtnDisabled: {
    opacity: 0.6,
  },
  optionBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#20232a',
    textAlign: 'center',
  },
  recordedCard: {
    backgroundColor: '#e8f6ef',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#b8dfc9',
  },
  recordedText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e6b45',
  },
  recordedHint: {
    fontSize: 14,
    color: '#2d8659',
    marginTop: 6,
    lineHeight: 20,
  },
  linkBtn: {
    padding: 12,
  },
  linkBtnText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '600',
  },
});
