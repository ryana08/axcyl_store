fetch("/html-pages/navbar.html")
  .then(res => res.text())
  .then(html => {
    document.querySelector("#navbar-placeholder").outerHTML = html;

    const cart = document.querySelector('.cart');
    const exit = document.querySelector('.exit');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay'); // Get overlay

    cart.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      overlay.classList.toggle('show'); // Toggle overlay too
      renderCart();
    });

    exit.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      overlay.classList.toggle('show'); // Toggle overlay too
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
    });
  });

fetch("/html-pages/navbar.html")
  .then(res => res.text())
  .then(html => {
    document.querySelector("#navbar-placeholder").outerHTML = html;

    const searchButton = document.querySelector('.search-container');
    const logoMove = document.querySelector('.logo');

    searchButton.addEventListener('hover', () => {
      logoMove.classList.toggle('show');
    });
  });

fetch("/html-pages/footer.html")
  .then(res => res.text())
  .then(html => {
    document.querySelector("#footer-placeholder").outerHTML = html;
  })

document.addEventListener('DOMContentLoaded', () => {
  // ----- SIZE SELECTION -----
  const sizeButtons = document.querySelectorAll('.size button');

  sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      sizeButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
    });
  });

  // ----- COLOR SELECTION -----
  const colorButtons = document.querySelectorAll('.color button');

  colorButtons.forEach(button => {
    button.addEventListener('click', () => {
      colorButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
    });
  });

  // ----- ADD TO CART -----
  const addToCartButton = document.querySelector('.add-to-cart');
  addToCartButton?.addEventListener('click', () => {
    const selectedSize = document.querySelector('.size button.selected');
    const selectedColor = document.querySelector('.color button.selected');

    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color before adding to cart!');
      return;
    }

    alert(`Added to cart:\nSize: ${selectedSize.textContent}\nColor: ${selectedColor.style.backgroundColor}`);

    const prodName = document.querySelector('.prod-name')?.textContent;
    const prodPrice = document.querySelector('.prod-price')?.textContent;
    const prodImage = document.querySelector('.product-purchase-img img')?.src;

    const cartItem = {
      id: Date.now(),
      name: prodName,
      image: prodImage,
      price: parseFloat(prodPrice.replace('$', '')),
      size: selectedSize.textContent,
      color: selectedColor.style.backgroundColor,
      quantity: 1
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.push(cartItem);

    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Added to cart!');
  });
});

/* RENDER CART INFO */

function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const sbItems = document.querySelector('.sb-items');

  sbItems.innerHTML = '';

  if (cart.length === 0) {
    sbItems.innerHTML = '<p style="padding: 20px; text-align: center;">Your cart is empty</p>';
    updateSubtotal(0);
    return;
  }

  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.setAttribute('data-id', item.id);

    itemElement.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-header">
          <span class="cart-item-name">${item.name}</span>
          <button class="remove-item" data-id="${item.id}">X</button>
        </div>
        <p>Color: ${item.color}</p>
        <p>Size: ${item.size}</p>
        <p class="cart-item-price">$${item.price}</p>
        <div class="quantity-controls">
          <button class="decrease-qty" data-id="${item.id}">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="increase-qty ${item.quantity >= 10 ? 'double-digit' : ''}" data-id="${item.id}">+</button>
        </div>
      </div>
    `;

    sbItems.appendChild(itemElement);

  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  updateSubtotal(total);

  attachCartEventListeners();
}

function updateSubtotal(total) {
  const subtotalPrice = document.querySelector('.subtotal p:nth-child(2)');
  if (subtotalPrice) {
    subtotalPrice.textContent = `$${total.toFixed(2)}`;
  }
}

function attachCartEventListeners() {
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const itemId = parseInt(e.target.getAttribute('data-id'));
      removeFromCart(itemId);
    });
  });

  document.querySelectorAll('.increase-qty').forEach(button => {
    button.addEventListener('click', (e) => {
      const itemId = parseInt(e.target.getAttribute('data-id'));
      updateQuantity(itemId, 1);
    });
  });

  document.querySelectorAll('.decrease-qty').forEach(button => {
    button.addEventListener('click', (e) => {
      const itemId = parseInt(e.target.getAttribute('data-id'));
      updateQuantity(itemId, -1);
    });
  });
}

function removeFromCart(itemId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  cart = cart.filter(item => item.id !== itemId);

  localStorage.setItem('cart', JSON.stringify(cart));

  renderCart();
}

function updateQuantity(itemId, change) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const item = cart.find(item => item.id === itemId);

  if (item) {
    item.quantity += change;

    if (item.quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    renderCart();
  }
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("dropdown-toggle")) {
    const content = e.target.nextElementSibling;

    // if hidden → show. if shown → hide.
    if (content.style.display === "" || content.style.display === "none") {
      content.style.display = "block";
    } else {
      content.style.display = "none";
    }
  }
});

// ----- STORE FILTER -----
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filters ul li');
  const productsContainer = document.querySelector('.products-container');

  const noProducts = document.createElement('div');
  noProducts.classList.add('no-products');
  noProducts.textContent = 'Coming Soon...';
  productsContainer.appendChild(noProducts);

  function applyFilter(filter) {
    const breadcrumb = document.querySelector('.breadcrumb');

    if (breadcrumb) {
      if (filter === 'all') {
        breadcrumb.innerHTML = ``;
      } else {
        breadcrumb.innerHTML = `<span class="separator">&gt;</span> <a href="#">${filter.toUpperCase()}</a>`;
      }
    }

    // Show/hide products
    const products = document.querySelectorAll('.products-container .product');
    let anyVisible = false;

    products.forEach(product => {
      if (filter === 'all' || product.dataset.category.includes(filter)) {
        product.style.display = 'block';
        anyVisible = true;
      } else {
        product.style.display = 'none';
      }
    });

    // Show “Coming Soon” if no results
    noProducts.style.display = anyVisible ? 'none' : 'flex';
  }

  // Button clicks
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      applyFilter(filter);
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const preFilter = urlParams.get("filter");

  if (preFilter) applyFilter(preFilter);
});


// Add this to a global JS file that loads on all pages
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for navbar to load if it's being injected
  setTimeout(() => {
    const searchBar = document.getElementById("searchBar");

    if (searchBar) {
      searchBar.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const searchText = searchBar.value.trim();

          if (searchText) {
            // If we're already on the store page, do the search
            if (window.location.pathname.includes('store.html')) {
              performSearch(searchText);
            } else {
              // Otherwise, redirect to store page with search query
              window.location.href = `../html-pages/store.html?search=${encodeURIComponent(searchText)}`;
            }
          }
        }
      });
    }
  }, 100);
});

// Function to perform the actual search
function performSearch(searchText) {
  const products = document.querySelectorAll('.products-container .product');
  const searchLower = searchText.toLowerCase();

  products.forEach(product => {
    const prodname = product.innerText.toLowerCase();
    const prodcat = product.getAttribute("data-category").toLowerCase();

    if (prodname.includes(searchLower) || prodcat.includes(searchLower)) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });

  // Update breadcrumb
  updateBreadcrumb(searchText);

  // Clear any active filters
  document.querySelectorAll('.filters li').forEach(filter => {
    filter.classList.remove('active');
  });
}

// Function to update breadcrumb
function updateBreadcrumb(searchText) {
  const breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = `&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${searchText.toUpperCase()}`;
    breadcrumb.style.display = 'block';
  }
}

// Add this to your store.html page JS
document.addEventListener('DOMContentLoaded', () => {
  // Check if there's a search query in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');

  if (searchQuery) {
    // Set the search bar value
    const searchBar = document.getElementById("searchBar");
    if (searchBar) {
      searchBar.value = searchQuery;
    }

    // Perform the search
    performSearch(searchQuery);
  }

  // Your existing filter code
  const filterItems = document.querySelectorAll('.filters li');
  filterItems.forEach(item => {
    item.addEventListener('click', () => {
      const filter = item.getAttribute('data-filter');

      // Clear search when using filters
      const searchBar = document.getElementById("searchBar");
      if (searchBar) {
        searchBar.value = '';
      }

      // Update breadcrumb for filters
      if (filter !== 'all') {
        updateBreadcrumb(item.textContent);
      } else {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
          breadcrumb.style.display = 'none';
        }
      }

      // Your existing filter logic here
    });
  });
});