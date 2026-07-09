from django.urls import path

from . import views

app_name = "store"

urlpatterns = [
    path("", views.product_list, name="home"),
    path("category/<slug:slug>/", views.product_list, name="category"),
    path("cart/add/<int:product_id>/", views.add_to_cart, name="add_to_cart"),
    path("cart/remove/<int:product_id>/", views.remove_from_cart, name="remove_from_cart"),
    path("checkout/", views.checkout, name="checkout"),
]
