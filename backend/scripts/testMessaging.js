const { User, Conversation, Message } = require("../models");

async function testMessaging() {
  try {
    console.log("🧪 Test du système de messagerie...");

    // Récupérer deux utilisateurs de test
    const users = await User.findAll({ limit: 2 });
    if (users.length < 2) {
      console.log(
        "⚠️ Il faut au moins 2 utilisateurs pour tester la messagerie"
      );
      return;
    }

    const user1 = users[0];
    const user2 = users[1];

    console.log(
      `👤 Utilisateur 1: ${user1.firstName} ${user1.lastName} (ID: ${user1.id})`
    );
    console.log(
      `👤 Utilisateur 2: ${user2.firstName} ${user2.lastName} (ID: ${user2.id})`
    );

    // Créer une conversation
    const [participant1Id, participant2Id] = [user1.id, user2.id].sort(
      (a, b) => a - b
    );

    let conversation = await Conversation.findOne({
      where: { participant1Id, participant2Id },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participant1Id,
        participant2Id,
      });
      console.log(`💬 Conversation créée (ID: ${conversation.id})`);
    } else {
      console.log(`💬 Conversation existante trouvée (ID: ${conversation.id})`);
    }

    // Créer un message de test
    const message = await Message.create({
      conversationId: conversation.id,
      senderId: user1.id,
      content: "Message de test depuis le script de synchronisation",
      messageType: "text",
    });

    console.log(`📨 Message créé (ID: ${message.id})`);

    // Mettre à jour la conversation
    await conversation.update({
      lastMessageAt: new Date(),
      lastMessagePreview: message.content.substring(0, 100),
    });

    console.log("✅ Test de messagerie réussi !");
  } catch (error) {
    console.error("❌ Erreur lors du test de messagerie:", error);
  }
}

// Lancer le test si demandé
if (process.argv.includes("--test-messaging")) {
  testMessaging();
}
