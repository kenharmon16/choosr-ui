import DecisionButton from '@/components/DecisionButton';
import { useAppContext } from '@/providers/AppProvider';
import { getDecisions } from '@/utils/apiUtils';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Decision {
    title: string;
    description: string;
}

const DecisionSelection = () => {
    const [decisionResponseData, setDecisionResponseData] = useState<Decision[]>();
    const router = useRouter();
    const { setDecisionData } = useAppContext();

    useEffect(() => {
        (async () => {
            const decisionResponse = await getDecisions();
            setDecisionResponseData(decisionResponse)
        })();
    }, []);

    const onBackSelect = () => {
        router.navigate('/');
    }

    const onDecisionButtonSelect = (decision: Decision) => {
        setDecisionData(decision);
        router.navigate('/vote');
    }

    return (
        <SafeAreaView style={styles.container}>
            <Button 
                title='Back'
                onPress={onBackSelect}/>
            <Text>How should we decide?</Text>
            {
                decisionResponseData && decisionResponseData.map((decision: Decision) => (
                    <DecisionButton
                        key={decision?.title}
                        title={decision?.title} 
                        description={decision.description} 
                        onPress={() => onDecisionButtonSelect(decision)}/>
                ))
            }
        </SafeAreaView>
    );
}

export default DecisionSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
  },
});