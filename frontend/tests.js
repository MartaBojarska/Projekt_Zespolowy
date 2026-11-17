console.log("--- ROZPOCZYNAM TESTY JEDNOSTKOWE ---");

// Testy dla funkcji isNotEmpty
console.assert(isNotEmpty("Jan") === true, "Test 1 oblany: 'Jan' nie jest puste.");
console.assert(isNotEmpty("   ") === false, "Test 2 oblany: Same spacje powinny być traktowane jako puste.");
console.assert(isNotEmpty("") === false, "Test 3 oblany: Pusty string powinien zwrócić false.");

// Testy dla funkcji doPasswordsMatch
console.assert(doPasswordsMatch("haslo123", "haslo123") === true, "Test 4 oblany: Hasła są identyczne.");
console.assert(doPasswordsMatch("haslo123", "Haslo123") === false, "Test 5 oblany: Wielkość liter ma znaczenie.");
console.assert(doPasswordsMatch("haslo", "innehaslo") === false, "Test 6 oblany: Różne hasła nie pasują.");

// Testy dla funkcji addToCart
const initialCart = ["miod_lipowy"];
const updatedCart = addToCart(initialCart, "miod_akacjowy");
console.assert(updatedCart.length === 2, "Test 7 oblany: Koszyk powinien mieć 2 elementy.");
console.assert(updatedCart[1] === "miod_akacjowy", "Test 8 oblany: Drugi element powinien być 'miod_akacjowy'.");
// Upewniamy się, że funkcja nie zmodyfikowała oryginalnej tablicy (niemutowalność)
console.assert(initialCart.length === 1, "Test 9 oblany: Oryginalny koszyk został zmodyfikowany!");

console.log("--- TESTY ZAKOŃCZONE ---");