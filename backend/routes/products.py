# backend/routes/products.py
from flask import Blueprint, jsonify, request
from models import db, Product
from sqlalchemy import or_

products_bp = Blueprint('products', __name__)


@products_bp.route('/<int:id>', methods=['GET'])
def get_product(id):
    try:
        print(f"Fetching product with ID: {id}")  # Добавляем логирование
        product = Product.query.get(id)

        if not product:
            print(f"Product with ID {id} not found")  # Добавляем логирование
            return jsonify({'error': 'Product not found'}), 404

        # Добавляем логирование найденного продукта
        print(f"Found product: {product.name}")

        return jsonify({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'stock': product.stock,
            'category': product.category,
            'image_url': product.image_url
        })
    except Exception as e:
        print(f"Error fetching product: {str(e)}")  # Добавляем логирование ошибки
        return jsonify({'error': str(e)}), 500

@products_bp.route('/', methods=['GET'])
def get_products():
    try:
        # Логируем входящие параметры
        print("Received params:", request.args)

        # Получаем параметры фильтрации
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        min_price = request.args.get('min_price')
        max_price = request.args.get('max_price')

        # Начинаем с базового запроса
        query = Product.query

        # Применяем поиск по названию и описанию
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term)
                )
            )

        # Фильтр по категории
        if category:
            query = query.filter(Product.category == category)

        # Фильтры по цене
        if min_price:
            try:
                min_price = float(min_price)
                query = query.filter(Product.price >= min_price)
            except ValueError:
                print(f"Invalid min_price value: {min_price}")

        if max_price:
            try:
                max_price = float(max_price)
                query = query.filter(Product.price <= max_price)
            except ValueError:
                print(f"Invalid max_price value: {max_price}")

        # Получаем все категории для фильтра
        categories = db.session.query(Product.category).distinct().all()
        categories = [cat[0] for cat in categories if cat[0]]

        # Получаем продукты
        products = query.all()

        # Логируем результаты
        print(f"Found {len(products)} products matching criteria")

        response_data = {
            'products': [{
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'price': p.price,
                'stock': p.stock,
                'category': p.category,
                'image_url': p.image_url
            } for p in products],
            'categories': categories
        }

        return jsonify(response_data)

    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({'error': f'Failed to fetch products: {str(e)}'}), 500


