let cart = [];
let btnsDOM = [];

class Products 
{
    async getProducts()
    {
        try 
        {
            //request the data in the file
            let result  = await fetch("products.json");
            // extracting the json data in the file
            let data = await result.json();
            //get the products (stored in "items")
            let products = data.items;
            products = products.map( (item) =>
            {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            });
            return products;    
        } 
        catch (error) 
        {
            console.log(`You Got Error ${error}`);
        }
    }
}

class UI 
{
    displayProducts(products) 
    {
        const productsContainer = document.querySelector(".products-center");
        let productsHTML = ``;
        products.forEach(product => 
        {
            productsHTML += 
            `
                <!-- single product -->
                <article class = "product">
                    <div class="img-container">
                        <img 
                        src=${product.image} 
                        alt="product" 
                        class = "product-img"
                        />
                        <button class="bag-btn" data-id = "${product.id}">
                            <i class = "fas fa-shopping-cart"></i>
                            add to bag
                        </button> 
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
                <!-- end of single product -->
            `;     
        });
        productsContainer.innerHTML = productsHTML;
    }

    getBagButtons()
    {
        const btns = [...document.querySelectorAll(".bag-btn")];
        btnsDOM = btns;
        btns.forEach(btn => 
        {
            let id = btn.dataset.id;
            let inCart = cart.find(product => id === product.id)
            if (inCart)
            {
                //not important till now
            }

            btn.addEventListener("click",ev =>
            {
                //changing lable and disable clicking
                ev.target.innerText = "In Cart";
                ev.target.disabled = true;

                //get the clicked product and add amount key initialized by one
                let cartItem = {...Storage.getProduct(id), amount : 1};
                
                //push cartItem to cart and save it in local storage
                cart = [...cart, cartItem];
                Storage.saveCart(cart);

                //update cart items number and total cost
                this.setCartValues(cart);

                //add the cartItem to Cart Menu
                this.addCartItem(cartItem);

                //showing the cart
                this.showCart();



            })
            
        })
    }

    setCartValues(cart)
    {
        const cartItems = document.querySelector(".cart-items");
        const cartTotal = document.querySelector(".cart-total");
        let itemsPrice = 0;
        let itemsAmount = 0;
        cart.forEach(item => 
        {
            itemsPrice += item.price * item.amount;
            itemsAmount += item.amount;
        })
        cartItems.innerText = itemsAmount;
        cartTotal.innerText = parseFloat(itemsPrice.toFixed(2));
    }

    addCartItem(item)
    {
        const cartContent = document.querySelector(".cart-content");
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = 
        `
            <img src="${item.image}" alt="product">

            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id = ${item.id}>remove</span>
            </div>
            
            <div>
                <i class = "fas fa-chevron-up" data-id = ${item.id}></i>
                <p class="item-amount" data-id = ${item.id}>${item.amount}</p>
                <i class = "fas fa-chevron-down"data-id = ${item.id}></i>
            </div>
        `;
        cartContent.appendChild(div);
        
    }

    showCart()
    {
        const cartOverlay = document.querySelector(".cart-overlay ");
        const cartDOM = document.querySelector(".cart ");
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    hideCart()
    {
        const cartOverlay = document.querySelector(".cart-overlay ");
        const cartDOM = document.querySelector(".cart ");
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    setupAPP()
    {
        //setting footer
        const footer = document.querySelector(".footer");
        footer.addEventListener("click",ev=>
        {
            if (ev.target.classList.contains("footer-title") || ev.target.classList.contains("fa-solid")) 
            {     
                this.scrollTo('pageTop')
            }
        })

        //setting banner
        const banner = document.querySelector(".banner");
        banner.addEventListener("click",()=>
        {    
            this.scrollTo('products')
        })

        //select open/close -cart btns
        const cartBtn = document.querySelector(".cart-btn");
        const closeCartBtn = document.querySelector(".close-cart-btn");

        //check if the cart had products
        cart = Storage.getCart();
        //calculate the cart values 
        this.setCartValues(cart);
        //add cart items to Cart Menu
        this.fillCart(cart)

        //add listeners to open/close cart
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);       

    }
    scrollTo(cls)
    {
        const scrolledClass = document.querySelector(`.${cls}`);
        scrolledClass.scrollIntoView({ behavior: "smooth" });
    }

    fillCart(cart)
    {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic()
    {
        //clear cart
        const clearBtn = document.querySelector(".clear-cart");
        clearBtn.addEventListener("click",()=>
        {
            this.clearCart()
        });

        /* increase / decrease / remove items from cart */
        const cartContent = document.querySelector(".cart-content");
        cartContent.addEventListener("click", ev => 
        {
            if(ev.target.classList.contains("remove-item"))
            {
                //select button & its ID
                let btn = ev.target;
                let id = btn.dataset.id;

                //remove the HTML
                let removeItem = btn.parentElement.parentElement;
                cartContent.removeChild(removeItem)

                //remove item from cart
                this.removeItemById(id);             
            }

            else if(ev.target.classList.contains("fa-chevron-down"))
            {
                //select button & its ID
                let btn = ev.target;
                let id = btn.dataset.id;

                /* select the decreased item 
                   (changing variable will affect the cart array 
                   as they points to same location in memory)
                */
                let decreasedItem = cart.find(item => id === item.id);
                decreasedItem.amount = decreasedItem.amount - 1;

                if(decreasedItem.amount == 0)
                {
                    //remove the HTML
                    let removeItem = btn.parentElement.parentElement;
                    cartContent.removeChild(removeItem)
    
                    //remove item from cart
                    this.removeItemById(id);             
                }
                else
                {        
                    // update the items amount
                    btn.previousElementSibling.innerText = btn.previousElementSibling.innerText - 1;

                    //update cart
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                }
                    
            }
            else if(ev.target.classList.contains("fa-chevron-up"))
            {
                //select button & its ID
                let btn = ev.target;
                let id = btn.dataset.id;

                /* select the decreased item 
                   (changing variable will affect the cart array as they points to same location in memory)
                */
               let increasedItem = cart.find(item => id === item.id);
               increasedItem.amount = increasedItem.amount + 1;

               // update the items amount
               btn.nextElementSibling.innerText = Number(btn.nextElementSibling.innerText) + 1;

               //update cart
               Storage.saveCart(cart);
               this.setCartValues(cart);

            }
                        
        })

    }

    clearCart()
    {
        //get the IDs of products in cart
        let cartItemsIDs = cart.map(item => item.id);
        //remove products from cart
        cartItemsIDs.forEach(id => this.removeItemById(id))
        //remove products from html page
        const cartContent = document.querySelector(".cart-content");
        while(cartContent.children.length > 0)
        {
            cartContent.removeChild(cartContent.children[0]);
        }

    }

    removeItemById(id)
    {
        //remove items
        cart = cart.filter(item => id !== item.id);
        //reset the values of cart menu and update localstorage after removing
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let btn = this.getButtonById(id);
        btn.disabled = false;
        btn.innerHTML = `
                            <i class = "fas fa-shopping-cart"></i>add to cart
                        `;                 
    }

    getButtonById(id)
    {
        return btnsDOM.find(btn => id === btn.dataset.id);
    }
}

class Storage 
{
    static saveProducts(products)
    {
        //Converting to JSON to be read at localStorage
        localStorage.setItem("Products",JSON.stringify(products));
    }

    static getProduct(id)
    {
        let products = JSON.parse(localStorage.getItem("Products"));
        return products.find(product => id === product.id);  
    }

    static saveCart(cart)
    {  
        //Converting to JSON to be read at localStorage
        localStorage.setItem("Cart",JSON.stringify(cart));
    }

    static getCart()
    {
        let cart = [];
        let cartItems = localStorage.getItem("Cart");
        if(cartItems != undefined)
        {
            cart = JSON.parse(cartItems);
        }
        return cart;
    }


}

document.addEventListener("DOMContentLoaded",()=>
{
    const ui = new UI;
    const products = new Products;
    /*  setup can be done before product are loaded 
        as it works on elements which are already exist or on the saved cart in the localStorage
    */
    ui.setupAPP();

    products.getProducts().then( products => 
    {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    })
    .then( ()=>
        {
            //btns must be selected after products displayed
            ui.getBagButtons();
            ui.cartLogic();
        }
    )
})
