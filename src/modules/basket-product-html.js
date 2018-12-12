let _makeHtml = ({
	id,
	name,
	image_url,
	price
}) => {
	let $product = $(`<div class="basket-product" data-product-id="${id}">`);
	$product.append($(`<img src="${image_url}" alt="${name}" class="basket-product-image">`));
	$product.append($(`<span class="basket-product-title">`).text(name));
	$product.append($(`<span class="basket-product-price">`).text(price));
	$product.append($('<button type="button" class="basket-product-remove-from-basket">').text("remove from basket"));
	return $product;
};

module.exports = _makeHtml;
