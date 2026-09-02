<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->createUsers();
        $categories = $this->createCategories();
        $this->createProducts($categories);
        $this->createSettings();
        $this->createCoupon();
    }

    protected function createUsers(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@kalmklothing.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Demo Customer',
            'email' => 'customer@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'phone' => '+2348012345678',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }

    protected function createCategories(): array
    {
        $men = Category::create(['name' => 'Men', 'slug' => 'men', 'sort_order' => 1]);
        $women = Category::create(['name' => 'Women', 'slug' => 'women', 'sort_order' => 2]);
        $unisex = Category::create(['name' => 'Unisex', 'slug' => 'unisex', 'sort_order' => 3]);

        $tshirts = Category::create(['name' => 'T-Shirts', 'slug' => 't-shirts', 'parent_id' => $unisex->id, 'sort_order' => 1]);
        $hoodies = Category::create(['name' => 'Hoodies', 'slug' => 'hoodies', 'parent_id' => $unisex->id, 'sort_order' => 2]);
        $shirts = Category::create(['name' => 'Shirts', 'slug' => 'shirts', 'parent_id' => $men->id, 'sort_order' => 1]);
        $trousers = Category::create(['name' => 'Trousers', 'slug' => 'trousers', 'parent_id' => $men->id, 'sort_order' => 2]);
        $dresses = Category::create(['name' => 'Dresses', 'slug' => 'dresses', 'parent_id' => $women->id, 'sort_order' => 1]);
        $accessories = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'parent_id' => $unisex->id, 'sort_order' => 3]);

        return compact('men', 'women', 'unisex', 'tshirts', 'hoodies', 'shirts', 'trousers', 'dresses', 'accessories');
    }

    protected function createProducts(array $categories): void
    {
        $products = [
            [
                'name' => 'Premium Ankara Shirt',
                'sku' => 'KLM-MEN-ANK-001',
                'description' => 'Handcrafted premium Ankara print shirt with modern tailoring. Features vibrant African-inspired patterns and a comfortable relaxed fit. Perfect for casual outings and cultural events.',
                'short_description' => 'Vibrant Ankara print shirt with modern African tailoring.',
                'category_id' => $categories['shirts']->id,
                'price' => 35000,
                'stock_quantity' => 50,
                'is_featured' => true,
                'is_new_arrival' => true,
                'weight' => 0.4,
                'tags' => ['ankara', 'african', 'premium', 'shirts'],
                'image_url' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
                'variants' => [
                    ['color' => 'Multi', 'color_hex' => '#FF6B35', 'size' => 'S', 'sku' => 'KLM-MEN-ANK-001-S', 'stock_quantity' => 10],
                    ['color' => 'Multi', 'color_hex' => '#FF6B35', 'size' => 'M', 'sku' => 'KLM-MEN-ANK-001-M', 'stock_quantity' => 15],
                    ['color' => 'Multi', 'color_hex' => '#FF6B35', 'size' => 'L', 'sku' => 'KLM-MEN-ANK-001-L', 'stock_quantity' => 15],
                    ['color' => 'Multi', 'color_hex' => '#FF6B35', 'size' => 'XL', 'sku' => 'KLM-MEN-ANK-001-XL', 'stock_quantity' => 10],
                ],
            ],
            [
                'name' => 'Elegant Wrapper Set',
                'sku' => 'KLM-WOM-WRP-001',
                'description' => 'Beautifully designed two-piece wrapper set with matching blouse. Features luxurious George fabric with intricate embroidery. Ideal for traditional ceremonies and special occasions.',
                'short_description' => 'Luxurious George fabric two-piece wrapper set.',
                'category_id' => $categories['dresses']->id,
                'price' => 45000,
                'stock_quantity' => 30,
                'is_featured' => true,
                'is_new_arrival' => false,
                'is_best_seller' => true,
                'weight' => 0.8,
                'tags' => ['wrapper', 'traditional', 'george', 'elegant'],
                'image_url' => 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
                'variants' => [
                    ['color' => 'Gold', 'color_hex' => '#FFD700', 'size' => 'M', 'sku' => 'KLM-WOM-WRP-001-M', 'stock_quantity' => 10],
                    ['color' => 'Gold', 'color_hex' => '#FFD700', 'size' => 'L', 'sku' => 'KLM-WOM-WRP-001-L', 'stock_quantity' => 10],
                    ['color' => 'Gold', 'color_hex' => '#FFD700', 'size' => 'XL', 'sku' => 'KLM-WOM-WRP-001-XL', 'stock_quantity' => 10],
                ],
            ],
            [
                'name' => 'Street Style Hoodie',
                'sku' => 'KLM-UNI-HOD-001',
                'description' => 'Urban street style hoodie with bold graphic prints. Made from premium cotton fleece for maximum comfort. Features a kangaroo pocket and adjustable drawstring hood.',
                'short_description' => 'Urban street style graphic hoodie.',
                'category_id' => $categories['hoodies']->id,
                'price' => 28000,
                'stock_quantity' => 60,
                'is_featured' => true,
                'is_new_arrival' => true,
                'weight' => 0.6,
                'tags' => ['hoodie', 'streetwear', 'urban', 'unisex'],
                'image_url' => 'https://images.unsplash.com/photo-1556821840-3a63f7560068?w=600',
                'variants' => [
                    ['color' => 'Black', 'color_hex' => '#000000', 'size' => 'S', 'sku' => 'KLM-UNI-HOD-001-BLK-S', 'stock_quantity' => 15],
                    ['color' => 'Black', 'color_hex' => '#000000', 'size' => 'M', 'sku' => 'KLM-UNI-HOD-001-BLK-M', 'stock_quantity' => 15],
                    ['color' => 'Black', 'color_hex' => '#000000', 'size' => 'L', 'sku' => 'KLM-UNI-HOD-001-BLK-L', 'stock_quantity' => 15],
                    ['color' => 'Black', 'color_hex' => '#000000', 'size' => 'XL', 'sku' => 'KLM-UNI-HOD-001-BLK-XL', 'stock_quantity' => 15],
                    ['color' => 'White', 'color_hex' => '#FFFFFF', 'size' => 'M', 'sku' => 'KLM-UNI-HOD-001-WHT-M', 'stock_quantity' => 10],
                    ['color' => 'White', 'color_hex' => '#FFFFFF', 'size' => 'L', 'sku' => 'KLM-UNI-HOD-001-WHT-L', 'stock_quantity' => 10],
                ],
            ],
            [
                'name' => 'Classic Denim Jacket',
                'sku' => 'KLM-MEN-DMJ-001',
                'description' => 'Timeless denim jacket crafted from premium selvedge denim. Features brass buttons, multiple pockets, and a comfortable regular fit. A wardrobe essential for every Nigerian man.',
                'short_description' => 'Premium selvedge denim jacket.',
                'category_id' => $categories['shirts']->id,
                'price' => 42000,
                'stock_quantity' => 35,
                'is_featured' => true,
                'weight' => 0.8,
                'tags' => ['denim', 'jacket', 'classic', 'premium'],
                'image_url' => 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600',
                'variants' => [
                    ['color' => 'Blue', 'color_hex' => '#4169E1', 'size' => 'S', 'sku' => 'KLM-MEN-DMJ-001-S', 'stock_quantity' => 10],
                    ['color' => 'Blue', 'color_hex' => '#4169E1', 'size' => 'M', 'sku' => 'KLM-MEN-DMJ-001-M', 'stock_quantity' => 10],
                    ['color' => 'Blue', 'color_hex' => '#4169E1', 'size' => 'L', 'sku' => 'KLM-MEN-DMJ-001-L', 'stock_quantity' => 10],
                    ['color' => 'Blue', 'color_hex' => '#4169E1', 'size' => 'XL', 'sku' => 'KLM-MEN-DMJ-001-XL', 'stock_quantity' => 5],
                ],
            ],
            [
                'name' => 'Floral Maxi Dress',
                'sku' => 'KLM-WOM-FLD-001',
                'description' => 'Stunning floral maxi dress with flowing silhouette. Features vibrant tropical prints on lightweight chiffon fabric. Perfect for garden parties, brunches, and summer events.',
                'short_description' => 'Flowing floral print maxi dress.',
                'category_id' => $categories['dresses']->id,
                'price' => 55000,
                'discount_price' => 48000,
                'stock_quantity' => 25,
                'is_new_arrival' => true,
                'is_best_seller' => true,
                'weight' => 0.5,
                'tags' => ['floral', 'maxi', 'dress', 'summer', 'elegant'],
                'image_url' => 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
                'variants' => [
                    ['color' => 'Blue', 'color_hex' => '#87CEEB', 'size' => 'S', 'sku' => 'KLM-WOM-FLD-001-S', 'stock_quantity' => 8],
                    ['color' => 'Blue', 'color_hex' => '#87CEEB', 'size' => 'M', 'sku' => 'KLM-WOM-FLD-001-M', 'stock_quantity' => 10],
                    ['color' => 'Blue', 'color_hex' => '#87CEEB', 'size' => 'L', 'sku' => 'KLM-WOM-FLD-001-L', 'stock_quantity' => 7],
                ],
            ],
            [
                'name' => 'Graphic T-Shirt',
                'sku' => 'KLM-UNI-GTS-001',
                'description' => 'Bold graphic t-shirt featuring African-inspired artwork. Made from 100% organic cotton with a comfortable regular fit. Machine washable and fade-resistant print.',
                'short_description' => 'African-inspired graphic cotton tee.',
                'category_id' => $categories['tshirts']->id,
                'price' => 15000,
                'stock_quantity' => 100,
                'is_best_seller' => true,
                'weight' => 0.3,
                'tags' => ['graphic', 't-shirt', 'african', 'cotton'],
                'image_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
                'variants' => [
                    ['color' => 'Black', 'color_hex' => '#000000', 'size' => 'S', 'sku' => 'KLM-UNI-GTS-001-BLK-S', 'stock_quantity' => 25],
                    ['color' => 'Black', 'color_hex' => '#000000', 'size' => 'M', 'sku' => 'KLM-UNI-GTS-001-BLK-M', 'stock_quantity' => 25],
                    ['color' => 'Black', 'color_hex' => '#000000', 'size' => 'L', 'sku' => 'KLM-UNI-GTS-001-BLK-L', 'stock_quantity' => 25],
                    ['color' => 'Black', 'color_hex' => '#000000', 'size' => 'XL', 'sku' => 'KLM-UNI-GTS-001-BLK-XL', 'stock_quantity' => 25],
                    ['color' => 'White', 'color_hex' => '#FFFFFF', 'size' => 'M', 'sku' => 'KLM-UNI-GTS-001-WHT-M', 'stock_quantity' => 20],
                    ['color' => 'White', 'color_hex' => '#FFFFFF', 'size' => 'L', 'sku' => 'KLM-UNI-GTS-001-WHT-L', 'stock_quantity' => 20],
                ],
            ],
            [
                'name' => 'Cargo Trousers',
                'sku' => 'KLM-MEN-CRG-001',
                'description' => 'Utility cargo trousers with multiple pockets. Made from durable cotton twill with a modern tapered fit. Features adjustable ankle cuffs and reinforced stitching.',
                'short_description' => 'Utility cargo trousers with modern fit.',
                'category_id' => $categories['trousers']->id,
                'price' => 25000,
                'stock_quantity' => 45,
                'is_featured' => true,
                'weight' => 0.5,
                'tags' => ['cargo', 'trousers', 'utility', 'mens'],
                'image_url' => 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
                'variants' => [
                    ['color' => 'Khaki', 'color_hex' => '#C3B091', 'size' => 'S', 'sku' => 'KLM-MEN-CRG-001-S', 'stock_quantity' => 15],
                    ['color' => 'Khaki', 'color_hex' => '#C3B091', 'size' => 'M', 'sku' => 'KLM-MEN-CRG-001-M', 'stock_quantity' => 15],
                    ['color' => 'Khaki', 'color_hex' => '#C3B091', 'size' => 'L', 'sku' => 'KLM-MEN-CRG-001-L', 'stock_quantity' => 15],
                    ['color' => 'Khaki', 'color_hex' => '#C3B091', 'size' => 'XL', 'sku' => 'KLM-MEN-CRG-001-XL', 'stock_quantity' => 10],
                ],
            ],
            [
                'name' => 'Peplum Blouse',
                'sku' => 'KLM-WOM-PPB-001',
                'description' => 'Elegant peplum blouse with structured shoulders and a flattering cinched waist. Features premium stretch fabric for comfort and a polished look. Perfect for office or events.',
                'short_description' => 'Structured peplum blouse with cinched waist.',
                'category_id' => $categories['women']->id,
                'price' => 22000,
                'stock_quantity' => 40,
                'is_new_arrival' => true,
                'weight' => 0.3,
                'tags' => ['peplum', 'blouse', 'elegant', 'womens'],
                'image_url' => 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600',
                'variants' => [
                    ['color' => 'Red', 'color_hex' => '#DC143C', 'size' => 'S', 'sku' => 'KLM-WOM-PPB-001-S', 'stock_quantity' => 10],
                    ['color' => 'Red', 'color_hex' => '#DC143C', 'size' => 'M', 'sku' => 'KLM-WOM-PPB-001-M', 'stock_quantity' => 15],
                    ['color' => 'Red', 'color_hex' => '#DC143C', 'size' => 'L', 'sku' => 'KLM-WOM-PPB-001-L', 'stock_quantity' => 15],
                ],
            ],
            [
                'name' => 'Oversized Sweatshirt',
                'sku' => 'KLM-UNI-OSW-001',
                'description' => 'Cozy oversized sweatshirt with dropped shoulders and ribbed cuffs. Made from premium French terry cotton. Features a minimalist embroidered logo on the chest.',
                'short_description' => 'Cozy oversized French terry sweatshirt.',
                'category_id' => $categories['hoodies']->id,
                'price' => 30000,
                'stock_quantity' => 55,
                'is_featured' => true,
                'is_new_arrival' => true,
                'weight' => 0.5,
                'tags' => ['sweatshirt', 'oversized', 'cozy', 'unisex'],
                'image_url' => 'https://images.unsplash.com/photo-1556821840-3a63f7560068?w=600',
                'variants' => [
                    ['color' => 'Grey', 'color_hex' => '#808080', 'size' => 'S', 'sku' => 'KLM-UNI-OSW-001-GRY-S', 'stock_quantity' => 15],
                    ['color' => 'Grey', 'color_hex' => '#808080', 'size' => 'M', 'sku' => 'KLM-UNI-OSW-001-GRY-M', 'stock_quantity' => 15],
                    ['color' => 'Grey', 'color_hex' => '#808080', 'size' => 'L', 'sku' => 'KLM-UNI-OSW-001-GRY-L', 'stock_quantity' => 15],
                    ['color' => 'Grey', 'color_hex' => '#808080', 'size' => 'XL', 'sku' => 'KLM-UNI-OSW-001-GRY-XL', 'stock_quantity' => 10],
                    ['color' => 'Navy', 'color_hex' => '#000080', 'size' => 'M', 'sku' => 'KLM-UNI-OSW-001-NVY-M', 'stock_quantity' => 10],
                    ['color' => 'Navy', 'color_hex' => '#000080', 'size' => 'L', 'sku' => 'KLM-UNI-OSW-001-NVY-L', 'stock_quantity' => 10],
                ],
            ],
            [
                'name' => 'Traditional Agbada',
                'sku' => 'KLM-MEN-AGB-001',
                'description' => 'Exquisite traditional Agbada hand-embroidered with intricate patterns. Made from premium Guinea brocade fabric. A statement piece for weddings, festivals, and celebrations.',
                'short_description' => 'Hand-embroidered premium Guinea brocade Agbada.',
                'category_id' => $categories['men']->id,
                'price' => 85000,
                'stock_quantity' => 20,
                'is_featured' => true,
                'is_best_seller' => true,
                'weight' => 1.2,
                'tags' => ['agbada', 'traditional', 'premium', 'wedding'],
                'image_url' => 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600',
                'variants' => [
                    ['color' => 'Cream', 'color_hex' => '#FFFDD0', 'size' => 'M', 'sku' => 'KLM-MEN-AGB-001-M', 'stock_quantity' => 7],
                    ['color' => 'Cream', 'color_hex' => '#FFFDD0', 'size' => 'L', 'sku' => 'KLM-MEN-AGB-001-L', 'stock_quantity' => 7],
                    ['color' => 'Cream', 'color_hex' => '#FFFDD0', 'size' => 'XL', 'sku' => 'KLM-MEN-AGB-001-XL', 'stock_quantity' => 6],
                ],
            ],
            [
                'name' => 'Lace Gown',
                'sku' => 'KLM-WOM-LCG-001',
                'description' => 'Stunning lace gown with delicate floral patterns and a flowing silhouette. Features quality French lace with satin lining. Perfect for weddings, galas, and traditional ceremonies.',
                'short_description' => 'Delicate French lace gown with satin lining.',
                'category_id' => $categories['dresses']->id,
                'price' => 65000,
                'stock_quantity' => 20,
                'is_new_arrival' => true,
                'is_best_seller' => true,
                'weight' => 0.7,
                'tags' => ['lace', 'gown', 'wedding', 'formal'],
                'image_url' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
                'variants' => [
                    ['color' => 'Ivory', 'color_hex' => '#FFFFF0', 'size' => 'S', 'sku' => 'KLM-WOM-LCG-001-S', 'stock_quantity' => 5],
                    ['color' => 'Ivory', 'color_hex' => '#FFFFF0', 'size' => 'M', 'sku' => 'KLM-WOM-LCG-001-M', 'stock_quantity' => 8],
                    ['color' => 'Ivory', 'color_hex' => '#FFFFF0', 'size' => 'L', 'sku' => 'KLM-WOM-LCG-001-L', 'stock_quantity' => 7],
                ],
            ],
            [
                'name' => 'Knitted Beanie',
                'sku' => 'KLM-UNI-BNI-001',
                'description' => 'Hand-knitted premium wool beanie with ribbed cuff. Warm and comfortable for cooler evenings. Features a subtle embroidered Kalmklothing logo.',
                'short_description' => 'Premium wool knitted beanie.',
                'category_id' => $categories['accessories']->id,
                'price' => 8000,
                'stock_quantity' => 80,
                'is_new_arrival' => true,
                'weight' => 0.1,
                'tags' => ['beanie', 'knitted', 'wool', 'accessories'],
                'image_url' => 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600',
                'variants' => [
                    ['color' => 'Black', 'color_hex' => '#000000', 'sku' => 'KLM-UNI-BNI-001-BLK', 'stock_quantity' => 25],
                    ['color' => 'Grey', 'color_hex' => '#808080', 'sku' => 'KLM-UNI-BNI-001-GRY', 'stock_quantity' => 25],
                    ['color' => 'Navy', 'color_hex' => '#000080', 'sku' => 'KLM-UNI-BNI-001-NVY', 'stock_quantity' => 20],
                    ['color' => 'Burgundy', 'color_hex' => '#800020', 'sku' => 'KLM-UNI-BNI-001-BRG', 'stock_quantity' => 10],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $variants = $productData['variants'] ?? [];
            $imageUrl = $productData['image_url'] ?? null;
            unset($productData['variants'], $productData['image_url']);

            $product = Product::create($productData);

            if ($imageUrl) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $imageUrl,
                    'alt_text' => $product->name,
                    'sort_order' => 0,
                    'is_primary' => true,
                ]);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $imageUrl.'&flip=true',
                    'alt_text' => $product->name.' - Alternative View',
                    'sort_order' => 1,
                    'is_primary' => false,
                ]);
            }

            foreach ($variants as $variant) {
                ProductVariant::create(array_merge($variant, [
                    'product_id' => $product->id,
                    'is_active' => true,
                ]));
            }
        }
    }

    protected function createSettings(): void
    {
        $settings = [
            ['key' => 'business_name', 'value' => 'Kalmklothing', 'group' => 'general', 'type' => 'text'],
            ['key' => 'business_email', 'value' => 'hello@kalmklothing.com', 'group' => 'general', 'type' => 'text'],
            ['key' => 'business_phone', 'value' => '+2348012345678', 'group' => 'general', 'type' => 'text'],
            ['key' => 'business_whatsapp', 'value' => '+2348012345678', 'group' => 'general', 'type' => 'text'],
            ['key' => 'business_address', 'value' => 'Lagos, Nigeria', 'group' => 'general', 'type' => 'text'],
            ['key' => 'currency', 'value' => 'NGN', 'group' => 'general', 'type' => 'text'],
            ['key' => 'currency_symbol', 'value' => '₦', 'group' => 'general', 'type' => 'text'],
            ['key' => 'free_shipping_threshold', 'value' => '100000', 'group' => 'shipping', 'type' => 'number'],
            ['key' => 'default_shipping_fee', 'value' => '2000', 'group' => 'shipping', 'type' => 'number'],
            ['key' => 'low_stock_threshold', 'value' => '10', 'group' => 'inventory', 'type' => 'number'],
            ['key' => 'tax_rate', 'value' => '0', 'group' => 'payment', 'type' => 'number'],
            ['key' => 'payment_gateway', 'value' => 'paystack', 'group' => 'payment', 'type' => 'text'],
            ['key' => 'meta_title', 'value' => 'Kalmklothing - Premium Nigerian Fashion', 'group' => 'seo', 'type' => 'text'],
            ['key' => 'meta_description', 'value' => 'Shop premium Nigerian fashion at Kalmklothing. Ankara prints, traditional wear, and modern styles for men and women.', 'group' => 'seo', 'type' => 'textarea'],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }

    protected function createCoupon(): void
    {
        Coupon::create([
            'code' => 'WELCOME10',
            'type' => 'percentage',
            'value' => 10,
            'minimum_order' => 10000,
            'maximum_discount' => 5000,
            'usage_limit' => 100,
            'used_count' => 0,
            'per_customer_limit' => 1,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addDays(90),
            'is_active' => true,
        ]);
    }
}
