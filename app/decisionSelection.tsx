import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DecisionSelection = () => {
    const router = useRouter();

    const onBackSelect = () => {
        router.navigate('/');
    }

    return (
        <SafeAreaView style={styles.container}>
            <Button 
                title='Back'
                onPress={onBackSelect}/>
            <Text>How should we decide?</Text>
            {/* We should make a network call to the backend to fetch the list of decision types */}
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