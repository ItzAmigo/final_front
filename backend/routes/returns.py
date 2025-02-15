from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Return, ReturnItem, Order, OrderItem, Product, User
from datetime import datetime

from routes.admin import admin_bp

returns_bp = Blueprint('returns', __name__)


@returns_bp.route('/', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required(optional=True)
def handle_returns():
    if request.method == 'OPTIONS':
        return '', 200

    if request.method == 'GET':
        try:
            user_id = get_jwt_identity()
            returns = Return.query.filter_by(user_id=user_id).order_by(Return.created_at.desc()).all()

            return jsonify({
                'returns': [{
                    'id': r.id,
                    'order_id': r.order_id,
                    'status': r.status,
                    'status_display': r.status_display,
                    'created_at': r.created_at.isoformat(),
                    'reason': r.reason,
                    'comments': r.comments,
                    'refund_amount': r.refund_amount,
                    'items': [{
                        'id': item.id,
                        'product_name': item.order_item.product.name,
                        'quantity': item.quantity,
                        'reason': item.reason,
                        'condition': item.condition
                    } for item in r.items]
                } for r in returns]
            })
        except Exception as e:
            print(f"Error fetching returns: {str(e)}")
            return jsonify({'error': str(e)}), 500

    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        print("Received data:", data)  # Debug incoming data

        if 'items' not in data:
            return jsonify({'error': 'Missing items'}), 400

        for item in data['items']:
            if 'order_item_id' not in item:
                return jsonify({'error': 'Missing order_item_id'}), 400
            print("Item data:", item)  # Debug individual items

        order = Order.query.filter_by(id=data['order_id'], user_id=user_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        if order.status not in ['delivered', 'completed']:
            return jsonify({'error': 'Order must be delivered to create return'}), 400

        return_request = Return(
            order_id=order.id,
            user_id=user_id,
            reason=data['reason'],
            comments=data.get('comments', ''),
            status='pending'
        )

        db.session.add(return_request)
        db.session.flush()

        total_refund = 0
        for item_data in data['items']:
            order_item = OrderItem.query.get(item_data['order_item_id'])
            if not order_item or order_item.order_id != order.id:
                db.session.rollback()
                return jsonify({'error': 'Invalid order item'}), 400

            if item_data['quantity'] > order_item.quantity:
                db.session.rollback()
                return jsonify({'error': 'Return quantity exceeds ordered quantity'}), 400

            return_item = ReturnItem(
                return_id=return_request.id,
                order_item_id=order_item.id,
                quantity=item_data['quantity'],
                reason=item_data.get('reason', ''),
                condition=item_data.get('condition', 'used')
            )

            total_refund += order_item.price * item_data['quantity']
            db.session.add(return_item)

        return_request.refund_amount = total_refund
        db.session.commit()

        return jsonify({
            'message': 'Return request created successfully',
            'return_id': return_request.id
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating return: {str(e)}")
        return jsonify({'error': str(e)}), 500


@returns_bp.route('/<int:return_id>', methods=['GET'])
@jwt_required()
def get_return(return_id):
    try:
        user_id = get_jwt_identity()
        return_request = Return.query.filter_by(id=return_id, user_id=user_id).first()

        if not return_request:
            return jsonify({'error': 'Return request not found'}), 404

        return jsonify({
            'id': return_request.id,
            'order_id': return_request.order_id,
            'status': return_request.status,
            'status_display': return_request.status_display,
            'created_at': return_request.created_at.isoformat(),
            'reason': return_request.reason,
            'comments': return_request.comments,
            'refund_amount': return_request.refund_amount,
            'items': [{
                'id': item.id,
                'product_name': item.order_item.product.name,
                'quantity': item.quantity,
                'reason': item.reason,
                'condition': item.condition
            } for item in return_request.items]
        })
    except Exception as e:
        print(f"Error fetching return: {str(e)}")
        return jsonify({'error': str(e)}), 500


@returns_bp.route('/admin/returns', methods=['GET'])
@jwt_required()
def admin_get_returns():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.email != 'admin@example.com':
            return jsonify({'error': 'Unauthorized'}), 403

        returns = Return.query.order_by(Return.created_at.desc()).all()

        return jsonify({
            'returns': [{
                'id': r.id,
                'order_id': r.order_id,
                'user_email': r.user.email,
                'status': r.status,
                'status_display': r.status_display,
                'created_at': r.created_at.isoformat(),
                'reason': r.reason,
                'comments': r.comments,
                'refund_amount': r.refund_amount,
                'items': [{
                    'id': item.id,
                    'product_name': item.order_item.product.name,
                    'quantity': item.quantity,
                    'reason': item.reason,
                    'condition': item.condition
                } for item in r.items]
            } for r in returns]
        })
    except Exception as e:
        print(f"Error fetching admin returns: {str(e)}")
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/returns/<int:return_id>/update-status', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def admin_update_return_status(return_id):
    if request.method == 'OPTIONS':
        return '', 200

    current_user_id = str(get_jwt_identity())
    current_user = User.query.get(int(current_user_id))

    if not current_user or current_user.email != 'admin@example.com':
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    return_request = Return.query.get_or_404(return_id)
    return_request.status = data['status']

    if data.get('comments'):
        return_request.comments += f"\n\nAdmin comment: {data['comments']}"

    db.session.commit()
    return jsonify({'message': 'Return status updated successfully'})