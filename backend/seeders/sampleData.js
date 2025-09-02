// backend/seeders/sampleData.js - Créer des données d'exemple pour le développement
const { User, Product, Auction, Bid } = require("../models");
const bcrypt = require("bcryptjs");

const sampleUsers = [
  {
    firstName: "Kofi",
    lastName: "Mensah",
    email: "kofi.mensah@email.com",
    password: "password123",
    phone: "+228 90 11 22 33",
    role: "seller",
    isVerified: true,
    avatar: "/images/users/kofi.jpg",
  },
  {
    firstName: "Afia",
    lastName: "Asante",
    email: "afia.asante@email.com",
    password: "password123",
    phone: "+228 90 44 55 66",
    role: "seller",
    isVerified: true,
    avatar: "/images/users/afia.jpg",
  },
  {
    firstName: "Emmanuel",
    lastName: "Koffi",
    email: "emmanuel.koffi@email.com",
    password: "password123",
    phone: "+228 90 77 88 99",
    role: "buyer",
    isVerified: true,
    avatar: "/images/users/emmanuel.jpg",
  },
  {
    firstName: "Esi",
    lastName: "Adjorlolo",
    email: "esi.adjorlolo@email.com",
    password: "password123",
    phone: "+228 90 12 34 56",
    role: "buyer",
    isVerified: true,
    avatar: "/images/users/esi.jpg",
  },
];

const sampleProducts = [
  {
    title: "iPhone 13 Pro Max 256GB",
    description:
      "iPhone 13 Pro Max en excellent état, couleur bleu Pacifique. Acheté il y a 8 mois, très peu utilisé. Vendu avec boîte, chargeur et écouteurs d'origine. Aucun défaut visible.",
    category: "Électronique",
    condition: "like_new",
    images: [
      "/images/products/iphone13.jpg",
      "/images/products/iphone13-2.jpg",
    ],
  },
  {
    title: "Sculpture en bronze - Art traditionnel togolais",
    description:
      "Magnifique sculpture en bronze représentant un guerrier traditionnel togolais. Pièce unique réalisée par un artisan local de Kpalimé. Hauteur 45cm, parfait état de conservation.",
    category: "Art et Antiquités",
    condition: "good",
    images: ["/images/products/sculpture.jpg"],
  },
  {
    title: "MacBook Air M2 2022",
    description:
      "MacBook Air M2 13 pouces, 512GB SSD, 16GB RAM. Couleur gris sidéral. Utilisé pour le travail, très bien entretenu. Vendu avec housse de protection et chargeur MagSafe.",
    category: "Électronique",
    condition: "good",
    images: ["/images/products/macbook.jpg", "/images/products/macbook-2.jpg"],
  },
  {
    title: "Montre Rolex Submariner (vintage 1985)",
    description:
      "Authentique Rolex Submariner de 1985 en acier inoxydable. Mouvement automatique, bracelet Oyster. Révisée récemment, fonctionne parfaitement. Pièce de collection rare.",
    category: "Bijoux et Montres",
    condition: "good",
    images: ["/images/products/rolex.jpg"],
  },
  {
    title: "Tableau peinture à l'huile - Paysage du Mont Agou",
    description:
      "Superbe peinture à l'huile sur toile représentant le Mont Agou au coucher du soleil. Œuvre originale d'un artiste togolais reconnu. Dimensions 80x60cm, encadrée.",
    category: "Art et Antiquités",
    condition: "new",
    images: ["/images/products/tableau.jpg"],
  },
  {
    title: "Guitare acoustique Yamaha FG830",
    description:
      "Guitare acoustique Yamaha FG830 en excellent état. Très peu utilisée, idéale pour débuter ou pour musicien confirmé. Vendue avec housse de transport et médiators.",
    category: "Instruments de Musique",
    condition: "like_new",
    images: ["/images/products/guitare.jpg"],
  },
];

const createSampleData = async () => {
  try {
    console.log("🌱 Création des données d'exemple...");

    // Créer les utilisateurs
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: hashedPassword,
          lastLogin: new Date(),
        },
      });

      createdUsers.push(user);
    }

    console.log(`✅ ${createdUsers.length} utilisateurs créés`);

    // Créer les produits et enchères
    const createdAuctions = [];
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const seller = createdUsers[i % 2]; // Alterner entre les 2 premiers utilisateurs (vendeurs)

      // Créer le produit
      const product = await Product.create({
        ...productData,
        sellerId: seller.id,
      });

      // Créer l'enchère
      const startingPrice = Math.floor(Math.random() * 100000) + 10000; // Entre 10k et 110k FCFA
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + Math.floor(Math.random() * 7) + 1); // Entre 1 et 7 jours

      const auction = await Auction.create({
        productId: product.id,
        startingPrice: startingPrice,
        currentPrice: startingPrice,
        reservePrice: startingPrice * 1.5,
        startTime: new Date(),
        endTime: endTime,
        status: "active",
        views: Math.floor(Math.random() * 100) + 10, // Entre 10 et 110 vues
      });

      // Créer quelques enchères sur certains produits
      if (Math.random() > 0.3) {
        // 70% de chance d'avoir des enchères
        const numBids = Math.floor(Math.random() * 5) + 1; // 1 à 5 enchères
        let currentPrice = startingPrice;

        for (let j = 0; j < numBids; j++) {
          const bidder = createdUsers[2 + (j % 2)]; // Utiliser les acheteurs
          const bidAmount =
            currentPrice + Math.floor(Math.random() * 5000) + 1000; // +1k à 6k FCFA

          await Bid.create({
            auctionId: auction.id,
            bidderId: bidder.id,
            amount: bidAmount,
            createdAt: new Date(Date.now() - (numBids - j) * 60 * 60 * 1000), // Échelonner dans le temps
          });

          currentPrice = bidAmount;
        }

        // Mettre à jour le prix courant de l'enchère
        await auction.update({ currentPrice });
      }

      createdAuctions.push(auction);
    }

    console.log(`✅ ${createdAuctions.length} produits et enchères créés`);

    // Créer quelques enchères terminées pour les statistiques
    for (let i = 0; i < 3; i++) {
      const seller = createdUsers[0];

      const product = await Product.create({
        title: `Produit vendu ${i + 1}`,
        description: "Produit déjà vendu avec succès",
        category: "Autres",
        condition: "good",
        images: ["/images/products/sold.jpg"],
        sellerId: seller.id,
      });

      const finalPrice = Math.floor(Math.random() * 50000) + 20000;

      const auction = await Auction.create({
        productId: product.id,
        startingPrice: 15000,
        currentPrice: finalPrice,
        reservePrice: 20000,
        startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
        status: "ended",
        views: Math.floor(Math.random() * 200) + 50,
      });

      // Créer l'enchère gagnante
      await Bid.create({
        auctionId: auction.id,
        bidderId: createdUsers[2].id,
        amount: finalPrice,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });
    }

    console.log("✅ 3 enchères terminées créées pour les statistiques");
    console.log("🎉 Données d'exemple créées avec succès !");

    return {
      users: createdUsers.length,
      auctions: createdAuctions.length + 3,
      message: "Données d'exemple créées avec succès",
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création des données d'exemple:",
      error
    );
    throw error;
  }
};

// Script d'exécution directe
if (require.main === module) {
  const { sequelize } = require("../models");

  const runSeeder = async () => {
    try {
      await sequelize.authenticate();
      await createSampleData();
      process.exit(0);
    } catch (error) {
      console.error("❌ Erreur:", error);
      process.exit(1);
    }
  };

  runSeeder();
}

module.exports = createSampleData;
