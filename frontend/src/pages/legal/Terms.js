// frontend/src/pages/legal/Terms.js - Conditions d'utilisation
import React from "react";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const Terms = () => {
  const lastUpdated = "15 janvier 2025";

  const sections = [
    {
      id: "definitions",
      title: "1. Définitions",
      icon: InformationCircleIcon,
      content: [
        {
          term: "BidHub",
          definition:
            "Désigne la plateforme d'enchères en ligne accessible via le site web et l'application mobile, développée et exploitée par GCSGC Agency.",
        },
        {
          term: "Utilisateur",
          definition:
            "Toute personne physique ou morale qui accède et utilise les services de BidHub, qu'elle soit acheteur ou vendeur.",
        },
        {
          term: "Enchère",
          definition:
            "Processus de vente aux enchères organisé sur la plateforme où les utilisateurs peuvent placer des offres sur des produits ou services.",
        },
        {
          term: "Vendeur",
          definition:
            "Utilisateur inscrit qui propose des biens ou services à la vente via le système d'enchères de BidHub.",
        },
        {
          term: "Acheteur",
          definition:
            "Utilisateur qui participe aux enchères dans le but d'acquérir des biens ou services proposés sur la plateforme.",
        },
      ],
    },
    {
      id: "acceptance",
      title: "2. Acceptation des conditions",
      icon: CheckCircleIcon,
      content: [
        "En accédant et en utilisant BidHub, vous acceptez d'être lié par ces conditions d'utilisation dans leur intégralité.",
        "Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement d'utiliser notre plateforme.",
        "Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur le site.",
        "Il est de votre responsabilité de consulter régulièrement ces conditions pour prendre connaissance des éventuelles modifications.",
      ],
    },
    {
      id: "registration",
      title: "3. Inscription et compte utilisateur",
      icon: ShieldCheckIcon,
      content: [
        "Pour utiliser certains services de BidHub, vous devez créer un compte en fournissant des informations exactes et complètes.",
        "Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées sur votre compte.",
        "Vous devez avoir au moins 18 ans pour créer un compte. Les mineurs peuvent utiliser la plateforme sous la supervision d'un parent ou tuteur légal.",
        "BidHub se réserve le droit de suspendre ou supprimer tout compte en cas de violation de ces conditions.",
        "Un seul compte par personne est autorisé. La création de comptes multiples peut entraîner la suspension de tous vos comptes.",
      ],
    },
    {
      id: "auctions",
      title: "4. Règles des enchères",
      icon: ScaleIcon,
      content: [
        "Les enchères sont organisées selon le principe de la vente aux enchères ascendante. L'offre la plus élevée à la fin de l'enchère remporte l'objet.",
        "Chaque enchère placée constitue un engagement ferme et irrévocable d'achat au prix proposé.",
        "Les vendeurs s'engagent à honorer la vente à l'issue de l'enchère et à livrer l'objet dans les délais convenus.",
        "BidHub se réserve le droit d'annuler une enchère en cas de comportement suspect, de fraude présumée ou de violation des règles.",
        "Les frais de transaction et de livraison sont clairement indiqués avant la finalisation de l'achat.",
      ],
    },
    {
      id: "payments",
      title: "5. Paiements et transactions",
      icon: DocumentTextIcon,
      content: [
        "Les paiements doivent être effectués dans les 24 heures suivant la fin de l'enchère via les méthodes acceptées sur la plateforme.",
        "BidHub prélève une commission de 5% sur le prix final de vente, payée par le vendeur uniquement en cas de vente réussie.",
        "Tous les prix sont affichés en Francs CFA (FCFA) et incluent les taxes applicables au Togo.",
        "Les remboursements sont traités selon notre politique de remboursement et peuvent prendre 3 à 7 jours ouvrables.",
        "En cas de litige de paiement, BidHub peut suspendre les comptes impliqués jusqu'à résolution du problème.",
      ],
    },
    {
      id: "prohibited",
      title: "6. Contenus et comportements interdits",
      icon: ExclamationTriangleIcon,
      content: [
        "Il est interdit de vendre des objets illégaux, contrefaits, dangereux ou violant les droits de propriété intellectuelle.",
        "Les comportements frauduleux, la manipulation des enchères ou la création de faux comptes sont strictement interdits.",
        "Le harcèlement, les propos discriminatoires ou offensants envers d'autres utilisateurs ne sont pas tolérés.",
        "La publication de contenu pornographique, violent ou inapproprié est interdite.",
        "Toute tentative de contournement des systèmes de sécurité ou d'accès non autorisé aux données est prohibée.",
      ],
    },
    {
      id: "liability",
      title: "7. Responsabilité et garanties",
      icon: ShieldCheckIcon,
      content: [
        "BidHub agit comme intermédiaire technique entre acheteurs et vendeurs et n'est pas partie aux transactions.",
        "Nous ne garantissons pas la qualité, l'authenticité ou la conformité des objets vendus sur la plateforme.",
        "La responsabilité de BidHub est limitée au montant des frais de transaction perçus pour l'enchère concernée.",
        "Les utilisateurs reconnaissent utiliser la plateforme à leurs propres risques et dégagent BidHub de toute responsabilité en cas de perte ou dommage.",
        "BidHub met en place des mesures de sécurité mais ne peut garantir l'absence totale de risques liés à l'utilisation d'Internet.",
      ],
    },
    {
      id: "data",
      title: "8. Protection des données personnelles",
      icon: ShieldCheckIcon,
      content: [
        "La collecte et le traitement de vos données personnelles sont régis par notre Politique de Confidentialité.",
        "Vos données sont traitées conformément aux lois togolaises sur la protection des données et aux standards internationaux.",
        "Nous ne vendons jamais vos données personnelles à des tiers et les utilisons uniquement pour l'amélioration de nos services.",
        "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.",
        "Pour exercer vos droits, contactez-nous à l'adresse privacy@bidhub.tg.",
      ],
    },
    {
      id: "termination",
      title: "9. Résiliation et suspension",
      icon: ExclamationTriangleIcon,
      content: [
        "Vous pouvez fermer votre compte à tout moment via les paramètres de votre profil ou en nous contactant.",
        "BidHub peut suspendre ou fermer votre compte en cas de violation de ces conditions, sans préavis.",
        "En cas de fermeture de compte, vous restez responsable des engagements pris avant la fermeture.",
        "Les données liées aux transactions complétées peuvent être conservées pour des raisons légales et comptables.",
        "La fermeture du compte n'annule pas les droits et obligations nés avant la résiliation.",
      ],
    },
    {
      id: "disputes",
      title: "10. Résolution des litiges",
      icon: ScaleIcon,
      content: [
        "En cas de litige entre utilisateurs, BidHub encourage le dialogue direct et peut jouer un rôle de médiation.",
        "Pour les litiges avec BidHub, nous encourageons le contact direct via notre service client pour une résolution amiable.",
        "Si aucune solution amiable n'est trouvée, les litiges seront soumis à la juridiction compétente de Lomé, Togo.",
        "Le droit togolais s'applique à ces conditions d'utilisation et à l'utilisation de la plateforme BidHub.",
        "Certains litiges de consommation peuvent être soumis à médiation selon les lois togolaises applicables.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <DocumentTextIcon className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Conditions d'utilisation
            </h1>

            <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
              Veuillez lire attentivement ces conditions qui régissent
              l'utilisation de BidHub
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
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
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
          {/* Introduction */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bienvenue sur BidHub
            </h2>
            <div className="prose prose-lg text-gray-600">
              <p>
                Ces conditions d'utilisation (les "Conditions") régissent votre
                accès et votre utilisation de la plateforme BidHub, développée
                et exploitée par <strong>GCSGC Agency</strong>, société de droit
                togolais ayant son siège au Togo.
              </p>
              <p>
                BidHub est la première plateforme d'enchères en ligne du Togo,
                conçue pour connecter acheteurs et vendeurs dans un
                environnement sécurisé et transparent. En utilisant nos
                services, vous acceptez de respecter ces conditions.
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
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {Array.isArray(section.content) ? (
                    section.content.map((item, index) => (
                      <div key={index}>
                        {typeof item === "string" ? (
                          <p className="text-gray-600 leading-relaxed">
                            {item}
                          </p>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <dt className="font-semibold text-gray-900 mb-1">
                              {item.term}
                            </dt>
                            <dd className="text-gray-600 text-sm leading-relaxed">
                              {item.definition}
                            </dd>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 leading-relaxed">
                      {section.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact et informations légales */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Informations légales et contact
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  BidHub - GCSGC Agency
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>📍 123 Avenue de la Paix, Lomé, Togo</p>
                  <p>📞 +228 90 12 34 56</p>
                  <p>📧 legal@bidhub.tg</p>
                  <p>
                    🌐 Site web :
                    <a
                      href="https://darevrse.github.io/site-gcsgc-agency/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 ml-1"
                    >
                      GCSGC Agency
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Documents connexes
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/privacy"
                    className="block text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    → Politique de confidentialité
                  </Link>
                  <Link
                    to="/cookies"
                    className="block text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    → Politique des cookies
                  </Link>
                  <Link
                    to="/legal"
                    className="block text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    → Mentions légales
                  </Link>
                  <Link
                    to="/contact"
                    className="block text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    → Nous contacter
                  </Link>
                </div>
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
                BidHub est fièrement créé et maintenu par GCSGC Agency, une
                agence digitale togolaise spécialisée dans le développement de
                solutions web innovantes.
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

          {/* Retour vers d'autres pages */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center"
            >
              Créer mon compte
            </Link>
            <Link
              to="/how-it-works"
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 text-center"
            >
              Comment ça marche ?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
