document.addEventListener("DOMContentLoaded", function () {
    const favoritesContainer = document.getElementById("favoritesContainer");
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    function renderFavorites() {
        favoritesContainer.innerHTML = "";
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <h3 class="text-muted">لا توجد منتجات في المفضلة.</h3>
                </div>
            `;
            return;
        }

        favorites.forEach(product => {
            const productCard = document.createElement("div");
            productCard.className = "col-12 col-md-6 col-lg-4";
            productCard.innerHTML = `
                <div class="card product-card h-100 shadow">
                    <img src="${product.image}" class="card-img-top p-3" alt="${product.title}" style="height: 200px; object-fit: contain;">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text text-success">${product.price} $</p>
                        <button class="btn btn-danger remove-btn" data-id="${product.id}">
                            ❌ إزالة من المفضلة
                        </button>
                    </div>
                </div>
            `;

            productCard.querySelector(".remove-btn").addEventListener("click", function () {
                favorites = favorites.filter(p => p.id != this.dataset.id);
                localStorage.setItem("favorites", JSON.stringify(favorites));
                renderFavorites();
            });

            favoritesContainer.appendChild(productCard);
        });
    }

    renderFavorites();
});
