# backend/app.py
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta
import os
from dotenv import load_dotenv
from models import db, User
from werkzeug.security import generate_password_hash

from routes.returns import returns_bp

load_dotenv()

def create_admin_user():
    admin = User.query.filter_by(email='admin@example.com').first()
    if not admin:
        admin = User(
            email='admin@example.com',
            password=generate_password_hash('admin123', method='pbkdf2'),
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()

def create_app():
    app = Flask(__name__)

    # CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5174"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })

    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL',
                                                      'postgresql://postgres:postgres@localhost/electronics_store')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # JWT configuration
    app.config['JWT_SECRET_KEY'] = 'your-secret-key-keep-it-secret'  # В продакшене использовать env
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)

    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return str(user)

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(id=identity).one_or_none()

    # Import blueprints
    from routes.auth import auth_bp
    from routes.products import products_bp
    from routes.orders import orders_bp
    from routes.cart import cart_bp
    from routes.admin import admin_bp

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(returns_bp, url_prefix='/api/returns')

    return app


app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_admin_user()

    app.run(debug=True)