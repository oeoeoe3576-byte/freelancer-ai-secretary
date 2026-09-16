import { Alert, Platform } from 'react-native';

// react-native-web의 Alert.alert()는 아무 동작도 하지 않는 빈 함수라(no-op),
// 웹 빌드에서는 "브랜드를 선택해주세요" 같은 검증 메시지가 전부 조용히 씹혀서
// 버튼을 눌러도 아무 반응이 없는 것처럼 보인다. 웹에서는 window.alert로 대체한다.
export function notify(title, message) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    return;
  }
  Alert.alert(title, message);
}

// 버튼이 여러 개인 Alert.alert(title, message, buttons)도 웹에서 동작하도록 감싼다.
// 웹에는 네이티브 액션시트가 없으니, 버튼 개수만큼 confirm을 순서대로 물어 하나를 고르게 한다.
export function notifyWithActions(title, message, buttons) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    if (!buttons || buttons.length <= 1) {
      window.alert(message ? `${title}\n\n${message}` : title);
      buttons?.[0]?.onPress?.();
      return;
    }
    const cancelBtn = buttons.find(b => b.style === 'cancel');
    const choices = buttons.filter(b => b !== cancelBtn);
    for (const b of choices) {
      if (window.confirm(`${title}${message ? '\n' + message : ''}\n\n[확인 = ${b.text}]`)) {
        b.onPress?.();
        return;
      }
    }
    cancelBtn?.onPress?.();
    return;
  }
  Alert.alert(title, message, buttons);
}
