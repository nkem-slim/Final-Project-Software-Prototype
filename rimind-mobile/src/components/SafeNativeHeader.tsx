import React from "react";
import { Platform, StatusBar } from "react-native";
import {
  Header,
  getHeaderTitle,
  HeaderBackButton,
} from "@react-navigation/elements";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Replaces the native stack header with the JS Header so we always reserve
 * status-bar space. On Android edge-to-edge, safe-area top can read 0 after
 * the first frame; StatusBar.currentHeight is used as a fallback.
 */
export const SafeNativeHeader: React.FC<NativeStackHeaderProps> = (props) => {
  const insets = useSafeAreaInsets();
  const androidStatusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0;
  const statusBarPad = Math.max(insets.top, androidStatusBarHeight);

  const { options, route, navigation } = props;
  const title = getHeaderTitle(options, route.name);
  const canGoBack = navigation.canGoBack();

  const { header: _customHeader, ...headerFieldOptions } = options;

  const headerLeft =
    options.headerLeft ??
    ((btnProps) =>
      canGoBack ? (
        <HeaderBackButton
          {...btnProps}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
          }}
        />
      ) : null);

  return (
    <Header
      {...headerFieldOptions}
      title={title}
      headerLeft={headerLeft}
      headerStatusBarHeight={statusBarPad}
      headerTintColor={options.headerTintColor ?? "#fff"}
    />
  );
};
