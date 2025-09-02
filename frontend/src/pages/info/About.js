// frontend/src/pages/info/About.js - Page À propos
import React from "react";
import { Link } from "react-router-dom";
import {
  HeartIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UsersIcon,
  TrophyIcon,
  SparklesIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

const About = () => {
  const stats = [
    {
      label: "Utilisateurs actifs",
      value: "50K+",
      icon: UsersIcon,
      color: "from-blue-500 to-cyan-600",
    },
    {
      label: "Enchères réussies",
      value: "125K+",
      icon: TrophyIcon,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Villes couvertes",
      value: "15+",
      icon: MapPinIcon,
      color: "from-purple-500 to-pink-600",
    },
    {
      label: "Satisfaction client",
      value: "98%",
      icon: CheckBadgeIcon,
      color: "from-yellow-500 to-orange-600",
    },
  ];

  const values = [
    {
      icon: ShieldCheckIcon,
      title: "Confiance & Sécurité",
      description:
        "Nous privilégions la sécurité de nos utilisateurs avec des transactions protégées et une vérification rigoureuse des identités.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: HeartIcon,
      title: "Passion & Communauté",
      description:
        "Nous créons un environnement où les passionnés peuvent partager leur amour pour les objets uniques et les collections.",
      color: "from-red-500 to-pink-600",
    },
    {
      icon: LightBulbIcon,
      title: "Innovation & Simplicité",
      description:
        "Nous développons des solutions technologiques innovantes tout en gardant une interface simple et accessible à tous.",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: GlobeAltIcon,
      title: "Impact Local",
      description:
        "Nous contribuons au développement de l'économie numérique togolaise en connectant acheteurs et vendeurs locaux.",
      color: "from-blue-500 to-purple-600",
    },
  ];

  const timeline = [
    {
      year: "2023",
      title: "Conception & Développement",
      description:
        "GCSGC Agency commence le développement de BidHub avec une vision claire : créer la première plateforme d'enchères moderne au Togo.",
      icon: LightBulbIcon,
      color: "from-blue-500 to-cyan-600",
    },
    {
      year: "2024",
      title: "Lancement Beta",
      description:
        "Lancement en version beta avec les premiers utilisateurs testeurs. Intégration des retours pour améliorer l'expérience utilisateur.",
      icon: RocketLaunchIcon,
      color: "from-purple-500 to-pink-600",
    },
    {
      year: "2024",
      title: "Version Publique",
      description:
        "Ouverture officielle au public avec toutes les fonctionnalités : enchères temps réel, paiements sécurisés, système de réputation.",
      icon: TrophyIcon,
      color: "from-green-500 to-emerald-600",
    },
    {
      year: "2025",
      title: "Expansion & Croissance",
      description:
        "Extension à toutes les régions du Togo et ajout de nouvelles fonctionnalités basées sur les besoins de notre communauté grandissante.",
      icon: SparklesIcon,
      color: "from-yellow-500 to-orange-600",
    },
  ];

  const team = [
    {
      name: "GCSGC Agency",
      role: "Développeur & Créateur",
      description:
        "L'équipe passionnée derrière BidHub, spécialisée dans le développement d'applications web modernes et innovantes.",
      avatar: "/images/gcsgc-logo.jpg",
      website: "https://darevrse.github.io/site-gcsgc-agency/",
      skills: [
        "React.js",
        "Node.js",
        "Design UX/UI",
        "Développement Full-Stack",
      ],
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
              <HeartIcon className="w-4 h-4 mr-2" />
              Fait avec passion au Togo
              <HeartIcon className="w-4 h-4 ml-2" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              À propos de{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                BidHub
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-blue-100">
              Nous sommes la première plateforme d'enchères en ligne du Togo,
              créée pour connecter les passionnés d'objets uniques et développer
              l'économie numérique locale.
            </p>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl mb-3`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-blue-200 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Notre{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  mission
                </span>
              </h2>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">BidHub</strong> est née de
                  la vision de démocratiser les enchères au Togo en créant une
                  plateforme moderne, sécurisée et accessible à tous. Nous
                  croyons que chaque objet a une histoire et mérite de trouver
                  le bon propriétaire.
                </p>

                <p>
                  Notre mission est de{" "}
                  <strong className="text-blue-600">
                    connecter les communautés
                  </strong>
                  , de{" "}
                  <strong className="text-green-600">
                    valoriser les objets uniques
                  </strong>{" "}
                  et de
                  <strong className="text-purple-600">
                    {" "}
                    contribuer au développement
                  </strong>{" "}
                  de l'économie numérique togolaise.
                </p>

                <p>
                  Développée par{" "}
                  <strong className="text-orange-600">GCSGC Agency</strong>,
                  BidHub combine innovation technologique et compréhension
                  profonde du marché local pour offrir une expérience d'enchères
                  exceptionnelle.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl transform hover:scale-105"
                >
                  Découvrir comment ça marche
                  <SparklesIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                    <UsersIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Communauté
                  </h3>
                  <p className="text-sm text-gray-600">
                    Une communauté active de passionnés et collectionneurs
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Sécurité
                  </h3>
                  <p className="text-sm text-gray-600">
                    Transactions protégées et utilisateurs vérifiés
                  </p>
                </div>
              </div>

              <div className="space-y-6 mt-8">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                    <GlobeAltIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Local
                  </h3>
                  <p className="text-sm text-gray-600">
                    Conçu spécialement pour le marché togolais
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <LightBulbIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Innovation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Technologies modernes et interface intuitive
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nos{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                valeurs
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Les principes fondamentaux qui guident notre travail et nos
              relations avec notre communauté
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${value.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Notre{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                histoire
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Le parcours de BidHub depuis sa conception jusqu'à aujourd'hui
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full hidden md:block"></div>

            <div className="space-y-16">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } flex-col`}
                >
                  {/* Content */}
                  <div
                    className={`w-full md:w-5/12 ${
                      index % 2 === 0 ? "md:pr-8" : "md:pl-8"
                    }`}
                  >
                    <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                      <div className="flex items-center mb-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${item.color} mr-4`}
                        >
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {item.year}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Circle */}
                  <div className="hidden md:flex items-center justify-center w-2/12">
                    <div
                      className={`w-6 h-6 rounded-full bg-gradient-to-r ${item.color} border-4 border-white shadow-lg`}
                    ></div>
                  </div>

                  {/* Empty Space */}
                  <div className="hidden md:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* L'équipe GCSGC Agency */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Créé par{" "}
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                GCSGC Agency
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              L'équipe de développement passionnée derrière BidHub
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 md:p-12 rounded-3xl shadow-2xl border border-yellow-100 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                  <BuildingOffice2Icon className="w-12 h-12" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-lg text-orange-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                  {member.description}
                </p>

                {/* Compétences */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {member.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 text-sm font-medium rounded-full border border-orange-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <a
                  href={member.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-2xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-xl transform hover:scale-105"
                >
                  <GlobeAltIcon className="w-5 h-5 mr-2" />
                  Découvrir GCSGC Agency
                  <SparklesIcon className="w-5 h-5 ml-2" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement pour le Togo */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Fiers d'être{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Togolais
              </span>
            </h2>

            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              BidHub est plus qu'une plateforme d'enchères, c'est notre
              contribution au développement de l'écosystème numérique togolais.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <MapPinIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Made in Togo</h3>
                <p className="text-blue-100">
                  Conçu et développé au Togo pour les Togolais
                </p>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <UsersIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Emplois Locaux</h3>
                <p className="text-blue-100">
                  Création d'opportunités pour les développeurs togolais
                </p>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <GlobeAltIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Innovation Tech</h3>
                <p className="text-blue-100">
                  Promouvoir l'innovation technologique au Togo
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/register"
                className="group px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 font-bold rounded-2xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 shadow-2xl transform hover:scale-105"
              >
                <span className="flex items-center text-lg">
                  <HeartIcon className="w-6 h-6 mr-2" />
                  Rejoindre la communauté
                  <SparklesIcon className="w-6 h-6 ml-2" />
                </span>
              </Link>

              <Link
                to="/contact"
                className="group px-10 py-5 border-2 border-white/30 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center text-lg">
                  <BuildingOffice2Icon className="w-6 h-6 mr-2" />
                  Nous contacter
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
