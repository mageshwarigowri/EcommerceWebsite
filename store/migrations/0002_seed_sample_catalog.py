from decimal import Decimal

from django.db import migrations


def seed_catalog(apps, schema_editor):
    Category = apps.get_model("store", "Category")
    Product = apps.get_model("store", "Product")

    categories = {
        "villa": Category.objects.get_or_create(
            slug="villa",
            defaults={"name": "Villa", "description": "Premium products for larger homes."},
        )[0],
        "furniture": Category.objects.get_or_create(
            slug="furniture",
            defaults={"name": "Furniture", "description": "Functional furniture for daily use."},
        )[0],
        "smart-home": Category.objects.get_or_create(
            slug="smart-home",
            defaults={"name": "Smart Home", "description": "Connected devices and automation."},
        )[0],
    }

    products = [
        {
            "name": "Smart Garden Villa Lamp",
            "slug": "smart-garden-villa-lamp",
            "description": "Weather-ready lamp with motion sensing and warm evening scenes.",
            "price": Decimal("3999.00"),
            "category": categories["villa"],
        },
        {
            "name": "Modular Oak Coffee Table",
            "slug": "modular-oak-coffee-table",
            "description": "Compact table with hidden storage for modern living rooms.",
            "price": Decimal("7499.00"),
            "category": categories["furniture"],
        },
        {
            "name": "Voice Control Hub",
            "slug": "voice-control-hub",
            "description": "Connects home devices, routines, lighting, and appliances in one place.",
            "price": Decimal("5299.00"),
            "category": categories["smart-home"],
        },
        {
            "name": "Premium Villa Security Kit",
            "slug": "premium-villa-security-kit",
            "description": "Door sensors, indoor camera, and instant phone alerts for larger homes.",
            "price": Decimal("12999.00"),
            "category": categories["villa"],
        },
        {
            "name": "Ergonomic Work Chair",
            "slug": "ergonomic-work-chair",
            "description": "Breathable mesh chair with adjustable lumbar support and tilt control.",
            "price": Decimal("8999.00"),
            "category": categories["furniture"],
        },
        {
            "name": "Smart Energy Monitor",
            "slug": "smart-energy-monitor",
            "description": "Tracks appliance usage and helps optimize daily power consumption.",
            "price": Decimal("4599.00"),
            "category": categories["smart-home"],
        },
    ]

    for product in products:
        Product.objects.get_or_create(slug=product["slug"], defaults=product)


def unseed_catalog(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Category = apps.get_model("store", "Category")
    Product.objects.filter(
        slug__in=[
            "smart-garden-villa-lamp",
            "modular-oak-coffee-table",
            "voice-control-hub",
            "premium-villa-security-kit",
            "ergonomic-work-chair",
            "smart-energy-monitor",
        ]
    ).delete()
    Category.objects.filter(slug__in=["villa", "furniture", "smart-home"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("store", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_catalog, unseed_catalog),
    ]
