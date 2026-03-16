let productdb = {};

document.addEventListener('DOMContentLoaded', () => {
    //initialize les variables
    const itemlist = document.getElementById('itemlist');
    const genderbuttons = document.getElementById('gender');
    const addtocartbtn = document.getElementById('add-to-cart-btn');
    const cartlist = document.getElementById('cart-items-list');
    const cartbadge = document.getElementById('cart-badge');
    const carttotaldisplay = document.getElementById('cart-total-price');
    const modalimage = document.getElementById('modal-image');
    const modaltitle = document.getElementById('modal-product-title');
    const modalprice = document.getElementById('modal-product-price');
    const modalcode = document.getElementById('modal-product-code');
    const modaldescription = document.getElementById('modal-product-description');
    const clear = document.getElementById('Clear');
    const arrow = document.getElementById('retourHaut');

    window.addEventListener('scroll', (event) =>
    {
        //fonction qui change la visibilité du scroll to top
        var scroll = window.scrollY;
        if (scroll >= 200 && window.screenY < 800){
            arrow.style.visibility = "visible";
        }
        else{
            arrow.style.visibility = "hidden";
        }
    });
    arrow.addEventListener('click', function(){
        //monte jusqu'au le debut de la page
        window.scrollTo(0, 0);
    })
    let filters = [];
    //verifie les field du contact modal
    let form = document.getElementById('contactForm');
    form.addEventListener('submit', (event)=>{
       event.preventDefault();
        let email = form.querySelector('#email');
        let name = form.querySelector('#name');
        let msg = form.querySelector('#message');
        const regemail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (regemail.test(email.value.toLowerCase()) == false){
            console.log(email.value.toLowerCase());
            alert("INVALID EMAIL")
        }
        else if (name.value.length <= 1){
            alert("INVALID NAME")
        }
        else if (msg.value.length < 30){
            alert('MESSAGE MUST BE LONGER THAN 30 CHARACTERS');
        }
        else{
            form.submit();
        }
    });
    fetch('./products.json').then(response => {
            if (!response.ok) throw new Error('failed to load products');
            return response.json();
        }).then(data => {
            productdb = data;
            //crée un variable pour stocker les filtre de l'item
            Object.entries(productdb).forEach(([id, details]) => {
                const itemfilters = details.filter.split(' ');
                itemfilters.forEach(f => {
                    if (!filters.includes(f)) filters.push(f);
                });
                //chargement des images a partire de products.json
                let imgurl = `img/${id.split('-')[1]}.png`;
                //ajoute modal au images
                itemlist.innerHTML += `
                <div class="col-12 col-md-4 image-box position-relative item"><img src="${imgurl}" alt="${details.code}" data-bs-toggle="modal" data-bs-target="#exampleModal" id="${id}" class="${details.filter} img-fluid img-300"><p class="item-subtitle">${details.code.toUpperCase()}</p></div>`;
            });
            //crée les boutons filtre pour chaque filtre trouver dans products.json
            genderbuttons.innerHTML = '<li><a data-filter="ALL" class="aa text-decoration-none menu-elements" href="#">ALL</a></li>';
            filters.forEach(f => {
                genderbuttons.innerHTML += `<li><a data-filter="${f}" class="aa text-decoration-none menu-elements" href="#">${f}</a></li>`;
            });
        }) .catch(err => console.error(err)); 

    function setcookies(name, value, days) {
        localStorage.setItem(name, JSON.stringify(value));
    }

    function getcookies(name) {
        const data = localStorage.getItem(name);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }

    let cart = getcookies("ShopCart") || [];
    cart = cart.map(item => ({ ...item, quantity: item.quantity || 1 }));
    
    function updateCartUI() {
        if (!cartlist) return;
        cartlist.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            //si panier est vide li = cart is empty
            cartlist.innerHTML = '<li class="list-group-item text-center text-muted">cart is empty</li>';
            //si panier est vide pas de nombre item
            if (cartbadge) cartbadge.style.display = 'none';

        } else {
            cart.forEach(item => {
                //sinon ajoute tous element(s) au panier
                const qty = item.quantity || 1;
                total += Number(item.price || 0) * qty;
                const cartitem = document.createElement('li');
                cartitem.id = item.code;
                cartitem.className = "list-group-item d-flex justify-content-between align-items-center";
                //crée l'element dans le panier
                cartitem.innerHTML = `<div class="count"><div class="fw-bold">${item.name}</div><small class="text-muted">${item.code}</small></div><div class="d-flex align-items-center gap-2"><span class="badge text-dark">$${(Number(item.price) * qty).toFixed(2)}</span></div><input class="form-control form-control-sm qty-input inpclass" min="1" name="quantity" value="${qty}" type="number" data-code="${item.code}" /><button class="btn btn-sm remove-btn" data-code="${item.code}">×</button>
                    `;
                cartlist.appendChild(cartitem);
            });
            if (cartbadge) {
                //calcul le nombre d'item et l'ajoute a l'indicateur de panier
                const badgeCount = cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
                cartbadge.textContent = badgeCount;
                cartbadge.style.display = 'flex';
            }
        }
        if (carttotaldisplay) carttotaldisplay.textContent = `$${total.toFixed(2)}`;
    }

    function removefromcart(code) { 
        const idx = cart.findIndex(i => i.code === code);
        if (idx !== -1) { 
            //enleve un item du panier
            cart.splice(idx, 1); 
            setcookies("ShopCart", cart, 7);
             updateCartUI();
        }
    }

    cartlist.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            //enleve item du panier quand x est clicker dans le panier
            removefromcart(e.target.dataset.code);
        }
    });

    cartlist.addEventListener('input', (e) => {
        if (e.target.classList.contains('qty-input')) {
            //input field pour changer le nombre item dans le field 
            const code = e.target.dataset.code;
            const qty = Number(e.target.value);
            const item = cart.find(i => i.code === code);
            if (item) {
                if (qty > 0) {
                    item.quantity = qty;
                } else {
                    removefromcart(code);
                    return;
                }
                setcookies("ShopCart", cart, 7);
                updateCartUI();
            }
        }
    });

    itemlist.addEventListener('click', (e) => {
        //chargement modal
        if (e.target.tagName === 'IMG') {
            const product = productdb[e.target.id];
            if (product) {
                if (modalimage) modalimage.src = e.target.src;
                if (modaltitle) modaltitle.textContent = product.name;
                if (modalprice) modalprice.textContent = `$${Number(product.price).toFixed(2)}`;
                if (modalcode) modalcode.textContent = `Item Code: ${product.code}`;
                //ajoute un bouton avec un popup
                if (modaldescription) modaldescription.innerHTML = `<div class="box"><a class="button desctitle" href="#descriptionpopup">DESCRIPTION</a></div><div id="descriptionpopup" class="overlay"><div class="descpop"><h2>Description:</h2><a class="close" href="#">×</a><div class="content">${product.description}</div></div></div>`;
                addtocartbtn.dataset.currentProduct = e.target.id;
            }
        }
    });

    addtocartbtn.addEventListener('click', () => {
        //ajoute un item au panier
        const productid = addtocartbtn.dataset.currentProduct;
        const product = productdb[productid];
        if (product) {
            const existing = cart.find(i => i.code === product.code);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            setcookies("ShopCart", cart, 7);
            updateCartUI();
            
            const modalinstance = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
            if (modalinstance) modalinstance.hide();
            
            const offcanvasel = document.getElementById('offcanvasNavbarlight');
            if (offcanvasel) {
                const offcanvas = new bootstrap.Offcanvas(offcanvasel);
                offcanvas.show();
            }
        }
    });

    genderbuttons.addEventListener('click', (e) => {
        //filtre les images
        const filterLink = e.target.closest('a[data-filter]');
        if (filterLink) {
            e.preventDefault();
            const filter = filterLink.dataset.filter;
            document.querySelectorAll('.image-box').forEach(item => {
                const img = item.querySelector('img');
                item.style.display = (filter === 'ALL' || img.classList.contains(filter)) ? 'block' : 'none';
            });
        }
    });
    updateCartUI();

    clear.addEventListener('click', () => {
        cart = [];
        setcookies("ShopCart", cart, 7);
        updateCartUI();
    });
});