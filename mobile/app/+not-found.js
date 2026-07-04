import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="explore-off" size={80} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>404</Text>
          <Text style={styles.subtitle}>Oops! Page Not Found</Text>
          <Text style={styles.description}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </Text>

          <Link href="/" asChild>
            <TouchableOpacity style={StyleSheet.flatten([styles.button, theme.shadows.soft])}>
              <MaterialIcons name="home" size={20} color="#fff" />
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 72,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    lineHeight: 80,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
});
