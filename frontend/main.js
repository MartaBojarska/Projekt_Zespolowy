document.addEventListener("DOMContentLoaded", () => {
    console.log("Plik main.js został poprawnie załadowany i podpięty!");

    const cartButtons = document.querySelectorAll(".add-to-cart-btn");

    cartButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            
            const productId = event.target.getAttribute("data-id");

            if (productId) {
                let cart = JSON.parse(localStorage.getItem("honeyShopCart")) || [];

                cart.push(productId);

                localStorage.setItem("honeyShopCart", JSON.stringify(cart));

                alert("Dodano do koszyka!");
            }
        });
    });

    // --- FUNKCJE POMOCNICZE DO WALIDACJI ---
    function showError(input, message) {
        // Podświetlenie błędnego pola na czerwono
        input.style.border = "2px solid red";
        
        // Tworzenie czerwonego komunikatu pod polem
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
        // Czyszczenie starych błędów przed kolejną próbą wysyłki
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
            
            if (email.value.trim() === "") {
                showError(email, "E-mail nie może być pusty.");
                isValid = false;
            }
            if (password.value.trim() === "") {
                showError(password, "Hasło nie może być puste.");
                isValid = false;
            }
            
            if (!isValid) {
                event.preventDefault(); // Zatrzymuje wysyłanie formularza i przeładowanie strony
            }
        });
    }

    // --- WALIDACJA REJESTRACJI ---
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            clearErrors(registerForm);
            let isValid = true;
            
            // 1. Sprawdzamy czy wszystkie pola są wypełnione
            const inputs = registerForm.querySelectorAll("input");
            inputs.forEach(input => {
                if (input.value.trim() === "") {
                    showError(input, "To pole jest wymagane.");
                    isValid = false;
                }
            });
            
            // 2. Sprawdzamy czy hasła się zgadzają
            const password = document.getElementById("reg-password");
            const confirmPassword = document.getElementById("reg-confirm-password");
            
            if (password.value !== confirmPassword.value && confirmPassword.value.trim() !== "") {
                showError(confirmPassword, "Podane hasła nie są identyczne.");
                isValid = false;
            }
            
            if (!isValid) {
                event.preventDefault(); // Zatrzymuje wysyłanie formularza
            }
        });
    }
});