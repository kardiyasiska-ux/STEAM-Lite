import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { auth, db } from "../firebaseconfig";
import { onValue, ref, remove } from "firebase/database";
import { signOut } from "firebase/auth";

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

interface WishlistItem {
  appId: number;
  name: string;
  image?: string;
  addedAt?: number;
}

interface PurchasedItem {
	appId: number;
	name: string;
	image?: string;
	price?: string;
	boughtAt?: number;
}

function formatAddedDate(timestamp?: number) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Profile({
  onSelectGame,
}: {
  onSelectGame: (appId: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<WishlistItem[]>([]);
	const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
	const [loadingPurchases, setLoadingPurchases] = useState(true);
  const user = auth.currentUser;
  const handleLogout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.log(error);
    }
    };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const wishlistRef = ref(db, `wishlists/${user.uid}`);

    const unsubscribe = onValue(
      wishlistRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setItems([]);
        } else {
          const list: WishlistItem[] = Object.values(data);
          list.sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
          setItems(list);
        }
        setLoading(false);
      },
      (error) => {
        console.log(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

	useEffect(() => {
		if (!user) {
			setLoadingPurchases(false);
			return;
		}

		const purchasesRef = ref(db, `purchases/${user.uid}`);

		const unsubscribe = onValue(
			purchasesRef,
			(snapshot) => {
				const data = snapshot.val();
				if (!data) {
					setPurchasedItems([]);
				} else {
					const list: PurchasedItem[] = Object.values(data);
					list.sort((a, b) => (b.boughtAt ?? 0) - (a.boughtAt ?? 0));
					setPurchasedItems(list);
				}
				setLoadingPurchases(false);
			},
			(error) => {
				console.log(error);
				setLoadingPurchases(false);
			}
		);

		return () => unsubscribe();
	}, [user?.uid]);

  const removeFromWishlist = async (appId: number) => {
    try {
      if (!user) return;
      await remove(ref(db, `wishlists/${user.uid}/${appId}`));
    } catch (error) {
      console.log(error);
      alert("Gagal menghapus dari wishlist");
    }
  };

  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.profileName}>
            {user?.email ?? "Tamu"}
          </Text>
          {!user && (
            <Text style={styles.profileSubtext}>
              Silakan login untuk melihat wishlist Anda
            </Text>
          )}
          <Pressable
            onPress={handleLogout}
            style={{
                marginTop: 10,
                backgroundColor: "#E8336D",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 6,
            }}
            >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
                Logout
            </Text>
            </Pressable>
        </View>

        {/* Purchased games section */}
				<View style={styles.sectionHeaderRow}>
					<Text style={styles.sectionTitle}>
						My Games{purchasedItems.length > 0 ? ` (${purchasedItems.length})` : ""}
					</Text>
				</View>

				{!user ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyStateText}>
							Anda belum login. Login terlebih dahulu untuk melihat game
							yang sudah Anda beli.
						</Text>
					</View>
				) : loadingPurchases ? (
					<View style={styles.loadingBox}>
						<ActivityIndicator color="#66C0F4" size="large" />
					</View>
				) : purchasedItems.length === 0 ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyStateText}>
							Anda belum membeli game apapun. Ketuk harga pada halaman
							detail game untuk menambahkannya ke daftar ini.
						</Text>
					</View>
				) : (
					<View style={styles.wishlistList}>
						{purchasedItems.map((item) => (
							<Pressable
								key={item.appId}
								style={styles.wishlistRow}
								onPress={() => onSelectGame(item.appId)}
							>
								<FallbackImage
									sources={[
										item.image,
										`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.appId}/header.jpg`,
										`https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/header.jpg`,
									].filter(Boolean) as string[]}
									style={styles.wishlistImage}
								/>
								<View style={styles.wishlistInfo}>
									<Text style={styles.wishlistName} numberOfLines={1}>
										{item.name}
									</Text>
									<Text style={styles.wishlistAddedAt}>
										{item.price ? `${item.price} \u00B7 ` : ""}
										Dibeli {formatAddedDate(item.boughtAt)}
									</Text>
								</View>
							</Pressable>
						))}
					</View>
				)}

        {/* Wishlist section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            My Wishlist{items.length > 0 ? ` (${items.length})` : ""}
          </Text>
        </View>

        {!user ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Anda belum login. Login terlebih dahulu untuk menyimpan dan
              melihat wishlist game Anda.
            </Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#66C0F4" size="large" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Wishlist Anda masih kosong. Tambahkan game yang Anda suka
              dari halaman detail game.
            </Text>
          </View>
        ) : (
          <View style={styles.wishlistList}>
            {items.map((item) => (
              <Pressable
                key={item.appId}
                style={styles.wishlistRow}
                onPress={() => onSelectGame(item.appId)}
              >
                <FallbackImage
                  sources={[
                    item.image,
                    `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.appId}/header.jpg`,
                    `https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/header.jpg`,
                  ].filter(Boolean) as string[]}
                  style={styles.wishlistImage}
                />
                <View style={styles.wishlistInfo}>
                  <Text style={styles.wishlistName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.addedAt ? (
                    <Text style={styles.wishlistAddedAt}>
                      Ditambahkan {formatAddedDate(item.addedAt)}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeFromWishlist(item.appId)}
                  hitSlop={8}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B2838",
  },

  /* Profile header */
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2A475E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  avatarText: {
    color: "#66C0F4",
    fontSize: 26,
    fontWeight: "700",
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  profileSubtext: {
    color: "#8F98A0",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },

  /* Section */
  sectionHeaderRow: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  emptyState: {
    marginHorizontal: 15,
    backgroundColor: "#16202D",
    borderRadius: 6,
    padding: 20,
  },

  emptyStateText: {
    color: "#8F98A0",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  loadingBox: {
    paddingVertical: 30,
    alignItems: "center",
  },

  wishlistList: {
    marginHorizontal: 15,
  },

  wishlistRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16202D",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },

  wishlistImage: {
    width: 92,
    height: 43,
    backgroundColor: "#0B0E14",
  },

  wishlistInfo: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  wishlistName: {
    color: "#C7D5E0",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },

  wishlistAddedAt: {
    color: "#67707A",
    fontSize: 10,
  },

  removeButton: {
    width: 32,
    height: 32,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#2A475E",
  },

  removeButtonText: {
    color: "#8F98A0",
    fontSize: 13,
    fontWeight: "700",
  },

  imagePlaceholder: {
    backgroundColor: "#2A475E",
  },
});
