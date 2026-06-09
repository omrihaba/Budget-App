import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBillReminder(
  title: string,
  amount: number,
  dueDate: Date
): Promise<string> {
  const granted = await requestPermission();
  if (!granted) return '';

  // remind 3 days before at 9 AM
  const trigger = new Date(dueDate);
  trigger.setDate(trigger.getDate() - 3);
  trigger.setHours(9, 0, 0, 0);

  if (trigger <= new Date()) return '';

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bill Due Soon',
        body: `${title} — ${amount.toFixed(0)}₪ is due in 3 days`,
        sound: true,
      },
      trigger: { date: trigger, type: Notifications.SchedulableTriggerInputTypes.DATE },
    });
  } catch {
    return '';
  }
}

export async function cancelReminder(notificationId: string): Promise<void> {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}
