from django.contrib import admin

from .models import Category, Order, OrderItem, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active",)
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "description")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "is_active", "updated_at")
    list_filter = ("category", "is_active")
    list_editable = ("price", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "description", "category__name")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "product_name", "quantity", "unit_price", "line_total")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "email", "grand_total", "created_at")
    search_fields = ("full_name", "email", "address")
    readonly_fields = ("grand_total", "created_at")
    inlines = [OrderItemInline]

# Register your models here.
