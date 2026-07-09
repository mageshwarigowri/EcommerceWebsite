const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartCount = document.querySelector("[data-cart-count]");
const checkoutSection = document.querySelector("[data-checkout]");
let cartAutoCloseTimer;

function openCart({ autoClose = false } = {}) {
  if (!cartDrawer) return;
  cartDrawer.hidden = false;
  window.clearTimeout(cartAutoCloseTimer);
  if (autoClose) {
    cartAutoCloseTimer = window.setTimeout(() => {
      cartDrawer.hidden = true;
    }, 2600);
  }
}

function closeCart() {
  if (!cartDrawer) return;
  window.clearTimeout(cartAutoCloseTimer);
  cartDrawer.hidden = true;
}

function openCheckout() {
  if (!checkoutSection) return;
  closeCart();
  checkoutSection.hidden = false;
  checkoutSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function refreshCartControls() {
  document.querySelectorAll("[data-cart-close]").forEach((button) => {
    button.addEventListener("click", closeCart);
  });
  document.querySelectorAll("[data-checkout-open]").forEach((button) => {
    button.addEventListener("click", openCheckout);
  });
}

document.querySelector("[data-cart-toggle]")?.addEventListener("click", () => {
  if (!cartDrawer) return;
  if (cartDrawer.hidden) {
    openCart();
  } else {
    closeCart();
  }
});

document.querySelector("[data-checkout-close]")?.addEventListener("click", () => {
  if (checkoutSection) checkoutSection.hidden = true;
});

document.querySelectorAll(".add-to-cart-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      form.submit();
      return;
    }

    const payload = await response.json();
    if (cartCount) cartCount.textContent = payload.cart_count;
    if (cartDrawer) cartDrawer.innerHTML = payload.cart_html;
    refreshCartControls();
    openCart({ autoClose: true });
  });
});

refreshCartControls();
