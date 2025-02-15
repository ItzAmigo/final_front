from app import create_app
from models import db, Product

app = create_app()

with app.app_context():
    Product.query.delete()

    products = [
        # Phones
        Product(name='iPhone 13', description='A15 Bionic chip, Pro camera system', price=399999.99, stock=10,
                category='Phones', image_url='https://via.placeholder.com/300'),
        Product(name='Samsung Galaxy S21', description='5G enabled, 108MP camera', price=349999.99, stock=15,
                category='Phones', image_url='https://via.placeholder.com/300'),
        Product(name='Google Pixel 6', description='Google Tensor chip, Night Sight camera', price=299999.99, stock=8,
                category='Phones', image_url='https://via.placeholder.com/300'),
        Product(name='OnePlus 9', description='Hasselblad camera, Warp Charge', price=279999.99, stock=12,
                category='Phones', image_url='https://via.placeholder.com/300'),

        # TVs
        Product(name='Samsung QLED 4K', description='65" Smart TV with Quantum Processor', price=899999.99, stock=5,
                category='TV', image_url='https://via.placeholder.com/300'),
        Product(name='LG OLED C1', description='55" 4K Gaming TV', price=699999.99, stock=7, category='TV',
                image_url='https://via.placeholder.com/300'),
        Product(name='Sony Bravia XR', description='75" 8K HDR Smart TV', price=1299999.99, stock=3, category='TV',
                image_url='https://via.placeholder.com/300'),
        Product(name='TCL 6-Series', description='65" Roku Smart TV', price=399999.99, stock=10, category='TV',
                image_url='https://via.placeholder.com/300'),

        # Laptops
        Product(name='MacBook Pro', description='14" M1 Pro chip, 16GB RAM', price=799999.99, stock=8,
                category='Laptops', image_url='https://via.placeholder.com/300'),
        Product(name='Dell XPS 15', description='4K OLED, RTX 3050 Ti', price=749999.99, stock=6, category='Laptops',
                image_url='https://via.placeholder.com/300'),
        Product(name='Lenovo ThinkPad X1', description='Intel i7, 32GB RAM', price=649999.99, stock=9,
                category='Laptops', image_url='https://via.placeholder.com/300'),
        Product(name='ASUS ROG Zephyrus', description='AMD Ryzen 9, RTX 3080', price=899999.99, stock=4,
                category='Laptops', image_url='https://via.placeholder.com/300')
    ]

    db.session.bulk_save_objects(products)
    db.session.commit()