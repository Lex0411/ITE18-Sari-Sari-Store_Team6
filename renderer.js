// Main script for handling product inventory operations
document.addEventListener('DOMContentLoaded', async () => {
  // Get all form elements and buttons
  const productForm = document.getElementById('add-product-form');
  const saveProductBtn = document.getElementById('save-product');
  const productTableBody = document.getElementById('inventory-table');
  const searchInput = document.getElementById('search-product');

  // Edit modal form fields
  const editName = document.getElementById('edit-product-name');
  const editCategory = document.getElementById('edit-product-category');
  const editPrice = document.getElementById('edit-product-price');
  const editStock = document.getElementById('edit-product-stock');
  const updateProductBtn = document.getElementById('update-product');
  
  let products = [];
  let currentEditIndex = null;

  // Load products from file when app starts
  async function loadProducts() {
    const exists = await window.electronAPI.fileExists();
    products = exists ? await window.electronAPI.readFile() : [];
    renderProducts();
  }

  // Display products in the table, optionally filtered by search query
  function renderProducts(filterQuery = '') {
    productTableBody.innerHTML = '';

    // Filter products if search query exists
    const displayProducts = filterQuery 
      ? products.filter(p => 
          p.name.toLowerCase().includes(filterQuery) ||
          p.category.toLowerCase().includes(filterQuery)
        )
      : products;

    // Show message if no products found
    if (displayProducts.length === 0) {
      const message = filterQuery ? 'No matching products' : 'No products found';
      productTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">${message}</td>
        </tr>`;
      return;
    }

    // Create table row for each product
    displayProducts.forEach((p, i) => {
      const originalIndex = products.indexOf(p);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>₱${p.price.toFixed(2)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn btn-warning btn-sm edit-btn" data-index="${originalIndex}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-danger btn-sm delete-btn" data-index="${originalIndex}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      productTableBody.appendChild(row);
    });
  }

  // Add new product to inventory
  saveProductBtn.addEventListener('click', async () => {
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);

    // Check if all fields are filled correctly
    if (!name || !category || isNaN(price) || isNaN(stock)) {
      alert('Please fill out all fields correctly.');
      return;
    }

    // Add product and save to file
    products.push({ name, category, price, stock });
    await window.electronAPI.writeFile(products);
    renderProducts();

    // Close modal and reset form
    productForm.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal.hide();
  });

  // Handle edit and delete button clicks
  productTableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    // Edit product
    if (editBtn) {
      currentEditIndex = parseInt(editBtn.getAttribute('data-index'));
      const product = products[currentEditIndex];

      // Fill edit form with current product data
      editName.value = product.name;
      editCategory.value = product.category;
      editPrice.value = product.price;
      editStock.value = product.stock;

      // Show edit modal
      const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
      modal.show();
    }

    // Delete product
    if (deleteBtn) {
      const index = parseInt(deleteBtn.getAttribute('data-index'));
      if (confirm('Are you sure you want to delete this product?')) {
        products.splice(index, 1);
        await window.electronAPI.writeFile(products);
        renderProducts();
      }
    }
  });

  // Save edited product
  updateProductBtn.addEventListener('click', async () => {
    if (currentEditIndex === null) return;

    const name = editName.value.trim();
    const category = editCategory.value.trim();
    const price = parseFloat(editPrice.value);
    const stock = parseInt(editStock.value);

    // Validate input fields
    if (!name || !category || isNaN(price) || isNaN(stock)) {
      alert('Please fill out all fields correctly.');
      return;
    }

    // Update product and save changes
    products[currentEditIndex] = { name, category, price, stock };
    await window.electronAPI.writeFile(products);
    renderProducts();

    // Close modal and reset edit index
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
    modal.hide();
    currentEditIndex = null;
  });

  // Filter products as user types in search box
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    renderProducts(query);
  });

  // Load products when page loads
  loadProducts();
});