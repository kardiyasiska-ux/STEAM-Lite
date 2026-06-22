import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import GameDetail from "./GameDetail";
import SteamHeader from "./HeaderLayout";
import Profile from "./Profile";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_WIDTH = SCREEN_WIDTH * 0.86;
const HERO_SPACING = 10;

function FallbackImage({ sources, style }: { sources: string[]; style: any }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed || sources.length === 0) {
    return <View style={[style, styles.imagePlaceholder]} />;
  }

  return (
    <Image
      source={{ uri: sources[index] }}
      style={style}
      onError={() => {
        if (index < sources.length - 1) {
          setIndex(index + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [heroGames, setHeroGames] = useState<any[]>([]);
  const [discountGames, setDiscountGames] = useState<any[]>([]);
  const [popularGames, setPopularGames] = useState<any[]>([]);
  const [featuredLists, setFeaturedLists] = useState<{
    new_releases: any[];
    top_sellers: any[];
    coming_soon: any[];
    specials: any[];
  }>({ new_releases: [], top_sellers: [], coming_soon: [], specials: [] });
  const [trendingFreeGames, setTrendingFreeGames] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "new_releases" | "top_sellers" | "coming_soon" | "specials" | "trending_free"
  >("new_releases");
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heroIds = [730, 1172470, 578080];
  const discountIds = [1245620, 1086940, 271590, 1238810];
  const trendingFreeIds = [730, 570, 1172470, 230410];

  const games = [
    { id: 730, name: "Counter-Strike 2" },
    { id: 570, name: "Dota 2" },
    { id: 578080, name: "PUBG: BATTLEGROUNDS" },
    { id: 1172470, name: "Apex Legends" },
  ];

  useEffect(() => {
    loadAll();
  }, []);

  const fetchDetails = async (appid: number) => {
    try {
      const response = await axios.get(
        `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=id&l=indonesian`
      );
      const game = response.data[appid];
      if (game && game.success) return game.data;
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const fetchFeaturedCategories = async () => {
    try {
      const response = await axios.get(
        `https://store.steampowered.com/api/featuredcategories?cc=id&l=indonesian`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const loadAll = async () => {
    try {
      const [heroResults, discountResults, popularResults, featured, trendingFreeResults] =
        await Promise.all([
          Promise.all(heroIds.map(fetchDetails)),
          Promise.all(discountIds.map(fetchDetails)),
          Promise.all(games.map((g) => fetchDetails(g.id))),
          fetchFeaturedCategories(),
          Promise.all(trendingFreeIds.map(fetchDetails)),
        ]);

      setHeroGames(heroResults.filter(Boolean));
      setDiscountGames(discountResults.filter(Boolean));
      setPopularGames(
        popularResults.map((data, idx) => data ?? { steam_appid: games[idx].id, name: games[idx].name })
      );
      setTrendingFreeGames(trendingFreeResults.filter(Boolean).filter((g) => g.is_free));

      if (featured) {
        setFeaturedLists({
          new_releases: featured.new_releases?.items ?? [],
          top_sellers: featured.top_sellers?.items ?? [],
          coming_soon: featured.coming_soon?.items ?? [],
          specials: featured.specials?.items ?? [],
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time search with debounce 400ms
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!text.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setSearchLoading(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await axios.get(
          `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(text.trim())}&cc=id&l=indonesian`
        );
        setSearchResults(response.data.items ?? []);
      } catch (error) {
        console.log(error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const onHeroScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        const index = Math.round(
          e.nativeEvent.contentOffset.x / (HERO_WIDTH + HERO_SPACING)
        );
        setActiveIndex(index);
      },
    }
  );
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price/100);
  };

  // Open a game from anywhere (home, search, profile/wishlist) and make
  // sure we leave the profile screen so the detail page is shown.
  const goToGame = (appId: number) => {
    setShowProfile(false);
    setSelectedAppId(appId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#66C0F4" size="large" />
      </View>
    );
  }

  const handleHeaderBack = () => {
    if (showProfile) {
      setShowProfile(false);
    } else if (selectedAppId !== null) {
      setSelectedAppId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Navbar — stays mounted across Home / Game Detail / Profile so
          search and the profile button are always reachable */}
      <SteamHeader
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        clearSearch={clearSearch}
        showDropdown={showDropdown}
        searchLoading={searchLoading}
        searchResults={searchResults}
        formatPrice={formatPrice}
        onSelectGame={(id) => goToGame(id)}
        onPressProfile={() => setShowProfile(true)}
        showBackButton={showProfile || selectedAppId !== null}
        onBack={handleHeaderBack}
      />
      {/* Backdrop to close dropdown on outside tap */}
      {showDropdown && (
        <Pressable style={styles.backdrop} onPress={clearSearch} />
      )}

      {showProfile ? (
        <Profile onSelectGame={(id) => goToGame(id)} />
      ) : selectedAppId !== null ? (
        <GameDetail
          appId={selectedAppId}
          onBack={() => setSelectedAppId(null)}
        />
      ) : (
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* spacer for search bar height */}
        {/* <View style={{ height: 68 }} /> */}

        {/* Featured & Recommended */}
        <Text style={styles.sectionTitle}>Featured &amp; Recommended</Text>

        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={HERO_WIDTH + HERO_SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.heroScrollContent}
          onScroll={onHeroScroll}
          scrollEventThrottle={16}
        >
          {heroGames.map((game) => (
            <Pressable
              key={game.steam_appid}
              style={styles.heroCard}
              onPress={() => setSelectedAppId(game.steam_appid)}
            >
              <FallbackImage
                sources={[
                  game.header_image,
                  `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steam_appid}/header.jpg`,
                  `https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_appid}/header.jpg`,
                ].filter(Boolean)}
                style={styles.heroImage}
              />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle} numberOfLines={1}>{game.name}</Text>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {game.is_free ? "PLAY FREE NOW" : "VIEW GAME"}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </Animated.ScrollView>

        <View style={styles.dotsRow}>
          {heroGames.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoLabel}>STEAM</Text>
            <Text style={styles.promoTitle}>BULLET FEST</Text>
          </View>
          <View style={styles.promoRight}>
            <Text style={styles.promoSub}>DISCOUNTS, DEMOS, AND MORE</Text>
            <View style={styles.promoPill}>
              <Text style={styles.promoPillText}>NOW THROUGH JUNE 15 AT 10 AM PACIFIC</Text>
            </View>
          </View>
        </View>

        {/* Discounts & Events */}
        <View style={styles.discountsHeaderRow}>
          <Text style={styles.sectionTitle}>Discounts &amp; Events</Text>
          <Text style={styles.seeMore}>See More</Text>
        </View>

        <FlatList
          data={discountGames}
          keyExtractor={(item) => item.steam_appid.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.discountListContent}
          renderItem={({ item, index }) => {
            const labels = ["WEEKEND DEAL", "WEEKEND DEAL", "TODAY'S DEAL", "PUBLISHER SALE"];
            const price = item.price_overview;
            return (
              <Pressable style={styles.discountCard} onPress={() => setSelectedAppId(item.steam_appid)}>
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>{labels[index % labels.length]}</Text>
                </View>
                <FallbackImage
                  sources={[
                    item.header_image,
                    `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.steam_appid}/header.jpg`,
                    `https://cdn.akamai.steamstatic.com/steam/apps/${item.steam_appid}/header.jpg`,
                  ].filter(Boolean)}
                  style={styles.discountImage}
                />
                <View style={styles.discountFooter}>
                  <Text style={styles.discountGameTitle} numberOfLines={1}>{item.name}</Text>
                  {price && price.discount_percent > 0 ? (
                    <View style={styles.priceRow}>
                      <View style={styles.discountPercentBadge}>
                        <Text style={styles.discountPercentText}>-{price.discount_percent}%</Text>
                      </View>
                      <View>
                        <Text style={styles.originalPrice}>{price.initial_formatted}</Text>
                        <Text style={styles.finalPrice}>{price.final_formatted}</Text>
                      </View>
                    </View>
                  ) : item.is_free ? (
                    <Text style={styles.freePrice}>Free To Play</Text>
                  ) : (
                    <Text style={styles.finalPrice}>{price?.final_formatted ?? ""}</Text>
                  )}
                </View>
              </Pressable>
            );
          }}
        />

        {/* Popular Games */}
        <Text style={styles.sectionTitle}>Popular Games</Text>
        {popularGames.map((item) => (
          <Pressable
            key={item.steam_appid}
            style={styles.gameCard}
            onPress={() => setSelectedAppId(item.steam_appid)}
          >
            <FallbackImage
              sources={[
                item.header_image,
                `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.steam_appid}/header.jpg`,
                `https://cdn.akamai.steamstatic.com/steam/apps/${item.steam_appid}/header.jpg`,
              ].filter(Boolean)}
              style={styles.gameImage}
            />
            <Text style={styles.gameTitle}>{item.name}</Text>
          </Pressable>
        ))}

        {/* Browse Tabs */}
        <View style={styles.tabsRow}>
          {[
            { key: "new_releases", label: "Popular New Releases" },
            { key: "top_sellers", label: "Top Sellers" },
            { key: "coming_soon", label: "Popular Upcoming" },
            { key: "specials", label: "Specials" },
            { key: "trending_free", label: "Trending Free" },
          ].map((tab) => (
            <Text
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            >
              {tab.label}
            </Text>
          ))}
        </View>

        <View style={styles.browseList}>
          {(() => {
            let items: any[] = [];
            let isAppDetailShape = false;

            if (activeTab === "trending_free") {
              items = trendingFreeGames;
              isAppDetailShape = true;
            } else {
              items = featuredLists[activeTab] ?? [];
            }

            if (items.length === 0) {
              return <Text style={styles.browseEmptyText}>No games to show.</Text>;
            }

            return items.slice(0, 10).map((item, index) => {
              const appid = isAppDetailShape ? item.steam_appid : item.id;
              const name = item.name;
              let genresText = "";
              let releaseText = "";
              let priceNode = null;

              if (isAppDetailShape) {
                genresText = (item.genres ?? []).slice(0, 4).map((g: any) => g.description).join(", ");
                releaseText = item.release_date?.date ? `Released ${item.release_date.date}` : "";
                priceNode = <Text style={styles.broweFreePrice}>Free To Play</Text>;
              } else {
                if (item.discounted) {
                  priceNode = (
                    <View style={styles.browsePriceRow}>
                      <View style={styles.discountPercentBadge}>
                        <Text style={styles.discountPercentText}>-{item.discount_percent}%</Text>
                      </View>
                      <View>
                        <Text style={styles.originalPrice}>
                          {/* {item.original_price ? `Rp ${item.original_price.toLocaleString("id-ID")}` : ""} */}
                          {formatPrice(item.original_price)}
                        </Text>
                        <Text style={styles.finalPrice}>
                          {/* {item.final_price ? `Rp ${item.final_price.toLocaleString("id-ID")}` : "Free"} */}
                          {formatPrice(item.final_price)}
                        </Text>
                      </View>
                    </View>
                  );
                } else if (item.final_price === 0) {
                  priceNode = <Text style={styles.broweFreePrice}>Free To Play</Text>;
                } else {
                  priceNode = (
                    <Text style={styles.finalPrice}>
                      {/* {item.final_price ? `Rp ${item.final_price.toLocaleString("id-ID")}` : ""} */}
                      {formatPrice(item.final_price)}
                    </Text>
                  );
                }
              }

              const imageCandidates: string[] = [];
              if (!isAppDetailShape) {
                if (item.large_capsule_image) imageCandidates.push(item.large_capsule_image);
                if (item.small_capsule_image) imageCandidates.push(item.small_capsule_image);
                if (item.header_image) imageCandidates.push(item.header_image);
              }
              imageCandidates.push(`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`);
              imageCandidates.push(`https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`);

              return (
                <Pressable
                  key={`${activeTab}-${appid}-${index}`}
                  style={styles.browseRow}
                  onPress={() => { if (appid) setSelectedAppId(appid); }}
                >
                  <FallbackImage sources={imageCandidates} style={styles.browseImage} />
                  <View style={styles.browseInfo}>
                    <Text style={styles.browseGameTitle} numberOfLines={1}>{name}</Text>
                    {genresText !== "" && (
                      <Text style={styles.browseGenres} numberOfLines={1}>{genresText}</Text>
                    )}
                    {releaseText !== "" && (
                      <Text style={styles.browseRelease}>{releaseText}</Text>
                    )}
                  </View>
                  <View style={styles.browsePriceBox}>{priceNode}</View>
                </Pressable>
              );
            });
          })()}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#171A21" },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#171A21",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Backdrop to dismiss dropdown */
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
  },

  heroScrollContent: { paddingLeft: 15, paddingRight: 15 - HERO_SPACING },

  heroCard: {
    width: HERO_WIDTH,
    height: 190,
    marginRight: HERO_SPACING,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1B2838",
  },

  heroImage: { width: "100%", height: "100%" },

  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    backgroundColor: "rgba(23,26,33,0.55)",
  },

  heroTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold", marginBottom: 8 },

  heroBadge: {
    backgroundColor: "#FFE000",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
  },

  heroBadgeText: { color: "#1B2838", fontSize: 11, fontWeight: "bold", letterSpacing: 0.5 },

  dotsRow: { flexDirection: "row", justifyContent: "center", marginTop: 10, gap: 6 },

  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#3D4450" },

  dotActive: { backgroundColor: "#66C0F4", width: 16 },

  promoBanner: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginTop: 20,
    backgroundColor: "#0B0E14",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A2F3A",
  },

  promoLeft: {
    backgroundColor: "#E8336D",
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  promoLabel: { color: "#FFFFFF", fontSize: 10, fontWeight: "700", letterSpacing: 2 },

  promoTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", letterSpacing: 1, marginTop: 2 },

  promoRight: { flex: 1, paddingHorizontal: 14, paddingVertical: 16, justifyContent: "center" },

  promoSub: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },

  promoPill: {
    backgroundColor: "#E8336D",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },

  promoPillText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },

  discountsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
  },

  seeMore: { color: "#66C0F4", fontSize: 12, fontWeight: "600" },

  discountListContent: { paddingLeft: 15, paddingRight: 5 },

  discountCard: {
    width: 160,
    marginRight: 10,
    backgroundColor: "#1B2838",
    borderRadius: 6,
    overflow: "hidden",
  },

  discountTag: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#E8336D",
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 1,
    borderBottomRightRadius: 4,
  },

  discountTagText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },

  discountImage: { width: "100%", height: 90 },

  discountFooter: { padding: 8 },

  discountGameTitle: { color: "#C7D5E0", fontSize: 12, fontWeight: "600", marginBottom: 6 },

  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6 },

  discountPercentBadge: {
    backgroundColor: "#4C6B22",
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  discountPercentText: { color: "#A4D007", fontSize: 12, fontWeight: "800" },

  originalPrice: {
    color: "#67707A",
    fontSize: 10,
    textDecorationLine: "line-through",
    textAlign: "right",
  },

  finalPrice: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", textAlign: "right" },

  freePrice: {
    color: "#A4D007",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    textTransform: "uppercase",
  },

  gameCard: {
    backgroundColor: "#1B2838",
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 10,
    overflow: "hidden",
  },

  gameImage: { width: "100%", height: 120 },

  gameTitle: { color: "#FFF", fontSize: 16, padding: 10 },

  tabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 15,
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#2A475E",
    paddingBottom: 8,
    gap: 16,
  },

  tabItem: { color: "#8F98A0", fontSize: 13, fontWeight: "600", paddingBottom: 6 },

  tabItemActive: { color: "#FFFFFF", borderBottomWidth: 2, borderBottomColor: "#66C0F4" },

  browseList: { marginHorizontal: 15, marginTop: 10 },

  browseEmptyText: { color: "#8F98A0", fontSize: 13, paddingVertical: 20, textAlign: "center" },

  browseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2838",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },

  browseImage: { width: 92, height: 43, backgroundColor: "#0B0E14" },

  browseInfo: { flex: 1, paddingHorizontal: 10, paddingVertical: 6 },

  browseGameTitle: { color: "#C7D5E0", fontSize: 13, fontWeight: "700", marginBottom: 2 },

  browseGenres: { color: "#8F98A0", fontSize: 10, marginBottom: 2 },

  browseRelease: { color: "#67707A", fontSize: 10 },

  browsePriceBox: { paddingHorizontal: 8, alignItems: "flex-end", minWidth: 80 },

  browsePriceRow: { flexDirection: "row", alignItems: "center", gap: 6 },

  broweFreePrice: {
    color: "#A4D007",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    textAlign: "right",
  },

  imagePlaceholder: { backgroundColor: "#2A475E" },
});
