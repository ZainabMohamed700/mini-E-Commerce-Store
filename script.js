
document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("products-container");
    const searchInput = document.getElementById("search");
    const categoryFilter = document.getElementById("category-filter");
    const priceFilter = document.getElementById("price-filter");

    let products = [];

    async function fetchProducts() {
        try {
            const response = await fetch("https://fakestoreapi.com/products");
            products = await response.json();
            displayProducts(products);
            populateFilters(products);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    function displayProducts(productList) {
        productsContainer.innerHTML = "";
        productList.forEach(product => {
            const productCard = document.createElement("div");
            productCard.className = "col-12 col-md-6 col-lg-4";
            productCard.innerHTML = `
                <div class="card product-card h-100 shadow">
                    <img src="${product.image}" class="card-img-top p-3" alt="${product.title}" style="height: 200px; object-fit: contain;">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text text-success">${product.price} $</p>
                        <div class="d-flex gap-2 justify-content-end">
                            <button class="btn btn-outline-info details-btn">📖 التفاصيل</button>
                            <button class="btn btn-outline-danger favorite-btn">❤️ المفضلة</button>
                            <button class="btn btn-primary buy-btn">🛒 شراء</button>
                        </div>
                        <div class="details hidden mt-3 p-3 bg-light rounded">
                            <p class="text-muted">${product.description}</p>
                            <button class="btn btn-sm btn-danger close-details">✕ إغلاق</button>
                        </div>
                    </div>
                </div>
            `;

            const detailsBtn = productCard.querySelector(".details-btn");
            const closeBtn = productCard.querySelector(".close-details");
            const detailsSection = productCard.querySelector(".details");

            detailsBtn.addEventListener("click", () => {
                detailsSection.classList.remove("hidden");
            });

            closeBtn.addEventListener("click", () => {
                detailsSection.classList.add("hidden");
            });

            productCard.querySelector(".favorite-btn").addEventListener("click", (e) => {
                e.target.classList.toggle("active");
                let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
                if (e.target.classList.contains("active")) {
                    favorites.push(product);
                    showNotification("تمت الإضافة إلى المفضلة ❤️", "success");
                } else {
                    favorites = favorites.filter(p => p.id !== product.id);
                    showNotification("تمت الإزالة من المفضلة", "error");
                }
                localStorage.setItem("favorites", JSON.stringify(favorites));
            });

            productCard.querySelector(".buy-btn").addEventListener("click", () => {
                const quantity = 1;
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                const existingItem = cart.find(item => item.id === product.id);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({ ...product, quantity });
                }
                localStorage.setItem("cart", JSON.stringify(cart));
                showNotification("تمت إضافة المنتج إلى السلة 🛒", "success");
            });

            productsContainer.appendChild(productCard);
        });
    }

    function showNotification(message, type = "success") {
        const notification = document.getElementById("notification");
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = "block";
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    }

    function populateFilters(products) {
        const categories = [...new Set(products.map(p => p.category))];
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    function filterProducts() {
        let filteredProducts = [...products];
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const priceOrder = priceFilter.value;

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p => 
                p.title.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        if (category) {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        if (priceOrder === "low") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (priceOrder === "high") {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        displayProducts(filteredProducts);
    }

    searchInput.addEventListener("input", filterProducts);
    categoryFilter.addEventListener("change", filterProducts);
    priceFilter.addEventListener("change", filterProducts);

    fetchProducts();
});
