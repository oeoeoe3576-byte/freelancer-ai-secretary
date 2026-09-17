import React, { useRef, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet, Animated, PanResponder } from 'react-native';
import { theme } from '../utils/theme';

const THRESHOLD = 60;
const MAX_PULL = 92;

// react-native-web의 RefreshControl은 빈 View만 그리고 실제로는 동작하지 않으므로
// (네이티브에서만 동작하는 스텁), 웹에서도 "당겨서 새로고침"이 되도록 직접 만든 ScrollView.
// 맨 위에서 아래로 당길 때만 반응하고, 다른 속성은 일반 ScrollView처럼 그대로 넘긴다.
export default function PullToRefreshScrollView({ onRefresh, children, style, ...rest }) {
  const [refreshing, setRefreshing] = useState(false);
  const atTop = useRef(true);
  const pulling = useRef(false);
  const pull = useRef(new Animated.Value(0)).current;

  const finishPull = (toValue) => {
    Animated.spring(pull, { toValue, useNativeDriver: false, bounciness: 0 }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gesture) =>
        atTop.current && !refreshing && gesture.dy > 10 && gesture.dy > Math.abs(gesture.dx) * 1.3,
      onPanResponderMove: (evt, gesture) => {
        if (gesture.dy > 0) {
          pulling.current = true;
          pull.setValue(Math.min(gesture.dy * 0.5, MAX_PULL));
        }
      },
      onPanResponderRelease: (evt, gesture) => {
        const pulled = pulling.current;
        pulling.current = false;
        if (pulled && gesture.dy * 0.5 >= THRESHOLD) {
          setRefreshing(true);
          finishPull(46);
          Promise.resolve(onRefresh?.()).finally(() => {
            setTimeout(() => { setRefreshing(false); finishPull(0); }, 350);
          });
        } else {
          finishPull(0);
        }
      },
      onPanResponderTerminate: () => { pulling.current = false; finishPull(0); },
    })
  ).current;

  return (
    <View style={[styles.wrap, style]} {...panResponder.panHandlers}>
      <Animated.View style={[styles.indicator, { height: pull }]}>
        {refreshing ? (
          <ActivityIndicator color={theme.primary} size="small" />
        ) : (
          <Text style={styles.indicatorText}>↓ 당겨서 새로고침</Text>
        )}
      </Animated.View>
      <ScrollView
        {...rest}
        onScroll={(e) => {
          atTop.current = e.nativeEvent.contentOffset.y <= 0;
          rest.onScroll?.(e);
        }}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, userSelect: 'none' },
  indicator: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  indicatorText: { fontSize: 11.5, color: theme.textSub, fontWeight: '700' },
});
