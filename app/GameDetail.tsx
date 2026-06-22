import axios from "axios";
import { onValue, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { auth, db } from "../firebaseconfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Image that tries a list of candidate URLs in order, falling back to the
 * next one whenever the previous fails to load.
 */
function FallbackImage({
  sources,
  style,
}: {
  sources: string[];
  style: any;
}) {
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

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default function GameDetail({
  appId,
  onBack,
}: {
  appId: number;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
	const [inWishlist, setInWishlist] = useState(false);
	const [purchased, setPurchased] = useState(false);

  const addToWishlist = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Silakan login terlebih dahulu");
        return;
      }

      if (inWishlist) {
        return;
      }

      await set(
        ref(db, `wishlists/${user.uid}/${appId}`),
        {
          appId: appId,
          name: details.name,
          image: details.header_image,
          addedAt: Date.now(),
        }
      );

      alert("Berhasil ditambahkan ke wishlist");
    } catch (error) {
      console.log(error);
      alert("Gagal menambahkan wishlist");
    }
  };

	const buyGame = async () => {
		try {
			const user = auth.currentUser;

			if (!user) {
				alert("Silakan login terlebih dahulu");
				return;
			}

			if (purchased) {
				return;
			}

			const priceLabel = details.is_free
				? "Gratis Dimainkan"
				: details.price_overview?.final_formatted ?? "Harga tidak tersedia";

			await set(
				ref(db, `purchases/${user.uid}/${appId}`),
				{
					appId: appId,
					name: details.name,
					image: details.header_image,
					price: priceLabel,
					boughtAt: Date.now(),
				}
			);

			alert(`"${details.name}" ditambahkan ke daftar game yang dibeli`);
		} catch (error) {
			console.log(error);
			alert("Gagal menambahkan ke daftar pembelian");
		}
	};

	useEffect(() => {
		const user = auth.currentUser;

		if (!user) {
			setInWishlist(false);
			setPurchased(false);
			return;
		}

		const wishlistRef = ref(db, `wishlists/${user.uid}/${appId}`);
		const purchaseRef = ref(db, `purchases/${user.uid}/${appId}`);

		const unsubscribeWishlist = onValue(wishlistRef, (snapshot) => {
			setInWishlist(snapshot.exists());
		});

		const unsubscribePurchase = onValue(purchaseRef, (snapshot) => {
			setPurchased(snapshot.exists());
		});

		return () => {
			unsubscribeWishlist();
			unsubscribePurchase();
		};
	}, [appId]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setActiveMediaIndex(0);

    axios
      .get(
        `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=indonesian`
      )
      .then((res) => {
        if (!isMounted) return;
        const entry = res.data[appId];
        if (entry && entry.success) {
          setDetails(entry.data);
        } else {
          setDetails(null);
        }
      })
      .catch((err) => {
        console.log(err);
        setDetails(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#66C0F4" size="large" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>
          Halaman toko untuk game ini tidak tersedia.
        </Text>
        <Pressable style={styles.backButtonStandalone} onPress={onBack}>
          <Text style={styles.backButtonText}>Kembali ke Toko</Text>
        </Pressable>
      </View>
    );
  }

  // Build a combined media list: movie thumbnails first, then screenshots.
  const movies = details.movies ?? [];
  const screenshots = details.screenshots ?? [];

  const mediaItems: { type: "movie" | "screenshot"; thumb: string; full: string }[] = [
    ...movies.map((m: any) => ({
      type: "movie" as const,
      thumb: m.thumbnail,
      full: m.thumbnail,
    })),
    ...screenshots.map((s: any) => ({
      type: "screenshot" as const,
      thumb: s.path_thumbnail,
      full: s.path_full,
    })),
  ];

  const activeMedia = mediaItems[activeMediaIndex];

  const headerCandidates = [
    details.header_image,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
  ].filter(Boolean);

  const capsuleCandidates = [
    details.capsule_image,
    details.header_image,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
  ].filter(Boolean);

  const recs = details.recommendations?.total;
  const reviewScore = details.metacritic?.score;

	const buyButtonLabel = purchased
		? "Sudah Dimiliki"
		: details.is_free
		? "Mainkan Game"
		: "Tambah ke Keranjang";

	const buyButton = (
		<Pressable
			style={[
				styles.addToCartButton,
				purchased && styles.addToCartButtonDisabled,
			]}
			onPress={buyGame}
			disabled={purchased}
		>
			<Text
				style={[
					styles.addToCartText,
					purchased && styles.addToCartTextDisabled,
				]}
			>
				{buyButtonLabel}
			</Text>
		</Pressable>
	);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Breadcrumb + title */}
        <View style={styles.headerBlock}>
          <Text style={styles.breadcrumb} numberOfLines={1}>
            Semua Game {"\u203A"}{" "}
            {details.genres?.[0]?.description ?? "Game"}
          </Text>
          <Text style={styles.gameTitle}>{details.name}</Text>
        </View>

        {/* Publisher sale style strip */}
        <View style={styles.saleStrip}>
          <FallbackImage
            sources={headerCandidates}
            style={styles.saleStripImage}
          />
          <View style={styles.saleStripOverlay}>
            <Text style={styles.saleStripText}>DISKON PUBLISHER</Text>
          </View>
        </View>

        {/* Main media + side panel */}
        <View style={styles.mainRow}>
          {/* Media viewer */}
          <View style={styles.mediaColumn}>
            <View style={styles.mediaViewer}>
              {activeMedia ? (
                <FallbackImage
                  sources={[activeMedia.full]}
                  style={styles.mediaViewerImage}
                />
              ) : (
                <FallbackImage
                  sources={headerCandidates}
                  style={styles.mediaViewerImage}
                />
              )}
              {activeMedia?.type === "movie" && (
                <View style={styles.playOverlay}>
                  <Text style={styles.playIcon}>{"\u25B6"}</Text>
                </View>
              )}
            </View>

            {/* Thumbnail strip */}
            {mediaItems.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbStrip}
              >
                {mediaItems.map((m, i) => (
                  <Pressable
                    key={`${m.type}-${i}`}
                    onPress={() => setActiveMediaIndex(i)}
                  >
                    <View
                      style={[
                        styles.thumbWrapper,
                        i === activeMediaIndex && styles.thumbWrapperActive,
                      ]}
                    >
                      <FallbackImage
                        sources={[m.thumb]}
                        style={styles.thumbImage}
                      />
                      {m.type === "movie" && (
                        <View style={styles.thumbPlayOverlay}>
                          <Text style={styles.thumbPlayIcon}>{"\u25B6"}</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Wishlist / Follow / Ignore row */}
            <View style={styles.actionsRow}>
              <Pressable
                style={[
                  styles.actionButton,
                  inWishlist && styles.actionButtonDisabled,
                ]}
                onPress={addToWishlist}
                disabled={inWishlist}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    inWishlist && styles.actionButtonTextDisabled,
                  ]}
                >
                  {inWishlist ? "Sudah di Wishlist" : "Tambahkan ke wishlist"}
                </Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Ikuti</Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Abaikan</Text>
              </Pressable>
            </View>
          </View>

          {/* Side info panel */}
          <View style={styles.sideColumn}>
            {/* <FallbackImage
              sources={capsuleCandidates}
              style={styles.capsuleImage}
            /> */}

            {details.short_description && (
              <Text style={styles.shortDescription}>
                {stripHtml(details.short_description)}
              </Text>
            )}

            <View style={styles.infoTable}>
              {recs !== undefined && (
                <InfoRow
                  label="ULASAN TERKINI:"
                  value={
                    reviewScore
                      ? `Skor ${reviewScore}/100`
                      : `${recs.toLocaleString()} ulasan`
                  }
                  highlight
                />
              )}
              {details.release_date?.date && (
                <InfoRow label="TANGGAL RILIS:" value={details.release_date.date} />
              )}
              {details.developers && details.developers.length > 0 && (
                <InfoRow
                  label="PENGEMBANG:"
                  value={details.developers.join(", ")}
                  highlight
                />
              )}
              {details.publishers && details.publishers.length > 0 && (
                <InfoRow
                  label="PENERBIT:"
                  value={details.publishers.join(", ")}
                  highlight
                />
              )}
            </View>

            {/* Tags */}
            {details.genres && details.genres.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsLabel}>
                  Tag populer dari pengguna untuk produk ini:
                </Text>
                <View style={styles.tagsRow}>
                  {details.genres.slice(0, 5).map((g: any) => (
                    <View key={g.id} style={styles.tag}>
                      <Text style={styles.tagText}>{g.description}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Price / buy box */}
        <View style={styles.buyBox}>
          <Text style={styles.buyBoxTitle} numberOfLines={1}>
            Beli {details.name}
          </Text>
          <View style={styles.buyBoxDivider} />
          <View style={styles.buyBoxRow}>
            {details.is_free ? (
              <>
                <Text style={styles.freeLabel}>Gratis Dimainkan</Text>
                {buyButton}
              </>
            ) : details.price_overview ? (
              details.price_overview.discount_percent > 0 ? (
                <>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      -{details.price_overview.discount_percent}%
                    </Text>
                  </View>
                  <View style={styles.priceChip}>
                    <Text style={styles.originalPrice}>
                      {details.price_overview.initial_formatted}
                    </Text>
                    <Text style={styles.priceChipFinal}>
                      {details.price_overview.final_formatted}
                    </Text>
                  </View>
                  {buyButton}
                </>
              ) : (
                <>
                  <View style={styles.priceChip}>
                    <Text style={styles.priceChipFinal}>
                      {details.price_overview.final_formatted}
                    </Text>
                  </View>
                  {buyButton}
                </>
              )
            ) : (
              <Text style={styles.finalPrice}>Harga tidak tersedia</Text>
            )}
          </View>
        </View>

        {/* About the game */}
        {(details.about_the_game || details.detailed_description) && (
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Tentang Game Ini</Text>
            <Text style={styles.aboutText}>
              {stripHtml(details.about_the_game ?? details.detailed_description)}
            </Text>
          </View>
        )}

        {/* Screenshots grid */}
        {screenshots.length > 0 && (
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Tangkapan Layar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {screenshots.slice(0, 8).map((s: any) => (
                <FallbackImage
                  key={s.id}
                  sources={[s.path_thumbnail]}
                  style={styles.gridScreenshot}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Footer link */}
        <Pressable
          style={styles.viewOnSteamButton}
          onPress={() =>
            Linking.openURL(`https://store.steampowered.com/app/${appId}/`)
          }
        >
          <Text style={styles.viewOnSteamText}>Lihat di Steam Store {"\u2197"}</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B2838",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#1B2838",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
  },

  notFoundText: {
    color: "#8F98A0",
    fontSize: 14,
    textAlign: "center",
  },

  backButtonStandalone: {
    backgroundColor: "#2A475E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },

  backButtonText: {
    color: "#66C0F4",
    fontSize: 14,
    fontWeight: "600",
  },

  /* Header block */
  headerBlock: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 8,
  },

  breadcrumb: {
    color: "#8F98A0",
    fontSize: 11,
    marginBottom: 6,
  },

  gameTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  /* Sale strip */
  saleStrip: {
    marginHorizontal: 15,
    height: 70,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#0B0E14",
  },

  saleStripImage: {
    width: "100%",
    height: "100%",
  },

  saleStripOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11,14,20,0.65)",
    paddingVertical: 6,
    alignItems: "center",
  },

  saleStripText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },

  /* Main row: media + side panel */
  mainRow: {
    paddingHorizontal: 15,
    flexDirection: SCREEN_WIDTH > 700 ? "row" : "column",
    gap: 14,
  },

  mediaColumn: {
    flex: SCREEN_WIDTH > 700 ? 1.4 : undefined,
  },

  mediaViewer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  mediaViewerImage: {
    width: "100%",
    height: "100%",
  },

  playOverlay: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  playIcon: {
    color: "#FFFFFF",
    fontSize: 22,
  },

  thumbStrip: {
    marginTop: 8,
  },

  thumbWrapper: {
    width: 92,
    height: 52,
    borderRadius: 2,
    overflow: "hidden",
    marginRight: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },

  thumbWrapperActive: {
    borderColor: "#66C0F4",
  },

  thumbImage: {
    width: "100%",
    height: "100%",
  },

  thumbPlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  thumbPlayIcon: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  actionButton: {
    backgroundColor: "#2A475E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 4,
  },

  actionButtonText: {
    color: "#C7D5E0",
    fontSize: 12,
    fontWeight: "600",
  },

	actionButtonDisabled: {
		backgroundColor: "#1B2838",
		opacity: 0.6,
	},

	actionButtonTextDisabled: {
		color: "#67707A",
	},

  /* Side panel */
  sideColumn: {
    flex: SCREEN_WIDTH > 700 ? 1 : undefined,
    marginTop: SCREEN_WIDTH > 700 ? 0 : 14,
    backgroundColor: "#16202D",
    borderRadius: 4,
    padding: 12,
  },

  capsuleImage: {
    width: "100%",
    height: 140,
    borderRadius: 4,
    marginBottom: 10,
    backgroundColor: "#0B0E14",
  },

  shortDescription: {
    color: "#C7D5E0",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },

  infoTable: {
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },

  infoLabel: {
    color: "#8F98A0",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    width: 110,
  },

  infoValue: {
    color: "#C7D5E0",
    fontSize: 11,
    flex: 1,
  },

  infoValueHighlight: {
    color: "#66C0F4",
  },

  tagsSection: {
    marginTop: 6,
  },

  tagsLabel: {
    color: "#8F98A0",
    fontSize: 10,
    marginBottom: 6,
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  tag: {
    backgroundColor: "#2A475E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },

  tagText: {
    color: "#66C0F4",
    fontSize: 10,
    fontWeight: "600",
  },

  /* Buy box */
  buyBox: {
    marginHorizontal: 15,
    marginTop: 16,
    backgroundColor: "#2A3F5A",
    borderRadius: 4,
    overflow: "hidden",
  },

	buyBoxTitle: {
		color: "#FFFFFF",
		fontSize: 15,
		fontWeight: "700",
		paddingHorizontal: 14,
		paddingTop: 14,
		paddingBottom: 10,
	},

	buyBoxDivider: {
		height: 1,
		backgroundColor: "#1B2838",
	},

	buyBoxRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		gap: 10,
		paddingHorizontal: 14,
		paddingVertical: 14,
	},

  freeLabel: {
    color: "#A4D007",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  discountBadge: {
    backgroundColor: "#4C6B22",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 2,
  },

  discountBadgeText: {
    color: "#A4D007",
    fontWeight: "800",
    fontSize: 15,
  },

	priceChip: {
		backgroundColor: "#000000",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 2,
		alignItems: "flex-end",
	},

  originalPrice: {
    color: "#67707A",
    fontSize: 11,
    textDecorationLine: "line-through",
    textAlign: "right",
  },

	priceChipFinal: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "700",
	},

  finalPrice: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

	addToCartButton: {
		backgroundColor: "#75B022",
		paddingHorizontal: 18,
		paddingVertical: 11,
		borderRadius: 2,
	},

	addToCartText: {
		color: "#FFFFFF",
		fontSize: 13,
		fontWeight: "700",
	},

	addToCartButtonDisabled: {
		backgroundColor: "#3D4450",
	},

	addToCartTextDisabled: {
		color: "#8F98A0",
	},

  /* About / sections */
  aboutSection: {
    marginHorizontal: 15,
    marginTop: 22,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  aboutText: {
    color: "#8F98A0",
    fontSize: 13,
    lineHeight: 20,
  },

  gridScreenshot: {
    width: 220,
    height: 124,
    borderRadius: 2,
    marginRight: 8,
    backgroundColor: "#0B0E14",
  },

  /* View on Steam */
  viewOnSteamButton: {
    marginHorizontal: 15,
    marginTop: 24,
    backgroundColor: "#2A475E",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },

  viewOnSteamText: {
    color: "#66C0F4",
    fontSize: 13,
    fontWeight: "700",
  },

  imagePlaceholder: {
    backgroundColor: "#2A475E",
  },
});