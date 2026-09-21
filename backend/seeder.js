const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await Product.deleteMany();

        const products = [
            {
                name: "Royal Red Banarasi Silk Saree",
                slug: "royal-red-banarasi-silk-saree",
                image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2574&auto=format&fit=crop",
                description: "Handwoven Banarasi silk saree with intricate zari work. Perfect for weddings and special occasions. This royal red drape features traditional motifs and a heavy border.",
                price: 12999,
                category: "Sarees",
                stock: 10,
                images: [
                    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2574&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=2574&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=2574&auto=format&fit=crop"
                ],
                colors: ["Red", "Gold"],
                sizes: ["Free Size"],
                fabric: "Silk",
                isBestSeller: true
            },
            {
                name: "Elegant Teal Georgette Anarkali",
                slug: "elegant-teal-georgette-anarkali",
                image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2574&auto=format&fit=crop",
                description: "Flowy georgette anarkali with sequin embellishments. Comes with a matching dupatta. Ideal for evening receptions and parties.",
                price: 5499,
                category: "Dresses",
                stock: 15,
                images: [
                    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2574&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1583391733975-d22797695024?q=80&w=2574&auto=format&fit=crop",
                    "https://plus.unsplash.com/premium_photo-1664112065870-d8cf01b54a2a?q=80&w=2574&auto=format&fit=crop"
                ],
                colors: ["Teal"],
                sizes: ["M", "L", "XL"],
                fabric: "Georgette",
                isBestSeller: false
            },
            {
                name: "Maroon Velvet Embroidered Kurti",
                slug: "maroon-velvet-embroidered-kurti",
                image: "https://images.unsplash.com/photo-1529139574466-a302d27f60d0?q=80&w=2574&auto=format&fit=crop",
                description: "Premium velvet kurti perfect for winter weddings. Intricate embroidery on the neckline adds a touch of sophistication.",
                price: 2999,
                category: "Kurtis",
                stock: 20,
                images: [
                    "https://images.unsplash.com/photo-1529139574466-a302d27f60d0?q=80&w=2574&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1510443493489-0ae6b5832aa6?q=80&w=2574&auto=format&fit=crop"
                ],
                colors: ["Maroon"],
                sizes: ["S", "M", "L", "XL", "XXL"],
                fabric: "Velvet",
                isBestSeller: true
            }
        ];

        await Product.insertMany(products);
        console.log("Data Imported!");
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
