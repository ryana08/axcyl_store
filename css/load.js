fetch("/html-pages/navbar.html")
  .then(res => res.text())
  .then(html => {
    document.querySelector("#navbar-placeholder").outerHTML = html;

    const menuIcon = document.querySelector('.menu-icon-overlay');
    const sidebar = document.querySelector('.sidebar');

    menuIcon.addEventListener('click', () => {
      sidebar.classList.toggle('show');
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
    // TODO: Add real cart functionality here
  });
});

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

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      // Update breadcrumb
      const breadcrumb = document.querySelector('.breadcrumb');
      if (filter === 'all') {
        breadcrumb.innerHTML = ``;
      } else {
        breadcrumb.innerHTML = `<span class="separator">&gt;</span> <a href="#">${filter.toUpperCase()}</a>`;
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

      // Show "Coming Soon" if no products
      noProducts.style.display = anyVisible ? 'none' : 'flex';
    });
  });
});
