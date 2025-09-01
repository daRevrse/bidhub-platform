import React from "react";
import { Link } from "react-router-dom";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { Logo } from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Comment ça marche", href: "/how-it-works" },
      { name: "Enchères", href: "/auctions" },
      { name: "Catégories", href: "/categories" },
      { name: "Devenir vendeur", href: "/become-seller" },
    ],
    support: [
      { name: "Centre d'aide", href: "/help" },
      { name: "Contact", href: "/contact" },
      { name: "Signaler un problème", href: "/report" },
      { name: "FAQ", href: "/faq" },
    ],
    legal: [
      { name: "Conditions d'utilisation", href: "/terms" },
      { name: "Politique de confidentialité", href: "/privacy" },
      { name: "Politique de cookies", href: "/cookies" },
      { name: "Mentions légales", href: "/legal" },
    ],
    company: [
      { name: "À propos", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Carrières", href: "/careers" },
      { name: "Presse", href: "/press" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com/bidhub",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "https://twitter.com/bidhub",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/bidhub",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://instagram.com/bidhub",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.764 3.72 13.61 3.72 12.312c0-1.297.478-2.448 1.406-3.323.928-.875 2.026-1.297 3.323-1.297 1.297 0 2.448.422 3.323 1.297.875.875 1.406 2.026 1.406 3.323 0 1.297-.531 2.452-1.406 3.323-.875.807-2.026 1.353-3.323 1.353zm8.687-9.316h-1.78V6.295h1.78v1.377zm-1.188 5.64c0 .956-.478 1.78-1.188 2.299-.71.519-1.533.807-2.49.807-.956 0-1.78-.288-2.49-.807-.71-.519-1.188-1.343-1.188-2.299 0-.956.478-1.78 1.188-2.299.71-.519 1.534-.807 2.49-.807.957 0 1.78.288 2.49.807.71.519 1.188 1.343 1.188 2.299z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                {/* <svg
                  className="w-6 h-6 text-white font-bold"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg> */}
                <Logo />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BidHub
                </span>
                <span className="text-sm text-gray-500 -mt-1">Togo</span>
              </div>
            </Link>
            <p className="text-gray-600 mb-6 max-w-md">
              La première plateforme d'enchères en ligne au Togo. Achetez et
              vendez en toute sécurité avec des milliers d'utilisateurs de
              confiance.
            </p>

            {/* Informations de contact */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-3 text-blue-600" />
                <span>Lomé, Togo</span>
              </div>
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="w-5 h-5 mr-3 text-blue-600" />
                <span>+228 90 00 00 00</span>
              </div>
              <div className="flex items-center text-gray-600">
                <EnvelopeIcon className="w-5 h-5 mr-3 text-blue-600" />
                <span>contact@bidhub.tg</span>
              </div>
            </div>
          </div>

          {/* Liens de navigation */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:col-span-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Plateforme
              </h3>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Entreprise
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Restez informé
            </h3>
            <p className="text-gray-600 mb-4">
              Recevez les dernières enchères et offres spéciales directement
              dans votre boîte mail.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Section du bas */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center text-gray-500 text-sm">
              <span>© {currentYear} BidHub Togo. Fait avec</span>
              <HeartIcon className="w-4 h-4 mx-1 text-red-500" />
              <span>au Togo.</span>
            </div>

            {/* Réseaux sociaux */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 text-sm mr-2">Suivez-nous :</span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors duration-200 transform hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Liens légaux */}
            <div className="flex items-center space-x-4 text-sm">
              {footerLinks.legal.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                  {index < footerLinks.legal.length - 1 && (
                    <span className="text-gray-300">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
