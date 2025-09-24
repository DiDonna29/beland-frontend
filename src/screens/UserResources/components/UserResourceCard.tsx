import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Clock, Gift, Ticket } from "lucide-react-native";

const UserResourceCard: React.FC<{
  item: any;
  onUse?: (item: any) => void;
  onDetails?: (item: any) => void;
}> = ({ item, onUse, onDetails }) => {
  const resource = item.resource || {};
  const name = resource.name || item.resource_name || item.resource_name;
  const image = resource.url_image || resource.resource_img || null;
  const quantity = item.quantity || 1;
  const expiresAt = item.expires_at ? new Date(item.expires_at) : null;
  const isExpired = expiresAt ? expiresAt.getTime() < Date.now() : false;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Gift size={28} color="#FF6B35" />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.row}>
          <View style={styles.chip}>
            <Ticket size={14} color="#555" />
            <Text style={styles.chipText}> x{quantity}</Text>
          </View>

          {expiresAt && (
            <View style={[styles.chip, isExpired && styles.chipExpired]}>
              <Clock size={14} color={isExpired ? "#A0A0A0" : "#555"} />
              <Text
                style={[styles.chipText, isExpired && { color: "#A0A0A0" }]}
              >
                {" "}
                {expiresAt.toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.useButton, isExpired && { backgroundColor: "#CCC" }]}
          onPress={() => onUse && onUse(item)}
          disabled={isExpired}
        >
          <Text style={styles.useText}>{isExpired ? "Vencido" : "Usar"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDetails && onDetails(item)}
          style={styles.detailsBtn}
        >
          <Text style={styles.detailsText}>Detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  left: { marginRight: 12 },
  image: { width: 72, height: 72, borderRadius: 10 },
  placeholder: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#FFF6F0",
    justifyContent: "center",
    alignItems: "center",
  },
  body: { flex: 1, justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  row: { flexDirection: "row", marginTop: 8, alignItems: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: { fontSize: 12, color: "#374151", marginLeft: 6 },
  chipExpired: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actions: { justifyContent: "center", alignItems: "flex-end" },
  useButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  useText: { color: "#fff", fontWeight: "700" },
  detailsBtn: { marginTop: 8 },
  detailsText: { color: "#6B7280", fontSize: 13 },
});

export default UserResourceCard;
