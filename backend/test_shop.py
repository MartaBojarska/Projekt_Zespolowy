import pytest
from werkzeug.security import check_password_hash
from app import app
from database import db, User, Product, Order, OrderItem


@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SECRET_KEY'] = 'test_secret_key'

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


def test_user_registration_and_password_hashing(client):
    payload = {
        "email": "test@honeyshop.pl",
        "password": "BezpieczneHaslo123!",
        "first_name": "Anna",
        "last_name": "Nowak",
        "address": "ul. Pszczela 5, Warszawa"
    }

    response = client.post('/api/register', json=payload)
    assert response.status_code == 201
    assert response.get_json()["message"] == "Rejestracja przebiegła pomyślnie"

    with app.app_context():
        user = User.query.filter_by(email="test@honeyshop.pl").first()
        assert user is not None
        assert user.first_name == "Anna"
        assert user.password != "BezpieczneHaslo123!"
        assert check_password_hash(user.password, "BezpieczneHaslo123!") is True
        assert check_password_hash(user.password, "ZleHaslo") is False


def test_duplicate_email_registration(client):
    payload = {
        "email": "duplikat@honeyshop.pl",
        "password": "Haslo123",
        "first_name": "Jan",
        "last_name": "Kowalski",
        "address": "ul. Miodowa 1"
    }

    first_response = client.post('/api/register', json=payload)
    assert first_response.status_code == 201

    second_response = client.post('/api/register', json=payload)
    assert second_response.status_code == 400
    assert "już istnieje" in second_response.get_json()["error"]


def test_order_total_calculation_and_stock_reduction(client):
    with app.app_context():
        p1 = Product(name="Miód Lipowy", price=25.50, stock_quantity=10, image_url="./img1.jpg")
        p2 = Product(name="Miód Akacjowy", price=30.00, stock_quantity=5, image_url="./img2.jpg")
        db.session.add_all([p1, p2])
        db.session.commit()
        p1_id = p1.id
        p2_id = p2.id

    client.post('/api/register', json={
        "email": "klient@honeyshop.pl",
        "password": "HasloKlienta123",
        "first_name": "Piotr",
        "last_name": "Zieliński",
        "address": "ul. Kwiatowa 10"
    })
    login_res = client.post('/api/login', json={
        "email": "klient@honeyshop.pl",
        "password": "HasloKlienta123"
    })
    assert login_res.status_code == 200

    order_res = client.post('/api/orders', json={
        "product_ids": [p1_id, p1_id, p2_id]
    })
    assert order_res.status_code == 201
    order_id = order_res.get_json()["order_id"]

    with app.app_context():
        order = Order.query.get(order_id)
        assert order is not None
        assert order.total_amount == pytest.approx(81.00)
        assert order.status == "W realizacji"

        updated_p1 = Product.query.get(p1_id)
        updated_p2 = Product.query.get(p2_id)
        assert updated_p1.stock_quantity == 8
        assert updated_p2.stock_quantity == 4

        items = OrderItem.query.filter_by(order_id=order_id).all()
        assert len(items) == 2


def test_order_insufficient_stock(client):
    with app.app_context():
        p1 = Product(name="Miód Rzadki", price=50.00, stock_quantity=1, image_url="./img3.jpg")
        db.session.add(p1)
        db.session.commit()
        p1_id = p1.id

    client.post('/api/register', json={
        "email": "kupujacy@honeyshop.pl",
        "password": "Haslo123",
        "first_name": "Ewa",
        "last_name": "Maj",
        "address": "ul. Leśna 3"
    })
    client.post('/api/login', json={
        "email": "kupujacy@honeyshop.pl",
        "password": "Haslo123"
    })

    order_res = client.post('/api/orders', json={
        "product_ids": [p1_id, p1_id]
    })
    assert order_res.status_code == 400
    assert "Niewystarczająca ilość" in order_res.get_json()["error"]