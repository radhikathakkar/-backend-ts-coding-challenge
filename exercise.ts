type Product = {
    sku: string;
    name: string;
    price: number;
}

type PricingRule = {
    sku: string;
    type: 'bulk' | '3for2' | 'bundle';
    threshold?: number;
    discountPrice?: number;
    price?: number;
    bundleProduct?: string;
}

class Checkout {
    private readonly products: Product[] = [
        { sku: 'ipd', name: 'Super iPad', price: 549.99 },
        { sku: 'mbp', name: 'MacBook Pro', price: 1399.99 },
        { sku: 'atv', name: 'Apple TV', price: 109.50 },
        { sku: 'vga', name: 'VGA adapter', price: 30.00 },
    ];

    private readonly pricingRules: PricingRule[] = [];

    private cart: { [sku: string]: number } = {};

    constructor(pricingRules?: PricingRule[]) {
        if (pricingRules) {
            this.pricingRules = pricingRules;
        }
    }

    scan(sku: string): void {
        if (this.cart[sku]) {
            this.cart[sku]++;
        } else {
            this.cart[sku] = 1;
        }
    }

    total(): number {
        let total = 0;

        Object.keys(this.cart).forEach((sku) => {
            const product = this.products.filter((p) => p.sku === sku)[0];

            if (!product) {
                throw new Error(`Product not found with SKU =  ${sku}`);
            }
            let price = product.price;
            const quantity = this.cart[sku];

            const pricingRule = this.pricingRules.filter((rule) => rule.sku === sku)[0];

            if (pricingRule) {
                switch (pricingRule.type) {
                    case '3for2':
                        price = (Math.floor(quantity / 3) * 2 + quantity % 3) * product.price;
                        break;
                    case 'bulk':
                        if (quantity >= pricingRule.threshold!) {
                            price = quantity * pricingRule.discountPrice!;
                        }
                        break;
                    case 'bundle':
                        if (quantity >= pricingRule.threshold!) {
                            const discountPrice = this.products.filter(el => el.sku ===  pricingRule.bundleProduct)[0].price;
                            price = quantity * +(product.price - discountPrice);
                        }
                        break;

                }
            }

            total += price;
        });

        return total;
    }
}


const pricingRules: PricingRule[] = [
    { sku: 'atv', type: '3for2' },
    { sku: 'ipd', type: 'bulk', threshold: 4, discountPrice: 499.99 },
    {
        sku: 'mbp',
        type: 'bundle',
        bundleProduct: 'vga',
        discountPrice: 30.00,
        threshold: 1,
    },
];

const co = new Checkout(pricingRules);
/** Example One - SKUs Scanned: atv, atv, atv, vga Total expected: $249.00 */
co.scan('atv');
co.scan('atv');
co.scan('atv');
co.scan('vga');



/** Example Two - SKUs Scanned: atv, ipd, ipd, atv, ipd, ipd, ipd Total expected: $2718.95 */
// co.scan('atv');
// co.scan('atv');
// co.scan('ipd');
// co.scan('ipd');
// co.scan('ipd');
// co.scan('ipd');
// co.scan('ipd');


/** Example Three - SKUs Scanned: mbp, vga, ipd Total expected: $1949.98 */
// co.scan('mbp');
// co.scan('vga');
// co.scan('ipd');


const total = co.total();

console.log("My Cart == ", co);

console.log("Expected Total ==", total)