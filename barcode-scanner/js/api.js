// API module for fetching product information

const API = {
    baseUrl: 'https://world.openfoodfacts.org/api/v0/product',

    async getProduct(barcode) {
        const url = `${this.baseUrl}/${barcode}.json`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 1 && data.product) {
                return this.formatProduct(data.product, barcode);
            } else {
                return { found: false, barcode: barcode };
            }
        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Failed to fetch product information');
        }
    },

    formatProduct(product, barcode) {
        return {
            found: true,
            barcode: barcode,
            name: product.product_name || 'Unknown Product',
            weight: product.quantity || product.product_quantity || 'Not specified',
            brand: product.brands || 'Unknown Brand',
            ingredients: product.ingredients_text || 'Not available',
            image: product.image_url || null,
            nutrition: product.nutriments || null
        };
    }
};