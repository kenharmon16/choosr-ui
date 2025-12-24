import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomePage = () => {
    const router = useRouter();

    const onCreateDecisionClick = () => {
        router.navigate('/decisionSelection');
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>choosr</Text>
            <Button 
                title='Create Decision'
                onPress={onCreateDecisionClick}/>
        </SafeAreaView>
    )
}

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
  },
  text: {
    fontSize: 18,
    color: '#111',
  },
  textBox: {
    borderWidth: 1
  }
});