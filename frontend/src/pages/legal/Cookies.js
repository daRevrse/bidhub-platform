// frontend/src/pages/legal/Cookies.js - Politique des cookies
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CogIcon,
  EyeIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const Cookies = () => {
  const lastUpdated = "15 janvier 2025";
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, cannot be disabled
    performance: true,
    functional: true,
    advertising: false,
  });

  const cookieTypes = [
    {
      id: "essential",
      name: "Cookies essentiels",
      icon: ShieldCheckIcon,
      color: "green",
      required: true,
      description:
        "Ces cookies sont nécessaires au fonctionnement de BidHub et ne peuvent pas être désactivés.",
      examples: [
        "Session utilisateur et authentification",
        "Panier d'enchères et préférences de navigation",
        "Sécurité et prévention de la fraude",
        "Fonctionnement des formulaires",
      ],
      retention: "Session ou jusqu'à 1 an",
      providers: ["BidHub (1ère partie)"],
    },
    {
      id: "performance",
      name: "Cookies de performance",
      icon: ChartBarIcon,
      color: "blue",
      required: false,
      description:
        "Ces cookies nous aident à comprendre comment vous utilisez BidHub pour améliorer nos services.",
      examples: [
        "Analyse du trafic et des pages visitées",
        "Mesure des performances du site",
        "Statistiques d'utilisation anonymisées",
        "Détection des erreurs techniques",
      ],
      retention: "Jusqu'à 24 mois",
      providers: ["Google Analytics", "BidHub Analytics"],
    },
    {
      id: "functional",
      name: "Cookies fonctionnels",
      icon: CogIcon,
      color: "purple",
      required: false,
      description:
        "Ces cookies permettent de personnaliser votre expérience et de mémoriser vos préférences.",
      examples: [
        "Préférences de langue et devise",
        "Filtres de recherche mémorisés",
        "Alertes et notifications personnalisées",
        "Interface utilisateur adaptée",
      ],
      retention: "Jusqu'à 12 mois",
      providers: ["BidHub (1ère partie)"],
    },
    {
      id: "advertising",
      name: "Cookies publicitaires",
      icon: MegaphoneIcon,
      color: "orange",
      required: false,
      description:
        "Ces cookies permettent d'afficher des publicités pertinentes selon vos centres d'intérêt.",
      examples: [
        "Publicités ciblées selon vos enchères",
        "Retargeting sur d'autres sites web",
        "Mesure de l'efficacité publicitaire",
        "Partenariats avec des réseaux publicitaires",
      ],
      retention: "Jusqu'à 12 mois",
      providers: ["Google Ads", "Facebook Pixel", "Partenaires publicitaires"],
    },
  ];

  const handlePreferenceChange = (cookieType, value) => {
    if (cookieType === "essential") return; // Cannot disable essential cookies

    setCookiePreferences((prev) => ({
      ...prev,
      [cookieType]: value,
    }));
  };

  const handleAcceptAll = () => {
    setCookiePreferences({
      essential: true,
      performance: true,
      functional: true,
      advertising: true,
    });
  };

  const handleRejectAll = () => {
    setCookiePreferences({
      essential: true, // Cannot be disabled
      performance: false,
      functional: false,
      advertising: false,
    });
  };

  const handleSavePreferences = () => {
    // Simulate saving preferences
    alert("Vos préférences de cookies ont été enregistrées !");
  };

  const getColorClasses = (color) => {
    const colors = {
      green: "bg-green-50 text-green-700 border-green-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return colors[color] || colors.blue;
  };

  const getIconColorClasses = (color) => {
    const colors = {
      green: "bg-green-100 text-green-600",
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <CogIcon className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Politique des cookies
            </h1>

            <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
              Découvrez comment BidHub utilise les cookies et gérez vos
              préférences
            </p>

            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              Dernière mise à jour : {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      {/* Gestionnaire de préférences */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Gérez vos préférences de cookies
                </h2>
                <p className="text-sm text-gray-600">
                  Personnalisez votre expérience en choisissant les cookies que
                  vous acceptez
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors text-sm"
                >
                  Tout refuser
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Tout accepter
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors text-sm"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Introduction */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Qu'est-ce qu'un cookie ?
            </h2>
            <div className="prose prose-lg text-gray-600">
              <p>
                Un cookie est un petit fichier texte stocké sur votre appareil
                (ordinateur, smartphone, tablette) lorsque vous visitez BidHub.
                Les cookies nous permettent de vous reconnaître, de mémoriser
                vos préférences et d'améliorer votre expérience d'utilisation.
              </p>
              <p>
                Chez BidHub, développé par <strong>GCSGC Agency</strong>, nous
                utilisons les cookies de manière responsable et transparente.
                Vous gardez toujours le contrôle sur les cookies que vous
                acceptez, à l'exception de ceux strictement nécessaires au
                fonctionnement du site.
              </p>
            </div>
          </div>

          {/* Types de cookies avec préférences */}
          <div className="space-y-6">
            {cookieTypes.map((cookieType) => (
              <div
                key={cookieType.id}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start">
                    <div
                      className={`p-3 rounded-xl mr-4 ${getIconColorClasses(
                        cookieType.color
                      )}`}
                    >
                      <cookieType.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 mr-3">
                          {cookieType.name}
                        </h3>
                        {cookieType.required && (
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${getColorClasses(
                              "green"
                            )}`}
                          >
                            Obligatoire
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {cookieType.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center ml-4">
                    {cookieType.required ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">
                          Toujours actif
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            handlePreferenceChange(cookieType.id, false)
                          }
                          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                            cookiePreferences[cookieType.id]
                              ? "bg-gray-300"
                              : "bg-red-500"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                              cookiePreferences[cookieType.id]
                                ? "translate-x-1"
                                : "translate-x-7"
                            }`}
                          />
                        </button>

                        <button
                          onClick={() =>
                            handlePreferenceChange(cookieType.id, true)
                          }
                          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                            cookiePreferences[cookieType.id]
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                              cookiePreferences[cookieType.id]
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Exemples d'utilisation
                    </h4>
                    <ul className="space-y-2">
                      {cookieType.examples.map((example, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-sm text-gray-600">
                            {example}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Durée de conservation
                      </h4>
                      <p className="text-sm text-gray-600">
                        {cookieType.retention}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Fournisseurs
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cookieType.providers.map((provider, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getColorClasses(
                              cookieType.color
                            )}`}
                          >
                            {provider}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comment gérer les cookies */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start mb-6">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <EyeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Comment gérer vos cookies ?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Via BidHub</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Centre de préférences
                      </p>
                      <p className="text-sm text-gray-600">
                        Accédez à vos paramètres de cookies depuis votre compte
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Bandeau de cookies
                      </p>
                      <p className="text-sm text-gray-600">
                        Modifiez vos choix via le bandeau lors de votre première
                        visite
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Contact direct
                      </p>
                      <p className="text-sm text-gray-600">
                        Contactez notre équipe à cookies@bidhub.tg
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Via votre navigateur
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Chrome</p>
                    <p>Paramètres → Confidentialité et sécurité → Cookies</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Firefox</p>
                    <p>Options → Vie privée et sécurité → Cookies</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Safari</p>
                    <p>Préférences → Confidentialité → Cookies</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Edge</p>
                    <p>Paramètres → Confidentialité → Cookies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cookies tiers */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start mb-6">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Cookies de tiers
              </h2>
            </div>

            <div className="prose text-gray-600 mb-6">
              <p>
                BidHub peut inclure des services de tiers qui déposent leurs
                propres cookies. Ces services ont leurs propres politiques de
                confidentialité que nous vous encourageons à consulter.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Google Analytics
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Analyse du trafic et des performances
                </p>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Politique de confidentialité →
                </a>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Processeurs de paiement
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Sécurisation des transactions
                </p>
                <p className="text-gray-500 text-sm">
                  Selon le mode de paiement choisi
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Réseaux sociaux
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Boutons de partage et intégrations
                </p>
                <p className="text-gray-500 text-sm">
                  Facebook, Twitter, LinkedIn
                </p>
              </div>
            </div>
          </div>

          {/* Vos droits */}
          <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Vos droits concernant les cookies
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Droit de choix
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vous pouvez accepter ou refuser les cookies non essentiels
                      à tout moment
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <TrashIcon className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Droit de suppression
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vous pouvez supprimer les cookies existants depuis votre
                      navigateur
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-5 h-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Droit à l'information
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vous avez le droit de savoir quels cookies sont utilisés
                      et pourquoi
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CogIcon className="w-5 h-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Droit de modification
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vous pouvez modifier vos préférences à tout moment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact et assistance */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Besoin d'aide avec les cookies ?
              </h2>

              <p className="text-gray-600 mb-6">
                Notre équipe est là pour vous aider à comprendre et gérer vos
                préférences de cookies.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="mailto:cookies@bidhub.tg"
                  className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
                >
                  <DocumentTextIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-900">
                    Email spécialisé
                  </p>
                  <p className="text-sm text-blue-700">cookies@bidhub.tg</p>
                </a>

                <Link
                  to="/contact"
                  className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors group"
                >
                  <CogIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-900">
                    Formulaire de contact
                  </p>
                  <p className="text-sm text-green-700">Support général</p>
                </Link>

                <a
                  href="tel:+22890123456"
                  className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors group"
                >
                  <InformationCircleIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold text-purple-900">
                    Support téléphonique
                  </p>
                  <p className="text-sm text-purple-700">+228 90 12 34 56</p>
                </a>
              </div>
            </div>
          </div>

          {/* Section GCSGC Agency */}
          <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl mb-4">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Développé par GCSGC Agency
              </h3>

              <p className="text-gray-600 mb-6">
                Cette politique de cookies respecte les meilleures pratiques
                internationales et a été développée par les experts de GCSGC
                Agency pour garantir votre confidentialité.
              </p>

              <a
                href="https://darevrse.github.io/site-gcsgc-agency/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                Découvrir GCSGC Agency
              </a>
            </div>
          </div>

          {/* Liens vers autres documents */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Documents connexes
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/privacy"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Politique de confidentialité
              </Link>
              <Link
                to="/terms"
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                Conditions d'utilisation
              </Link>
              <Link
                to="/legal"
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
              >
                Mentions légales
              </Link>
              <Link
                to="/contact"
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
              >
                Nous contacter
              </Link>
            </div>
          </div>

          {/* Dernière mise à jour */}
          <div className="mt-12 text-center py-6">
            <p className="text-sm text-gray-500">
              Politique des cookies mise à jour le {lastUpdated}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              BidHub respecte votre vie privée - Une création GCSGC Agency 🇹🇬
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cookies;
