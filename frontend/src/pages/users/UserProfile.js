import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import UserReputation from "../../components/reputation/UserReputation";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Récupérer les informations utilisateur
      const userResponse = await axios.get(
        `http://localhost:5000/api/users/public/${userId}`
      );
      setUser(userResponse.data);

      // Récupérer les produits actifs de l'utilisateur
      const productsResponse = await axios.get(
        `http://localhost:5000/api/products?sellerId=${userId}&status=active`
      );
      setProducts(productsResponse.data.products || []);
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Utilisateur non trouvé
        </h1>
        <p className="text-gray-600">
          Ce profil n'existe pas ou n'est plus accessible.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header du profil */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.firstName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-600">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 capitalize">
              {user.role === "seller" ? "Vendeur" : "Utilisateur"}
            </p>
            <p className="text-sm text-gray-500">
              Membre depuis{" "}
              {new Date(user.createdAt).toLocaleDateString("fr-FR")}
            </p>

            {/* Réputation compacte */}
            <div className="mt-3">
              <UserReputation userId={user.id} showDetails={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {["about", "products", "reputation"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "about"
                ? "À propos"
                : tab === "products"
                ? `Produits (${products.length})`
                : "Réputation"}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === "about" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">À propos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Informations générales
                  </h3>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <p>
                      Rôle: {user.role === "seller" ? "Vendeur" : "Acheteur"}
                    </p>
                    <p>
                      Membre depuis:{" "}
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                    {user.isVerified && (
                      <p className="flex items-center">
                        <span className="text-green-600 mr-1">✓</span>
                        Profil vérifié
                      </p>
                    )}
                  </div>
                </div>

                {user.role === "seller" && (
                  <div>
                    <h3 className="font-medium text-gray-900">
                      En tant que vendeur
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {products.length} produits actuellement en vente
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Produits en vente</h2>
              {products.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-2">📦</div>
                  <p className="text-gray-500">
                    Aucun produit en vente actuellement
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {products.slice(0, 8).map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <Link
                        to={`/auction/${product.auction?.id || product.id}`}
                      >
                        <div className="aspect-w-16 aspect-h-12">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={`http://localhost:5000/uploads/products/${product.images[0]}`}
                              alt={product.title}
                              className="w-full h-32 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded-t-lg flex items-center justify-center">
                              <span className="text-gray-400">Pas d'image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-2">
                            {product.title}
                          </h3>
                          {product.auction && (
                            <p className="text-primary-600 font-semibold">
                              {formatPrice(product.auction.currentPrice)}
                            </p>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reputation" && (
            <UserReputation userId={user.id} showDetails={true} />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {activeTab !== "reputation" && (
            <UserReputation userId={user.id} showDetails={true} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
