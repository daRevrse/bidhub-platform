// frontend/src/pages/Home.js - VERSION AMÉLIORÉE GCSGC Agency
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  TrophyIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  HandRaisedIcon,
  EyeIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { FireIcon, BoltIcon, GiftIcon } from "@heroicons/react/24/solid";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // États pour les données dynamiques
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeUsers: 0,
    successfulSales: 0,
    totalBids: 0,
  });
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage
  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Charger les enchères populaires
      const auctionsResponse = await axios.get(
        "http://localhost:5000/api/auctions?status=active&limit=6&featured=true"
      );
      setFeaturedAuctions(auctionsResponse.data.auctions || []);

      // Charger les statistiques
      const statsResponse = await axios.get(
        "http://localhost:5000/api/stats/home"
      );
      setStats(statsResponse.data || stats);

      // Témoignages statiques (ou depuis API)
      setTestimonials([
        {
          id: 1,
          name: "Kofi Mensah",
          role: "Collectionneur",
          avatar: "/images/testimonial1.jpg",
          content:
            "BidHub a révolutionné ma façon d'acheter des objets de collection. Interface intuitive et sécurité optimale !",
          rating: 5,
          location: "Lomé",
        },
        {
          id: 2,
          name: "Afia Asante",
          role: "Entrepreneure",
          avatar: "/images/testimonial2.jpg",
          content:
            "Grâce à BidHub, j'ai pu vendre mes créations artisanales à des prix équitables. La communauté est fantastique !",
          rating: 5,
          location: "Kara",
        },
        {
          id: 3,
          name: "Emmanuel Koffi",
          role: "Acheteur régulier",
          avatar: "/images/testimonial3.jpg",
          content:
            "Des enchères transparentes et un service client réactif. BidHub est devenu ma plateforme de référence.",
          rating: 5,
          location: "Kpalimé",
        },
      ]);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchTerm = formData.get("search");
    if (searchTerm?.trim()) {
      navigate(`/auctions?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section Amélioré */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            {/* Badge GCSGC */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Une création GCSGC Agency
              <SparklesIcon className="w-4 h-4 ml-2" />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Bienvenue sur{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                BidHub
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto leading-relaxed text-blue-100">
              La première plateforme d'enchères en ligne au{" "}
              <span className="font-semibold text-white">Togo</span>. Achetez et
              vendez en toute{" "}
              <span className="font-semibold text-yellow-300">confiance</span>{" "}
              avec des milliers d'utilisateurs passionnés.
            </p>

            {/* Barre de recherche Hero */}
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto mb-10"
            >
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Rechercher des enchères, produits, catégories..."
                  className="w-full px-6 py-4 pl-14 pr-32 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300/50 text-lg shadow-xl"
                />
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  Chercher
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auctions"
                className="group px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 font-bold rounded-2xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 shadow-2xl transform hover:scale-105"
              >
                <span className="flex items-center">
                  <FireIcon className="w-5 h-5 mr-2" />
                  Voir les enchères
                  <ArrowTrendingUpIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to={user ? "/create-product" : "/register"}
                className="group px-8 py-4 border-2 border-white/30 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center">
                  <HandRaisedIcon className="w-5 h-5 mr-2" />
                  {user ? "Vendre maintenant" : "Commencer à vendre"}
                  <BoltIcon className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </span>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                label: "Enchères actives",
                value: stats.totalAuctions,
                icon: HandRaisedIcon,
              },
              {
                label: "Utilisateurs actifs",
                value: stats.activeUsers,
                icon: UsersIcon,
              },
              {
                label: "Ventes réussies",
                value: stats.successfulSales,
                icon: CheckBadgeIcon,
              },
              {
                label: "Offres placées",
                value: stats.totalBids,
                icon: TrophyIcon,
              },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stat.value.toLocaleString()}+
                </div>
                <div className="text-sm text-blue-200 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi choisir{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BidHub
              </span>{" "}
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez les avantages qui font de BidHub la plateforme
              d'enchères de référence au Togo, développée avec expertise par
              GCSGC Agency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheckIcon,
                title: "Sécurité garantie",
                description:
                  "Transactions sécurisées avec vérification d'identité et système de paiement protégé. Votre confiance est notre priorité.",
                color: "from-green-500 to-emerald-600",
              },
              {
                icon: ClockIcon,
                title: "Enchères en temps réel",
                description:
                  "Participez aux enchères en direct avec notifications instantanées et mises à jour automatiques.",
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: TrophyIcon,
                title: "Système de réputation",
                description:
                  "Vendeurs et acheteurs certifiés avec système de badges et d'évaluations communautaires.",
                color: "from-yellow-500 to-orange-600",
              },
              {
                icon: UsersIcon,
                title: "Communauté active",
                description:
                  "Rejoignez une communauté passionnée de collectionneurs et d'entrepreneurs togolais.",
                color: "from-purple-500 to-pink-600",
              },
              {
                icon: ChatBubbleLeftRightIcon,
                title: "Support 24/7",
                description:
                  "Équipe de support dédiée pour vous accompagner à chaque étape de vos transactions.",
                color: "from-indigo-500 to-blue-600",
              },
              {
                icon: HandRaisedIcon,
                title: "Enchères variées",
                description:
                  "Large gamme de produits : art, électronique, véhicules, objets de collection et bien plus.",
                color: "from-red-500 to-rose-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-transparent"
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
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

      {/* Featured Auctions Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Enchères du moment 🔥
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez une sélection d'enchères populaires et ne manquez pas
              les meilleures opportunités !
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-lg animate-pulse"
                >
                  <div className="bg-gray-300 h-48 rounded-xl mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredAuctions.map((auction) => (
                <Link
                  key={auction.id}
                  to={`/auction/${auction.id}`}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={
                        auction.product?.images?.[0] ||
                        "/images/placeholder.jpg"
                      }
                      alt={auction.product?.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                        <ClockIcon className="w-3 h-3 inline mr-1" />
                        Se termine bientôt
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {auction.product?.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {auction.product?.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Enchère actuelle
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {auction.currentBid?.toLocaleString() ||
                            auction.startingPrice?.toLocaleString()}{" "}
                          FCFA
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Offres</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {auction.bidCount || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Termine dans {auction.timeRemaining || "2h 15min"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/auctions"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl transform hover:scale-105"
            >
              Voir toutes les enchères
              <ArrowTrendingUpIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ils nous font confiance 💬
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les témoignages de notre communauté d'utilisateurs
              satisfaits à travers le Togo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100"
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>

                <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
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

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Prêt à découvrir{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              BidHub
            </span>{" "}
            ?
          </h2>

          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-blue-100">
            Rejoignez des milliers d'utilisateurs qui font déjà confiance à
            notre plateforme pour leurs achats et ventes aux enchères.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/register"
              className="group px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-600 text-gray-900 font-bold rounded-2xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 shadow-2xl transform hover:scale-105"
            >
              <span className="flex items-center text-lg">
                <GiftIcon className="w-6 h-6 mr-2" />
                Créer mon compte gratuitement
                <ArrowTrendingUpIcon className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              to="/how-it-works"
              className="group px-10 py-5 border-2 border-white/30 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center text-lg">
                <EyeIcon className="w-6 h-6 mr-2" />
                Comment ça marche
              </span>
            </Link>
          </div>

          {/* GCSGC Agency Credit */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-sm text-blue-200">
              BidHub est fièrement développé par{" "}
              <span className="font-semibold text-white">GCSGC Agency</span> -
              Votre partenaire digital d'excellence au Togo
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
