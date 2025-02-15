# backend/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, DeliveryUpdate, User
from datetime import datetime

admin_bp = Blueprint('admin', __name__)


def is_admin(user_id):
    user = User.query.get(user_id)
    return user and user.is_admin

@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_all_orders():
    try:
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return jsonify({'error': 'Unauthorized'}), 403

        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify({
            'orders': [{
                'id': order.id,
                'user_id': order.user_id,
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'shipping_address': order.shipping_address,
                'total_amount': order.total_amount,
                'tracking_number': order.tracking_number,
                'delivery_updates': [{
                    'status': update.status,
                    'location': update.location,
                    'timestamp': update.timestamp.isoformat(),
                    'description': update.description
                } for update in order.delivery_updates]
            } for order in orders]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/orders/<int:order_id>/update-status', methods=['POST'])
@jwt_required()
def update_order_status(order_id):
    try:
        user_id = get_jwt_identity()
        if not is_admin(user_id):
            return jsonify({'error': 'Unauthorized'}), 403

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
                'tracking_number': order.tracking_number,
                'delivery_updates': [{
                    'status': update.status,
                    'location': update.location,
                    'timestamp': update.timestamp.isoformat(),
                    'description': update.description
                } for update in order.delivery_updates]
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500