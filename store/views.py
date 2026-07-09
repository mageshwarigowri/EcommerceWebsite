from decimal import Decimal

from django.contrib import messages
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .models import Category, Order, OrderItem, Product


def _cart_dict(request):
    return request.session.setdefault("cart", {})


def _cart_payload(request):
    cart = _cart_dict(request)
    product_ids = [int(product_id) for product_id in cart.keys()]
    products = Product.objects.filter(id__in=product_ids, is_active=True).select_related("category")
    product_map = {product.id: product for product in products}
    items = []
    total = Decimal("0.00")
    count = 0

    for product_id_text, quantity in cart.items():
        product = product_map.get(int(product_id_text))
        if not product:
            continue
        line_total = product.price * quantity
        total += line_total
        count += quantity
        items.append(
            {
                "product": product,
                "quantity": quantity,
                "line_total": line_total,
            }
        )

    return {
        "items": items,
        "total": total,
        "count": count,
    }


def product_list(request, slug=None):
    categories = Category.objects.filter(is_active=True)
    products = Product.objects.filter(is_active=True).select_related("category")
    selected_category = None
    search_query = request.GET.get("q", "").strip()

    if slug:
        selected_category = get_object_or_404(Category, slug=slug, is_active=True)
        products = products.filter(category=selected_category)

    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) | Q(description__icontains=search_query)
        )

    cart = _cart_payload(request)

    context = {
        "categories": categories,
        "products": products,
        "selected_category": selected_category,
        "search_query": search_query,
        "cart": cart,
    }
    return render(request, "store/product_list.html", context)


@require_POST
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, pk=product_id, is_active=True)
    cart = _cart_dict(request)
    product_id_text = str(product.id)
    cart[product_id_text] = cart.get(product_id_text, 0) + 1
    request.session.modified = True

    cart_payload = _cart_payload(request)

    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        return JsonResponse(
            {
                "message": f"{product.name} added to cart.",
                "cart_count": cart_payload["count"],
                "cart_total": f"Rs. {cart_payload['total']:,.0f}",
                "cart_html": render(
                    request,
                    "store/partials/cart_drawer.html",
                    {"cart": cart_payload},
                ).content.decode("utf-8"),
            }
        )

    messages.success(request, f"{product.name} added to cart.")
    return redirect("store:home")


@require_POST
def remove_from_cart(request, product_id):
    cart = _cart_dict(request)
    cart.pop(str(product_id), None)
    request.session.modified = True
    messages.info(request, "Item removed from cart.")
    return redirect("store:home")


@require_POST
def checkout(request):
    cart = _cart_payload(request)
    if not cart["items"]:
        messages.error(request, "Your cart is empty.")
        return redirect("store:home")

    full_name = request.POST.get("full_name", "").strip()
    email = request.POST.get("email", "").strip()
    address = request.POST.get("address", "").strip()

    if not full_name or not email or not address:
        messages.error(request, "Please complete all checkout fields.")
        return redirect("store:home")

    order = Order.objects.create(
        full_name=full_name,
        email=email,
        address=address,
        grand_total=cart["total"],
    )

    for item in cart["items"]:
        product = item["product"]
        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            quantity=item["quantity"],
            unit_price=product.price,
            line_total=item["line_total"],
        )

    request.session["cart"] = {}
    messages.success(request, f"Order #{order.id} placed successfully.")
    return redirect("store:home")

