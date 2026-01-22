import { Image, Linking, StyleSheet, Text } from "react-native";



interface ParsedContentProps {
    text: string;
}

const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(mailto:[^\s]+)|(\+?\d[\d\s-]{7,}\d)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(#\w+)/g;
const imageExtensions = /\.(jpeg|jpg|gif|png|webp|avif|svg)$/i;

export function ParsedContent({ text }: ParsedContentProps) {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const matches = [...text.matchAll(urlRegex)];

    matches.forEach((match) => {
        const matchText = match[0];
        const index = match.index || 0;

        // Add text before match
        if (index > lastIndex) {
            elements.push(text.slice(lastIndex, index));
        }

        // Handle image URLs
        if (imageExtensions.test(matchText)) {
            elements.push(
                <Image
                    key={index}
                    source={{ uri: matchText.startsWith('http') ? matchText : 'https://' + matchText }}
                    style={{ width: '100%', height: 200, borderRadius: 12, marginVertical: 8 }}
                    resizeMode="cover"
                />
            );
        }
        // Handle website URLs
        else if (matchText.startsWith('http') || matchText.startsWith('www')) {
            const url = matchText.startsWith('http') ? matchText : 'https://' + matchText;
            elements.push(
                <Text key={index} style={styles.link} onPress={() => Linking.openURL(url)}>
                    {matchText}
                </Text>
            );
        }
        // Handle email
        else if (matchText.includes('@')) {
            elements.push(
                <Text key={index} style={styles.link} onPress={() => Linking.openURL(`mailto:${matchText}`)}>
                    {matchText}
                </Text>
            );
        }
        // Handle phone numbers
        else if (matchText.replace(/\D/g, '').length >= 8) {
            elements.push(
                <Text key={index} style={styles.link} onPress={() => Linking.openURL(`tel:${matchText.replace(/\s|-/g, '')}`)}>
                    {matchText}
                </Text>
            );
        }
        // Handle hashtags
        else if (matchText.startsWith('#')) {
            elements.push(
                <Text key={index} style={styles.hashtag}>
                    {matchText}
                </Text>
            );
        }
        // Default fallback
        else {
            elements.push(matchText);
        }

        lastIndex = index + matchText.length;
    });

    // Remaining text after last match
    if (lastIndex < text.length) {
        elements.push(text.slice(lastIndex));
    }

    return <Text style={styles.text}>{elements}</Text>;
}
const styles = StyleSheet.create({
    text: {
        color: '#374151',
        lineHeight: 22,
        fontSize: 14,
    },
    link: {
        color: '#2563EB',
        textDecorationLine: 'underline',
    },
    hashtag: {
        color: '#10B981',
        fontWeight: '600',
    },
});