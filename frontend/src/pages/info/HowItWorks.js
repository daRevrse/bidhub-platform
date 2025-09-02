// frontend/src/pages/info/HowItWorks.js - Page Comment ça marche
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  HandRaisedIcon,
  TrophyIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  BellIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import { FireIcon, SparklesIcon } from "@heroicons/react/24/solid";

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedFAQ, setSelectedFAQ] = useState(null);

  const steps = [
    {
      id: 1,
      title: "Créez votre compte",
      description:
        "Inscrivez-vous gratuitement en quelques minutes avec votre email.",
      icon: UserPlusIcon,
      color: "from-blue-500 to-cyan-600",
      details: [
        "Inscription gratuite et rapide",
        "Vérification de votre identité",
        "Configuration de votre profil",
        "Choix de vos préférences",
      ],
      duration: "2-3 minutes",
    },
    {
      id: 2,
      title: "Explorez les enchères",
      description:
        "Découvrez des milliers d'enchères dans toutes les catégories.",
      icon: MagnifyingGlassIcon,
      color: "from-purple-500 to-pink-600",
      details: [
        "Navigation par catégories",
        "Filtres avancés de recherche",
        "Alertes personnalisées",
        "Suivi des enchères favorites",
      ],
      duration: "Illimité",
    },
    {
      id: 3,
      title: "Placez vos enchères",
      description:
        "Participez aux enchères qui vous intéressent en temps réel.",
      icon: HandRaisedIcon,
      color: "from-green-500 to-emerald-600",
      details: [
        "Enchères en temps réel",
        "Notifications instantanées",
        "Auto-enchères disponibles",
        "Historique des offres",
      ],
      duration: "Temps réel",
    },
    {
      id: 4,
      title: "Remportez et payez",
      description:
        "Finalisez vos achats avec nos méthodes de paiement sécurisées.",
      icon: TrophyIcon,
      color: "from-yellow-500 to-orange-600",
      details: [
        "Paiement sécurisé",
        "Multiple méthodes disponibles",
        "Confirmation automatique",
        "Suivi de commande",
      ],
      duration: "24h max",
    },
  ];

  const sellerSteps = [
    {
      icon: UserPlusIcon,
      title: "Devenez vendeur",
      description: "Activez votre statut vendeur et validez votre identité",
    },
    {
      icon: CreditCardIcon,
      title: "Ajoutez vos produits",
      description: "Créez vos annonces avec photos et descriptions détaillées",
    },
    {
      icon: ClockIcon,
      title: "Configurez vos enchères",
      description: "Définissez prix de départ, durée et conditions de vente",
    },
    {
      icon: CheckCircleIcon,
      title: "Recevez vos paiements",
      description:
        "Vos gains sont transférés automatiquement après chaque vente",
    },
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Sécurité garantie",
      description:
        "Transactions protégées et vérification d'identité obligatoire",
      color: "text-green-600",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Communication directe",
      description: "Échangez avec vendeurs et acheteurs via notre messagerie",
      color: "text-blue-600",
    },
    {
      icon: StarIcon,
      title: "Système de réputation",
      description: "Consultez les évaluations et construisez votre réputation",
      color: "text-yellow-600",
    },
    {
      icon: BellIcon,
      title: "Notifications intelligentes",
      description: "Restez informé des enchères importantes en temps réel",
      color: "text-purple-600",
    },
    {
      icon: HeartIcon,
      title: "Favoris et alertes",
      description: "Sauvegardez vos enchères préférées et recevez des alertes",
      color: "text-red-600",
    },
    {
      icon: GiftIcon,
      title: "Offres spéciales",
      description:
        "Profitez d'événements exclusifs et de promotions régulières",
      color: "text-indigo-600",
    },
  ];

  const faqs = [
    {
      question: "Comment fonctionne le système d'enchères ?",
      answer:
        "Les enchères fonctionnent de manière ascendante. Vous placez une offre supérieure à l'enchère actuelle. L'utilisateur avec l'offre la plus élevée à la fin de l'enchère remporte l'objet. Vous recevez des notifications en temps réel pour suivre les enchères.",
    },
    {
      question: "Quels sont les frais sur BidHub ?",
      answer:
        "L'inscription et la participation aux enchères sont gratuites pour les acheteurs. Les vendeurs paient une commission de 5% uniquement sur les ventes réussies. Aucun frais d'inscription ni frais cachés.",
    },
    {
      question: "Comment puis-je être sûr de la qualité des produits ?",
      answer:
        "Tous les vendeurs sont vérifiés et notés par la communauté. Chaque produit est accompagné de photos détaillées et d'une description complète. Notre système de garantie protège vos achats.",
    },
    {
      question: "Que se passe-t-il si je remporte une enchère ?",
      answer:
        "Vous recevez immédiatement une notification et un email de confirmation. Vous avez 24h pour effectuer le paiement. Une fois le paiement validé, le vendeur dispose de 2-5 jours pour expédier l'article selon le mode de livraison choisi.",
    },
    {
      question: "Comment sont gérées les livraisons ?",
      answer:
        "BidHub propose plusieurs options : retrait en main propre, livraison à domicile ou en point relais. Les frais de livraison sont clairement indiqués avant l'achat. Nous travaillons avec des transporteurs fiables au Togo.",
    },
    {
      question: "Puis-je annuler mon enchère ?",
      answer:
        "Les enchères sont généralement irrévocables pour garantir l'équité. Cependant, vous pouvez nous contacter dans des cas exceptionnels (erreur de frappe, problème technique). Notre équipe évaluera chaque situation au cas par cas.",
    },
  ];

  const testimonials = [
    {
      name: "Afia Kouakou",
      role: "Collectionneuse",
      avatar: "/images/user1.jpg",
      quote:
        "J'ai trouvé des pièces rares pour ma collection. Le processus est transparent et sécurisé !",
      rating: 5,
      location: "Lomé",
    },
    {
      name: "Koffi Mensah",
      role: "Vendeur",
      avatar: "/images/user2.jpg",
      quote:
        "BidHub m'a permis de développer mon activité. Interface simple et paiements rapides.",
      rating: 5,
      location: "Kara",
    },
    {
      name: "Esi Adjorlolo",
      role: "Acheteuse régulière",
      avatar: "/images/user3.jpg",
      quote:
        "Service client excellent et livraisons toujours à temps. Je recommande vivement !",
      rating: 5,
      location: "Sokodé",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Guide complet d'utilisation
              <SparklesIcon className="w-4 h-4 ml-2" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Comment ça{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                marche
              </span>{" "}
              ?
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-blue-100">
              Découvrez comment participer aux enchères sur BidHub en 4 étapes
              simples. Rejoignez des milliers d'utilisateurs qui font déjà
              confiance à notre plateforme.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/register"
                className="group px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 font-bold rounded-2xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 shadow-2xl transform hover:scale-105"
              >
                <span className="flex items-center">
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Commencer maintenant
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button className="group px-8 py-4 border-2 border-white/30 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-xl transform hover:scale-105">
                <span className="flex items-center">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Voir la vidéo démo
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comment participer aux enchères */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Participer aux{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                enchères
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Suivez ces 4 étapes simples pour commencer à enchérir et remporter
              vos objets préférés
            </p>
          </div>

          {/* Étapes principales */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Navigation des étapes */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    activeStep === step.id
                      ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${step.color} flex-shrink-0`}
                    >
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-bold text-gray-500 mr-3">
                          ÉTAPE {step.id}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          {step.duration}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      <ul className="space-y-1">
                        {step.details.map((detail, i) => (
                          <li
                            key={i}
                            className="flex items-center text-sm text-gray-500"
                          >
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Illustration de l'étape active */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center">
                <div
                  className={`inline-flex p-6 rounded-full bg-gradient-to-r ${
                    steps[activeStep - 1]?.color
                  } mb-6`}
                >
                  {React.createElement(steps[activeStep - 1]?.icon, {
                    className: "w-12 h-12 text-white",
                  })}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {steps[activeStep - 1]?.title}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {steps[activeStep - 1]?.description}
                </p>

                {/* Exemple visuel selon l'étape */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div className="text-left">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-500">
                          votre.email@exemple.com
                        </div>
                      </div>
                      <div className="text-left">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet
                        </label>
                        <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-500">
                          Votre nom complet
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-gray-500">
                          Rechercher des enchères...
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {["Art", "Électronique", "Mode"].map((cat) => (
                          <div
                            key={cat}
                            className="bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium"
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-300 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Enchère actuelle
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            15,000 FCFA
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="Votre offre"
                          />
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                            Enchérir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 4 && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="font-medium text-green-800">
                            Félicitations !
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          Vous avez remporté cette enchère
                        </p>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
                        Procéder au paiement
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment vendre */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Comment{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                vendre
              </span>{" "}
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transformez vos objets en revenus en suivant ces étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sellerSteps.map((step, index) => (
              <div
                key={index}
                className="group text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100"
              >
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full mb-3">
                    ÉTAPE {index + 1}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl transform hover:scale-105"
            >
              Devenir vendeur
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Fonctionnalités clés */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fonctionnalités{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                avancées
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des outils puissants pour optimiser votre expérience d'achat et de
              vente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gray-100 mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Questions{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                fréquentes
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Trouvez rapidement les réponses à vos questions les plus courantes
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <button
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  onClick={() =>
                    setSelectedFAQ(selectedFAQ === index ? null : index)
                  }
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div
                    className={`transform transition-transform duration-200 ${
                      selectedFAQ === index ? "rotate-45" : ""
                    }`}
                  >
                    <div className="w-6 h-6 relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-0.5 bg-gray-600"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-600"></div>
                    </div>
                  </div>
                </button>
                {selectedFAQ === index && (
                  <div className="px-8 pb-6 text-gray-600 leading-relaxed animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Témoignages{" "}
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                utilisateurs
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez ce que pensent nos utilisateurs de BidHub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>

                <blockquote className="text-gray-700 mb-6 leading-relaxed italic text-lg">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonial.role} • {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Prêt à commencer{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              l'aventure
            </span>{" "}
            ?
          </h2>

          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-blue-100">
            Rejoignez des milliers d'utilisateurs satisfaits et découvrez le
            plaisir des enchères en ligne au Togo !
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/register"
              className="group px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 font-bold rounded-2xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 shadow-2xl transform hover:scale-105"
            >
              <span className="flex items-center text-lg">
                <FireIcon className="w-6 h-6 mr-2" />
                Créer mon compte gratuitement
                <ArrowRightIcon className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              to="/auctions"
              className="group px-10 py-5 border-2 border-white/30 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center text-lg">
                <EyeIcon className="w-6 h-6 mr-2" />
                Explorer les enchères
              </span>
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-sm text-blue-200">
              Vous avez encore des questions ? Notre équipe support est
              disponible 24h/7j pour vous aider.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
