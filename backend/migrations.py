# backend/migrations.py
from flask_migrate import Migrate
from app import create_app
from models import db

app = create_app()
migrate = Migrate(app, db)

if __name__ == '__main__':
    app.run()