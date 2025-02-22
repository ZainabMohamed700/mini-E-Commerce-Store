class Product {
    constructor(id, title, price, description, category, image, rating) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.description = description;
        this.category = category;
        this.image = image;
        this.rating = rating;
    }

    render() {
        return `
            <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="product-card position-relative p-3 h-100">
                    <button class="favorite-btn ${this.isFavorite() ? 'active' : ''}" 
                            data-id="${this.id}">
                        <i class="${this.isFavorite() ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <img src="${this.image}" class="product-img card-img-top" alt="${this.title}">
                    <div class="card-body text-center">
                        <h5 class="product-title mb-3">${this.title}</h5>
                        <div class="rating-stars mb-2">
                            ${this.renderRating()}
                        </div>
                        <p class="product-price mb-3">$${this.price}</p>
                        <div class="d-flex justify-content-center gap-2 align-items-center">
                            <button class="btn btn-outline-primary view-details" data-id="${this.id}">
                                التفاصيل
                            </button>
                            <div class="quantity-control d-flex">
                                <button class="btn btn-outline-secondary quantity-btn minus" data-id="${this.id}">-</button>
                                <input type="number" class="quantity-input text-center" 
                                       value="1" min="1" max="10" data-id="${this.id}">
                                <button class="btn btn-outline-secondary quantity-btn plus" data-id="${this.id}">+</button>
                            </div>
                            <button class="btn btn-custom add-to-cart" data-id="${this.id}">
                                <i class="fas fa-cart-plus me-2"></i>شراء
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRating() {
        return [...Array(5)].map((_, i) => 
            `<i class="fas fa-star${i < Math.round(this.rating.rate) ? '' : '-half-alt'}"></i>`
        ).join('');
    }

    isFavorite() {
        return this.app.favorites.includes(this.id);
    }
}

class ECommerceApp {
    constructor() {
        this.products = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.init();
    }

    async init() {
        await this.fetchProducts();
        this.setupEventListeners();
        this.updateFavoritesDisplay();
    }

    async fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            const data = await response.json();
            this.products = data.map(item => new Product(
                item.id,
                item.title,
                item.price,
                item.description,
                item.category,
                item.image,
                item.rating
            ));
            this.products.forEach(p => p.app = this);
            this.populateCategories(data);
            this.renderProducts(this.products);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    renderProducts(products) {
        const container = document.getElementById('productsContainer');
        container.innerHTML = products.map(p => p.render()).join('');
    }

    setupEventListeners() {
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('ratingFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('priceRange').addEventListener('input', (e) => {
            document.getElementById('maxPrice').textContent = e.target.value + '$';
            this.applyFilters();
        });

        document.body.addEventListener('click', (e) => {
            const target = e.target;

            if (target.closest('.favorite-btn')) {
                this.toggleFavorite(target.closest('button').dataset.id);
            }

            if (target.closest('.add-to-cart')) {
                this.addToCart(target.closest('button'));
            }

            if (target.closest('.view-details')) {
                this.showProductDetails(target.closest('button').dataset.id);
            }

            if (target.classList.contains('quantity-btn')) {
                this.handleQuantityChange(target);
            }
        });
    }

    handleQuantityChange(button) {
        const input = button.closest('.quantity-control').querySelector('.quantity-input');
        let value = parseInt(input.value);
        
        if (button.classList.contains('plus')) {
            value = Math.min(value + 1, 10);
        } else {
            value = Math.max(value - 1, 1);
        }
        input.value = value;
    }

    addToCart(button) {
        const productId = button.dataset.id;
        const product = this.products.find(p => p.id == productId);
        const quantity = parseInt(document.querySelector(`[data-id="${productId}"] .quantity-input`).value) || 1;
        
        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.showCartEffect(button);
        this.showToast(`تمت إضافة ${quantity} من المنتج إلى السلة`);
    }

    showCartEffect(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 300);
    }

    toggleFavorite(productId) {
        const index = this.favorites.indexOf(+productId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(+productId);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateFavoritesDisplay();
    }

    async showProductDetails(productId) {
        try {
            const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
            const product = await response.json();
            const modalContent = `
                <div class="row">
                    <div class="col-md-6">
                        <img src="${product.image}" class="img-fluid rounded-3" alt="${product.title}">
                    </div>
                    <div class="col-md-6">
                        <h3 class="mb-3">${product.title}</h3>
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <span class="product-price">$${product.price}</span>
                            <div class="rating-stars">
                                ${[...Array(5)].map((_, i) => 
                                    `<i class="fas fa-star${i < Math.round(product.rating.rate) ? '' : '-half-alt'}"></i>`
                                ).join('')}
                            </div>
                        </div>
                        <p class="text-muted">${product.description}</p>
                        <button class="btn btn-custom w-100 add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus me-2"></i>إضافة إلى السلة
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('productDetails').innerHTML = modalContent;
            new bootstrap.Modal('#productModal').show();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    applyFilters() {
        const category = document.getElementById('categoryFilter').value;
        const minRating = document.getElementById('ratingFilter').value;
        const maxPrice = document.getElementById('priceRange').value;

        let filtered = this.products;

        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }

        if (minRating) {
            filtered = filtered.filter(p => p.rating.rate >= minRating);
        }

        if (maxPrice) {
            filtered = filtered.filter(p => p.price <= maxPrice);
        }

        this.renderProducts(filtered);
    }

    populateCategories(products) {
        const categories = [...new Set(products.map(p => p.category))];
        const select = document.getElementById('categoryFilter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    updateFavoritesDisplay() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const isFavorite = this.favorites.includes(+btn.dataset.id);
            btn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
            btn.classList.toggle('active', isFavorite);
        });
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        document.body.appendChild(toast);
        new bootstrap.Toast(toast, { autohide: true, delay: 2000 }).show();
        setTimeout(() => toast.remove(), 2500);
    }
}

const app = new ECommerceApp();