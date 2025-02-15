# backend/routes/orders.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, Product, DeliveryUpdate
from datetime import datetime, timedelta

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    try:
        # Получаем id пользователя из токена
        user_id = str(get_jwt_identity())  # Преобразуем в строку
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        print("Creating order for user:", user_id)
        print("Order data:", data)

        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ['shipping_address', 'delivery_method', 'items']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Создаем заказ
        order = Order(
            user_id=int(user_id),  # Преобразуем обратно в число
            shipping_address=data['shipping_address'],
            delivery_method=data['delivery_method'],
            status='pending',
            total_amount=0,
            estimated_delivery=datetime.utcnow() + timedelta(days=5)
        )

        db.session.add(order)
        db.session.flush()

        total_amount = 0
        for item in data['items']:
            product = Product.query.get(item['product_id'])
            if not product:
                db.session.rollback()
                return jsonify({"error": f"Product {item['product_id']} not found"}), 404

            if product.stock < item['quantity']:
                db.session.rollback()
                return jsonify({"error": f"Not enough stock for {product.name}"}), 400

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item['quantity'],
                price=product.price
            )

            product.stock -= item['quantity']
            total_amount += product.price * item['quantity']
            db.session.add(order_item)

        # Добавляем стоимость доставки
        delivery_cost = 1000
        total_amount += delivery_cost
        order.total_amount = total_amount

        # Создаем первую запись в истории доставки
        delivery_update = DeliveryUpdate(
            order_id=order.id,
            status='pending',
            location='Order Processing Center',
            description='Order received and pending processing'
        )
        db.session.add(delivery_update)

        db.session.commit()
        return jsonify({
            "message": "Order created successfully",
            "order_id": order.id,
            "total_amount": total_amount
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating order: {str(e)}")
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        user_id = get_jwt_identity()
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()

        return jsonify({
            'orders': [{
                'id': order.id,
                'status': order.status,
                'status_display': order.status_display,
                'created_at': order.created_at.isoformat(),
                'updated_at': order.updated_at.isoformat(),
                'total_amount': order.total_amount,
                'delivery_method': order.delivery_method,
                'shipping_address': order.shipping_address,
                'tracking_number': order.tracking_number,
                'current_location': order.current_location,
                'estimated_delivery': order.estimated_delivery.isoformat() if order.estimated_delivery else None,
                'items': [{
                    'product_name': item.product.name,
                    'quantity': item.quantity,
                    'price': item.price,
                    'subtotal': item.price * item.quantity
                } for item in order.items],
                'delivery_updates': [{
                    'status': update.status,
                    'location': update.location,
                    'timestamp': update.timestamp.isoformat(),
                    'description': update.description
                } for update in order.delivery_updates]
            } for order in orders]
        })
    except Exception as e:
        print(f"Error fetching orders: {str(e)}")
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    try:
        user_id = get_jwt_identity()
        order = Order.query.filter_by(id=order_id, user_id=user_id).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        return jsonify({
            'id': order.id,
            'status': order.status,
            'status_display': order.status_display,
            'created_at': order.created_at.isoformat(),
            'updated_at': order.updated_at.isoformat(),
            'total_amount': order.total_amount,
            'delivery_method': order.delivery_method,
            'shipping_address': order.shipping_address,
            'tracking_number': order.tracking_number,
            'current_location': order.current_location,
            'estimated_delivery': order.estimated_delivery.isoformat() if order.estimated_delivery else None,
            'items': [{
                'id': item.id,  # Include OrderItem ID
                'product_name': item.product.name,
                'quantity': item.quantity,
                'price': item.price,
                'subtotal': item.price * item.quantity
            } for item in order.items],
            'delivery_updates': [{
                'status': update.status,
                'location': update.location,
                'timestamp': update.timestamp.isoformat(),
                'description': update.description
            } for update in order.delivery_updates]
        })
    except Exception as e:
        print(f"Error fetching order: {str(e)}")
        return jsonify({"error": str(e)}), 500


@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    try:
        user_id = get_jwt_identity()
        order = Order.query.filter_by(id=order_id, user_id=user_id).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        if order.status not in ['pending', 'confirmed']:
            return jsonify({'error': 'Order cannot be cancelled'}), 400

        # Возвращаем товары на склад
        for item in order.items:
            product = Product.query.get(item.product_id)
            if product:
                product.stock += item.quantity

        order.status = 'cancelled'

        # Добавляем запись об отмене в историю доставки
        cancellation_update = DeliveryUpdate(
            order_id=order.id,
            status='cancelled',
            location=order.current_location,
            description='Order cancelled by customer'
        )
        db.session.add(cancellation_update)

        db.session.commit()

        return jsonify({
            'message': 'Order cancelled successfully',
            'order_id': order.id
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling order: {str(e)}")
        return jsonify({"error": str(e)}), 500