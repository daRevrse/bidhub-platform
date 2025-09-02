// frontend/src/components/layout/Footer.js - VERSION AMÉLIORÉE GCSGC Agency
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Logo } from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [emailSubscription, setEmailSubscription] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  const footerLinks = {
    platform: [
      {
        name: "Comment ça marche",
        href: "/how-it-works",
        description: "Découvrez notre processus d'enchères",
      },
      {
        name: "Enchères",
        href: "/auctions",
        description: "Voir toutes les enchères actives",
      },
      {
        name: "Catégories",
        href: "/categories",
        description: "Explorer par catégories",
      },
      {
        name: "Devenir vendeur",
        href: "/become-seller",
        description: "Commencez à vendre aujourd'hui",
      },
    ],
    support: [
      {
        name: "Centre d'aide",
        href: "/help",
        description: "Trouvez des réponses à vos questions",
      },
      {
        name: "Contact",
        href: "/contact",
        description: "Contactez notre équipe",
      },
      {
        name: "Signaler un problème",
        href: "/report",
        description: "Signalez un contenu inapproprié",
      },
      {
        name: "FAQ",
        href: "/faq",
        description: "Questions fréquemment posées",
      },
    ],
    legal: [
      {
        name: "Conditions d'utilisation",
        href: "/terms",
        description: "Nos conditions d'usage",
      },
      {
        name: "Politique de confidentialité",
        href: "/privacy",
        description: "Protection de vos données",
      },
      {
        name: "Politique de cookies",
        href: "/cookies",
        description: "Utilisation des cookies",
      },
      {
        name: "Mentions légales",
        href: "/legal",
        description: "Informations légales",
      },
    ],
    company: [
      {
        name: "À propos",
        href: "/about",
        description: "Notre histoire et mission",
      },
      { name: "Blog", href: "/blog", description: "Actualités et conseils" },
      {
        name: "Carrières",
        href: "/careers",
        description: "Rejoignez notre équipe",
      },
      { name: "Presse", href: "/press", description: "Ressources médias" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com/bidhub.togo",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "https://twitter.com/bidhub_togo",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2H21l-6.563 7.5L22 22h-5.75l-4.65-6.375L6.1 22H3.344l6.875-7.875L2 2h5.75l4.275 5.95L18.244 2zm-2.034 18h1.293L8.1 4h-1.3l9.41 16z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/bidhub-togo",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://instagram.com/bidhub.togo",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/22893231346",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
      ),
    },
  ];

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!emailSubscription.trim()) return;

    try {
      // Simulation d'abonnement newsletter
      setSubscriptionStatus("loading");

      // Simuler un appel API
      setTimeout(() => {
        setSubscriptionStatus("success");
        setEmailSubscription("");

        // Réinitialiser le statut après 3 secondes
        setTimeout(() => {
          setSubscriptionStatus(null);
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error("Erreur abonnement newsletter:", error);
      setSubscriptionStatus("error");
    }
  };

  const contactInfo = {
    address: "123 Avenue de la Paix, Lomé, Togo",
    phone: "+228 93 23 13 46",
    email: "contact@bidhub.tg",
    businessHours: "Lun-Ven: 8h-18h, Sam: 9h-15h",
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section principale */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* À propos de BidHub */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              {/* <div className="w-2 h-2">
                <Logo />
              </div> */}

              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                BidHub Togo
              </h3>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              La première plateforme d'enchères en ligne au Togo. Achetez et
              vendez en toute confiance avec des milliers d'utilisateurs
              passionnés.
            </p>

            {/* Informations de contact */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{contactInfo.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  {contactInfo.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <BuildingOffice2Icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">
                  {contactInfo.businessHours}
                </span>
              </div>
            </div>
          </div>

          {/* Liens de navigation */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 relative">
                  Plateforme
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {footerLinks.platform.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="group flex flex-col text-gray-300 hover:text-white transition-colors duration-200"
                        title={link.description}
                      >
                        <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">
                          {link.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4 relative">
                  Support
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="group flex flex-col text-gray-300 hover:text-white transition-colors duration-200"
                        title={link.description}
                      >
                        <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">
                          {link.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4 relative">
                  Entreprise
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="group flex flex-col text-gray-300 hover:text-white transition-colors duration-200"
                        title={link.description}
                      >
                        <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">
                          {link.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4 relative">
                  Légal
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="group flex flex-col text-gray-300 hover:text-white transition-colors duration-200"
                        title={link.description}
                      >
                        <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">
                          {link.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter et réseaux sociaux */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              Restez connecté
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
            </h3>

            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Recevez les dernières enchères et offres spéciales directement
              dans votre boîte mail.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <div className="relative">
                <input
                  type="email"
                  value={emailSubscription}
                  onChange={(e) => setEmailSubscription(e.target.value)}
                  placeholder="Votre adresse email"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 text-white placeholder-gray-400 text-sm transition-all duration-200"
                  required
                  disabled={subscriptionStatus === "loading"}
                />
                <button
                  type="submit"
                  disabled={
                    subscriptionStatus === "loading" ||
                    !emailSubscription.trim()
                  }
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {subscriptionStatus === "loading" ? "..." : "OK"}
                </button>
              </div>

              {subscriptionStatus === "success" && (
                <div className="flex items-center mt-2 text-green-400 text-sm">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Abonnement réussi !
                </div>
              )}

              {subscriptionStatus === "error" && (
                <div className="mt-2 text-red-400 text-sm">
                  Erreur lors de l'abonnement. Veuillez réessayer.
                </div>
              )}
            </form>

            {/* Réseaux sociaux */}
            <div>
              <p className="text-gray-300 mb-4 text-sm">Suivez-nous :</p>
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/30 transition-all duration-200 transform hover:scale-110"
                    aria-label={social.name}
                    title={`Suivez BidHub sur ${social.name}`}
                  >
                    <div className="text-gray-300 group-hover:text-white transition-colors duration-200">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section GCSGC Agency */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                  <GlobeAltIcon className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    GCSGC Agency
                  </h4>
                  <p className="text-sm text-gray-300">
                    Votre partenaire digital d'excellence
                  </p>
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm text-gray-300 mb-2">
                  BidHub est fièrement développé par{" "}
                  <span className="font-semibold text-white">GCSGC Agency</span>
                </p>
                <a
                  href="https://darevrse.github.io/site-gcsgc-agency/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 font-semibold rounded-lg hover:from-yellow-400 hover:to-orange-500 transition-all duration-200 text-sm"
                >
                  <GlobeAltIcon className="w-4 h-4 mr-2" />
                  Découvrir GCSGC Agency
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section du bas */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="flex items-center text-gray-400 text-sm order-2 lg:order-1">
              <span>© {currentYear} BidHub Togo. Développé avec</span>
              <HeartIcon className="w-4 h-4 mx-2 text-red-500 animate-pulse" />
              <span>au Togo par</span>
              <a
                href="https://darevrse.github.io/site-gcsgc-agency/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                GCSGC Agency
              </a>
            </div>

            {/* Indicateurs de confiance */}
            <div className="flex items-center space-x-6 text-sm text-gray-400 order-1 lg:order-2">
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2" />
                <span>Paiements sécurisés</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-blue-400 mr-2" />
                <span>Support 24/7</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-purple-400 mr-2" />
                <span>Made in Togo</span>
              </div>
            </div>
          </div>

          {/* Version et dernière mise à jour */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">
              BidHub v2.0.0 • Dernière mise à jour :{" "}
              {new Date().toLocaleDateString("fr-FR")} • Plateforme optimisée
              pour le marché togolais
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
