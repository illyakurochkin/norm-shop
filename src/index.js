import './scss/base.scss';

import $ from 'jquery';
window.$ = $;

import _makeProduct from './modules/product-html';
import _makeCategory from './modules/category-html';
import _makebasketProduct from './modules/basket-product-html';
import _makeSelectedProduct from './modules/selected-product-html';

init();

function init() {

	// get info about category #1
	$.ajax({
		url: 'https://nit.tron.net.ua/api/product/list',
		method: 'get', dataType: 'json',
		success: (json) => {
			window.category = {id: 1, name: "All", description: "All products"};
			updateProducts();
		},
		error: (error) => { console.err(error); }
	});	

	window.basket = [];

	updateCategories();

	// add click listener to button 'show-basket'
	$('.show-basket').click(() => {
		updatebasketProducts();
		$('.basket').addClass('visible');
	});

	// add key listener to key 'esc'
	$(document).keydown(e => {
	    if( e.keyCode === 27 ) {
	        $('.full-product .close-button, .basket .close-button').click();
	    }
	});
}

function updateCategories() {
	$('.category-list').empty();
	$.ajax({
		url: 'https://nit.tron.net.ua/api/category/list',
		method: 'get',
		dataType: 'json',
		success: (json) => {
			// json[] = {id: 1, name: "All", description: "All products"};
			let cat = {id: 1, name: "All", description: "All products"};

			let catHTML = _makeCategory(cat);

				$(catHTML).click(() => {

					$('.category.selected').removeClass("selected");
					window.category = cat;
					
					$(`[data-category-id="${window.category.id}"`).addClass("selected");
					updateProducts();
				});

				if(cat.id == window.category.id) {
					$(catHTML).addClass("selected");
				}

				$('.category-list').append(catHTML);

			json.forEach(category => {
				let categoryHTML = _makeCategory(category);

				$(categoryHTML).click(() => {

					$('.category.selected').removeClass("selected");
					window.category = category;
					
					$(`[data-category-id="${window.category.id}"`).addClass("selected");
					updateProducts();
				});

				if(category.id == window.category.id) {
					$(categoryHTML).addClass("selected");
				}

				$('.category-list').append(categoryHTML);
			});

		}, error: (err) => console.log(err)
	});
}



function updateProducts() {
	$('.product-grid').empty();
	if(window.category.id == 1) {
		$.ajax({
			url: `https://nit.tron.net.ua/api/product/list`,
			method: 'get', dataType: 'json',
			success: (json) => {
				json.forEach(product => {
					let productHTML = _makeProduct(product);
					$(productHTML).click(() => updateSelectedProduct(product));
					$('.product-grid').append(productHTML);
				});
			}, error: (err) => console.log(err)
		});
		
	} else {
		$.ajax({
			url: `https://nit.tron.net.ua/api/product/list/category/${window.category.id}`,
			method: 'get', dataType: 'json',
			success: (json) => {
				json.forEach(product => {
					let productHTML = _makeProduct(product);
					$(productHTML).click(() => updateSelectedProduct(product));
					$('.product-grid').append(productHTML);
				});
			}, error: (err) => console.log(err)
		});
	}
}

function updateSelectedProduct(product) {
	let selectedProduct = _makeSelectedProduct(product); 
	$('.full-product').addClass("visible");
	$('.full-product').empty().append(selectedProduct);

	$('.full-product.visible .close-button').click(() => {
		$('.full-product.visible').removeClass('visible');
	});

	$('.full-product.visible .selected-product-add-to-basket').click(() => {
		window.basket.push(product);
		$('.full-product.visible').removeClass('visible');
	});
}

function updatebasketProducts() {
	$('.basket > .basket-product-list').empty();

	$('.basket .close-button').click(() => {
		$('.basket.visible').removeClass('visible');
	});

	window.basket.forEach(product => {
		let $basketProduct = _makebasketProduct(product); 
		$($basketProduct).find('.basket-product-remove-from-basket').click(() => {
			let index = window.basket.indexOf(product);
			if (index > -1) {
			 	window.basket.splice(index, 1);
			}
			updatebasketProducts();
		});
		$('.basket-product-list').append($basketProduct);
	});

	// $('.basket').append($('<button class="basket-buy-button">')
	// 	.text("BUY " + number_format(toPay(), 2, '.', '') + "грн."));

	$('.basket-buy-button').text("BUY " + number_format(toPay(), 2, '.', '') + "грн.");

	$('.basket-buy-button').click(() => {

		if(!($('#name').val() && $('#phone').val() && $('#email'))) {
			//console.log('world');
			return;
		} else {
			//console.log('hello');
		}

		let products = {};
		for(let i = 0; i < window.basket.length; i++) {
			let id = window.basket[i].id;
			if(products[id] != undefined) {
				products[id]++;
			} else if(products[id] == undefined){
				products[id] = 1;
			}
		}

		let obj = {
				"token": "TdUOJDbKInOrgkshXsGT",
				"name": $('#name').val(),
				"phone": $('#phone').val(),
				"email": $('#email').val(),
				"products": products
			};
			// console.log("FUCKING POST");
		$.post("https://nit.tron.net.ua/api/order/add", obj
			, (json) => {
				// console.log(json);
				$('.basket.visible').removeClass("visible");
			});

		$('.basket.visible').removeClass("visible");
	});

	
}


function toPay() {
	return window.basket.reduce((a, b) => {
		return +a + +(b.special_price != null ? +b.special_price : +b.price);
	}, 0);
}









// http://alittlebit.ru/blog/vebmasterskaya/js-jquery/formatirovanie-chisel-na-js.html

function number_format(number, decimals, dec_point, thousands_sep) {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}