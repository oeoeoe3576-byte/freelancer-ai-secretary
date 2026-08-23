import React from 'react';
import { Modal, View, TouchableWithoutFeedback, StyleSheet, Platform } from 'react-native';
import { theme } from '../utils/theme';

// 모든 팝업이 공유하는 오버레이. 바깥(어두운 영역)을 누르면 닫히고,
// 내부 카드를 누르면 이벤트가 전파되지 않아 닫히지 않는다.
export default function ModalOverlay({ visible, onClose, children, align = 'bottom' }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.wrap, align === 'center' && styles.center]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.card, align === 'center' && styles.cardCenter]}>{children}</View>
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
});
