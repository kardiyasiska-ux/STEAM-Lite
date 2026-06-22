import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function FallbackImage({
  sources,
  style,
}: {
  sources: string[];
  style: any;
}) {
  return (
    <Image
      source={{ uri: sources[0] }}
      style={style}
    />
  );
}

interface SteamHeaderProps {
  searchQuery: string;
  handleSearchChange: (text: string) => void;
  clearSearch: () => void;
  showDropdown: boolean;
  searchLoading: boolean;
  searchResults: any[];
  formatPrice: (price: number) => string;
  onSelectGame: (appId: number) => void;
  onPressProfile?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function SteamHeader({
  searchQuery,
  handleSearchChange,
  clearSearch,
  showDropdown,
  searchLoading,
  searchResults,
  formatPrice,
  onSelectGame,
  onPressProfile,
  showBackButton,
  onBack,
}: SteamHeaderProps) {
  return (
    <>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navbarTopRow}>
          {showBackButton ? (
            <Pressable
              onPress={onBack}
              style={styles.headerBackButton}
              hitSlop={8}
            >
              <Text style={styles.headerBackButtonText}>{"\u2039"} Back</Text>
            </Pressable>
          ) : (
            <View style={styles.navbarSideSpace} />
          )}
          <Text style={styles.logo}>STEAM</Text>
          <Pressable
            style={styles.profileButton}
            onPress={onPressProfile}
            hitSlop={8}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>

        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Search the store"
            placeholderTextColor="#8f98a0"
            style={styles.search}
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCorrect={false}
          />

          {searchQuery.length > 0 && (
            <Pressable
              style={styles.searchClearBtn}
              onPress={clearSearch}
            >
              <Text style={styles.searchClearText}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Dropdown */}
      <View style={styles.searchSection}>
        {showDropdown && (
          <View style={styles.dropdown}>
            {searchLoading ? (
              <View style={styles.dropdownLoadingRow}>
                <ActivityIndicator
                  color="#66C0F4"
                  size="small"
                />
                <Text style={styles.dropdownLoadingText}>
                  Searching...
                </Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.dropdownEmptyRow}>
                <Text style={styles.dropdownEmptyText}>
                  No results for "{searchQuery}"
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.dropdownLabel}>
                  Search Results
                </Text>

                {searchResults.slice(0, 6).map((item) => {
                  const hasDiscount =
                    item.price?.discount_percent > 0;

                  const isFree =
                    !item.price ||
                    item.price.final === 0;

                  return (
                    <Pressable
                      key={item.id}
                      style={styles.dropdownRow}
                      onPress={() => {
                        onSelectGame(item.id);
                        clearSearch();
                      }}
                    >
                      <FallbackImage
                        sources={[
                          item.tiny_image,
                          `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/header.jpg`,
                        ].filter(Boolean)}
                        style={styles.dropdownThumb}
                      />

                      <View style={styles.dropdownInfo}>
                        <Text
                          style={styles.dropdownName}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>

                        {hasDiscount ? (
                          <View
                            style={
                              styles.dropdownPriceRow
                            }
                          >
                            <View
                              style={
                                styles.dropdownDiscoBadge
                              }
                            >
                              <Text
                                style={
                                  styles.dropdownDiscoText
                                }
                              >
                                -
                                {
                                  item.price
                                    .discount_percent
                                }
                                %
                              </Text>
                            </View>

                            <Text
                              style={
                                styles.dropdownOriginalPrice
                              }
                            >
                              {formatPrice(
                                item.price.initial
                              )}
                            </Text>

                            <Text
                              style={
                                styles.dropdownFinalPrice
                              }
                            >
                              {formatPrice(
                                item.price.final
                              )}
                            </Text>
                          </View>
                        ) : isFree ? (
                          <Text
                            style={
                              styles.dropdownFreeText
                            }
                          >
                            Free
                          </Text>
                        ) : (
                          <Text
                            style={
                              styles.dropdownFinalPrice
                            }
                          >
                            {formatPrice(
                              item.price.final
                            )}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </>
            )}
          </View>
        )}
      </View>

      {showDropdown && (
        <Pressable
          style={styles.backdrop}
          onPress={clearSearch}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: "#1B2838",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2A475E",
  },

  navbarTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  navbarSideSpace: {
    width: 32,
  },

  headerBackButton: {
    paddingVertical: 4,
    paddingRight: 10,
  },

  headerBackButtonText: {
    color: "#66C0F4",
    fontSize: 14,
    fontWeight: "600",
  },

  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2A475E",
    alignItems: "center",
    justifyContent: "center",
  },

  profileIcon: {
    fontSize: 15,
  },

  logo: {
    flex: 1,
    textAlign: "center",
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  search: {
    flex: 1,
    backgroundColor: "#2A475E",
    borderRadius: 6,
    padding: 12,
    color: "#FFF",
    paddingRight: 44,
  },

  searchClearBtn: {
    position: "absolute",
    right: 12,
  },

  searchClearText: {
    color: "#8F98A0",
    fontSize: 16,
  },

  searchSection: {
    position: "absolute",
    top: 110,
    left: 15,
    right: 15,
    zIndex: 999,
  },

  dropdown: {
    backgroundColor: "#1B2838",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A475E",
  },

  dropdownLabel: {
    color: "#8F98A0",
    padding: 10,
    fontWeight: "700",
  },

  dropdownLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 10,
  },

  dropdownLoadingText: {
    color: "#FFF",
  },

  dropdownEmptyRow: {
    padding: 15,
  },

  dropdownEmptyText: {
    color: "#8F98A0",
  },

  dropdownRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#16202D",
  },

  dropdownThumb: {
    width: 90,
    height: 42,
    borderRadius: 3,
  },

  dropdownInfo: {
    flex: 1,
    marginLeft: 10,
  },

  dropdownName: {
    color: "#FFF",
    fontWeight: "600",
  },

  dropdownPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  dropdownDiscoBadge: {
    backgroundColor: "#4C6B22",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },

  dropdownDiscoText: {
    color: "#A4D007",
    fontSize: 11,
    fontWeight: "700",
  },

  dropdownOriginalPrice: {
    color: "#67707A",
    textDecorationLine: "line-through",
    fontSize: 11,
  },

  dropdownFinalPrice: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },

  dropdownFreeText: {
    color: "#A4D007",
    fontWeight: "700",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
});
