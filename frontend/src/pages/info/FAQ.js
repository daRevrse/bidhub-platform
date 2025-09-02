// frontend/src/pages/info/FAQ.js - Questions fréquemment posées
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  HandRaisedIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const FAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [openQuestions, setOpenQuestions] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      id: "general",
      name: "Général",
      icon: QuestionMarkCircleIcon,
      color: "blue",
    },
    {
      id: "account",
      name: "Compte",
      icon: UserGroupIcon,
      color: "green",
    },
    {
      id: "auctions",
      name: "Enchères",
      icon: HandRaisedIcon,
      color: "purple",
    },
    {
      id: "payments",
      name: "Paiements",
      icon: CreditCardIcon,
      color: "yellow",
    },
    {
      id: "delivery",
      name: "Livraison",
      icon: TruckIcon,
      color: "orange",
    },
    {
      id: "security",
      name: "Sécurité",
      icon: ShieldCheckIcon,
      color: "red",
    },
    {
      id: "problems",
      name: "Problèmes",
      icon: ExclamationTriangleIcon,
      color: "gray",
    },
  ];

  const faqData = {
    general: [
      {
        question: "Qu'est-ce que BidHub ?",
        answer:
          "BidHub est la première plateforme d'enchères en ligne au Togo, développée par GCSGC Agency. Nous connectons acheteurs et vendeurs dans un environnement sécurisé pour acheter et vendre des objets via un système d'enchères en temps réel.",
      },
      {
        question: "Comment fonctionne BidHub ?",
        answer:
          "Les vendeurs mettent leurs objets aux enchères avec un prix de départ et une durée. Les acheteurs placent des offres, et celui qui propose le prix le plus élevé à la fin remporte l'objet. Tout se passe en temps réel avec des notifications instantanées.",
      },
      {
        question: "BidHub est-il gratuit ?",
        answer:
          "L'inscription et la participation aux enchères sont entièrement gratuites pour les acheteurs. Les vendeurs paient une commission de 5% uniquement sur les ventes réussies. Aucun frais d'inscription ni frais cachés.",
      },
      {
        question: "Dans quelles villes BidHub est-il disponible ?",
        answer:
          "BidHub couvre tout le Togo, avec une présence forte à Lomé, Kara, Sokodé, Kpalimé, Atakpamé et dans toutes les autres villes. Nous proposons différentes options de livraison selon votre localisation.",
      },
    ],
    account: [
      {
        question: "Comment créer un compte ?",
        answer:
          "Cliquez sur 'S'inscrire', renseignez votre email, nom, et créez un mot de passe sécurisé. Vous recevrez un email de confirmation. L'inscription prend moins de 2 minutes et est totalement gratuite.",
      },
      {
        question: "Comment devenir vendeur ?",
        answer:
          "Après inscription, allez dans votre profil et activez le statut 'Vendeur'. Vous devrez fournir une pièce d'identité pour vérification. Une fois validé, vous pourrez créer vos premières annonces.",
      },
      {
        question: "J'ai oublié mon mot de passe, que faire ?",
        answer:
          "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Saisissez votre email, et vous recevrez un lien pour créer un nouveau mot de passe. Le lien est valide 24 heures.",
      },
      {
        question: "Comment modifier mes informations personnelles ?",
        answer:
          "Connectez-vous à votre compte, allez dans 'Mon Profil' puis 'Modifier'. Vous pouvez changer votre nom, email, téléphone, adresse et photo de profil. Certaines modifications nécessitent une vérification.",
      },
      {
        question: "Comment supprimer mon compte ?",
        answer:
          "Dans les paramètres de votre compte, section 'Confidentialité', cliquez sur 'Supprimer mon compte'. Attention : cette action est définitive et supprimera toutes vos données et historique d'enchères.",
      },
    ],
    auctions: [
      {
        question: "Comment participer à une enchère ?",
        answer:
          "Trouvez une enchère qui vous intéresse, cliquez dessus pour voir les détails. Placez votre offre en saisissant un montant supérieur à l'enchère actuelle. Vous recevrez des notifications si vous êtes surenchéri.",
      },
      {
        question: "Puis-je annuler mon enchère ?",
        answer:
          "Les enchères sont généralement irrévocables pour garantir l'équité. Cependant, contactez-nous immédiatement en cas d'erreur de frappe ou de problème technique. Chaque cas est étudié individuellement.",
      },
      {
        question: "Comment savoir si j'ai gagné une enchère ?",
        answer:
          "Vous recevez immédiatement une notification push, un email et un SMS (si activé) dès que l'enchère se termine. Vous avez ensuite 24h pour procéder au paiement.",
      },
      {
        question: "Que se passe-t-il si personne n'enchérit ?",
        answer:
          "Si aucune offre n'est placée ou si le prix de réserve n'est pas atteint, l'objet n'est pas vendu. Le vendeur peut relancer une nouvelle enchère ou ajuster ses prix.",
      },
      {
        question: "Comment fixer le prix de départ d'une enchère ?",
        answer:
          "Commencez par un prix attractif mais pas trop bas. Un prix de départ à 60-70% de la valeur estimée attire plus d'enchérisseurs. Vous pouvez fixer un prix de réserve secret plus élevé.",
      },
    ],
    payments: [
      {
        question: "Quels modes de paiement acceptez-vous ?",
        answer:
          "Nous acceptons les cartes Visa/Mastercard, les virements bancaires, MTN Mobile Money, Moov Money et T-Money. Tous les paiements sont sécurisés et cryptés.",
      },
      {
        question: "Quand dois-je payer après avoir gagné ?",
        answer:
          "Vous avez 24 heures pour effectuer le paiement après la fin de l'enchère. Un rappel automatique est envoyé après 12h. Le non-paiement peut entraîner une suspension temporaire.",
      },
      {
        question: "Les frais de transaction sont-ils inclus ?",
        answer:
          "Pour les acheteurs, aucun frais supplémentaire. Le prix affiché est le prix final. Les frais de livraison sont mentionnés séparément. Les vendeurs paient 5% de commission sur les ventes.",
      },
      {
        question: "Comment récupérer mon argent en cas de problème ?",
        answer:
          "Nous avons une garantie acheteur. Si l'objet n'est pas conforme ou n'arrive pas, contactez-nous sous 48h. Après enquête, nous procédons au remboursement intégral sous 3-7 jours.",
      },
      {
        question: "Quand les vendeurs reçoivent-ils leur argent ?",
        answer:
          "Les vendeurs reçoivent leur paiement (moins la commission) dans les 2-5 jours après confirmation de livraison par l'acheteur, ou automatiquement après 7 jours.",
      },
    ],
    delivery: [
      {
        question: "Quelles sont les options de livraison ?",
        answer:
          "Retrait en main propre (gratuit), livraison à domicile dans Lomé (2000-5000 FCFA), livraison nationale (5000-15000 FCFA selon la distance), ou point relais dans les grandes villes.",
      },
      {
        question: "Combien de temps prend la livraison ?",
        answer:
          "Retrait immédiat, livraison Lomé sous 24-48h, livraison nationale 2-5 jours ouvrables selon la destination. Les vendeurs ont 2 jours pour expédier après paiement confirmé.",
      },
      {
        question: "Comment suivre ma commande ?",
        answer:
          "Vous recevez un numéro de suivi par email/SMS dès l'expédition. Suivez votre colis en temps réel dans votre compte BidHub section 'Mes achats' ou sur le site du transporteur.",
      },
      {
        question: "Que faire si mon colis est endommagé ?",
        answer:
          "Photographiez immédiatement les dégâts et contactez-nous sous 24h. Ne signez pas la réception si le colis est visiblement endommagé. Nous gérons le litige avec le transporteur et vous remboursons si nécessaire.",
      },
      {
        question: "Puis-je changer l'adresse de livraison ?",
        answer:
          "Oui, tant que le vendeur n'a pas encore expédié l'objet. Contactez-nous rapidement après l'achat pour modifier l'adresse. Une fois l'expédition confirmée, les changements ne sont plus possibles.",
      },
    ],
    security: [
      {
        question: "Mes données personnelles sont-elles protégées ?",
        answer:
          "Absolument. Nous utilisons un cryptage SSL, des serveurs sécurisés et respectons la réglementation togolaise sur la protection des données. Consultez notre Politique de Confidentialité pour tous les détails.",
      },
      {
        question: "Comment vérifiez-vous l'identité des vendeurs ?",
        answer:
          "Tous les vendeurs doivent fournir une pièce d'identité valide, un justificatif de domicile récent et parfois des références bancaires. Notre équipe vérifie chaque document avant validation du statut vendeur.",
      },
      {
        question: "Que faire si je suspecte une fraude ?",
        answer:
          "Contactez immédiatement notre équipe à fraude@bidhub.tg avec tous les détails. Nous enquêtons sous 24h, suspendons les comptes suspects et collaborons avec les autorités si nécessaire.",
      },
      {
        question: "Comment signaler un utilisateur suspect ?",
        answer:
          "Sur le profil ou l'annonce concernée, cliquez sur 'Signaler'. Décrivez le problème précisément. Notre équipe de modération examine chaque signalement et prend les mesures appropriées.",
      },
      {
        question: "BidHub stocke-t-il mes informations bancaires ?",
        answer:
          "Non, nous ne stockons jamais vos données bancaires complètes. Nous utilisons des processeurs de paiement certifiés PCI-DSS qui cryptent et sécurisent toutes les informations de paiement.",
      },
    ],
    problems: [
      {
        question: "Le site est lent ou ne fonctionne pas, que faire ?",
        answer:
          "Vérifiez votre connexion internet, videz le cache de votre navigateur (Ctrl+F5), ou essayez un autre navigateur. Si le problème persiste, contactez-nous avec vos détails techniques.",
      },
      {
        question: "Je n'arrive pas à me connecter à mon compte",
        answer:
          "Vérifiez que votre email et mot de passe sont corrects. Essayez la récupération de mot de passe. Si votre compte est suspendu, vous recevrez un message d'erreur spécifique avec les raisons.",
      },
      {
        question: "Mes notifications ne fonctionnent pas",
        answer:
          "Vérifiez vos paramètres de notification dans votre profil. Autorisez les notifications push dans votre navigateur. Vérifiez aussi vos spams pour les emails. Contactez-nous si le problème persiste.",
      },
      {
        question: "Un vendeur ne répond pas à mes messages",
        answer:
          "Les vendeurs ont 24h pour répondre aux messages. Après ce délai, vous pouvez nous signaler le problème. Nous contactons le vendeur et prenons des mesures si nécessaire.",
      },
      {
        question: "Comment contacter le service client ?",
        answer:
          "Email : support@bidhub.tg (réponse sous 12h), téléphone : +228 90 12 34 56 (9h-18h), WhatsApp, ou formulaire de contact sur le site. Nous sommes là 7j/7 pour vous aider.",
      },
    ],
  };

  const toggleQuestion = (questionId) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(questionId)) {
      newOpenQuestions.delete(questionId);
    } else {
      newOpenQuestions.add(questionId);
    }
    setOpenQuestions(newOpenQuestions);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      red: "bg-red-50 text-red-700 border-red-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[color] || colors.blue;
  };

  const getIconColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      gray: "bg-gray-100 text-gray-600",
    };
    return colors[color] || colors.blue;
  };

  // Filtrer les questions selon la recherche
  const filteredQuestions = searchTerm
    ? Object.values(faqData)
        .flat()
        .filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : faqData[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Questions fréquentes
            </h1>

            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Trouvez rapidement les réponses à vos questions les plus courantes
              sur BidHub
            </p>

            {/* Barre de recherche */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher dans la FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pl-14 pr-4 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300/50 text-lg shadow-xl"
                />
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation par catégories */}
      {!searchTerm && (
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? getColorClasses(category.color)
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  <category.icon className="w-5 h-5 mr-2" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Questions et réponses */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Titre de section */}
          {searchTerm ? (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Résultats de recherche pour "{searchTerm}"
              </h2>
              <p className="text-gray-600">
                {filteredQuestions.length} résultat
                {filteredQuestions.length !== 1 ? "s" : ""} trouvé
                {filteredQuestions.length !== 1 ? "s" : ""}
              </p>
            </div>
          ) : (
            <div className="text-center mb-8">
              {categories.find((cat) => cat.id === selectedCategory) && (
                <>
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${getIconColorClasses(
                      categories.find((cat) => cat.id === selectedCategory)
                        .color
                    )}`}
                  >
                    {React.createElement(
                      categories.find((cat) => cat.id === selectedCategory)
                        .icon,
                      {
                        className: "w-6 h-6",
                      }
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {categories.find((cat) => cat.id === selectedCategory).name}
                  </h2>
                  <p className="text-gray-600">
                    {filteredQuestions.length} question
                    {filteredQuestions.length !== 1 ? "s" : ""}
                    {filteredQuestions.length !== 1
                      ? " disponibles"
                      : " disponible"}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Liste des questions */}
          {filteredQuestions.length > 0 ? (
            <div className="space-y-4">
              {filteredQuestions.map((faq, index) => {
                const questionId = `${selectedCategory}-${index}`;
                const isOpen = openQuestions.has(questionId);

                return (
                  <div
                    key={questionId}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleQuestion(questionId)}
                      className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      <div
                        className={`transform transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-8 pb-6 border-t border-gray-100 bg-gray-50">
                        <div className="pt-6">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <QuestionMarkCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-500">
                Essayez avec d'autres mots-clés ou consultez une autre
                catégorie.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section contact */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-xl text-gray-600">
              Notre équipe support est là pour vous aider 24h/7j
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link
              to="/contact"
              className="group p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Formulaire de contact
              </h3>
              <p className="text-gray-600 mb-4">
                Décrivez votre question en détail et recevez une réponse
                personnalisée
              </p>
              <p className="text-sm text-blue-600 font-medium">
                Réponse sous 12h →
              </p>
            </Link>

            <a
              href="mailto:support@bidhub.tg"
              className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Email support
              </h3>
              <p className="text-gray-600 mb-4">
                Envoyez-nous directement un email avec votre question
              </p>
              <p className="text-sm text-green-600 font-medium">
                support@bidhub.tg →
              </p>
            </a>

            <a
              href="https://wa.me/22890123456"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                WhatsApp
              </h3>
              <p className="text-gray-600 mb-4">
                Chat direct avec notre équipe pour une réponse immédiate
              </p>
              <p className="text-sm text-purple-600 font-medium">
                +228 90 12 34 56 →
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Section GCSGC Agency */}
      <section className="py-20 bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-yellow-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl mb-6">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Support technique par{" "}
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  GCSGC Agency
                </span>
              </h2>

              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Notre FAQ est maintenue par l'équipe technique de GCSGC Agency.
                Si vous avez des questions techniques spécifiques sur
                l'utilisation de BidHub, n'hésitez pas à nous contacter
                directement.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://darevrse.github.io/site-gcsgc-agency/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-2xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-xl transform hover:scale-105"
                >
                  <GlobeAltIcon className="w-5 h-5 mr-2" />
                  Découvrir GCSGC Agency
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 border-2 border-yellow-500 text-yellow-600 font-bold rounded-2xl hover:bg-yellow-500 hover:text-white transition-all duration-300"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                  Support technique
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ressources additionnelles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ressources utiles
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez d'autres pages pour mieux comprendre BidHub
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/how-it-works"
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-blue-300 transition-all duration-300"
            >
              <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Comment ça marche
              </h3>
              <p className="text-sm text-gray-600">
                Guide complet pour utiliser BidHub
              </p>
            </Link>

            <Link
              to="/terms"
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-green-300 transition-all duration-300"
            >
              <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Conditions d'usage
              </h3>
              <p className="text-sm text-gray-600">
                Règles et conditions d'utilisation
              </p>
            </Link>

            <Link
              to="/privacy"
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-purple-300 transition-all duration-300"
            >
              <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Confidentialité
              </h3>
              <p className="text-sm text-gray-600">
                Protection de vos données personnelles
              </p>
            </Link>

            <Link
              to="/about"
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-orange-300 transition-all duration-300"
            >
              <div className="bg-orange-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GlobeAltIcon className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">À propos</h3>
              <p className="text-sm text-gray-600">
                Notre histoire et notre mission
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
