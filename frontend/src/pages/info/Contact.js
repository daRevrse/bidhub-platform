// frontend/src/pages/info/Contact.js - Page Contact
import React, { useState } from "react";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

const Contact = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
    priority: "normal",
  });

  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = {
    address: "123 Avenue de la Paix, Quartier Administratif, Lomé, Togo",
    phone: "+228 90 12 34 56",
    whatsapp: "+228 90 12 34 56",
    email: "contact@bidhub.tg",
    supportEmail: "support@bidhub.tg",
    businessHours: "Lundi - Vendredi: 8h00 - 18h00",
    weekendHours: "Samedi: 9h00 - 15h00",
    responseTime: "Réponse sous 24h en moyenne",
  };

  const contactReasons = [
    {
      icon: QuestionMarkCircleIcon,
      title: "Support technique",
      description: "Problèmes avec l'application, bugs, fonctionnalités",
      color: "from-blue-500 to-cyan-600",
      email: "support@bidhub.tg",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Questions générales",
      description: "Informations sur BidHub, comment ça marche",
      color: "from-green-500 to-emerald-600",
      email: "info@bidhub.tg",
    },
    {
      icon: ExclamationTriangleIcon,
      title: "Signalement",
      description: "Signaler un utilisateur ou un contenu inapproprié",
      color: "from-red-500 to-pink-600",
      email: "report@bidhub.tg",
    },
    {
      icon: BuildingOffice2Icon,
      title: "Partenariats",
      description: "Collaborations, partenariats commerciaux",
      color: "from-purple-500 to-indigo-600",
      email: "business@bidhub.tg",
    },
  ];

  const faqQuestions = [
    {
      question: "Comment créer un compte vendeur ?",
      answer:
        "Inscrivez-vous normalement puis activez le statut vendeur dans votre profil. Une vérification d'identité sera demandée.",
    },
    {
      question: "Quels sont les frais de transaction ?",
      answer:
        "Les achats sont gratuits. Les vendeurs paient 5% de commission uniquement sur les ventes réussies.",
    },
    {
      question: "Comment sont protégés mes paiements ?",
      answer:
        "Nous utilisons des systèmes de paiement sécurisés et une garantie acheteur pour protéger toutes les transactions.",
    },
    {
      question: "Puis-je annuler une enchère ?",
      answer:
        "Les enchères sont généralement irrévocables. Contactez-nous rapidement en cas d'erreur pour étudier votre cas.",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulation d'envoi
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitStatus("success");
      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: "",
        priority: "normal",
      });

      // Réinitialiser le statut après 5 secondes
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error("Erreur envoi formulaire:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Nous sommes là pour vous aider
              <ChatBubbleLeftRightIcon className="w-4 h-4 ml-2" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Contactez{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                nous
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-blue-100">
              Notre équipe est à votre disposition pour répondre à toutes vos
              questions et vous accompagner dans votre expérience BidHub.
            </p>

            {/* Contact rapide */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <a
                href={`tel:${contactInfo.phone}`}
                className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <PhoneIcon className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="font-medium mb-1">Appelez-nous</p>
                <p className="text-sm text-blue-200 group-hover:text-white transition-colors">
                  {contactInfo.phone}
                </p>
              </a>

              <a
                href={`mailto:${contactInfo.email}`}
                className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <EnvelopeIcon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="font-medium mb-1">Email</p>
                <p className="text-sm text-blue-200 group-hover:text-white transition-colors">
                  {contactInfo.email}
                </p>
              </a>

              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(
                  /\D/g,
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="font-medium mb-1">WhatsApp</p>
                <p className="text-sm text-blue-200 group-hover:text-white transition-colors">
                  Chat direct
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Moyens de contact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Comment nous{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                contacter
              </span>{" "}
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez le moyen qui vous convient le mieux selon votre besoin
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactReasons.map((reason, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${reason.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <reason.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {reason.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {reason.description}
                </p>

                <a
                  href={`mailto:${reason.email}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  {reason.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire de contact et informations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Formulaire de contact */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Envoyez-nous un message
              </h2>

              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                    <p className="text-green-800 font-medium">
                      Message envoyé avec succès ! Nous vous répondrons
                      rapidement.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3" />
                    <p className="text-red-800 font-medium">
                      Erreur lors de l'envoi. Veuillez réessayer ou nous appeler
                      directement.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+228 XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      name="category"
                      value={contactForm.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Choisir une catégorie</option>
                      <option value="support">Support technique</option>
                      <option value="general">Question générale</option>
                      <option value="report">Signalement</option>
                      <option value="partnership">Partenariat</option>
                      <option value="feedback">Suggestion/Feedback</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Résumé de votre demande"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={contactForm.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="low">Basse - Réponse sous 48h</option>
                    <option value="normal">Normale - Réponse sous 24h</option>
                    <option value="high">Haute - Réponse sous 12h</option>
                    <option value="urgent">Urgente - Réponse sous 4h</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Décrivez votre demande en détail..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 caractères. Soyez précis pour une réponse plus
                    rapide.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !contactForm.name ||
                    !contactForm.email ||
                    !contactForm.subject ||
                    !contactForm.category ||
                    !contactForm.message
                  }
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Envoi en cours...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <EnvelopeIcon className="w-5 h-5 mr-2" />
                      Envoyer le message
                      <SparklesIcon className="w-5 h-5 ml-2" />
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Informations et FAQ */}
            <div className="space-y-12">
              {/* Informations de contact */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl border border-blue-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations de contact
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <MapPinIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Adresse
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <PhoneIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Téléphone
                      </h4>
                      <p className="text-gray-600 text-sm">
                        <a
                          href={`tel:${contactInfo.phone}`}
                          className="hover:text-green-600 transition-colors"
                        >
                          {contactInfo.phone}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <EnvelopeIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Email
                      </h4>
                      <p className="text-gray-600 text-sm">
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="hover:text-purple-600 transition-colors"
                        >
                          {contactInfo.email}
                        </a>
                      </p>
                      <p className="text-gray-600 text-sm">
                        Support:{" "}
                        <a
                          href={`mailto:${contactInfo.supportEmail}`}
                          className="hover:text-purple-600 transition-colors"
                        >
                          {contactInfo.supportEmail}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <ClockIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Horaires
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {contactInfo.businessHours}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {contactInfo.weekendHours}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {contactInfo.responseTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ rapide */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Questions fréquentes
                </h3>

                <div className="space-y-4">
                  {faqQuestions.map((faq, index) => (
                    <details
                      key={index}
                      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {faq.question}
                        </h4>
                        <div className="text-gray-400 group-open:rotate-45 transition-transform duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </div>
                      </summary>
                      <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <a
                    href="/faq"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <QuestionMarkCircleIcon className="w-4 h-4 mr-2" />
                    Voir toutes les FAQ
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section GCSGC Agency */}
      <section className="py-20 bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-yellow-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mb-6">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Développé par{" "}
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  GCSGC Agency
                </span>
              </h2>

              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                BidHub est fièrement développé par GCSGC Agency, une agence
                digitale togolaise spécialisée dans la création de solutions web
                innovantes et sur mesure.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <BuildingOffice2Icon className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Expertise technique
                  </h3>
                  <p className="text-sm text-gray-600">
                    Développement web, applications mobiles, solutions digitales
                    complètes
                  </p>
                </div>

                <div className="text-center">
                  <HeartIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Made in Togo
                  </h3>
                  <p className="text-sm text-gray-600">
                    Conçu au Togo avec passion pour promouvoir l'innovation
                    locale
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
                <SparklesIcon className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Une question urgente ?
          </h2>

          <p className="text-xl mb-12 max-w-3xl mx-auto text-blue-100">
            Notre équipe support est disponible pour vous aider rapidement
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl transform hover:scale-105"
            >
              <span className="flex items-center text-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
                WhatsApp direct
                <SparklesIcon className="w-6 h-6 ml-2" />
              </span>
            </a>

            <a
              href={`tel:${contactInfo.phone}`}
              className="group px-10 py-5 border-2 border-white/30 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center text-lg">
                <PhoneIcon className="w-6 h-6 mr-2" />
                Appeler maintenant
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
