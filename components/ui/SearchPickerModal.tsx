import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import { Check, ChevronDown, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  labelStyle?: object;
  error?: string;
}

export function SearchPickerModal({
  label,
  placeholder,
  value,
  options,
  onSelect,
  labelStyle,
  error,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const handleSelect = (val: string) => {
    onSelect(val);
    setVisible(false);
    setQuery("");
  };

  const handleClose = () => {
    setVisible(false);
    setQuery("");
  };

  return (
    <>
      {/* ── Champ déclencheur ── */}
      <View style={styles.group}>
        {label ? (
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        ) : null}
        <Pressable
          style={[styles.trigger, error ? styles.triggerError : undefined]}
          onPress={() => setVisible(true)}
        >
          <Text
            style={value ? styles.triggerValue : styles.triggerPlaceholder}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
          <ChevronDown size={18} color={colors.textMuted} />
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {/* ── Bottom-sheet modal ── */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        {/* Sheet */}
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* En-tête */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <X size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Barre de recherche */}
          <View style={styles.searchBar}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor={colors.inputPlaceholder}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Liste filtrée */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => {
              const isSelected = item === value;
              return (
                <Pressable
                  style={[styles.option, isSelected && styles.optionActive]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Check size={16} color={colors.primary} strokeWidth={2.5} />
                  )}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Aucun résultat pour « {query} »</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // ── Trigger ──
    group: {
      gap: 8,
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      gap: 8,
    },
    triggerError: {
      borderColor: colors.danger,
    },
    triggerValue: {
      flex: 1,
      fontSize: 16,
      color: colors.inputText,
    },
    triggerPlaceholder: {
      flex: 1,
      fontSize: 16,
      color: colors.inputPlaceholder,
    },
    error: {
      fontSize: 13,
      color: colors.danger,
    },

    // ── Modal ──
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "75%",
      paddingTop: 12,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 12,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },

    // ── Recherche ──
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceElevated,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.inputText,
    },

    // ── Liste ──
    list: {
      paddingHorizontal: 8,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderRadius: 10,
    },
    optionActive: {
      backgroundColor: colors.primary + "14",
    },
    optionText: {
      fontSize: 15,
      color: colors.text,
      flex: 1,
    },
    optionTextActive: {
      color: colors.primary,
      fontWeight: "600",
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    },
    empty: {
      paddingVertical: 32,
      alignItems: "center",
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
    },
  });
