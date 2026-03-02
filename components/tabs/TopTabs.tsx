import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export const TabScreen = ({
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return <>{children}</>;
};

export const TopTabs = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactElement<TabProps>[];
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Header — titre + pill switcher */}
      <View style={styles.header}>
        {title && <Text style={styles.headerTitle}>{title}</Text>}
        <View style={styles.tabs}>
          {children.map((child, index) => (
            <Pressable
              key={index}
              style={[styles.tab, activeTab === index && styles.tabActive]}
              onPress={() => setActiveTab(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === index && styles.tabTextActive,
                ]}
              >
                {child.props.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Contenu de l'onglet actif */}
      <View style={styles.content}>{children[activeTab]}</View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 14,
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.surfaceElevated,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 9,
      borderRadius: 9,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.textInverse,
    },
    content: {
      flex: 1,
    },
  });
