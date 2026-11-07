# seed_db.py
from database import app, db, Product

def seed_products():
    with app.app_context():
        # Najpierw sprawdzamy, czy w bazie są już jakieś produkty. 
        # Jeśli tak, to nie dodajemy ich ponownie, by uniknąć duplikatów.
        if Product.query.first():
            print("W bazie znajdują się już produkty. Przerywam zasilanie (seeding).")
            return

        # Tworzymy listę obiektów produktów.
        # Zauważ, że pole 'image_url' zawiera ścieżki zgodne z nazwami plików 
        # w Twoim folderze 'frontend/images/'
        products_to_add = [
            Product(
                name="Miód Lipowy",
                price=25.99,
                stock_quantity=10,
                image_url="./images/miod-100ml.jpg" 
            ),
            Product(
                name="Miód naturalny 40ml",
                price=99.00,  # Zgodnie ze stroną produkt_miod40ml_5.html
                stock_quantity=15, 
                image_url="./images/sloik_z_miodem_40ml.jpg"
            ),
            Product(
                name="Miód akacjowy 100ml",
                price=99.00,  # Zgodnie ze stroną produkt_miod100ml_5.html
                stock_quantity=8,
                image_url="./images/miod-100ml.jpg"
            ),
            Product(
                name="Koszulka z motywem miodu (Biała)",
                price=99.00,
                stock_quantity=50,
                image_url="./images/tshirt_white.png"
            ),
            Product(
                name="Koszulka z motywem miodu (Czarna)",
                price=99.00,
                stock_quantity=50,
                image_url="./images/tshirt_black.png"
            )
        ]

        # Dodajemy wszystkie produkty do sesji bazy danych
        db.session.add_all(products_to_add)
        
        # Zapisujemy zmiany na stałe (commit)
        db.session.commit()
        
        print("Baza danych została pomyślnie zasilona (seeded) podstawowymi produktami!")

if __name__ == '__main__':
    seed_products()