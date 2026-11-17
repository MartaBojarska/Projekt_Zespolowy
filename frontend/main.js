// --- CZYSTE FUNKCJE (DO TESTOWANIA) ---

// Sprawdza, czy pole nie jest puste
function isNotEmpty(value) {
    return value.trim() !== "";
}

// Sprawdza, czy hasła są identyczne
function doPasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}

// Logika dodawania do koszyka (przyjmuje obecny koszyk i nowe ID)
function addToCart(currentCart, productId) {
    if (!productId) return currentCart;
    const newCart = [...currentCart]; // Kopiujemy tablicę (dobra praktyka)
    newCart.push(productId);
    return newCart;
}

// Eksportujemy funkcje, jeśli środowisko to wspiera (przydatne do testów)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isNotEmpty, doPasswordsMatch, addToCart };
}

// --- LOGIKA APLIKACJI (POŁĄCZENIE Z DOM) ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("Plik main.js został poprawnie załadowany i podpięty!");

    // --- KOSZYK ---
    const cartButtons = document.querySelectorAll(".add-to-cart-btn");
    cartButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute("data-id");
            if (productId) {
                let currentCart = JSON.parse(localStorage.getItem("honeyShopCart")) || [];
                // Używamy naszej czystej funkcji!
                let updatedCart = addToCart(currentCart, productId);
                localStorage.setItem("honeyShopCart", JSON.stringify(updatedCart));
                alert("Dodano do koszyka!");
            }
        });
    });

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
            
            // Używamy naszej czystej funkcji!
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
            
            // Używamy naszych czystych funkcji!
            if (isNotEmpty(confirmPassword.value) && !doPasswordsMatch(password.value, confirmPassword.value)) {
                showError(confirmPassword, "Podane hasła nie są identyczne.");
                isValid = false;
            }
            
            if (!isValid) event.preventDefault();
        });
    }
});