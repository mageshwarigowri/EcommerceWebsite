import { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import chairImage from "./assets/Chair.webp";
import coffeeTableImage from "./assets/CoffeeTable.avif";
import energyMeterImage from "./assets/EnergyMeter.jpeg";
import securityKitImage from "./assets/SecurityKit.jpeg";
import smartHomeHubImage from "./assets/SmartHomeHub.jpg";
import villaLampImage from "./assets/VillaLamp.avif";

const PRODUCTS = [
  {
    id: 1,
    name: "Smart Garden Villa Lamp",
    description: "Weather-ready lamp with motion sensing and warm evening scenes.",
    price: 3999,
    image: villaLampImage,
    category: "villa",
    tags: ["smart", "outdoor", "lighting"]
  },
  {
    id: 2,
    name: "Modular Oak Coffee Table",
    description: "Compact table with hidden storage for modern living rooms.",
    price: 7499,
    image: coffeeTableImage,
    category: "furniture",
    tags: ["living", "storage", "wood"]
  },
  {
    id: 3,
    name: "Voice Control Hub",
    description: "Connects home devices, routines, lighting, and appliances in one place.",
    price: 5299,
    image: smartHomeHubImage,
    category: "smart-home",
    tags: ["smart", "automation", "voice"]
  },
  {
    id: 4,
    name: "Premium Villa Security Kit",
    description: "Door sensors, indoor camera, and instant phone alerts for larger homes.",
    price: 12999,
    image: securityKitImage,
    category: "villa",
    tags: ["security", "smart", "camera"]
  },
  {
    id: 5,
    name: "Ergonomic Work Chair",
    description: "Breathable mesh chair with adjustable lumbar support and tilt control.",
    price: 8999,
    image: chairImage,
    category: "furniture",
    tags: ["office", "comfort", "mesh"]
  },
  {
    id: 6,
    name: "Smart Energy Monitor",
    description: "Tracks appliance usage and helps optimize daily power consumption.",
    price: 4599,
    image: energyMeterImage,
    category: "smart-home",
    tags: ["energy", "smart", "savings"]
  }
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function debounce(callback, delay = 300) {
  let timerId;
  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => callback(...args), delay);
  };
}

function ProductImage({ product, className = "" }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (hasImageError) {
    return (
      <div
        className={`grid place-items-center bg-slate-100 text-sm font-semibold text-slate-500 ${className}`}
      >
        Image not found
      </div>
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      onError={() => setHasImageError(true)}
      className={`object-cover ${className}`}
    />
  );
}

function ProductCard({ product, quantity = 0, onAddToCart, onIncrement, onDecrement }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg">
      <div className="overflow-hidden bg-slate-100">
        <ProductImage
          product={product}
          className="aspect-[4/3] w-full transition duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            {product.category}
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">{product.name}</h3>
        </div>
        <p className="flex-1 text-sm leading-6 text-slate-600">{product.description}</p>
        <p className="text-xl font-bold text-slate-950">
          {currencyFormatter.format(product.price)}
        </p>
        {quantity > 0 ? (
          <div className="quantity-control" aria-label={`${product.name} quantity`}>
            <button
              type="button"
              onClick={() => onDecrement(product)}
              aria-label={`Decrease ${product.name} quantity`}
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => onIncrement(product)}
              aria-label={`Increase ${product.name} quantity`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="professional-button professional-button-primary"
          >
            Add to Cart
          </button>
        )}
      </div>
    </article>
  );
}

function Cart({ cartItems, onClose, onCheckout }) {
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <aside className="fixed right-4 top-24 z-20 w-[min(92vw,420px)] rounded-lg border border-slate-200 bg-white p-5 shadow-cart ring-1 ring-slate-100">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-950">Shopping Cart</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cart"
          className="professional-icon-button"
        >
          x
        </button>
      </div>

      {cartItems.length === 0 ? (
        <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
          Your cart is empty.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="max-h-[45vh] space-y-3 overflow-auto pr-1">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-md border border-slate-200 p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="h-16 w-16 rounded-md bg-slate-100 object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-slate-950">
                  {currencyFormatter.format(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{currencyFormatter.format(cartTotal)}</span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              className="professional-button professional-button-dark mt-4 w-full"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function CheckoutPage({ cartItems, onPlaceOrder, onBack }) {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    email: "",
    upiId: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const grandTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!formData.address.trim()) nextErrors.address = "Address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (paymentMethod === "upi" && !/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
      nextErrors.upiId = "Enter a valid UPI ID.";
    }
    if (paymentMethod === "card") {
      if (!/^\d{12,19}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        nextErrors.cardNumber = "Enter a valid card number.";
      }
      if (!formData.cardName.trim()) nextErrors.cardName = "Name on card is required.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry)) {
        nextErrors.cardExpiry = "Use MM/YY format.";
      }
      if (!/^\d{3,4}$/.test(formData.cardCvv)) {
        nextErrors.cardCvv = "Enter a valid CVV.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await onPlaceOrder({ ...formData, paymentMethod }, grandTotal);
    setIsSubmitting(false);
  };

  return (
    <section className="bg-white py-10">
      <div className="checkout-grid mx-auto max-w-6xl px-4 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                Checkout
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Place your order</h2>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="professional-button professional-button-secondary"
            >
              Back to Shop
            </button>
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-4 py-3"
              placeholder="Your full name"
            />
            {errors.fullName && <span className="mt-1 block text-sm text-red-600">{errors.fullName}</span>}
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-4 py-3"
              placeholder="you@example.com"
            />
            {errors.email && <span className="mt-1 block text-sm text-red-600">{errors.email}</span>}
          </label>

          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Address</span>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="min-h-28 w-full resize-y rounded-md border border-slate-300 px-4 py-3"
              placeholder="Delivery address"
            />
            {errors.address && <span className="mt-1 block text-sm text-red-600">{errors.address}</span>}
          </label>

          <div className="mb-6">
            <span className="mb-3 block text-sm font-semibold text-slate-700">Payment method</span>
            <div className="payment-options">
              {[
                { id: "upi", label: "UPI" },
                { id: "card", label: "Card" },
                { id: "cod", label: "COD" }
              ].map((option) => (
                <label
                  key={option.id}
                  className={`payment-option ${paymentMethod === option.id ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={paymentMethod === option.id}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {paymentMethod === "upi" && (
            <label className="mb-6 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">UPI ID</span>
              <input
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-4 py-3"
                placeholder="name@bank"
              />
              {errors.upiId && <span className="mt-1 block text-sm text-red-600">{errors.upiId}</span>}
            </label>
          )}

          {paymentMethod === "card" && (
            <div className="mb-6">
              <label className="mb-4 block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Card number</span>
                <input
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-4 py-3"
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && <span className="mt-1 block text-sm text-red-600">{errors.cardNumber}</span>}
              </label>
              <label className="mb-4 block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Name on card</span>
                <input
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-4 py-3"
                  placeholder="Card holder name"
                />
                {errors.cardName && <span className="mt-1 block text-sm text-red-600">{errors.cardName}</span>}
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Expiry</span>
                  <input
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-4 py-3"
                    placeholder="MM/YY"
                  />
                  {errors.cardExpiry && <span className="mt-1 block text-sm text-red-600">{errors.cardExpiry}</span>}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">CVV</span>
                  <input
                    name="cardCvv"
                    value={formData.cardCvv}
                    onChange={handleChange}
                    className="w-full rounded-md border border-slate-300 px-4 py-3"
                    placeholder="123"
                  />
                  {errors.cardCvv && <span className="mt-1 block text-sm text-red-600">{errors.cardCvv}</span>}
                </label>
              </div>
            </div>
          )}

          {paymentMethod === "cod" && (
            <div className="mb-6 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Pay with cash when your order is delivered.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || cartItems.length === 0}
            className="professional-button professional-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-bold text-slate-950">Order Summary</h3>
          <div className="mt-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span className="font-semibold">
                  {currencyFormatter.format(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-slate-300 pt-4 text-xl font-bold">
            <span>Grand Total</span>
            <span>{currencyFormatter.format(grandTotal)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Recommendations({ products, cartItems, onAddToCart, onIncrement, onDecrement }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Recommended
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">You may also like</h2>
      </div>
      <div className="product-grid sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={cartItems.find((item) => item.id === product.id)?.quantity || 0}
            onAddToCart={onAddToCart}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [shouldAutoCloseCart, setShouldAutoCloseCart] = useState(false);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Firebase is initialized from the hosting environment's injected globals when available.
  useEffect(() => {
    const initializeFirebase = async () => {
      const rawConfig =
        typeof window !== "undefined" ? window.__firebase_config : undefined;

      if (!rawConfig) {
        console.info("Firebase config was not provided; orders will log locally.");
        return;
      }

      try {
        const firebaseConfig =
          typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const auth = getAuth(app);
        const initialToken = window.__initial_auth_token;

        const credential = initialToken
          ? await signInWithCustomToken(auth, initialToken)
          : await signInAnonymously(auth);

        setDb(firestore);
        setUserId(credential.user.uid);
      } catch (error) {
        console.error("Unable to initialize Firebase:", error);
      }
    };

    initializeFirebase();
  }, []);

  // The debounced filter keeps search responsive without filtering on every key press.
  const debouncedFilterProducts = useMemo(
    () =>
      debounce((query) => {
        const normalizedQuery = query.trim().toLowerCase();
        const nextProducts = PRODUCTS.filter((product) => {
          const searchableText = `${product.name} ${product.description}`.toLowerCase();
          return searchableText.includes(normalizedQuery);
        });
        setFilteredProducts(nextProducts);
      }, 300),
    []
  );

  useEffect(() => {
    debouncedFilterProducts(searchTerm);
  }, [searchTerm, debouncedFilterProducts]);

  useEffect(() => {
    if (!confirmationMessage) return;
    const timeoutId = window.setTimeout(() => setConfirmationMessage(""), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [confirmationMessage]);

  useEffect(() => {
    if (!isCartOpen || !shouldAutoCloseCart) return;
    const timeoutId = window.setTimeout(() => {
      setIsCartOpen(false);
      setShouldAutoCloseCart(false);
    }, 2600);
    return () => window.clearTimeout(timeoutId);
  }, [isCartOpen, shouldAutoCloseCart, cartItems]);

  const generateRecommendations = (category) => {
    const matchingProducts = PRODUCTS.filter((product) => product.category === category);
    setRecommendedProducts(matchingProducts);
  };

  const handleAddToCart = (product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });

    generateRecommendations(product.category);
    setIsCartOpen(true);
    setShouldAutoCloseCart(true);
  };

  const handleIncrementCartItem = (product) => {
    handleAddToCart(product);
  };

  const handleDecrementCartItem = (product) => {
    setCartItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== product.id) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      })
    );
  };

  const handlePlaceOrder = async (formData, grandTotal) => {
    const appId =
      typeof window !== "undefined" && window.__app_id
        ? window.__app_id
        : "ecommerce-app";
    const activeUserId = userId || "anonymous-preview-user";
    const newOrder = {
      ...formData,
      cartItems,
      grandTotal,
      createdAt: new Date().toISOString()
    };

    try {
      if (db && userId) {
        await addDoc(
          collection(db, "artifacts", appId, "users", activeUserId, "orders"),
          newOrder
        );
      }

      console.info("Order placed successfully:", newOrder);
      setCartItems([]);
      setIsCheckout(false);
      setIsCartOpen(false);
      setShouldAutoCloseCart(false);
      setConfirmationMessage("Order placed successfully. Thank you for shopping with us.");
    } catch (error) {
      console.error("Order placement failed:", error);
      setConfirmationMessage("Order could not be saved. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Ecommerce App
            </p>
            <h1 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">
              Curated Home Essentials
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <form
              className="topbar-search"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products..."
                className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm"
              />
              <button
                type="submit"
                className="professional-button professional-button-dark h-10 px-4 py-2 text-sm"
              >
                Search
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setIsCartOpen((currentValue) => !currentValue);
                setShouldAutoCloseCart(false);
              }}
              className="cart-button"
              aria-label="Toggle shopping cart"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.8a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span className="cart-count">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {confirmationMessage && (
        <div className="mx-auto mt-5 max-w-6xl px-4">
          <div className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 font-semibold text-teal-900">
            {confirmationMessage}
          </div>
        </div>
      )}

      {isCartOpen && (
        <Cart
          cartItems={cartItems}
          onClose={() => {
            setIsCartOpen(false);
            setShouldAutoCloseCart(false);
          }}
          onCheckout={() => {
            setIsCheckout(true);
            setIsCartOpen(false);
            setShouldAutoCloseCart(false);
          }}
        />
      )}

      {isCheckout ? (
        <main>
          <CheckoutPage
            cartItems={cartItems}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setIsCheckout(false)}
          />
        </main>
      ) : (
      <main>
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                Catalog
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Shop products</h2>
            </div>
            <p className="text-sm text-slate-600">
              {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} found
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
              No products found.
            </div>
          ) : (
            <div className="product-grid sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={cartItems.find((item) => item.id === product.id)?.quantity || 0}
                  onAddToCart={handleAddToCart}
                  onIncrement={handleIncrementCartItem}
                  onDecrement={handleDecrementCartItem}
                />
              ))}
            </div>
          )}
        </section>

        {recommendedProducts.length > 0 && (
          <Recommendations
            products={recommendedProducts}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onIncrement={handleIncrementCartItem}
            onDecrement={handleDecrementCartItem}
          />
        )}
      </main>
      )}
    </div>
  );
}
