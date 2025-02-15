# backend/add_products.py
from app import create_app
from models import db, Product

app = create_app()

with app.app_context():
    new_products = [
        Product(name='iPhone 14 Pro', description='A16 chip, 48MP camera', price=479999.99, stock=7, category='Phones',
                image_url='https://via.placeholder.com/300'),
        Product(name='Xiaomi 12', description='Snapdragon 8, 120W charging', price=249999.99, stock=15,
                category='Phones', image_url='https://via.placeholder.com/300'),
        Product(name='Huawei P50', description='Leica cameras, HarmonyOS', price=289999.99, stock=10, category='Phones',
                image_url='https://via.placeholder.com/300'),

        Product(name='Hisense U8H', description='65" Mini-LED TV', price=459999.99, stock=8, category='TV',
                image_url='https://via.placeholder.com/300'),
        Product(name='Philips OLED+', description='55" Ambilight TV', price=579999.99, stock=6, category='TV',
                image_url='https://via.placeholder.com/300'),

        Product(name='HP Spectre x360', description='2-in-1 laptop, OLED', price=549999.99, stock=12,
                category='Laptops', image_url='https://via.placeholder.com/300'),
        Product(name='Razer Blade 14', description='AMD Ryzen 9, RTX 3070', price=679999.99, stock=5,
                category='Laptops', image_url='https://via.placeholder.com/300'),
        Product(name='Acer Swift 5', description='Intel Evo, 14" touch', price=399999.99, stock=9, category='Laptops',
                image_url='https://via.placeholder.com/300'),
    ]

    db.session.bulk_save_objects(new_products)
    db.session.commit()