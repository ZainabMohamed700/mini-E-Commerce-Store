document.addEventListener("DOMContentLoaded", function () {
    const cartContainer = document.getElementById("cartContainer");
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    function renderCart() {
        cartContainer.innerHTML = "";
        if (cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3 class="text-muted">سلة المشتريات فارغة.</h3>
                </div>
            `;
            return;
        }

        cartItems.forEach(item => {
            const productCard = document.createElement("div");
            productCard.className = "col-12 col-md-6 col-lg-4";
            productCard.innerHTML = `
                <div class="card product-card h-100 shadow">
                    <img src="${item.image}" class="card-img-top p-3" alt="${item.title}" style="height: 200px; object-fit: contain;">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text text-success">السعر: ${item.price} $</p>
                        <div class="quantity-control d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-secondary decrease">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary increase">+</button>
                        </div>
                        <p class="mt-2">الإجمالي: ${(item.price * item.quantity).toFixed(2)} $</p>
                        <button class="btn btn-danger remove-btn" data-id="${item.id}">❌ حذف</button>
                    </div>
                </div>
            `;

            productCard.querySelector(".remove-btn").addEventListener("click", function () {
                cartItems = cartItems.filter(i => i.id != this.dataset.id);
                localStorage.setItem("cart", JSON.stringify(cartItems));
                renderCart();
            });

            productCard.querySelector(".increase").addEventListener("click", function () {
                updateQuantity(item.id, 1);
            });

            productCard.querySelector(".decrease").addEventListener("click", function () {
                updateQuantity(item.id, -1);
            });

            cartContainer.appendChild(productCard);
        });

        updateTotal();
    }

    function updateQuantity(id, change) {
        const item = cartItems.find(i => i.id == id);
        item.quantity += change;
        
        if (item.quantity < 1) item.quantity = 1;
        
        localStorage.setItem("cart", JSON.stringify(cartItems));
        renderCart();
    }

    function updateTotal() {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElement = document.createElement("div");
        totalElement.className = "col-12 text-center mt-4";
        totalElement.innerHTML = `
            <h3 class="text-success">المجموع الكلي: ${total.toFixed(2)} $</h3>
            <button class="btn btn-success btn-lg mt-3">💳 اتمام الشراء</button>
        `;
        cartContainer.appendChild(totalElement);
    }

    renderCart();
});