const { User, Product, Auction, Bid, Payment } = require("../models");
const bcrypt = require("bcryptjs");

const seedDatabase = async () => {
  try {
    console.log("🌱 Début du seeding...");

    // Créer des utilisateurs de test
    const hashedPassword = await bcrypt.hash("123456", 10);

    const users = await User.bulkCreate([
      {
        firstName: "Admin",
        lastName: "BidHub",
        email: "admin@bidhub.tg",
        phone: "+228 90 00 00 00",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      },
      {
        firstName: "Koffi",
        lastName: "Mensah",
        email: "koffi@example.com",
        phone: "+228 90 11 11 11",
        password: hashedPassword,
        role: "seller",
        isVerified: true,
      },
      {
        firstName: "Ama",
        lastName: "Dagbé",
        email: "ama@example.com",
        phone: "+228 90 22 22 22",
        password: hashedPassword,
        role: "user",
        isVerified: true,
      },
    ]);

    // Créer des produits de test
    const products = await Product.bulkCreate([
      {
        title: "iPhone 13 Pro Max",
        description:
          "iPhone 13 Pro Max en excellent état, 256GB, couleur bleu Pacifique",
        category: "Électronique",
        condition: "like_new",
        images: ["iphone-1.jpg"],
        sellerId: users[1].id,
        status: "active",
      },
      {
        title: "Toyota Corolla 2018",
        description:
          "Toyota Corolla 2018, très bon état, 45000 km, climatisation",
        category: "Véhicules",
        condition: "good",
        images: ["toyota-1.jpg"],
        sellerId: users[1].id,
        status: "active",
      },
      {
        title: "Sculpture Ewe traditionnelle",
        description:
          "Magnifique sculpture traditionnelle Ewe, bois sculpté à la main",
        category: "Art et Antiquités",
        condition: "good",
        images: ["sculpture-1.jpg"],
        sellerId: users[1].id,
        status: "active",
      },
    ]);

    // Créer des enchères de test
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const auctions = await Auction.bulkCreate([
      {
        productId: products[0].id,
        startingPrice: 200000,
        currentPrice: 250000,
        reservePrice: 300000,
        startTime: now,
        endTime: tomorrow,
        status: "active",
      },
      {
        productId: products[1].id,
        startingPrice: 1500000,
        currentPrice: 1500000,
        reservePrice: 2000000,
        startTime: now,
        endTime: nextWeek,
        status: "active",
      },
      {
        productId: products[2].id,
        startingPrice: 50000,
        currentPrice: 75000,
        reservePrice: 100000,
        startTime: now,
        endTime: tomorrow,
        status: "active",
      },
    ]);

    // Créer quelques offres de test
    await Bid.bulkCreate([
      {
        auctionId: auctions[0].id,
        bidderId: users[2].id,
        amount: 250000,
      },
      {
        auctionId: auctions[2].id,
        bidderId: users[2].id,
        amount: 75000,
      },
    ]);

    // Créer quelques paiements de test
    await Payment.bulkCreate([
      {
        transactionId: "BH_TEST_001",
        auctionId: auctions[0].id,
        userId: users[2].id,
        amount: 250000,
        provider: "flooz",
        phoneNumber: "22890222222",
        status: "completed",
        fees: 6250,
        completedAt: new Date(),
        metadata: { test: true },
      },
      {
        transactionId: "BH_TEST_002",
        auctionId: auctions[2].id,
        userId: users[2].id,
        amount: 75000,
        provider: "tmoney",
        phoneNumber: "22870111111",
        status: "pending",
        fees: 1500,
        metadata: { test: true },
      },
    ]);

    console.log("✅ Test payments created");

    console.log("✅ Seeding terminé avec succès");
    console.log("📧 Comptes de test créés:");
    console.log("   Admin: admin@bidhub.tg / 123456");
    console.log("   Vendeur: koffi@example.com / 123456");
    console.log("   Acheteur: ama@example.com / 123456");
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit());
}

module.exports = seedDatabase;
