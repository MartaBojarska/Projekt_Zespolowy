// --- CZYSTE FUNKCJE (DO TESTOWANIA) ---

function isNotEmpty(value) {
    return value.trim() !== "";
}

function doPasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}

function addToCart(currentCart, productId) {
    if (!productId) return currentCart;
    const newCart = [...currentCart]; 
    newCart.push(productId);
    return newCart;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isNotEmpty, doPasswordsMatch, addToCart };
}

// --- LOGIKA APLIKACJI (POŁĄCZENIE Z DOM) ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("Plik main.js został poprawnie załadowany i podpięty!");

    // --- NOWA LOGIKA KOSZYKA (DELEGACJA ZDARZEŃ) ---
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart-btn")) {
            const productId = event.target.getAttribute("data-id");

            if (productId) {
                let currentCart = JSON.parse(localStorage.getItem("honeyShopCart")) || [];
                let updatedCart = addToCart(currentCart, productId);
                localStorage.setItem("honeyShopCart", JSON.stringify(updatedCart));
                alert("Dodano do koszyka!");
            }
        }
    });

    // --- DYNAMICZNE ŁADOWANIE PRODUKTÓW Z API ---
    const productsList = document.getElementById("products-list");
    
    if (productsList) {
        fetchProducts();
    }

    async function fetchProducts() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/products");
            
            if (!response.ok) {
                throw new Error("Błąd sieci lub serwera");
            }

            const products = await response.json();
            
            productsList.innerHTML = "";

            products.forEach(product => {
                const productCard = document.createElement("div");
                productCard.className = "product";
                
                productCard.innerHTML = `
                    <h2>${product.name}</h2>
                    <p>Cena: ${product.price.toFixed(2)} PLN</p>
                    <p>Dostępna ilość: ${product.stock_quantity} szt.</p>
                    <button class="order-btn add-to-cart-btn" data-id="${product.id}">Zamów</button>
                `;
                
                productsList.appendChild(productCard);
            });

        } catch (error) {
            console.error("Wystąpił problem z pobraniem produktów:", error);
            productsList.innerHTML = "<p style='color: red;'>Nie udało się załadować produktów. Upewnij się, że serwer backendowy jest włączony.</p>";
        }
    }

    // --- DYNAMICZNY PANEL KLIENTA ---
    const profileContainer = document.getElementById("profile-container");
    const ordersList = document.getElementById("orders-list");

    // Skrypt uruchomi się tylko wtedy, gdy na stronie istnieją odpowiednie kontenery (czyli w Panelu Klienta)
    if (profileContainer && ordersList) {
        loadCustomerPanel();
    }

    async function loadCustomerPanel() {
        try {
            // 1. Pobieranie profilu użytkownika
            const profileResponse = await fetch("http://127.0.0.1:5000/api/profile", {
                method: 'GET',
                credentials: 'include' // Wymagane, aby wysłać ciasteczko sesji do Flaska
            });

            // Obsługa braku autoryzacji (błąd 401)
            if (profileResponse.status === 401) {
                window.location.href = "logowanie.html";
                return; // Przerywamy dalsze wykonywanie funkcji
            }

            if (!profileResponse.ok) throw new Error("Błąd pobierania danych profilu");

            const profileData = await profileResponse.json();

            // Wypełnianie HTML danymi klienta
            profileContainer.innerHTML = `
                <p><strong>Imię:</strong> ${profileData.first_name}</p>
                <p><strong>Nazwisko:</strong> ${profileData.last_name}</p>
                <p><strong>Email:</strong> ${profileData.email}</p>
                <p><strong>Adres:</strong> ${profileData.address}</p>
            `;

            // 2. Pobieranie historii zamówień
            const ordersResponse = await fetch("http://127.0.0.1:5000/api/orders/history", {
                method: 'GET',
                credentials: 'include'
            });

            if (!ordersResponse.ok) throw new Error("Błąd pobierania historii zamówień");

            const ordersData = await ordersResponse.json();

            // Czyszczenie napisu "Ładowanie historii..."
            ordersList.innerHTML = "";

            if (ordersData.length === 0) {
                ordersList.innerHTML = `<tr><td colspan="4" style="text-align: center;">Nie masz jeszcze żadnych zamówień.</td></tr>`;
            } else {
                // Generowanie wierszy tabeli dla każdego zamówienia
                ordersData.forEach(order => {
                    // Łączenie produktów w jeden tekst, np. "Miód Lipowy x2 <br> Koszulka x1"
                    const itemsString = order.items.map(item => `${item.product_name} x${item.quantity}`).join("<br>");

                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${order.order_date}</td>
                        <td>${itemsString}</td>
                        <td>${order.total_amount.toFixed(2)} PLN</td>
                        <td>${order.status}</td>
                    `;
                    ordersList.appendChild(tr);
                });
            }

        } catch (error) {
            console.error("Wystąpił problem w panelu klienta:", error);
            profileContainer.innerHTML = "<p style='color: red;'>Wystąpił błąd podczas komunikacji z serwerem.</p>";
            ordersList.innerHTML = `<tr><td colspan="4" style="color: red; text-align: center;">Błąd ładowania zamówień.</td></tr>`;
        }
    }

    // --- FUNKCJE POMOCNICZE WIZUALNE ---
    function showError(input, message) {
        input.style.border = "2px solid red";
        let errorMsg = input.nextElementSibling;
        if (!errorMsg || !errorMsg.classList.contains("error-msg")) {
            errorMsg = document.createElement("div");
            errorMsg.className = "error-msg";
            errorMsg.style.color = "red";
            errorMsg.style.fontSize = "12px";
            errorMsg.style.textAlign = "left";
            errorMsg.style.marginBottom = "10px";
            errorMsg.style.marginTop = "-5px";
            input.parentNode.insertBefore(errorMsg, input.nextSibling);
        }
        errorMsg.innerText = message;
    }

    function clearErrors(form) {
        form.querySelectorAll("input").forEach(input => {
            input.style.border = "1px solid #ccc";
        });
        form.querySelectorAll(".error-msg").forEach(msg => msg.remove());
    }

    // --- WALIDACJA LOGOWANIA ---
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            clearErrors(loginForm);
            let isValid = true;
            
            const email = loginForm.querySelector("input[name='email']");
            const password = loginForm.querySelector("input[name='password']");
            
            if (!isNotEmpty(email.value)) {
                showError(email, "E-mail nie może być pusty.");
                isValid = false;
            }
            if (!isNotEmpty(password.value)) {
                showError(password, "Hasło nie może być puste.");
                isValid = false;
            }
            
            if (!isValid) event.preventDefault();
        });
    }

    // --- WALIDACJA REJESTRACJI ---
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            clearErrors(registerForm);
            let isValid = true;
            
            const inputs = registerForm.querySelectorAll("input");
            inputs.forEach(input => {
                if (!isNotEmpty(input.value)) {
                    showError(input, "To pole jest wymagane.");
                    isValid = false;
                }
            });
            
            const password = document.getElementById("reg-password");
            const confirmPassword = document.getElementById("reg-confirm-password");
            
            if (isNotEmpty(confirmPassword.value) && !doPasswordsMatch(password.value, confirmPassword.value)) {
                showError(confirmPassword, "Podane hasła nie są identyczne.");
                isValid = false;
            }
            
            if (!isValid) event.preventDefault();
        });
    }
});