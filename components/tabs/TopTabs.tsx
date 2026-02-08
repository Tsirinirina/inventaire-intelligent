import { useTheme } from "@/theme/ThemeProvider";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TabProps {
  label: string;
  children: React.ReactNode;
}

// This acts as a placeholder for the tab content
export const TabScreen = ({
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return <>{children}</>;
};

export const TopTabs = ({
  children,
}: {
  children: React.ReactElement<TabProps>[];
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {children.map((child, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tabItem, activeTab === index && styles.activeTab]}
            onPress={() => setActiveTab(index)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === index && styles.activeLabel,
              ]}
            >
              {child.props.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>{children[activeTab]}</View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    tabBar: {
      flexDirection: "row",
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.primaryDark,
      borderRadius: 18,
      padding: 4,
      overflow: "hidden",
      elevation: 5,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabLabel: {
      color: colors.primaryDark,
      fontWeight: "600",
      fontSize: 16,
    },
    activeLabel: {
      color: colors.textInverse,
    },
    content: {
      flex: 1,
    },
  });
