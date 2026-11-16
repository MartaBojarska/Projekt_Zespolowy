from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# 1. Konfiguracja aplikacji i bazy danych SQLite
app = Flask(__name__)
# Baza zostanie utworzona w tym samym folderze jako 'database.sqlite'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 2. Definicje Modeli (Tabel)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False) # Zmienione na długi string pod hashe
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    
    # Relacja do zamówień
    orders = db.relationship('Order', backref='customer', lazy=True)

class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(255), nullable=False) # Ścieżka do zdjęcia

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "stock_quantity": self.stock_quantity,
            "image_url": self.image_url
        }

class Order(db.Model):
    __tablename__ = 'order'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='W realizacji')
    
    # Relacja do pozycji w zamówieniu
    items = db.relationship('OrderItem', backref='order', lazy=True)

class OrderItem(db.Model):
    __tablename__ = 'order_item'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False) # Zapisujemy cenę z momentu zakupu

# 3. Inicjalizacja bazy danych
if __name__ == '__main__':
    # Context aplikacji jest wymagany do operacji na bazie przed uruchomieniem serwera
    with app.app_context():
        # Ta komenda tworzy plik database.sqlite i wszystkie tabele, jeśli jeszcze nie istnieją
        db.create_all()
        print("Baza danych 'database.sqlite' została pomyślnie wygenerowana!")