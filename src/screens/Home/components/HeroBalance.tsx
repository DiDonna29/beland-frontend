import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WalletBalanceCard } from "../../Wallet/components/WalletBalanceCard";
import { colors } from "../../../styles/colors";

import { WalletData } from "../../Wallet/types";

interface HeroBalanceProps {
  walletData: WalletData;
  onRecharge?: () => void;
  onTransfer?: () => void;
}

export const HeroBalance: React.FC<HeroBalanceProps> = ({
  walletData,
  onRecharge,
  onTransfer,
}) => {
  return (
    <View style={styles.container}>
      <WalletBalanceCard walletData={walletData} />

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onRecharge}>
          <Text style={styles.actionText}>Recargar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onTransfer}>
          <Text style={styles.actionText}>Transferir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12 },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "700" },
});
