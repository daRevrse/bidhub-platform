import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  CheckBadgeIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

const VerificationManagement = () => {
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState(""); // "approve" ou "reject"
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0,
  });

  useEffect(() => {
    fetchVerificationRequests();
  }, [pagination.currentPage]);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/admin/verification-requests?page=${pagination.currentPage}&limit=10`
      );
      setVerificationRequests(response.data.requests);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalRequests: response.data.totalRequests,
      });
    } catch (error) {
      console.error("Erreur récupération demandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowModal(true);
    if (action === "approve") {
      setRejectionReason("");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setActionType("");
    setRejectionReason("");
  };

  const handleVerificationAction = async () => {
    if (!selectedUser) return;

    setProcessing((prev) => ({ ...prev, [selectedUser.id]: true }));

    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${selectedUser.id}/verify`,
        {
          approve: actionType === "approve",
          reason: actionType === "reject" ? rejectionReason : null,
        }
      );

      // Retirer la demande de la liste
      setVerificationRequests((prev) =>
        prev.filter((req) => req.id !== selectedUser.id)
      );

      closeModal();
    } catch (error) {
      console.error("Erreur traitement vérification:", error);
      alert("Erreur lors du traitement de la demande");
    } finally {
      setProcessing((prev) => ({ ...prev, [selectedUser.id]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSinceRequest = (dateString) => {
    const now = new Date();
    const requestDate = new Date(dateString);
    const diffInHours = Math.floor((now - requestDate) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Demandes de vérification
        </h1>
        <p className="text-gray-600">
          Gérez les demandes de vérification de comptes utilisateurs
        </p>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-900">
                  {pagination.totalRequests}
                </p>
                <p className="text-yellow-700 text-sm">En attente</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckBadgeIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">-</p>
                <p className="text-green-700 text-sm">Approuvées aujourd'hui</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XMarkIcon className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-red-900">-</p>
                <p className="text-red-700 text-sm">Rejetées aujourd'hui</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {verificationRequests.length === 0 ? (
          <div className="text-center py-12">
            <CheckBadgeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-900 mb-2">
              Aucune demande en attente
            </p>
            <p className="text-gray-500">
              Toutes les demandes de vérification ont été traitées.
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">
                Demandes en attente ({pagination.totalRequests})
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {verificationRequests.map((user) => (
                <div
                  key={user.id}
                  className="px-6 py-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Informations utilisateur */}
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-lg font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.role === "seller" ? "Vendeur" : "Acheteur"}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-1" />
                            {user.email}
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            Membre depuis {formatDate(user.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {getTimeSinceRequest(user.verificationRequestedAt)}
                          </span>
                        </div>

                        {user.bio && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          window.open(`/user/${user.id}`, "_blank")
                        }
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Voir profil
                      </button>

                      <button
                        onClick={() => openModal(user, "reject")}
                        disabled={processing[user.id]}
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Rejeter
                      </button>

                      <button
                        onClick={() => openModal(user, "approve")}
                        disabled={processing[user.id]}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {processing[user.id] ? (
                          <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <CheckBadgeIcon className="w-4 h-4 mr-2" />
                        )}
                        Approuver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Page {pagination.currentPage} sur {pagination.totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmation */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              {actionType === "approve" ? (
                <CheckBadgeIcon className="w-8 h-8 text-green-600 mr-3" />
              ) : (
                <XMarkIcon className="w-8 h-8 text-red-600 mr-3" />
              )}
              <h3 className="text-lg font-medium text-gray-900">
                {actionType === "approve"
                  ? "Approuver la vérification"
                  : "Rejeter la demande"}
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              {actionType === "approve"
                ? `Êtes-vous sûr de vouloir vérifier le compte de ${selectedUser.firstName} ${selectedUser.lastName} ?`
                : `Pourquoi rejetez-vous la demande de ${selectedUser.firstName} ${selectedUser.lastName} ?`}
            </p>

            {actionType === "reject" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du rejet
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Expliquez pourquoi cette demande est rejetée..."
                  required
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleVerificationAction}
                disabled={actionType === "reject" && !rejectionReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionType === "approve" ? "Approuver" : "Rejeter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationManagement;
