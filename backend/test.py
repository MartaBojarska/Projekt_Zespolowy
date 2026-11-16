import pytest
from app import app
from database import db, Product, User
from werkzeug.security import generate_password_hash


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


def test_get_products_returns_200_and_list(client):
    with app.app_context():
        product = Product(
            name="Miód Wielokwiatowy",
            price=28.00,
            stock_quantity=12,
            image_url="./images/miod.jpg"
        )
        db.session.add(product)
        db.session.commit()

    response = client.get('/api/products')
    assert response.status_code == 200

    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == "Miód Wielokwiatowy"
    assert data[0]["price"] == 28.00


def test_get_single_product_not_found_returns_404(client):
    response = client.get('/api/products/999')
    assert response.status_code == 404


def test_login_missing_json_returns_400(client):
    response = client.post('/api/login', json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "Brak danych"


def test_login_invalid_credentials_returns_401(client):
    with app.app_context():
        user = User(
            email="jan@honeyshop.pl",
            password=generate_password_hash("PrawidloweHaslo123"),
            first_name="Jan",
            last_name="Kowalski",
            address="ul. Miodowa 1"
        )
        db.session.add(user)
        db.session.commit()

    wrong_password_res = client.post('/api/login', json={
        "email": "jan@honeyshop.pl",
        "password": "ZleHaslo999"
    })
    assert wrong_password_res.status_code == 401
    assert wrong_password_res.get_json()["error"] == "Nieprawidłowy e-mail lub hasło"

    nonexistent_user_res = client.post('/api/login', json={
        "email": "nieistniejacy@honeyshop.pl",
        "password": "PrawidloweHaslo123"
    })
    assert nonexistent_user_res.status_code == 401
    assert nonexistent_user_res.get_json()["error"] == "Nieprawidłowy e-mail lub hasło"


def test_login_valid_credentials_returns_200(client):
    with app.app_context():
        user = User(
            email="jan@honeyshop.pl",
            password=generate_password_hash("PrawidloweHaslo123"),
            first_name="Jan",
            last_name="Kowalski",
            address="ul. Miodowa 1"
        )
        db.session.add(user)
        db.session.commit()

    response = client.post('/api/login', json={
        "email": "jan@honeyshop.pl",
        "password": "PrawidloweHaslo123"
    })
    assert response.status_code == 200
    assert response.get_json()["message"] == "Zalogowano pomyślnie"


def test_protected_profile_endpoint_unauthorized_returns_401(client):
    response = client.get('/api/profile')
    assert response.status_code == 401
    assert response.get_json()["error"] == "Brak autoryzacji"