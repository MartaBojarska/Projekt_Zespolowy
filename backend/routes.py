from flask import Blueprint, jsonify, request, session, abort
from werkzeug.security import generate_password_hash, check_password_hash
from database import db, Product, User, Order, OrderItem

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@api_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    product = Product.query.get(product_id)
    if not product:
        abort(404, description="Produkt nie został znaleziony")
    return jsonify(product.to_dict())

@api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Brak danych"}), 400
    
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    address = data.get('address')

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Użytkownik o takim adresie e-mail już istnieje"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(
        email=email,
        password=hashed_password,
        first_name=first_name,
        last_name=last_name,
        address=address
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Rejestracja przebiegła pomyślnie"}), 201

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Brak danych"}), 400

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Nieprawidłowy e-mail lub hasło"}), 401

    session['user_id'] = user.id
    session['user_email'] = user.email

    return jsonify({"message": "Zalogowano pomyślnie"}), 200

@api_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Wylogowano pomyślnie"}), 200

@api_bp.route('/profile', methods=['GET'])
def get_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Brak autoryzacji"}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Użytkownik nie znaleziony"}), 404
    return jsonify({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "address": user.address
    }), 200

@api_bp.route('/orders', methods=['POST'])
def create_order():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Musisz być zalogowany, aby złożyć zamówienie"}), 401
    
    data = request.get_json()
    if not data or 'product_ids' not in data:
        return jsonify({"error": "Brak produktów w żądaniu"}), 400
        
    product_ids = data['product_ids']
    if not product_ids:
        return jsonify({"error": "Koszyk jest pusty"}), 400
        
    product_counts = {}
    for pid in product_ids:
        pid_int = int(pid)
        product_counts[pid_int] = product_counts.get(pid_int, 0) + 1
        
    total_amount = 0.0
    order_items_data = []
    
    for pid, qty in product_counts.items():
        product = Product.query.get(pid)
        if not product:
            return jsonify({"error": f"Produkt o ID {pid} nie istnieje"}), 404
        if product.stock_quantity < qty:
            return jsonify({"error": f"Niewystarczająca ilość produktu {product.name} w magazynie"}), 400
        
        item_total = product.price * qty
        total_amount += item_total
        order_items_data.append({
            'product': product,
            'quantity': qty,
            'price': product.price
        })
        
    new_order = Order(
        user_id=user_id,
        total_amount=total_amount,
        status='W realizacji'
    )
    db.session.add(new_order)
    db.session.flush()
    
    for item in order_items_data:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item['product'].id,
            quantity=item['quantity'],
            price_at_purchase=item['price']
        )
        item['product'].stock_quantity -= item['quantity']
        db.session.add(order_item)
        
    db.session.commit()
    return jsonify({"message": "Zamówienie zostało złożone pomyślnie", "order_id": new_order.id}), 201

@api_bp.route('/orders/history', methods=['GET'])
def order_history():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Brak autoryzacji"}), 401
        
    orders = Order.query.filter_by(user_id=user_id).all()
    result = []
    for order in orders:
        items_list = []
        for item in order.items:
            product = Product.query.get(item.product_id)
            items_list.append({
                "product_name": product.name if product else "Produkt",
                "quantity": item.quantity,
                "price": item.price_at_purchase
            })
        result.append({
            "id": order.id,
            "order_date": order.order_date.strftime('%Y-%m-%d %H:%M'),
            "total_amount": order.total_amount,
            "status": order.status,
            "items": items_list
        })
        
    return jsonify(result), 200