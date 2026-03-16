(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('submit', (event)=>{
        event.preventDefault();
        const myModal = new bootstrap.Modal(document.querySelector("#exampleModal"));
       // event.target.parentNode.submit();
         myModal.show();
    })
    if (typeof initValidation === 'function') initValidation();
    let x = document.getElementById('xbtn');
    let cls = document.getElementById('cls');
    cls.addEventListener('click', ()=>{
        let form = document.querySelector('form');
        form.submit();
    })
    x.addEventListener('click', ()=>{
        let form = document.querySelector('form');
        form.submit();
    })
    function getCartFromCookie() {
        //obtient les items des cookies
        try {
            const list = JSON.parse(localStorage.getItem('ShopCart') || '[]');
            return list.map(item => ({ ...item, quantity: item.quantity || 1 }));
        } catch (error) {
            console.error("Cart parsing error:", error);
            return [];
        }
    }

    function setCartCookie(cart) {
        //modifie les cookies
        localStorage.setItem('ShopCart', JSON.stringify(cart));
    }

    let cart = getCartFromCookie();
    const paymentradios = document.querySelectorAll('input[name="paymentMethod"]');
    const cardfieldscontainer = document.querySelector('.row.gy-3');
    const radiogroup = document.querySelector('.my-3');

    let paypalcontainer = document.getElementById('paypal-form-container');
    if (!paypalcontainer && radiogroup) {
        paypalcontainer = document.createElement('div');
        paypalcontainer.id = 'paypal-form-container';
        radiogroup.parentNode.insertBefore(paypalcontainer, cardfieldscontainer);
    }

    function setPaymentMethod(methodId) {
        //fonction pour afficher le bouton paypal
        const ispaypal = methodId === 'paypal';

        if (paypalcontainer) {
            if (ispaypal) {
                paypalcontainer.innerHTML = `<div class="my-3 p-3 border rounded bg-light text-center"><form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="ABC123XYZ"><input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal"></form></div>`;
                paypalcontainer.style.display = 'block';
            } else {
                paypalcontainer.innerHTML = '';
                paypalcontainer.style.display = 'none';
            }
        }

        if (cardfieldscontainer) {
            cardfieldscontainer.style.display = ispaypal ? 'none' : 'flex';
            cardfieldscontainer.querySelectorAll('input').forEach(input => {
                input.disabled = ispaypal;
                if (!ispaypal) {
                    const requiredIds = ['cc-name', 'cc-number', 'cc-expiration', 'cc-cvv'];
                    input.required = requiredIds.includes(input.id);
                } else {
                    input.required = false;
                    input.classList.remove('is-valid', 'is-invalid');
                }
            });
        }
    }

    paymentradios.forEach(radio => {
        radio.addEventListener('change', (e) => setPaymentMethod(e.target.id));
    });

    const selectedpayment = Array.from(paymentradios).find(radio => radio.checked);
    if (selectedpayment) {
        setPaymentMethod(selectedpayment.id);
    } else if (paymentradios.length > 0) {
        paymentradios[0].checked = true;
        setPaymentMethod(paymentradios[0].id);
    }

    function updateCartUI() {
        const cartlist = document.getElementById('list-group');
        const cartbadge = document.getElementById('cart-badge');
        const carttotaldisplay = document.getElementById('cart-total-price');

        if (!cartlist) return;

        if (!cart || cart.length === 0) {
            cartlist.innerHTML = '<li class="list-group-item text-center text-muted">Cart is empty</li>';
            if (cartbadge) cartbadge.style.display = 'none';
            if (carttotaldisplay) carttotaldisplay.textContent = '$0.00';
            return;
        }

        const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
        //ajoute item a liste du panier
        cartlist.innerHTML = cart.map(item => `<li class="list-group-item d-flex justify-content-between lh-sm align-items-center">
                <div><h6 class="my-0 itemname">${item.name || 'Product'}</h6><small class="text-body-secondary itemcode">${item.code || ''}</small>
                </div><div class="d-flex align-items-center gap-2"><input type="number" min="1" class="form-control form-control-sm qty-input" data-code="${item.code}" value="${item.quantity || 1}" style="width:4rem;"/><span class="text-body-secondary">$${(Number(item.price) * (item.quantity || 1)).toFixed(2)}</span><button class="btn btn-sm btn-link text-dark text-decoration-none remove-btn" data-code="${item.code}">×</button></div></li>`).join('');
        if (cartbadge) {
            const badgeCount = cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
            cartbadge.textContent = badgeCount;
            cartbadge.style.display = 'inline-block';
        }

        if (carttotaldisplay) {
            carttotaldisplay.textContent = `$${total.toFixed(2)}`;
        }
    }

    updateCartUI();

    const cartlistEl = document.getElementById('list-group');
    if (cartlistEl) {
        cartlistEl.addEventListener('input', e => {
            if (e.target.classList.contains('qty-input')) {
                const code = e.target.dataset.code;
                const qty = Number(e.target.value);
                const item = cart.find(i => i.code === code);
                if (item) {
                    if (qty > 0) {
                        item.quantity = qty;
                    } else {
                        cart = cart.filter(i => i.code !== code);
                    }
                    setCartCookie(cart);
                    updateCartUI();
                }
            }
        });
        cartlistEl.addEventListener('click', e => {
            if (e.target.classList.contains('remove-btn')) {
                const code = e.target.dataset.code;
                cart = cart.filter(i => i.code !== code);
                setCartCookie(cart);
                updateCartUI();
            }
        });
    }
});