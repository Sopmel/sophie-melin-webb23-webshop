const api_url = 'https://fakestoreapi.com/products';
const api_category = 'https://fakestoreapi.com/products/category/jewelery'
const api_single = 'https://fakestoreapi.com/products/' 

class Cart {
  constructor() {
    this.cartItems = this.loadCartItems();
  }

  loadCartItems() {
   
    const storedCartItems = localStorage.getItem('cartItems');
    return storedCartItems ? JSON.parse(storedCartItems) : [];
  }
  
  
  saveCartItems() {
   
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  addToCart(item) {
    this.cartItems.push(item);
    this.saveCartItems();
  }

  removeItem(index) {
    this.cartItems.splice(index, 1);
    this.saveCartItems();
  }

  getTotalPrice() {
    try {
      return this.cartItems.reduce((total, item) => {
        const [, price] = item.text.split(' | ');
        return total + parseFloat(price);
      }, 0);
    } catch (error) {
      console.error('Error calculating total price:', error);
      return 0; 
    }
  }
}

const cart = new Cart();

cart.cartItems = cart.loadCartItems();
displaycart();


const renderProductCard = (item, index)  => {
  return `
  <div class='card'>
    <div class="card-img">
      <img class="w-50" src="${item.image}" alt="${item.title}" />
    </div>
    <div class='bottom'>
      <h6>${item.category}</h6>
      <p class="text-muted">${item.title}</p>
      
      <h2>$ ${item.price}.00</h2>
      <button class="card-btn" onclick='addToCart(${index})'>Add to cart</button>
      <button id="more" class="card-btn more-window" onclick='openPopupWithID(${JSON.stringify(item.id)})'>More</button>
    </div>
  </div>`;
}



//fetch items
fetch(api_url)
.then((response) => response.json())
.then((fetchedProducts) => {
  products = fetchedProducts; 
  root.innerHTML = products
    .map((item, index) => {
      const text = `${item.title} | ${item.price} | ${item.category} | ${item.description}`;
    const html = renderProductCard(item, index)

        
        return html;
    })
    

});


//add to cart
function addToCart(index) {
const product = products[index];
const text = `${product.title} | ${product.price} | ${product.category} | ${product.description}`;
cart.addToCart({ text });
displaycart();
}

function displaycart() {
  let j = 0;
  const total = cart.getTotalPrice();
  document.getElementById('count').innerHTML = cart.cartItems.length;
  if (cart.cartItems.length === 0) {
    document.getElementById('cartItem').innerHTML = "Your cart is empty";
    document.getElementById('total').innerHTML = "$ " + 0 + ".00";
  } else {
    document.getElementById('cartItem').innerHTML = cart.cartItems.map((item, index) => {
      try {
        const [title, price] = item.text.split(' |');
        return (
          `<div class="cart-item">
            <p style='font-size:12px;'>${title}</p>
            <h2 style='font-size: 15px;'>$ ${price}.00</h2>` +
          "<i class='fa-solid fa-trash' onclick='removeFromCart(" + (j++) + ")'></i></div>"
          
        );
      } catch (error) {
        console.error('Error displaying cart item:', error);
        return ''; //empty string
      }
    }).join('');

    document.getElementById('total').innerHTML = "$ " + total.toFixed(2) + ".00";
  }
}

function removeFromCart(index) {
  cart.removeItem(index);
  displaycart();
}

     

//open cart
function openCart() {
  const cartSidebar = document.querySelector('.cart-sidebar');
  if (cartSidebar) {
    cartSidebar.style.right = '0';
  }
}

//close cart
function closeCart() {
  const cartSidebar = document.querySelector('.cart-sidebar');
  if (cartSidebar) {
    cartSidebar.style.right = '-400px';
  }
}

// Category search
const categorySelect = document.getElementById('categorySelect');
const root = document.getElementById('root');
let products = [];

fetch(api_url)
  .then((response) => response.json())
  .then((fetchedProducts) => {
    products = fetchedProducts;
    updateProductList(); 
  });

categorySelect.addEventListener('change', updateProductList);

function updateProductList() {
  const selectedCategory = categorySelect.value.toLowerCase();

  // filter category
  const filteredProducts = products.filter((product) => {
    return selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory;
  });

 
  const html = filteredProducts
    .map((item, index) => {
      return renderProductCard(item, index)
    })
    .join('');

 
  root.innerHTML = html;
}

//open popup

async function openPopupWithID(id) {
  const singleURL = api_single + id;
  const singleProductRes = await fetch(singleURL  );
  const singleData = await singleProductRes.json();
  if(!singleData) return;
  const {title, image, description, category, price}  = singleData;
  openPopup(image, title, category, description, price)
}





function openPopup(image, title, category, description, price) {
  const popupContainer = document.createElement('div');
  popupContainer.classList.add('popup-container');
  

  const popupContent = `
    <div class="popup">
      <span class="close" onclick="closePopup()">&times;</span>
      <div class="image-container">
        <img class="more-img" src="${image}" alt="${title}" />
      </div>
      <div class="text-container">
        <h3>${title}</h3>
        <h5>${category}</h5>
        <p>Description: ${description}</p>
        <p>Price: $${price}.00</p>
      </div>
    </div>
  `;

  popupContainer.innerHTML = popupContent;

  
  document.body.appendChild(popupContainer);
  
  // Style popup
  popupContainer.style.position = 'fixed';
  popupContainer.style.top = '0';
  popupContainer.style.left = '0';
  popupContainer.style.width = '100%';
  popupContainer.style.height = '100%';
  popupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  popupContainer.style.display = 'flex';
  popupContainer.style.justifyContent = 'center';
  popupContainer.style.alignItems = 'center';


  // close popup 
  popupContainer.addEventListener('click', (event) => {
    if (event.target === popupContainer) {
      closePopup();
    }
  });
}

//close popup
function closePopup() {
  const popupContainer = document.querySelector('.popup-container');
  if (popupContainer) {
    popupContainer.remove();
  }
}

//clear cart
function clearCart() {
  cart.cartItems = []; // Clear
  cart.saveCartItems(); //local storage
  displaycart(); 
}

document.addEventListener("DOMContentLoaded", function () {
  const cartIcon = document.querySelector('.fa-shopping-cart');
  const closeCartBtn = document.getElementById('closeCart');

  if (cartIcon) {
    cartIcon.addEventListener('click', openCart);
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', function () {
      console.log('Close button clicked');
      closeCart();
    });
  }
});

