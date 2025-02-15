# backend/routes/auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity
from models import db, User
from datetime import timedelta
import logging

auth_bp = Blueprint('auth', __name__)
logging.basicConfig(level=logging.DEBUG)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        logging.debug(f"Registration attempt with data: {data}")

        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400

        # Проверяем существование пользователя
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email already exists'}), 400

        # Создаем пользователя
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        new_user = User(
            email=data['email'],
            password=hashed_password
        )

        db.session.add(new_user)
        db.session.commit()

        # Создаем токен - преобразуем id в строку
        token = create_access_token(
            identity=str(new_user.id),
            additional_claims={'email': new_user.email},
            fresh=True,
            expires_delta=timedelta(days=1)
        )
        logging.debug(f"Created token for new user: {token}")

        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {
                'id': new_user.id,
                'email': new_user.email
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        logging.error(f"Registration error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        logging.debug(f"Login attempt with data: {data}")

        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=data['email']).first()
        logging.debug(f"Found user: {user is not None}")

        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Создаем токен - преобразуем id в строку
        token = create_access_token(
            identity=str(user.id),
            additional_claims={'email': user.email},
            fresh=True,
            expires_delta=timedelta(days=1)
        )
        logging.debug(f"Created token: {token}")

        response_data = {
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email
            }
        }
        logging.debug(f"Sending response: {response_data}")

        return jsonify(response_data), 200

    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    try:
        auth_header = request.headers.get('Authorization')
        logging.debug(f"Verify token with header: {auth_header}")

        if not auth_header:
            return jsonify({'error': 'No token provided'}), 401

        # Проверяем формат токена
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Invalid token format'}), 401

        return jsonify({
            'message': 'Token received',
            'header': auth_header
        }), 200

    except Exception as e:
        logging.error(f"Token verification error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No token provided'}), 401

        # Получаем id пользователя из токена (строка)
        user_id = get_jwt_identity()
        # Преобразуем в число для запроса
        user = User.query.get(int(user_id))

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email
            }
        }), 200

    except Exception as e:
        logging.error(f"Get current user error: {str(e)}")
        return jsonify({'error': str(e)}), 500