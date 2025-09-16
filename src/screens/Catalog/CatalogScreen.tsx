import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BeCoinsBalance } from "../../components/ui/BeCoinsBalance";
import * as Haptics from "expo-haptics";

// Hooks
import { useCatalogFilters, useCatalogModals } from "./hooks";
import { useProducts } from "../../hooks/useProducts";
import { useCartSync } from "../../hooks/useCartSync";
import { categoryService } from "../../services/categoryService";
import { resourceService } from "../../services/resourceService";
import { walletService } from "../../services/walletService";
import { useUserBalance } from "../../hooks/useUserBalance";
import { calculateResourcePrice } from "../../utils/priceHelpers";
import { ProductCardType } from "./components/ProductCard";
import { useAuth } from "../../hooks/AuthContext";
import { useCustomAlert } from "../../hooks/useCustomAlert";

// Components
import { SearchBar, FilterPanel, ProductGrid } from "./components";
import { ProductCard } from "./components/ProductCard";
import { OrderDeliveryModal } from "./components/OrderDeliveryModal";
import { CustomAlert } from "../../components/ui/CustomAlert";
// Comunidad: reutilizar componentes existentes (solo ResourcesGrid)
import { ResourcesGrid } from "../Community/components";

// Styles
import { containerStyles, productStyles } from "./styles";
import {
  formatBeCoins,
  convertBeCoinsToUSD,
  formatUSDPrice,
  CURRENCY_CONFIG,
} from "../../constants/currency";

import { useCartStore } from "../../stores/useCartStore";
import { CartBottomSheet } from "./components/CartBottomSheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// Purchase modal components from Community
import { PurchaseModal } from "../Community/components/PurchaseModal";
import { InsufficientBalanceModal } from "../Community/components";

export const CatalogScreen = () => {
  const navigation = useNavigation();
  const { canPerformAction, loginWithAuth0, isAuthenticated } = useAuth();
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();

  const {
    addProduct: addProductToCart,
    addProductToServer,
    products: cartProducts,
  } = useCartStore();

  // Hook para sincronizar carrito con servidor
  const { isSyncing, syncError, performCartSync } = useCartSync();

  const {
    searchText,
    setSearchText,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
  } = useCatalogFilters();

  const { showDeliveryModal, openDeliveryModal, closeDeliveryModal } =
    useCatalogModals();

  const [showCart, setShowCart] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [allCategories, setAllCategories] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);

  const selectedCategoryId = useMemo(
    () => allCategories.find((cat) => cat.name === filters.categories[0])?.id,
    [allCategories, filters.categories]
  );

  const brands: string[] = [];

  const { products, loading, error, updateQuery } = useProducts({
    page: 1,
    category_id: undefined,
    name: searchText,
    sortBy: filters.sortBy || undefined,
    order: filters.order || undefined,
  });

  // Memoize product query to avoid triggering updateQuery with equivalent objects
  const productQuery = useMemo(() => {
    return {
      page: 1,
      limit: 12,
      name: searchText,
      category_id: selectedCategoryId || undefined,
      sortBy: filters.sortBy || undefined,
      order: filters.order || undefined,
    };
  }, [searchText, selectedCategoryId, filters.sortBy, filters.order]);

  const lastProductsQueryRef = useRef<string | null>(null);
  useEffect(() => {
    const qString = JSON.stringify(productQuery);
    if (lastProductsQueryRef.current === qString) return;
    lastProductsQueryRef.current = qString;
    updateQuery(productQuery);
  }, [productQuery]);

  useEffect(() => {
    (async () => {
      try {
        const categories = await categoryService.getCategories();
        setAllCategories(
          categories.map((cat) => ({ id: cat.id, name: cat.name }))
        );
      } catch (e: any) {
        console.error("[CATEGORIAS] Error al cargar categorías:", e);
        const cats = Array.from(
          new Set((products || []).map((p) => p.category).filter(Boolean))
        ).map((name) => ({ id: String(name), name: String(name) }));
        setAllCategories(cats);
      }
    })();
  }, [products]);

  // Comunidad: recursos
  const [communityResources, setCommunityResources] = useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  // Estado para compra directa desde la vista previa de Comunidad
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [insufficientBalanceModalVisible, setInsufficientBalanceModalVisible] =
    useState(false);
  const [selectedCommunityResource, setSelectedCommunityResource] = useState<
    any | null
  >(null);

  // Hook para balance del usuario (reutilizar comportamiento de CommunityScreen)
  const { balance, refetch: refetchBalance } = useUserBalance();

  const loadCommunityResources = async (page = 1, limit = 6) => {
    setCommunityLoading(true);
    try {
      const resp = await resourceService.getResources({ page, limit });
      setCommunityResources(resp.resources || []);
    } catch (err) {
      console.error("Error cargando recursos de comunidad:", err);
    } finally {
      setCommunityLoading(false);
    }
  };

  // Ensure community resources are loaded only once (protect against StrictMode double-effect)
  const communityLoadedRef = useRef(false);
  useEffect(() => {
    if (communityLoadedRef.current) return;
    communityLoadedRef.current = true;
    loadCommunityResources(1, 6);
  }, []);

  // Refs & state to control carousels (community and products)
  const communityScrollRef = useRef<ScrollView | null>(null);
  const communityX = useRef(0);
  const communityContentWidth = useRef(0);
  const communityLayoutWidth = useRef(0);
  const [communityCanLeft, setCommunityCanLeft] = useState(false);
  const [communityCanRight, setCommunityCanRight] = useState(false);

  const productsScrollRef = useRef<ScrollView | null>(null);
  const productsX = useRef(0);
  const productsContentWidth = useRef(0);
  const productsLayoutWidth = useRef(0);
  const [productsCanLeft, setProductsCanLeft] = useState(false);
  const [productsCanRight, setProductsCanRight] = useState(false);

  const updateCommunityNav = () => {
    const x = communityX.current || 0;
    const cw = communityContentWidth.current || 0;
    const lw = communityLayoutWidth.current || 0;
    setCommunityCanLeft(x > 10);
    setCommunityCanRight(cw - lw - x > 10);
  };

  const updateProductsNav = () => {
    const x = productsX.current || 0;
    const cw = productsContentWidth.current || 0;
    const lw = productsLayoutWidth.current || 0;
    setProductsCanLeft(x > 10);
    setProductsCanRight(cw - lw - x > 10);
  };

  const scrollCommunityBy = (dir: number) => {
    const step = Math.max(
      200,
      Math.floor((communityLayoutWidth.current || 600) * 0.8)
    );
    const target = Math.max(0, communityX.current + dir * step);
    communityScrollRef.current?.scrollTo({ x: target, animated: true });
    // small timeout to let scroll update
    setTimeout(() => updateCommunityNav(), 200);
  };

  const scrollProductsBy = (dir: number) => {
    const step = Math.max(
      200,
      Math.floor((productsLayoutWidth.current || 600) * 0.8)
    );
    const target = Math.max(0, productsX.current + dir * step);
    productsScrollRef.current?.scrollTo({ x: target, animated: true });
    setTimeout(() => updateProductsNav(), 200);
  };

  // Componente local para la sección Comunidad en el Catálogo
  const CatalogCommunitySection: React.FC = () => {
    const formatBeCoins = (n: number) => {
      if (n === null || n === undefined) return "0 BeCoins";
      if (typeof n === "number") return `${n} BeCoins`;
      return String(n);
    };

    const ResourcePreviewCard: React.FC<{ resource: any }> = ({ resource }) => {
      const priceCalc = calculateResourcePrice(resource);
      const quantity =
        typeof resource.resource_quanity === "number"
          ? resource.resource_quanity
          : resource.resource_quantity || 0;

      const imageUri = resource.resource_img || null;

      return (
        <View style={productStyles.productCard}>
          <View style={productStyles.productImageContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={productStyles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#F8F9FA",
                }}
              >
                <Text style={{ color: "#999", fontSize: 12 }}>Sin imagen</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, width: "100%" }}>
            <Text style={productStyles.productBrand}>Mis Beneficios</Text>
            <Text style={productStyles.productName} numberOfLines={2}>
              {resource.resource_name}
            </Text>
            <Text style={productStyles.productCategory} numberOfLines={2}>
              {resource.resource_desc || ""}
            </Text>

            <View style={productStyles.productPriceRow}>
              <View style={{ flex: 1 }}>
                {/* Mostrar precio en USD y BeCoins; incluir precio original si hay descuento */}
                {(() => {
                  // Resource prices are stored in BeCoins (same as PurchaseModal)
                  const usdFinal = convertBeCoinsToUSD(priceCalc.finalPrice);
                  const usdOriginal = convertBeCoinsToUSD(
                    priceCalc.originalPrice
                  );

                  return (
                    <>
                      {priceCalc.hasDiscount && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#999",
                            marginTop: 2,
                          }}
                        >
                          Precio original:
                        </Text>
                      )}

                      {priceCalc.hasDiscount && (
                        <Text
                          style={{
                            color: "#999",
                            fontSize: 12,
                            textDecorationLine: "line-through",
                            marginTop: 2,
                          }}
                        >
                          {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                          {formatUSDPrice(usdOriginal)} c/u · (
                          {formatBeCoins(priceCalc.originalPrice)} c/u)
                        </Text>
                      )}

                      <Text style={productStyles.productPrice}>
                        {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                        {formatUSDPrice(usdFinal)} c/u
                      </Text>

                      <Text style={productStyles.becoinsReference}>
                        ({formatBeCoins(priceCalc.finalPrice)} c/u)
                      </Text>
                    </>
                  );
                })()}

                <Text style={productStyles.becoinsReference}>
                  {quantity} unidades
                </Text>
              </View>
              <TouchableOpacity
                style={productStyles.addToCartButton}
                onPress={() => handleCommunityPurchasePress(resource)}
              >
                <Text style={productStyles.addToCartText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    };

    return (
      <View
        style={{
          marginVertical: 12,
          backgroundColor: "transparent",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#333" }}>
            Mis Beneficios
          </Text>
        </View>

        {communityLoading ? (
          <ActivityIndicator color="#FF6B35" />
        ) : communityResources.length === 0 ? (
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: "#666" }}>No hay recursos disponibles</Text>
          </View>
        ) : (
          <View>
            <ScrollView
              ref={(ref) => {
                communityScrollRef.current = ref;
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 24 }}
              onScroll={(e) => {
                communityX.current = e.nativeEvent.contentOffset.x;
                updateCommunityNav();
              }}
              scrollEventThrottle={50}
              onContentSizeChange={(w) => {
                communityContentWidth.current = w as number;
                updateCommunityNav();
              }}
              onLayout={(e) => {
                communityLayoutWidth.current = e.nativeEvent.layout.width;
                updateCommunityNav();
              }}
            >
              {communityResources.map((r: any) => (
                <View key={r.id} style={{ marginRight: 16 }}>
                  <ResourcePreviewCard resource={r} />
                </View>
              ))}
            </ScrollView>

            {/* Flechas para navegar comunidad */}
            {communityCanLeft && (
              <TouchableOpacity
                accessibilityLabel="Anterior comunidad"
                accessibilityRole="button"
                style={{
                  position: "absolute",
                  left: 4,
                  top: "40%",
                  zIndex: 10,
                  backgroundColor: "#FF6B35",
                  padding: 8,
                  borderRadius: 22,
                  elevation: 5,
                }}
                onPress={() => scrollCommunityBy(-1)}
              >
                <Text
                  style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}
                >
                  ‹
                </Text>
              </TouchableOpacity>
            )}

            {communityCanRight && (
              <TouchableOpacity
                accessibilityLabel="Siguiente comunidad"
                accessibilityRole="button"
                style={{
                  position: "absolute",
                  right: 4,
                  top: "40%",
                  zIndex: 10,
                  backgroundColor: "#FF6B35",
                  padding: 8,
                  borderRadius: 22,
                  elevation: 5,
                }}
                onPress={() => scrollCommunityBy(1)}
              >
                <Text
                  style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}
                >
                  ›
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // Handlers para confirmar compra desde el modal de Comunidad
  const handleCommunityModalConfirm = async (quantity: number) => {
    if (!selectedCommunityResource) return;
    try {
      const response = await walletService.purchaseResource(
        selectedCommunityResource.id,
        quantity
      );
      // Cerrar modal y recargar recursos para actualizar stock
      setPurchaseModalVisible(false);
      setSelectedCommunityResource(null);
      loadCommunityResources(1, 6);
      showCustomAlert(
        "¡Compra Exitosa!",
        `Has comprado ${quantity} ${selectedCommunityResource.resource_name} exitosamente`,
        "success"
      );
    } catch (error: any) {
      console.error("Error comprando recurso desde catálogo:", error);
      setPurchaseModalVisible(false);
      setSelectedCommunityResource(null);
      showCustomAlert(
        "Error en la compra",
        "No se pudo completar la compra",
        "error"
      );
    }
  };

  const handleCommunityModalCancel = () => {
    setPurchaseModalVisible(false);
    setSelectedCommunityResource(null);
  };

  // Equivalent of CommunityScreen.handlePurchasePress
  const handleCommunityPurchasePress = async (resource: any) => {
    if (!canPerformAction) {
      setShowAuthAlert(true);
      return;
    }

    // Refrescar balance antes de validar
    try {
      await refetchBalance();
    } catch (e) {
      console.warn("No se pudo refrescar balance:", e);
    }

    setSelectedCommunityResource(resource);

    const priceCalc = calculateResourcePrice(resource);
    const minQuantity = 1;
    const totalPrice = priceCalc.finalPrice * minQuantity;

    if ((balance || 0) < totalPrice) {
      setInsufficientBalanceModalVisible(true);
    } else {
      setPurchaseModalVisible(true);
    }
  };

  // Sincronizar carrito al cargar el catálogo
  useEffect(() => {
    const syncCart = async () => {
      try {
        // Sincronizar carrito con servidor usando estrategia de merge
        // para no perder productos que el usuario ya haya agregado localmente
        await performCartSync("merge");
      } catch (error) {
        console.error("Error syncing cart:", error);
        // No mostrar error al usuario ya que es una operación en segundo plano
      }
    };

    syncCart();
  }, []); // Solo ejecutar una vez al montar el componente

  const handleAddProduct = async (product: ProductCardType) => {
    if (!canPerformAction) {
      setShowAuthAlert(true);
      return;
    }
    // Normalize image field (backend sometimes uses `image`, sometimes `image_url`)
    const imageField =
      (product as any).image_url || (product as any).image || "";

    try {
      setAddingProductId(product.id);
      console.log(
        "🛒 CatalogScreen: Adding product to cart and server:",
        product.name
      );

      const success = await addProductToServer({
        id: product.id,
        name: product.name,
        price: Number((product as any).price || 0),
        quantity: 1,
        image: imageField,
      });

      if (success) {
        console.log("✅ CatalogScreen: Product added successfully to server");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.log(
          "⚠️ CatalogScreen: Product added locally but failed on server"
        );
        // Fallback local add
        addProductToCart({
          id: product.id,
          name: product.name,
          price: Number((product as any).price || 0),
          quantity: 1,
          image: imageField,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error("❌ CatalogScreen: Error adding product:", error);
      // Fallback to local add
      addProductToCart({
        id: product.id,
        name: product.name,
        price: Number((product as any).price || 0),
        quantity: 1,
        image: imageField,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <SafeAreaView style={containerStyles.container}>
      {/* Header */}
      <View style={containerStyles.headerContainer}>
        <View style={containerStyles.headerRow}>
          <View style={containerStyles.headerLeft}>
            <View style={containerStyles.headerTitles}>
              <Text style={containerStyles.headerTitle}>Catálogo</Text>
              <Text style={containerStyles.headerSubtitle}>
                Productos disponibles para entrega
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <BeCoinsBalance
              size="medium"
              variant="header"
              style={containerStyles.coinsContainer}
            />
            {isAuthenticated && (
              <TouchableOpacity
                style={styles.headerCartBtn}
                onPress={() => setShowCart(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={isSyncing ? "sync" : "cart-variant"}
                  size={32}
                  color={isSyncing ? "#FFA500" : "#FF6B35"}
                  style={[
                    styles.headerCartIcon,
                    isSyncing && styles.syncingIcon,
                  ]}
                />
                {cartProducts.length > 0 && !isSyncing && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>
                      {cartProducts.length}
                    </Text>
                  </View>
                )}
                {isSyncing && (
                  <View style={styles.syncIndicator}>
                    <Text style={styles.syncText}>⟳</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={containerStyles.container}
        contentContainerStyle={containerStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SearchBar searchQuery={searchText} onSearchChange={setSearchText} />

        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            categories={allCategories.map((cat) => cat.name)}
            brands={brands}
          />
        )}

        <TouchableOpacity
          style={{ marginBottom: 16, alignSelf: "flex-end" }}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ color: "#FF6B35", fontWeight: "600" }}>
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Text>
        </TouchableOpacity>

        {/* Sección Comunidad integrada dentro del Catálogo */}
        <CatalogCommunitySection />

        {/* Productos - título y separación para mayor coherencia visual */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: 8,
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#333" }}>
              Productos
            </Text>
            {/* Puedes mantener un botón 'Ver más' aquí si se desea */}
          </View>
          <View style={{ height: 8 }} />
        </View>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 32 }}>
            Cargando productos...
          </Text>
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center", marginTop: 32 }}>
            {error}
          </Text>
        ) : (
          // Carrusel horizontal de productos
          <View style={{ paddingVertical: 8 }}>
            {products && products.length > 0 ? (
              <View>
                <ScrollView
                  ref={(ref) => {
                    productsScrollRef.current = ref;
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 16, paddingRight: 24 }}
                  onScroll={(e) => {
                    productsX.current = e.nativeEvent.contentOffset.x;
                    updateProductsNav();
                  }}
                  scrollEventThrottle={50}
                  onContentSizeChange={(w) => {
                    productsContentWidth.current = w as number;
                    updateProductsNav();
                  }}
                  onLayout={(e) => {
                    productsLayoutWidth.current = e.nativeEvent.layout.width;
                    updateProductsNav();
                  }}
                >
                  {products.map((p) => (
                    <View key={p.id} style={{ marginRight: 16 }}>
                      <ProductCard
                        product={p}
                        onAddToCart={handleAddProduct}
                        isAdding={addingProductId === p.id}
                      />
                    </View>
                  ))}
                </ScrollView>

                {productsCanLeft && (
                  <TouchableOpacity
                    accessibilityLabel="Anterior productos"
                    accessibilityRole="button"
                    style={{
                      position: "absolute",
                      left: 4,
                      top: "40%",
                      zIndex: 10,
                      backgroundColor: "#FF6B35",
                      padding: 8,
                      borderRadius: 22,
                      elevation: 5,
                    }}
                    onPress={() => scrollProductsBy(-1)}
                  >
                    <Text
                      style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}
                    >
                      ‹
                    </Text>
                  </TouchableOpacity>
                )}

                {productsCanRight && (
                  <TouchableOpacity
                    accessibilityLabel="Siguiente productos"
                    accessibilityRole="button"
                    style={{
                      position: "absolute",
                      right: 4,
                      top: "40%",
                      zIndex: 10,
                      backgroundColor: "#FF6B35",
                      padding: 8,
                      borderRadius: 22,
                      elevation: 5,
                    }}
                    onPress={() => scrollProductsBy(1)}
                  >
                    <Text
                      style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}
                    >
                      ›
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={productStyles.emptyState}>
                <Text style={productStyles.emptyStateText}>
                  No se encontraron productos
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {isAuthenticated && (
        <CartBottomSheet
          visible={showCart}
          onClose={() => setShowCart(false)}
          onCheckout={async () => {
            setShowCart(false);

            if (cartProducts.length === 0) {
              Alert.alert(
                "Carrito vacío",
                "Agrega productos antes de continuar"
              );
              return;
            }

            try {
              // Mostrar loading si es necesario
              console.log(
                "🛒 Procesando checkout con productos:",
                cartProducts
              );

              // Aquí es donde ahora procesamos el carrito al backend
              // Pero por ahora, como aún no tienes la pantalla de direcciones,
              // vamos a usar el modal de delivery existente
              const firstProduct = cartProducts[0];
              const fullProduct = products.find(
                (p) => p.id === firstProduct.id
              );

              if (fullProduct) {
                openDeliveryModal(fullProduct);
              } else {
                Alert.alert(
                  "Producto no disponible",
                  "El producto seleccionado ya no está disponible en el catálogo.",
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              console.error("Error en checkout:", error);
              Alert.alert(
                "Error",
                "Hubo un problema al procesar tu carrito. Inténtalo de nuevo.",
                [{ text: "OK" }]
              );
            }
          }}
        />
      )}

      <OrderDeliveryModal
        visible={showDeliveryModal}
        onClose={closeDeliveryModal}
        onOrderCreated={(orderId: string) => {
          // Navigate to Orders tab to see the created order
          console.log("Order created:", orderId);
          (navigation as any).navigate("Orders");
        }}
      />

      {/* Purchase modals para recursos de Comunidad (misma experiencia que CommunityScreen) */}
      <PurchaseModal
        visible={purchaseModalVisible}
        resource={selectedCommunityResource}
        userBalance={balance || 0}
        onConfirm={async (qty: number) => {
          await handleCommunityModalConfirm(qty);
        }}
        onCancel={handleCommunityModalCancel}
        onNavigateToRecharge={() => {
          setPurchaseModalVisible(false);
          setSelectedCommunityResource(null);
          (navigation as any).navigate("RechargeScreen");
        }}
      />

      <InsufficientBalanceModal
        visible={insufficientBalanceModalVisible}
        userBalance={balance || 0}
        requiredAmount={
          selectedCommunityResource
            ? calculateResourcePrice(selectedCommunityResource).finalPrice
            : 0
        }
        onRecharge={() => {
          setInsufficientBalanceModalVisible(false);
          setSelectedCommunityResource(null);
          (navigation as any).navigate("RechargeScreen");
        }}
        onCancel={() => {
          setInsufficientBalanceModalVisible(false);
          setSelectedCommunityResource(null);
        }}
      />

      {/* Custom Alert para autenticación */}
      <CustomAlert
        visible={showAuthAlert}
        title="¡Inicia sesión para comprar!"
        message="Para agregar productos al carrito, necesitas tener una cuenta activa. Es rápido y seguro."
        type="info"
        onClose={() => setShowAuthAlert(false)}
        primaryButton={{
          text: "Iniciar sesión",
          onPress: () => {
            setShowAuthAlert(false);
            loginWithAuth0();
          },
        }}
        secondaryButton={{
          text: "Más tarde",
          onPress: () => setShowAuthAlert(false),
        }}
      />

      {/* Alert del hook useCustomAlert para otros mensajes */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerCartBtn: {
    marginLeft: 12,
    padding: 6,
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF6B35",
    elevation: 2,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  headerCartIcon: {},
  syncingIcon: {
    transform: [{ rotate: "45deg" }],
  },
  headerBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    zIndex: 2,
  },
  headerBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  syncIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FFA500",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    zIndex: 2,
  },
  syncText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
  },
});
