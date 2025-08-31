const { Badge } = require("../models");

async function seedBadges() {
  try {
    const badges = [
      // Badges pour les vendeurs
      {
        name: "Premier pas vendeur",
        description: "Première vente réalisée avec succès",
        icon: "🎯",
        color: "#10B981",
        criteria: { minSales: 1 },
        rarity: "common",
      },
      {
        name: "Vendeur confirmé",
        description: "10 ventes réussies avec une note moyenne de 4+",
        icon: "⭐",
        color: "#F59E0B",
        criteria: { minSales: 10, minRating: 4.0 },
        rarity: "uncommon",
      },
      {
        name: "Vendeur expert",
        description: "50 ventes avec une excellente réputation (4.5+)",
        icon: "🏆",
        color: "#8B5CF6",
        criteria: { minSales: 50, minRating: 4.5 },
        rarity: "rare",
      },
      {
        name: "Marchand légendaire",
        description: "100+ ventes avec une réputation parfaite (4.8+)",
        icon: "👑",
        color: "#EF4444",
        criteria: { minSales: 100, minRating: 4.8 },
        rarity: "legendary",
      },

      // Badges pour les acheteurs
      {
        name: "Premier achat",
        description: "Premier achat réalisé sur BidHub",
        icon: "🛍️",
        color: "#3B82F6",
        criteria: { minPurchases: 1 },
        rarity: "common",
      },
      {
        name: "Acheteur régulier",
        description: "10 achats avec de bonnes évaluations",
        icon: "💎",
        color: "#06B6D4",
        criteria: { minPurchases: 10, minRating: 4.0 },
        rarity: "uncommon",
      },
      {
        name: "Collectionneur",
        description: "25+ achats dans diverses catégories",
        icon: "🎨",
        color: "#8B5CF6",
        criteria: { minPurchases: 25 },
        rarity: "rare",
      },

      // Badges spéciaux
      {
        name: "Membre fondateur",
        description: "Parmi les premiers utilisateurs de BidHub",
        icon: "🚀",
        color: "#F97316",
        criteria: { accountAge: 30 }, // 30 jours
        rarity: "epic",
      },
      {
        name: "Communicateur",
        description: "Répond rapidement aux messages (< 2h en moyenne)",
        icon: "💬",
        color: "#10B981",
        criteria: { averageResponseTime: 2 },
        rarity: "uncommon",
      },
      {
        name: "Évaluateur",
        description: "A donné au moins 20 avis constructifs",
        icon: "📝",
        color: "#6366F1",
        criteria: { minReviews: 20 },
        rarity: "uncommon",
      },
      {
        name: "Ambassadeur BidHub",
        description: "Membre actif avec excellente réputation globale",
        icon: "🌟",
        color: "#F59E0B",
        criteria: { minReviews: 50, minRating: 4.7, trustLevel: "gold" },
        rarity: "epic",
      },
    ];

    await Badge.bulkCreate(badges, { ignoreDuplicates: true });
    console.log("✅ Badges par défaut créés");
  } catch (error) {
    console.error("Erreur création badges:", error);
  }
}

if (require.main === module) {
  seedBadges().then(() => process.exit());
}

module.exports = seedBadges;
