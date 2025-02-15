# backend/routes/admin.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, DeliveryUpdate, User, Return
from datetime import datetime

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_all_orders():
    try:
        current_user_id = str(get_jwt_identity())  # Преобразуем в строку
        current_user = User.query.get(int(current_user_id))  # Преобразуем обратно в число для запроса

        if not current_user or current_user.email != 'admin@example.com':
            return jsonify({'error': 'Unauthorized access'}), 403

        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify({
            'orders': [{
                'id': order.id,
                'status': order.status,
                'status_display': order.status_display,
                'user_id': order.user_id,
                'created_at': order.created_at.isoformat(),
                'updated_at': order.updated_at.isoformat() if order.updated_at else None,
                'shipping_address': order.shipping_address,
                'total_amount': order.total_amount,
                'delivery_method': order.delivery_method,
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
                } for update in order.delivery_updates] if order.delivery_updates else []
            } for order in orders]
        })
    except Exception as e:
        print(f"Error in admin get_all_orders: {str(e)}")
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/orders/<int:order_id>/update-status', methods=['POST'])
@jwt_required()
def update_order_status(order_id):
    try:
        current_user_id = str(get_jwt_identity())
        current_user = User.query.get(int(current_user_id))

        if not current_user or current_user.email != 'admin@example.com':
            return jsonify({'error': 'Unauthorized access'}), 403

        data = request.get_json()
        order = Order.query.get_or_404(order_id)

        # Обновляем статус заказа
        order.status = data['status']

        # Если заказ отправлен, генерируем трекинг номер
        if data['status'] == 'shipped' and not order.tracking_number:
            order.tracking_number = f"KZ{order.id}{datetime.now().strftime('%Y%m%d%H%M')}"

        # Создаем запись об обновлении доставки
        update = DeliveryUpdate(
            order_id=order_id,
            status=data['status'],
            location=data.get('location', 'Almaty Warehouse'),
            description=data.get('description', f"Order status updated to {data['status']}")
        )

        db.session.add(update)
        db.session.commit()

        return jsonify({
            'message': 'Order updated successfully',
            'order': {
                'id': order.id,
                'status': order.status,
                'tracking_number': order.tracking_number
            }
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error in admin update_order_status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/returns', methods=['GET'])
@jwt_required()
def admin_get_returns():
    try:
        current_user_id = str(get_jwt_identity())
        current_user = User.query.get(int(current_user_id))

        if not current_user or current_user.email != 'admin@example.com':
            return jsonify({'error': 'Unauthorized access'}), 403

        returns = Return.query.order_by(Return.created_at.desc()).all()
        return jsonify({
            'returns': [{
                'id': r.id,
                'order_id': r.order_id,
                'status': r.status,
                'reason': r.reason,
                'created_at': r.created_at.isoformat(),
                'items': [{
                    'product_name': item.order_item.product.name,
                    'quantity': item.quantity,
                    'condition': item.condition
                } for item in r.items]
            } for r in returns]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500