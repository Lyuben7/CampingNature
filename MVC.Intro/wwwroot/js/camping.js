const CART_KEY = "camping-cart";
let cart = loadCart();

function loadCart() {
    try {
        const stored = localStorage.getItem(CART_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    showNotification(`${productName} е добавен в количката!`);
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById("cart-count");
    if (countEl) {
        countEl.textContent = totalCount;
    }
}

function renderCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    if (!cartItemsContainer || !cartTotalElement) {
        return;
    }

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #666;">Количката е празна</p>';
        cartTotalElement.textContent = "0";
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div>
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <small style="color: #666;">${item.quantity} x ${item.price} лв.</small>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="cart-item-price">${itemTotal} лв.</span>
                    <button type="button" data-name="${escapeHtml(item.name)}" class="remove-cart-item" style="background: #ff6b6b; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 5px; cursor: pointer;">×</button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;
    cartTotalElement.textContent = total.toFixed(2);
    cartItemsContainer.querySelectorAll(".remove-cart-item").forEach(button => {
        button.addEventListener("click", () => removeFromCart(button.getAttribute("data-name")));
    });
}

function openCart() {
    renderCart();
    document.getElementById("cart-modal").style.display = "block";
}

function closeCart() {
    document.getElementById("cart-modal").style.display = "none";
}

function checkout() {
    if (cart.length === 0) {
        alert("Количката е празна!");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Благодарим за поръчката! Обща стойност: ${total.toFixed(2)} лв.\n\nЩе се свържем с вас скоро за потвърждение.`);
    cart = [];
    saveCart();
    updateCartCount();
    closeCart();
}

function showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #4a7c23 0%, #2d5016 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
    }
`;
document.head.appendChild(style);

function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    alert("Съобщението е изпратено успешно! Ще се свържем с вас скоро.");
    form.reset();
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (!href || href === "#") {
            return;
        }
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

window.addEventListener("click", function (event) {
    const modal = document.getElementById("cart-modal");
    if (event.target === modal) {
        closeCart();
    }
});

window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (!navbar) {
        return;
    }
    navbar.style.boxShadow = window.scrollY > 50
        ? "0 4px 20px rgba(0,0,0,0.2)"
        : "0 2px 10px rgba(0,0,0,0.1)";
});

document.querySelectorAll(".buy-button").forEach(btn => {
    btn.addEventListener("click", () => {
        const name = btn.dataset.name;
        const price = Number(btn.dataset.price);
        if (!name || Number.isNaN(price)) {
            return;
        }
        addToCart(name, price);
    });
});

updateCartCount();
