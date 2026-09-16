import React, { useRef } from 'react';
import { Modal, View, TouchableWithoutFeedback, StyleSheet, Platform, Animated, PanResponder } from 'react-native';
import { theme } from '../utils/theme';

// 모든 팝업이 공유하는 오버레이. 바깥(어두운 영역)을 누르면 닫히고,
// 내부 카드를 누르면 이벤트가 전파되지 않아 닫히지 않는다.
// 하단에서 올라오는 시트(align='bottom')는 위쪽 손잡이를 손가락으로 아래로 끌면 닫힌다.
export default function ModalOverlay({ visible, onClose, children, align = 'bottom' }) {
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gesture) => gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (evt, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (evt, gesture) => {
        if (gesture.dy > 90 || gesture.vy > 0.8) {
          Animated.timing(translateY, { toValue: 700, duration: 180, useNativeDriver: true }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.wrap, align === 'center' && styles.center]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View style={[styles.card, align === 'center' && styles.cardCenter, align !== 'center' && { transform: [{ translateY }] }]}>
              {align !== 'center' && (
                <View {...panResponder.panHandlers} style={styles.handleArea}>
                  <View style={styles.handle} />
                </View>
              )}
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.overlay, justifyContent: 'flex-end' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: theme.card,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 38 : 22,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: '90%',
  },
  cardCenter: { borderRadius: theme.radius.lg, width: '100%', maxWidth: 420, maxHeight: '80%' },
  handleArea: { alignItems: 'center', marginTop: -10, paddingTop: 2, paddingBottom: 10 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#D8DBE0' },
});
