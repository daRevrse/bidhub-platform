// frontend/src/pages/legal/Privacy.js - Politique de confidentialité
import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  EyeIcon,
  KeyIcon,
  CircleStackIcon,
  ShareIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  PencilIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const Privacy = () => {
  const lastUpdated = "15 janvier 2025";

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: InformationCircleIcon,
      content: [
        "BidHub, développé par GCSGC Agency, s'engage à protéger votre vie privée et vos données personnelles.",
        "Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles.",
        "En utilisant BidHub, vous acceptez les pratiques décrites dans cette politique de confidentialité.",
        "Cette politique s'applique à tous les utilisateurs de BidHub, qu'ils soient acheteurs, vendeurs ou visiteurs.",
      ],
    },
    {
      id: "data-collection",
      title: "2. Données que nous collectons",
      icon: CircleStackIcon,
      content: {
        categories: [
          {
            title: "Informations d'identification",
            items: [
              "Nom, prénom, pseudonyme",
              "Adresse email",
              "Numéro de téléphone",
              "Date de naissance",
              "Pièce d'identité (pour la vérification vendeur)",
            ],
          },
          {
            title: "Informations de profil",
            items: [
              "Photo de profil",
              "Préférences d'achat",
              "Historique des enchères",
              "Évaluations et commentaires",
            ],
          },
          {
            title: "Données techniques",
            items: [
              "Adresse IP",
              "Type de navigateur et version",
              "Système d'exploitation",
              "Pages visitées sur BidHub",
              "Temps passé sur la plateforme",
            ],
          },
          {
            title: "Informations de paiement",
            items: [
              "Informations bancaires (cryptées)",
              "Historique des transactions",
              "Méthodes de paiement préférées",
            ],
          },
        ],
      },
    },
    {
      id: "data-usage",
      title: "3. Comment nous utilisons vos données",
      icon: EyeIcon,
      content: [
        "Fournir et améliorer nos services d'enchères en ligne",
        "Traiter vos transactions et gérer votre compte",
        "Vous envoyer des notifications importantes liées à vos enchères",
        "Prévenir la fraude et assurer la sécurité de la plateforme",
        "Personnaliser votre expérience utilisateur",
        "Vous envoyer des communications marketing (avec votre consentement)",
        "Répondre à vos demandes de support client",
        "Améliorer nos services grâce à l'analyse des données d'usage",
      ],
    },
    {
      id: "data-sharing",
      title: "4. Partage de vos données",
      icon: ShareIcon,
      content: [
        "Nous ne vendons jamais vos données personnelles à des tiers.",
        "Nous pouvons partager vos données dans les cas suivants :",
        "• Avec d'autres utilisateurs : nom d'utilisateur, évaluations, historique public des enchères",
        "• Avec nos prestataires de services : processeurs de paiement, services de livraison, hébergement cloud",
        "• Pour des raisons légales : sur demande des autorités compétentes togolaises",
        "• En cas de fusion ou acquisition : les données peuvent être transférées au nouvel propriétaire",
        "• Avec votre consentement explicite pour des partenariats commerciaux",
      ],
    },
    {
      id: "data-protection",
      title: "5. Protection de vos données",
      icon: ShieldCheckIcon,
      content: [
        "Chiffrement SSL/TLS pour toutes les communications",
        "Stockage sécurisé des données sur des serveurs protégés",
        "Accès limité aux données par le personnel autorisé uniquement",
        "Surveillance continue des activités suspectes",
        "Sauvegardes régulières et redondantes",
        "Mise à jour constante des mesures de sécurité",
        "Audit de sécurité régulier par des experts indépendants",
      ],
    },
    {
      id: "your-rights",
      title: "6. Vos droits",
      icon: KeyIcon,
      content: {
        rights: [
          {
            title: "Droit d'accès",
            description:
              "Vous pouvez demander une copie de toutes les données personnelles que nous détenons à votre sujet.",
          },
          {
            title: "Droit de rectification",
            description:
              "Vous pouvez demander la correction de données inexactes ou incomplètes.",
          },
          {
            title: "Droit de suppression",
            description:
              "Vous pouvez demander la suppression de vos données dans certaines circonstances.",
          },
          {
            title: "Droit de portabilité",
            description:
              "Vous pouvez demander le transfert de vos données vers un autre service.",
          },
          {
            title: "Droit d'opposition",
            description:
              "Vous pouvez vous opposer au traitement de vos données à des fins marketing.",
          },
          {
            title: "Droit de limitation",
            description:
              "Vous pouvez demander la limitation du traitement de vos données.",
          },
        ],
      },
    },
    {
      id: "cookies",
      title: "7. Cookies et technologies similaires",
      icon: DocumentTextIcon,
      content: [
        "BidHub utilise des cookies pour améliorer votre expérience utilisateur.",
        "Types de cookies utilisés :",
        "• Cookies essentiels : nécessaires au fonctionnement du site",
        "• Cookies de performance : pour analyser l'utilisation du site",
        "• Cookies de fonctionnalité : pour mémoriser vos préférences",
        "• Cookies publicitaires : pour personnaliser les publicités (avec consentement)",
        "Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.",
        "Consultez notre Politique des Cookies pour plus de détails.",
      ],
    },
    {
      id: "retention",
      title: "8. Durée de conservation",
      icon: TrashIcon,
      content: [
        "Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités décrites.",
        "Données de compte : conservées tant que votre compte est actif",
        "Données de transaction : conservées 10 ans pour obligations comptables et légales",
        "Données de navigation : conservées 13 mois maximum",
        "Données marketing : conservées 3 ans après votre dernière interaction",
        "Après suppression, certaines données peuvent être conservées sous forme anonymisée à des fins statistiques.",
      ],
    },
    {
      id: "minors",
      title: "9. Protection des mineurs",
      icon: ExclamationTriangleIcon,
      content: [
        "BidHub est destiné aux personnes âgées de 18 ans et plus.",
        "Nous ne collectons pas sciemment de données personnelles auprès de mineurs de moins de 18 ans.",
        "Si nous découvrons qu'un mineur a fourni des données personnelles, nous supprimerons immédiatement ces informations.",
        "Les parents ou tuteurs légaux peuvent nous contacter s'ils pensent qu'un mineur a créé un compte.",
        "L'utilisation supervisée par un parent ou tuteur légal peut être autorisée dans certains cas.",
      ],
    },
    {
      id: "international",
      title: "10. Transferts internationaux",
      icon: GlobeAltIcon,
      content: [
        "Vos données sont principalement stockées et traitées au Togo.",
        "Certains de nos prestataires de services peuvent être situés à l'étranger.",
        "Dans ce cas, nous nous assurons que des garanties appropriées sont en place pour protéger vos données.",
        "Les transferts respectent les standards internationaux de protection des données.",
        "Vous pouvez nous contacter pour obtenir plus d'informations sur les transferts de données.",
      ],
    },
    {
      id: "changes",
      title: "11. Modifications de cette politique",
      icon: PencilIcon,
      content: [
        "Nous pouvons modifier cette politique de confidentialité à tout moment.",
        "Les modifications importantes vous seront notifiées par email ou via un avis sur la plateforme.",
        "La date de dernière mise à jour est indiquée en haut de cette politique.",
        "Nous vous encourageons à consulter régulièrement cette page pour rester informé.",
        "L'utilisation continue de BidHub après modification constitue votre acceptation de la nouvelle politique.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Politique de confidentialité
            </h1>

            <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
              Votre confidentialité est notre priorité. Découvrez comment nous
              protégeons vos données personnelles.
            </p>

            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              Dernière mise à jour : {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation rapide */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
              >
                <section.icon className="w-4 h-4 mr-2" />
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Introduction générale */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Notre engagement pour votre vie privée
                </h2>
                <p className="text-gray-600">
                  Transparence et protection maximale de vos données
                </p>
              </div>
            </div>

            <div className="prose prose-lg text-gray-600">
              <p>
                Chez BidHub, nous croyons que la confiance est la base de toute
                relation commerciale. Cette politique de confidentialité
                détaille notre approche responsable de la gestion de vos données
                personnelles.
              </p>
              <p>
                Développée par <strong>GCSGC Agency</strong> selon les
                meilleures pratiques internationales et en conformité avec les
                lois togolaises, cette politique garantit une protection
                optimale de votre vie privée.
              </p>
            </div>
          </div>

          {/* Sections détaillées */}
          <div className="space-y-8">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-start mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4">
                    <section.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Contenu simple (array de strings) */}
                  {Array.isArray(section.content) &&
                    section.content.map((item, index) => (
                      <p key={index} className="text-gray-600 leading-relaxed">
                        {item}
                      </p>
                    ))}

                  {/* Contenu structuré pour les catégories de données */}
                  {section.content?.categories && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {section.content.categories.map((category, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-xl">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            {category.title}
                          </h3>
                          <ul className="space-y-2">
                            {category.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-sm text-gray-600">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contenu structuré pour les droits */}
                  {section.content?.rights && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {section.content.rights.map((right, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-xl">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {right.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {right.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comment exercer vos droits */}
          <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comment exercer vos droits ?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Par email
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    📧 <strong>privacy@bidhub.tg</strong>
                  </p>
                  <p className="text-sm">Réponse sous 72h maximum</p>
                  <p className="text-sm">
                    Joignez une pièce d'identité pour vérification
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dans votre compte
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>⚙️ Paramètres → Confidentialité</p>
                  <p className="text-sm">Gérez vos préférences en temps réel</p>
                  <p className="text-sm">Téléchargez vos données</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Délais de traitement :</strong> Nous traitons vos
                demandes dans un délai de 30 jours maximum, conformément à la
                réglementation en vigueur au Togo.
              </p>
            </div>
          </div>

          {/* Contact DPO */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                <KeyIcon className="w-6 h-6 text-purple-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Délégué à la Protection des Données
              </h2>

              <p className="text-gray-600 mb-6">
                Pour toute question concernant cette politique de
                confidentialité ou l'exercice de vos droits, vous pouvez
                contacter directement notre DPO.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
                <p className="font-semibold text-gray-900">
                  GCSGC Agency - DPO
                </p>
                <p className="text-gray-600">dpo@bidhub.tg</p>
                <p className="text-gray-600">+228 90 12 34 56</p>
                <p className="text-sm text-gray-500 mt-2">
                  Disponible du lundi au vendredi, 9h-17h
                </p>
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
                Cette politique de confidentialité a été élaborée par les
                experts de GCSGC Agency en conformité avec les standards
                internationaux et la réglementation togolaise.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://darevrse.github.io/site-gcsgc-agency/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  <GlobeAltIcon className="w-5 h-5 mr-2" />
                  Découvrir GCSGC Agency
                </a>

                <Link
                  to="/legal"
                  className="inline-flex items-center px-6 py-3 border-2 border-yellow-500 text-yellow-600 font-semibold rounded-xl hover:bg-yellow-500 hover:text-white transition-all duration-300"
                >
                  Mentions légales
                </Link>
              </div>
            </div>
          </div>

          {/* Liens vers autres documents */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Documents connexes
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/terms"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Conditions d'utilisation
              </Link>
              <Link
                to="/cookies"
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                Politique des cookies
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
        </div>
      </section>
    </div>
  );
};

export default Privacy;
