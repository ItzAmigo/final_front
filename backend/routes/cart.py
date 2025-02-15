# backend/routes/cart.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Cart, CartItem, Product

cart_bp = Blueprint('cart', __name__)


@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(user_id=user_id).first()

    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()

    return jsonify({
        'items': [{
            'id': item.id,
            'product_id': item.product_id,
            'quantity': item.quantity,
            'product': {
                'name': item.product.name,
                'price': item.product.price,
                'image_url': item.product.image_url
            }
        } for item in cart.items]
    })


@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()

        product = Product.query.get_or_404(data['product_id'])
        cart_item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=data['product_id']
        ).first()

        if cart_item:
            cart_item.quantity += data.get('quantity', 1)
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=data['product_id'],
                quantity=data.get('quantity', 1)
            )
            db.session.add(cart_item)

        db.session.commit()
        return jsonify({'message': 'Item added to cart'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@cart_bp.route('/update/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return jsonify({'error': 'Cart not found'}), 404

        cart_item = CartItem.query.filter_by(
            id=item_id,
            cart_id=cart.id
        ).first()

        if not cart_item:
            return jsonify({'error': 'Item not found'}), 404

        cart_item.quantity = data['quantity']
        db.session.commit()

        return jsonify({'message': 'Cart updated'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@cart_bp.route('/remove/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    try:
        user_id = get_jwt_identity()
        cart = Cart.query.filter_by(user_id=user_id).first()

        if not cart:
            return jsonify({'error': 'Cart not found'}), 404

        cart_item = CartItem.query.filter_by(
            id=item_id,
            cart_id=cart.id
        ).first()

        if not cart_item:
            return jsonify({'error': 'Item not found'}), 404

        db.session.delete(cart_item)
        db.session.commit()

        return jsonify({'message': 'Item removed from cart'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400