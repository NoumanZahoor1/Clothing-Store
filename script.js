// More concise version with all necessary functionality
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('navbar');
    
    // Toggle menu function
    const toggleMenu = () => nav.classList.toggle('active');
    
    // Event listeners
    document.getElementById('bar')?.addEventListener('click', toggleMenu);
    document.getElementById('close')?.addEventListener('click', toggleMenu);
    
    // Close menu when resizing to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 799) nav.classList.remove('active');
    });
});

// Save user data in localStorage (simple demo only)
document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
  
    // Signup functionality
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("signupName").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
  
        localStorage.setItem("user", JSON.stringify({ name, email, password }));
        alert("Signup successful! Please login.");
        window.location.href = "login.html";
      });
    }
  
    // Login functionality
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
  
        const user = JSON.parse(localStorage.getItem("user"));
  
        if (user && user.email === email && user.password === password) {
          alert("Login successful!");
          window.location.href = "index.html"; // Redirect to your ecommerce page
        } else {
          alert("Invalid email or password.");
        }
      });
    }
});

// Enhanced Cart Functionality
class Cart {
    constructor() {
        this.cart = this.getCart();
        this.init();
    }

    // Initialize cart functionality
    init() {
        this.updateCartCount();
        this.setupCartEventListeners();
        this.setupAddToCartButtons();
    }

    // Get cart from localStorage
    getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.updateCartDisplay(); // Update cart display if on cart page
    }

    // Update cart count in navigation
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline' : 'none';
        });
    }

    // Add product to cart
    addToCart(productId, productName, productPrice, productImage, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: quantity
            });
        }

        this.saveCart();
        this.showAddToCartMessage(productName);
    }

    // Remove product from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    // Update product quantity
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    // Calculate cart total
    calculateTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get cart items
    getCartItems() {
        return this.cart;
    }

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    // Show add to cart message
    showAddToCartMessage(productName) {
        // Show floating notification
        const notification = document.getElementById('floating-cart-notification');
        if (notification) {
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Also show alert for immediate feedback
        alert(`${productName} added to cart!`);
    }

    // Setup cart event listeners
    setupCartEventListeners() {
        // Quantity changes in cart page
        document.addEventListener('input', (e) => {
            if (e.target.type === 'number' && e.target.closest('#cart')) {
                const row = e.target.closest('tr');
                const productId = row?.dataset?.productId;
                const quantity = parseInt(e.target.value);
                
                if (productId) {
                    this.updateQuantity(productId, quantity);
                }
            }
        });

        // Remove items from cart
        document.addEventListener('click', (e) => {
            if (e.target.closest('.far.fa-times-circle') || e.target.closest('.remove-item')) {
                e.preventDefault();
                const row = e.target.closest('tr');
                const productId = row?.dataset?.productId;
                
                if (productId) {
                    this.removeFromCart(productId);
                }
            }
        });

        // Apply coupon
        document.addEventListener('click', (e) => {
            if (e.target.closest('#coupon button')) {
                e.preventDefault();
                this.applyCoupon();
            }
        });

        // Proceed to checkout
        document.addEventListener('click', (e) => {
            if (e.target.closest('#subtotal button') && e.target.closest('#subtotal button').textContent.includes('Proceed To Checkout')) {
                e.preventDefault();
                this.proceedToCheckout();
            }
        });
    }

    // Setup add to cart buttons
    setupAddToCartButtons() {
        document.addEventListener('click', (e) => {
            // Handle cart icon clicks
            if (e.target.closest('.cart') || e.target.classList.contains('cart')) {
                e.preventDefault();
                const productElement = e.target.closest('.pro');
                if (productElement) {
                    this.handleAddToCart(productElement);
                }
            }

            // Handle "Add to Cart" button clicks
            if (e.target.closest('.cart-add-btn')) {
                e.preventDefault();
                const productElement = e.target.closest('.pro');
                if (productElement) {
                    this.handleAddToCart(productElement);
                }
            }

            // Single product page add to cart
            if (e.target.closest('button.normal') && e.target.closest('button.normal').textContent.includes('Add To Cart')) {
                const productSection = e.target.closest('#prodetails');
                if (productSection) {
                    this.handleSingleProductAdd(productSection);
                }
            }
        });
    }

    // Handle add to cart from product cards
    handleAddToCart(productElement) {
        const productId = this.getProductIdFromElement(productElement);
        const productName = productElement.querySelector('h5').textContent;
        const productPrice = this.parsePrice(productElement.querySelector('h4').textContent);
        const productImage = productElement.querySelector('img').src.split('/').pop();

        this.addToCart(productId, productName, productPrice, productImage, 1);
    }

    // Handle add to cart from single product page
    handleSingleProductAdd(productSection) {
        const productId = localStorage.getItem('selectedProduct') || 'f1';
        const productName = productSection.querySelector('#product-title')?.textContent || 'Product';
        const priceText = productSection.querySelector('#product-price')?.textContent || '$100';
        const productPrice = this.parsePrice(priceText);
        const productImage = document.getElementById('MainImg')?.src.split('/').pop() || 'f1.jpg';
        const quantity = parseInt(productSection.querySelector('input[type="number"]')?.value) || 1;

        this.addToCart(productId, productName, productPrice, productImage, quantity);
    }

    // Get product ID from element
    getProductIdFromElement(element) {
        // Try to get from data attribute first
        const dataProduct = element.querySelector('.cart-add-btn')?.getAttribute('data-product');
        if (dataProduct) return dataProduct;

        // Fallback: get from image src
        const imgSrc = element.querySelector('img').src;
        const fileName = imgSrc.split('/').pop();
        return fileName.split('.')[0]; // Returns 'f1', 'f2', etc.
    }

    // Parse price from string
    parsePrice(priceString) {
        return parseFloat(priceString.replace(/[^0-9.]/g, ''));
    }

    // Apply coupon (basic implementation)
    applyCoupon() {
        const couponInput = document.querySelector('#coupon input');
        const couponCode = couponInput?.value.trim();
        
        if (couponCode === 'SAVE10') {
            alert('Coupon applied! You saved 10%');
            // You can implement discount logic here
        } else if (couponCode) {
            alert('Invalid coupon code');
        } else {
            alert('Please enter a coupon code');
        }
        
        if (couponInput) couponInput.value = '';
    }

    // Proceed to checkout
    proceedToCheckout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        alert('Proceeding to checkout! Total: $' + this.calculateTotal().toFixed(2));
        // In a real app, you would redirect to checkout page
        // window.location.href = 'checkout.html';
    }

    // Update cart display on cart page
    updateCartDisplay() {
        if (!window.location.pathname.includes('cart.html')) return;

        const cartItems = this.getCartItems();
        const cartTable = document.querySelector('#cart tbody');
        const subtotalElement = document.querySelector('#subtotal table tr:first-child td:last-child');
        const totalElement = document.querySelector('#subtotal table tr:last-child td:last-child');

        if (cartTable) {
            cartTable.innerHTML = '';

            if (cartItems.length === 0) {
                cartTable.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px; color: #888;">
                            <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 20px; display: block;"></i>
                            <h3>Your cart is empty</h3>
                            <p>Add some products to get started!</p>
                            <button class="normal" onclick="window.location.href='shop.html'" style="margin-top: 20px;">
                                Continue Shopping
                            </button>
                        </td>
                    </tr>
                `;
            } else {
                cartItems.forEach(item => {
                    const subtotal = item.price * item.quantity;
                    const row = document.createElement('tr');
                    row.dataset.productId = item.id;
                    row.innerHTML = `
                        <td><a href="#" class="remove-item"><i class="far fa-times-circle"></i></a></td>
                        <td><img src="img/products/${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover;"></td>
                        <td>${item.name}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td><input type="number" value="${item.quantity}" min="1" style="width: 60px; padding: 5px;"></td>
                        <td>$${subtotal.toFixed(2)}</td>
                    `;
                    cartTable.appendChild(row);
                });
            }
        }

        // Update totals
        if (subtotalElement && totalElement) {
            const total = this.calculateTotal();
            subtotalElement.textContent = `$${total.toFixed(2)}`;
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
    }
}

// Product database (extended with real data)
const products = {
  'f1': { name: 'Air Max Premium T-Shirt', price: 78, brand: 'Nike' },
  'f2': { name: 'Classic Originals Hoodie', price: 65, brand: 'Adidas' },
  'f3': { name: 'Sport Performance Jacket', price: 89, brand: 'Puma' },
  'f4': { name: 'Training Workout Tee', price: 45, brand: 'Under Armour' },
  'f5': { name: 'Vintage Classic Sweatshirt', price: 55, brand: 'Reebok' },
  'f6': { name: 'Athletic Running Shorts', price: 35, brand: 'New Balance' },
  'f7': { name: 'Dri-FIT Sport Polo', price: 60, brand: 'Nike' },
  'f8': { name: 'Ultraboost Running Shoes', price: 120, brand: 'Adidas' },
  'n1': { name: 'Limited Edition Sneakers', price: 110, brand: 'Puma' },
  'n2': { name: 'Basketball Pro Jersey', price: 85, brand: 'Nike' },
  'n3': { name: 'Yoga Training Pants', price: 50, brand: 'Adidas' },
  'n4': { name: 'ColdGear Compression Top', price: 70, brand: 'Under Armour' },
  'n5': { name: 'CrossFit Training Shorts', price: 40, brand: 'Reebok' },
  'n6': { name: 'Fresh Foam Running Shoes', price: 95, brand: 'New Balance' },
  'n7': { name: 'Jordan Collection Hoodie', price: 125, brand: 'Nike' },
  'n8': { name: 'Trefoil Logo Sweater', price: 75, brand: 'Adidas' }
};

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
  window.cart = new Cart();
  
  // Update cart display if on cart page
  if (window.location.pathname.includes('cart.html')) {
      window.cart.updateCartDisplay();
  }

  // Update product details on single product page
  if (window.location.pathname.includes('sproduct.html')) {
      updateProductDetails();
  }
});

// Update product details on single product page
function updateProductDetails() {
  const selectedProduct = localStorage.getItem('selectedProduct');
  if (selectedProduct && products[selectedProduct]) {
      const product = products[selectedProduct];
      const titleElement = document.getElementById('product-title');
      const priceElement = document.getElementById('product-price');
      
      if (titleElement) titleElement.textContent = product.name;
      if (priceElement) priceElement.textContent = `$${product.price}`;
  }
}

// Add CSS for cart count
const style = document.createElement('style');
style.textContent = `
  .cart-count {
      background: #850808;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 12px;
      position: absolute;
      top: -8px;
      right: -8px;
  }
  #lg-bag, #mobile a[href="cart.html"] {
      position: relative;
  }
  @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

// Enhanced event listener for sproduct page
document.addEventListener('click', function(e) {
  // Check if it's the Add to Cart button in sproduct page
  if (e.target.matches('#prodetails button.normal') && 
      e.target.textContent.trim() === 'Add To Cart') {
      e.preventDefault();
      
      // Get product details
      const productId = localStorage.getItem('selectedProduct') || 'f1';
      const productName = document.getElementById('product-title')?.textContent || 'Product';
      const priceText = document.getElementById('product-price')?.textContent || '$100';
      const productPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const productImage = document.getElementById('MainImg')?.src.split('/').pop() || 'f1.jpg';
      const quantityInput = document.querySelector('#prodetails input[type="number"]');
      const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
      
      console.log('Adding to cart:', { productId, productName, productPrice, quantity });
      
      // Add to cart
      if (window.cart) {
          window.cart.addToCart(productId, productName, productPrice, productImage, quantity);
      } else {
          alert('Cart system not loaded. Please refresh the page.');
      }
  }
});

// Enhanced Search Functionality
class Search {
  constructor() {
      this.init();
  }

  init() {
      this.setupSearchListeners();
      this.setupVoiceSearch();
  }

  setupSearchListeners() {
      const searchInput = document.getElementById('search-input');
      const searchBtn = document.getElementById('search-btn');

      if (searchInput && searchBtn) {
          // Search on button click
          searchBtn.addEventListener('click', () => this.performSearch());
          
          // Search on Enter key
          searchInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                  this.performSearch();
              }
          });

          // Real-time search suggestions (optional)
          searchInput.addEventListener('input', (e) => {
              this.showSearchSuggestions(e.target.value);
          });
      }
  }

  performSearch() {
      const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
      
      if (searchTerm === '') {
          this.showSearchMessage('Please enter a product name to search');
          return;
      }

      // Store search term and redirect to shop page
      localStorage.setItem('searchTerm', searchTerm);
      window.location.href = 'shop.html';
  }

  // Filter products on shop page
  filterProducts() {
      const searchTerm = localStorage.getItem('searchTerm');
      
      if (searchTerm) {
          const proContainer = document.querySelector('.pro-container');
          const pageHeader = document.getElementById('page-header');
          const allProducts = document.querySelectorAll('.pro');
          
          if (pageHeader) {
              pageHeader.innerHTML = `
                  <h2>Search Results</h2>
                  <p>Searching for: "${searchTerm}"</p>
              `;
          }
          
          if (proContainer && allProducts.length > 0) {
              let foundProducts = 0;
              
              allProducts.forEach(product => {
                  const productName = product.querySelector('h5').textContent.toLowerCase();
                  const productBrand = product.querySelector('span').textContent.toLowerCase();
                  
                  // Check if product matches search term
                  if (productName.includes(searchTerm) || productBrand.includes(searchTerm)) {
                      product.style.display = 'block';
                      foundProducts++;
                  } else {
                      product.style.display = 'none';
                  }
              });
              
              // Update header with results count
              if (pageHeader) {
                  if (foundProducts > 0) {
                      pageHeader.innerHTML = `
                          <h2>Search Results</h2>
                          <p>Found ${foundProducts} products for "${searchTerm}"</p>
                      `;
                  } else {
                      pageHeader.innerHTML = `
                          <h2>No Results Found</h2>
                          <p>No products found for "${searchTerm}"</p>
                          <button class="normal" onclick="clearSearch()" style="margin-top: 10px;">Show All Products</button>
                      `;
                  }
              }
          }
          
          // Clear search term after display
          setTimeout(() => {
              localStorage.removeItem('searchTerm');
          }, 100);
      }
  }

  showSearchMessage(message) {
      // Create notification
      const notification = document.createElement('div');
      notification.style.cssText = `
          position: fixed;
          top: 100px;
          right: 20px;
          background: #850808;
          color: white;
          padding: 15px 20px;
          border-radius: 5px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: slideIn 0.3s ease;
      `;
      notification.innerHTML = `
          <i class="fas fa-info-circle"></i>
          ${message}
      `;

      document.body.appendChild(notification);

      // Remove after 3 seconds
      setTimeout(() => {
          notification.remove();
      }, 3000);
  }

  showSearchSuggestions(searchTerm) {
      // Remove existing suggestions
      this.removeSearchSuggestions();
      
      if (searchTerm.length < 2) return;

      // Get all product names for suggestions
      const suggestions = this.getSearchSuggestions(searchTerm);
      
      if (suggestions.length > 0) {
          const searchInput = document.getElementById('search-input');
          const suggestionsContainer = document.createElement('div');
          suggestionsContainer.id = 'search-suggestions';
          suggestionsContainer.style.cssText = `
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background: white;
              border: 1px solid #ddd;
              border-radius: 4px;
              max-height: 200px;
              overflow-y: auto;
              z-index: 1000;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          `;

          suggestions.forEach(suggestion => {
              const suggestionItem = document.createElement('div');
              suggestionItem.style.cssText = `
                  padding: 10px;
                  cursor: pointer;
                  border-bottom: 1px solid #eee;
                  color: #333;
              `;
              suggestionItem.textContent = suggestion;
              suggestionItem.addEventListener('click', () => {
                  searchInput.value = suggestion;
                  this.removeSearchSuggestions();
                  this.performSearch();
              });
              suggestionItem.addEventListener('mouseenter', () => {
                  suggestionItem.style.background = '#f5f5f5';
              });
              suggestionItem.addEventListener('mouseleave', () => {
                  suggestionItem.style.background = 'white';
              });
              
              suggestionsContainer.appendChild(suggestionItem);
          });

          searchInput.parentNode.style.position = 'relative';
          searchInput.parentNode.appendChild(suggestionsContainer);
      }
  }

  getSearchSuggestions(searchTerm) {
      // Sample suggestions based on your products
      const allProducts = [
          'Classic Cotton T-Shirt', 'Premium Fit T-Shirt', 'Sport Performance T-Shirt',
          'Casual Comfort T-Shirt', 'Urban Style T-Shirt', 'Graphic Print T-Shirt',
          'Athletic Training Trousers', 'Slim Fit T-Shirt', 'Modern Fit T-Shirt',
          'Street Style T-Shirt', 'Everyday Comfort T-Shirt', 'Premium Cotton T-Shirt',
          'Fashion Basic T-Shirt', 'Sport Running Shorts', 'Casual Wear T-Shirt',
          'Classic Design T-Shirt'
      ];

      return allProducts.filter(product => 
          product.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
  }

  removeSearchSuggestions() {
      const existingSuggestions = document.getElementById('search-suggestions');
      if (existingSuggestions) {
          existingSuggestions.remove();
      }
  }

  // Voice Search Functionality
  setupVoiceSearch() {
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          console.log('Voice search not supported in this browser');
          return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      // Create voice search button
      this.createVoiceSearchButton(recognition);
  }

  createVoiceSearchButton(recognition) {
      const searchBar = document.getElementById('search-bar');
      if (!searchBar) return;

      const voiceBtn = document.createElement('button');
      voiceBtn.id = 'voice-search-btn';
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      voiceBtn.style.cssText = `
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          color: #850808;
          padding: 5px;
          margin-left: 5px;
      `;

      // Add voice button after search button
      const searchBtn = document.getElementById('search-btn');
      searchBtn.parentNode.insertBefore(voiceBtn, searchBtn.nextSibling);

      // Voice search functionality
      voiceBtn.addEventListener('click', () => {
          this.toggleVoiceSearch(voiceBtn, recognition);
      });

      recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          document.getElementById('search-input').value = transcript;
          this.performSearch();
      };

      recognition.onerror = (event) => {
          console.log('Speech recognition error:', event.error);
          this.showSearchMessage('Voice search error: ' + event.error);
          voiceBtn.style.color = '#850808';
      };

      recognition.onend = () => {
          voiceBtn.style.color = '#850808';
      };
  }

  toggleVoiceSearch(voiceBtn, recognition) {
      if (voiceBtn.style.color === 'red') {
          recognition.stop();
          voiceBtn.style.color = '#850808';
      } else {
          recognition.start();
          voiceBtn.style.color = 'red';
          this.showSearchMessage('Listening... Speak now');
      }
  }
}

// Global function to clear search
function clearSearch() {
  localStorage.removeItem('searchTerm');
  window.location.reload();
}

// Initialize search when page loads
document.addEventListener('DOMContentLoaded', function() {
  window.search = new Search();
  
  // Filter products if on shop page with search term
  if (window.location.pathname.includes('shop.html')) {
      window.search.filterProducts();
  }
});

class EcommerceChatbot {
  constructor() {
      this.isOpen = false;
      this.conversation = [];
      this.initializeChatbot();
      this.loadConversation();
  }

  initializeChatbot() {
      const chatbotToggle = document.getElementById('chatbot-toggle');
      const chatbotClose = document.getElementById('chatbot-close');
      const chatbotSend = document.getElementById('chatbot-send');
      const chatbotInput = document.getElementById('chatbot-message-input');
      const messagesContainer = document.getElementById('chatbot-messages');

      if (!chatbotToggle || !chatbotClose || !chatbotSend || !chatbotInput || !messagesContainer) {
          return;
      }

      // Toggle chatbot
      chatbotToggle.addEventListener('click', () => {
          this.toggleChatbot();
      });

      chatbotClose.addEventListener('click', () => {
          this.closeChatbot();
      });

      // Send message
      chatbotSend.addEventListener('click', () => {
          this.sendMessage();
      });

      chatbotInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              this.sendMessage();
          }
      });

      // Welcome message
      setTimeout(() => {
          if (this.conversation.length === 0) {
              this.addBotMessage("Hello! I'm your store assistant. How can I help you today?");
              this.showQuickReplies([
                  "Track my order",
                  "Product information", 
                  "Shipping questions",
                  "Return policy",
                  "Speak to human agent"
              ]);
          }
      }, 1000);
  }

  toggleChatbot() {
      this.isOpen = !this.isOpen;
      document.getElementById('chatbot-container').classList.toggle('active');
      
      if (this.isOpen) {
          document.getElementById('chatbot-message-input').focus();
      }
  }

  closeChatbot() {
      this.isOpen = false;
      document.getElementById('chatbot-container').classList.remove('active');
  }

  sendMessage() {
      const input = document.getElementById('chatbot-message-input');
      const message = input.value.trim();

      if (message) {
          this.addUserMessage(message);
          input.value = '';
          this.processUserMessage(message);
      }
  }

  addUserMessage(text) {
      this.addMessage(text, 'user');
      this.conversation.push({ type: 'user', text, timestamp: new Date() });
      this.saveConversation();
  }

  addBotMessage(text, quickReplies = null) {
      this.addMessage(text, 'bot', quickReplies);
      this.conversation.push({ type: 'bot', text, timestamp: new Date() });
      this.saveConversation();
  }

  addMessage(text, sender, quickReplies = null) {
      const messagesContainer = document.getElementById('chatbot-messages');
      if (!messagesContainer) return;
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${sender}`;
      messageDiv.textContent = text;

      if (quickReplies) {
          const quickRepliesDiv = document.createElement('div');
          quickRepliesDiv.className = 'quick-replies';
          
          quickReplies.forEach(reply => {
              const button = document.createElement('button');
              button.className = 'quick-reply';
              button.textContent = reply;
              button.addEventListener('click', () => {
                  this.addUserMessage(reply);
                  this.processUserMessage(reply);
              });
              quickRepliesDiv.appendChild(button);
          });

          messageDiv.appendChild(quickRepliesDiv);
      }

      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTypingIndicator() {
      const messagesContainer = document.getElementById('chatbot-messages');
      if (!messagesContainer) return null;
      const typingDiv = document.createElement('div');
      typingDiv.className = 'typing-indicator';
      typingDiv.innerHTML = `
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
      `;
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return typingDiv;
  }

  hideTypingIndicator(typingDiv) {
      if (typingDiv && typingDiv.parentNode) {
          typingDiv.parentNode.removeChild(typingDiv);
      }
  }

  processUserMessage(message) {
      const lowerMessage = message.toLowerCase();
      const typingIndicator = this.showTypingIndicator();

      // Simulate processing delay
      setTimeout(() => {
          this.hideTypingIndicator(typingIndicator);
          this.generateResponse(lowerMessage);
      }, 1000 + Math.random() * 1000);
  }

  generateResponse(userMessage) {
      let response = '';
      let quickReplies = null;

      // Order tracking
      if (userMessage.includes('track') || userMessage.includes('order')) {
          response = "To track your order, please provide your order number or check your email for tracking information. You can also visit the 'Order History' section in your account.";
          quickReplies = ["Where is my order?", "Order status", "Need help with tracking"];
      }
      // Product information
      else if (userMessage.includes('product') || userMessage.includes('item')) {
          response = "I can help you find product information! Which product are you interested in? You can browse our catalog or use the search feature on our website.";
          quickReplies = ["Product availability", "Size guide", "Product specifications"];
      }
      // Shipping
      else if (userMessage.includes('shipping') || userMessage.includes('delivery')) {
          response = "We offer free shipping on orders over $50. Standard delivery takes 3-5 business days. Express shipping (1-2 days) is available for an additional fee.";
          quickReplies = ["Shipping costs", "Delivery time", "International shipping"];
      }
      // Returns
      else if (userMessage.includes('return') || userMessage.includes('exchange')) {
          response = "We have a 30-day return policy. Items must be in original condition with tags attached. Would you like to start a return process?";
          quickReplies = ["Start return", "Return policy details", "Exchange item"];
      }
      // Human agent
      else if (userMessage.includes('human') || userMessage.includes('agent')) {
          response = "I'm connecting you with a human agent. Please wait a moment... In the meantime, you can call our support at 1-800-STORE-HELP or email support@mystore.com";
          // In real implementation, this would trigger a live chat connection
      }
      // General help
      else {
          response = "I'm here to help with order tracking, product information, shipping questions, returns, and more! What would you like to know?";
          quickReplies = [
              "Track my order",
              "Product questions", 
              "Shipping information",
              "Return policy",
              "Contact support"
          ];
      }

      this.addBotMessage(response, quickReplies);
  }

  showQuickReplies(replies) {
      const messagesContainer = document.getElementById('chatbot-messages');
      if (!messagesContainer) return;
      const quickRepliesDiv = document.createElement('div');
      quickRepliesDiv.className = 'quick-replies';
      
      replies.forEach(reply => {
          const button = document.createElement('button');
          button.className = 'quick-reply';
          button.textContent = reply;
          button.addEventListener('click', () => {
              this.addUserMessage(reply);
              this.processUserMessage(reply);
          });
          quickRepliesDiv.appendChild(button);
      });

      messagesContainer.appendChild(quickRepliesDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  saveConversation() {
      // Save last 50 messages to localStorage
      const recentMessages = this.conversation.slice(-50);
      localStorage.setItem('chatbot_conversation', JSON.stringify(recentMessages));
  }

  loadConversation() {
      const saved = localStorage.getItem('chatbot_conversation');
      if (saved) {
          this.conversation = JSON.parse(saved);
          // Replay conversation
          this.conversation.forEach(msg => {
              if (msg.type === 'user') {
                  this.addMessage(msg.text, 'user');
              } else {
                  this.addMessage(msg.text, 'bot');
              }
          });
      }
  }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', function() {
  window.chatbot = new EcommerceChatbot();
});

// Product Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector('.slider');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const dotsContainer = document.querySelector('.slider-dots');
  
  if (!slider || !slides.length) return;
  
  let currentSlide = 0;
  const slideCount = slides.length;
  
  // Create dots
  if (dotsContainer) {
      slides.forEach((_, index) => {
          const dot = document.createElement('div');
          dot.classList.add('dot');
          if (index === 0) dot.classList.add('active');
          dot.addEventListener('click', () => goToSlide(index));
          dotsContainer.appendChild(dot);
      });
  }
  
  const dots = dotsContainer ? document.querySelectorAll('.dot') : [];
  
  // Function to go to specific slide
  function goToSlide(slideIndex) {
      currentSlide = slideIndex;
      updateSlider();
  }
  
  // Function to update slider position
  function updateSlider() {
      slider.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      // Update dots
      if (dots.length) {
          dots.forEach((dot, index) => {
              dot.classList.toggle('active', index === currentSlide);
          });
      }
  }
  
  // Next slide function
  function nextSlide() {
      currentSlide = (currentSlide + 1) % slideCount;
      updateSlider();
  }
  
  // Previous slide function
  function prevSlide() {
      currentSlide = (currentSlide - 1 + slideCount) % slideCount;
      updateSlider();
  }
  
  // Event listeners for buttons
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  
  // Auto slide every 5 seconds
  let slideInterval = setInterval(nextSlide, 5000);
  
  // Pause auto-slide on hover
  const sliderContainer = document.querySelector('.slider-container');
  if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', () => {
          clearInterval(slideInterval);
      });
      
      sliderContainer.addEventListener('mouseleave', () => {
          slideInterval = setInterval(nextSlide, 5000);
      });
      
      // Touch swipe support for mobile
      let startX = 0;
      let endX = 0;
      
      sliderContainer.addEventListener('touchstart', (e) => {
          startX = e.touches[0].clientX;
      });
      
      sliderContainer.addEventListener('touchend', (e) => {
          endX = e.changedTouches[0].clientX;
          handleSwipe();
      });
      
      function handleSwipe() {
          const swipeThreshold = 50;
          const diff = startX - endX;
          
          if (Math.abs(diff) > swipeThreshold) {
              if (diff > 0) {
                  nextSlide(); // Swipe left
              } else {
                  prevSlide(); // Swipe right
              }
          }
      }
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
          prevSlide();
      } else if (e.key === 'ArrowRight') {
          nextSlide();
      }
  });
});

// Global function to set product (for product links)
function setProduct(productId) {
    localStorage.setItem('selectedProduct', productId);
}