import { StyleSheet, Text, View } from "react-native";

interface SummaryItem {
  label: string;
  value: string;
}

interface SummaryStripProps {
  items: SummaryItem[];
}

export const SummaryStrip = ({ items }: SummaryStripProps) => (
  <View style={styles.container}>
    {items.map((item) => (
      <View key={item.label} style={styles.card}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.value}>{item.value}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  card: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  label: {
    fontSize: 13,
    color: "#5c7188"
  },
  value: {
    marginTop: 6,
    fontSize: 28,
    color: "#122238",
    fontWeight: "800"
  }
});
