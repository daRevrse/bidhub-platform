// frontend/src/pages/legal/Legal.js - Mentions légales
import React from "react";
import { Link } from "react-router-dom";
import {
  BuildingOffice2Icon,
  IdentificationIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ScaleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const Legal = () => {
  const lastUpdated = "15 janvier 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <ScaleIcon className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mentions légales
            </h1>

            <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
              Informations légales concernant BidHub et GCSGC Agency
            </p>

            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              Dernière mise à jour : {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {/* Éditeur du site */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                <BuildingOffice2Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                1. Éditeur du site
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Raison sociale
                  </h3>
                  <p className="text-gray-600">GCSGC Agency</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Forme juridique
                  </h3>
                  <p className="text-gray-600">Société de droit togolais</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Siège social
                  </h3>
                  <div className="flex items-start">
                    <MapPinIcon className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-gray-600">
                      123 Avenue de la Paix
                      <br />
                      Quartier Administratif
                      <br />
                      Lomé, Togo
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href="tel:+22890123456"
                        className="text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        +228 90 12 34 56
                      </a>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href="mailto:legal@bidhub.tg"
                        className="text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        legal@bidhub.tg
                      </a>
                    </div>
                    <div className="flex items-center">
                      <GlobeAltIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href="https://darevrse.github.io/site-gcsgc-agency/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        Site GCSGC Agency
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Directeur de publication
                  </h3>
                  <p className="text-gray-600">GCSGC Agency</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Numéro d'immatriculation
                  </h3>
                  <p className="text-gray-600">En cours d'obtention</p>
                  <p className="text-xs text-gray-500">
                    Registre du Commerce du Togo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hébergement */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start mb-6">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <GlobeAltIcon className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                2. Hébergement
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Hébergeur web
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">
                    Services cloud professionnels
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Serveurs situés dans des datacenters sécurisés
                  </p>
                  <p className="text-sm text-gray-600">
                    Conformité aux standards internationaux de sécurité
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Caractéristiques techniques
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Certificats SSL/TLS pour sécurisation des données
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Sauvegardes automatiques quotidiennes
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Monitoring 24h/24 et 7j/7
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Infrastructure redondante
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Propriété intellectuelle */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start mb-6">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                3. Propriété intellectuelle
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Droits d'auteur
                </h3>
                <div className="prose text-gray-600">
                  <p>
                    L'ensemble du contenu de BidHub (design, textes, images,
                    logos, interface utilisateur, code source) est protégé par
                    le droit d'auteur et appartient à GCSGC Agency.
                  </p>
                  <p>
                    Toute reproduction, représentation, modification,
                    publication, adaptation de tout ou partie des éléments du
                    site, quel que soit le moyen ou le procédé utilisé, est
                    interdite, sauf autorisation écrite préalable de GCSGC
                    Agency.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Marques et logos
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    "BidHub" est une marque de GCSGC Agency. L'utilisation de
                    cette marque à des fins commerciales sans autorisation
                    écrite est strictement interdite.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Contenus utilisateurs
                </h3>
                <div className="prose text-gray-600">
                  <p>
                    Les utilisateurs conservent la propriété intellectuelle de
                    leurs contenus (descriptions de produits, photos,
                    commentaires) mais accordent à BidHub une licence
                    d'utilisation nécessaire au fonctionnement du service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Données personnelles */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start mb-6">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                4. Protection des données personnelles
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Responsable du traitement
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-900">GCSGC Agency</p>
                  <p className="text-sm text-blue-700">
                    En qualité d'éditeur de la plateforme BidHub
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Contact DPO : dpo@bidhub.tg
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Vos droits</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Droit d'accès à vos données</li>
                  <li>• Droit de rectification</li>
                  <li>• Droit à l'effacement</li>
                  <li>• Droit de portabilité</li>
                  <li>• Droit d'opposition</li>
                </ul>
                <Link
                  to="/privacy"
                  className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Consulter la politique de confidentialité →
                </Link>
              </div>
            </div>
          </div>

          {/* Droit applicable */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start mb-6">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <ScaleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                5. Droit applicable et juridiction
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Législation applicable
                </h3>
                <div className="prose text-gray-600">
                  <p>
                    Les présentes mentions légales et l'utilisation de BidHub
                    sont régies par le droit togolais. En cas de litige, les
                    tribunaux de Lomé seront seuls compétents.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Règlement des différends
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    Avant tout recours judiciaire, nous encourageons la
                    résolution amiable des litiges. Contactez notre service
                    client à l'adresse : contact@bidhub.tg
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Médiation</h3>
                <div className="prose text-gray-600">
                  <p>
                    En cas de litige persistant, une procédure de médiation peut
                    être engagée auprès des organismes compétents du Togo,
                    conformément à la réglementation en vigueur.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Accessibilité */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start mb-6">
              <div className="p-3 bg-yellow-100 rounded-xl mr-4">
                <IdentificationIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                6. Accessibilité
              </h2>
            </div>

            <div className="space-y-4">
              <div className="prose text-gray-600">
                <p>
                  BidHub s'efforce de rendre ses services accessibles à tous les
                  utilisateurs, y compris les personnes en situation de
                  handicap, conformément aux standards d'accessibilité web
                  internationaux.
                </p>
                <p>
                  Si vous rencontrez des difficultés d'accès à certaines
                  fonctionnalités, n'hésitez pas à nous contacter à l'adresse :
                  accessibilite@bidhub.tg
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Mesures d'accessibilité mises en place
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Navigation au clavier</li>
                  <li>• Contrastes de couleurs optimisés</li>
                  <li>• Textes alternatifs pour les images</li>
                  <li>• Structure sémantique du code HTML</li>
                  <li>• Compatibilité avec les lecteurs d'écran</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-start mb-6">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <DocumentTextIcon className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                7. Cookies et traceurs
              </h2>
            </div>

            <div className="prose text-gray-600 mb-6">
              <p>
                BidHub utilise des cookies pour améliorer l'expérience
                utilisateur et analyser l'utilisation du site. Ces cookies sont
                déposés selon votre consentement et conformément à notre
                politique des cookies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/cookies"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-center"
              >
                Politique des cookies
              </Link>
              <button className="px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-xl hover:bg-green-600 hover:text-white transition-colors">
                Gérer mes préférences
              </button>
            </div>
          </div>

          {/* Section GCSGC Agency */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl mb-6">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                À propos de{" "}
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  GCSGC Agency
                </span>
              </h2>

              <div className="max-w-3xl mx-auto">
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  GCSGC Agency est une agence digitale togolaise spécialisée
                  dans la conception et le développement de solutions web
                  innovantes. Fondée avec pour mission de promouvoir la
                  transformation numérique au Togo, l'agence accompagne les
                  entreprises et entrepreneurs dans leur digitalisation.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <GlobeAltIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Expertise technique
                    </h3>
                    <p className="text-sm text-gray-600">
                      Développement web et mobile de qualité
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <BuildingOffice2Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Innovation locale
                    </h3>
                    <p className="text-sm text-gray-600">
                      Solutions adaptées au marché togolais
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <ShieldCheckIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Qualité garantie
                    </h3>
                    <p className="text-sm text-gray-600">
                      Standards internationaux de développement
                    </p>
                  </div>
                </div>

                <a
                  href="https://darevrse.github.io/site-gcsgc-agency/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-2xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-xl transform hover:scale-105"
                >
                  <GlobeAltIcon className="w-5 h-5 mr-2" />
                  Découvrir GCSGC Agency
                  <span className="ml-2">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact et documents connexes */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Nous contacter
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Questions légales
                    </p>
                    <a
                      href="mailto:legal@bidhub.tg"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      legal@bidhub.tg
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Support client</p>
                    <a
                      href="tel:+22890123456"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      +228 90 12 34 56
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Adresse</p>
                    <p className="text-gray-600 text-sm">
                      123 Avenue de la Paix
                      <br />
                      Lomé, Togo
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                Formulaire de contact
              </Link>
            </div>

            {/* Documents connexes */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Documents connexes
              </h2>

              <div className="space-y-4">
                <Link
                  to="/terms"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Conditions d'utilisation
                    </p>
                    <p className="text-sm text-blue-600">
                      Règles d'usage de BidHub
                    </p>
                  </div>
                  <span className="ml-auto text-blue-600 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>

                <Link
                  to="/privacy"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">
                      Politique de confidentialité
                    </p>
                    <p className="text-sm text-green-600">
                      Protection de vos données
                    </p>
                  </div>
                  <span className="ml-auto text-green-600 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>

                <Link
                  to="/cookies"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <DocumentTextIcon className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-purple-900">
                      Politique des cookies
                    </p>
                    <p className="text-sm text-purple-600">
                      Gestion des traceurs
                    </p>
                  </div>
                  <span className="ml-auto text-purple-600 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Dernière mise à jour */}
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Mentions légales mises à jour le {lastUpdated}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              BidHub est une création GCSGC Agency - Made with ❤️ in Togo
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Legal;
