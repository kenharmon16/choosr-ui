import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface DecisionButtonProps {
    onPress: () => void;
    title: string
    description?: string
}

const DecisionButton: React.FC<DecisionButtonProps> = ({onPress, title, description}) => {

    return (
        <Pressable onPress={onPress} style={styles.button}>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
        </Pressable>
    );
}

export default DecisionButton;

const styles = StyleSheet.create({
    button: {
        borderColor: '#20232a',
        borderRadius: 6,
        borderWidth: 1,
        borderStyle: 'solid',
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        minWidth: 220,
        marginVertical: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#20232a',
    },
    description: {
        fontSize: 12,
        color: '#333',
        marginTop: 6,
    }
})