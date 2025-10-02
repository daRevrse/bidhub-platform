// frontend/src/components/admin/SellerRequestsManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const SellerRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    businessType: "",
    search: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "approve" ou "reject"
  const [actionForm, setActionForm] = useState({
    adminNotes: "",
    rejectionReason: "",
  });
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [currentPage, filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters,
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/seller-requests?${params}`
      );

      setRequests(response.data.requests);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Erreur chargement demandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/seller-requests/stats`
      );
      setStats(response.data);
    } catch (error) {
      console.error("Erreur chargement statistiques:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const openRequestDetails = async (requestId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/seller-requests/${requestId}`
      );
      setSelectedRequest(response.data.request);
      setShowModal(true);
    } catch (error) {
      console.error("Erreur chargement détails:", error);
    }
  };

  const handleAction = async (type) => {
    setActionType(type);
    // Les autres actions seront gérées dans la modal
  };

  const submitAction = async () => {
    try {
      const endpoint = actionType === "approve" ? "approve" : "reject";
      const data =
        actionType === "approve"
          ? { adminNotes: actionForm.adminNotes }
          : {
              rejectionReason: actionForm.rejectionReason,
              adminNotes: actionForm.adminNotes,
            };

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/seller-requests/${selectedRequest.id}/${endpoint}`,
        data
      );

      setShowModal(false);
      setSelectedRequest(null);
      setActionForm({ adminNotes: "", rejectionReason: "" });
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error("Erreur traitement demande:", error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    const labels = {
      pending: "En attente",
      approved: "Approuvée",
      rejected: "Rejetée",
      cancelled: "Annulée",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getBusinessTypeLabel = (type) => {
    const labels = {
      individual: "Particulier",
      company: "Entreprise",
      association: "Association",
      other: "Autre",
    };
    return labels[type] || type;
  };

  return (
    <>
      <div className="p-6">
        {/* En-tête avec statistiques */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Demandes de Vendeur
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      En attente
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pending || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approuvées
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.approved || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XMarkIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rejetées
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.rejected || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Taux d'approbation
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.approvalRate || 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <input
                type="text"
                placeholder="Nom, email..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvées</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'activité
              </label>
              <select
                value={filters.businessType}
                onChange={(e) =>
                  handleFilterChange("businessType", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="individual">Particulier</option>
                <option value="company">Entreprise</option>
                <option value="association">Association</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ status: "", businessType: "", search: "" });
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Demandeur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type d'activité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de soumission
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={
                                request.user.avatar ||
                                `https://ui-avatars.com/api/?name=${request.user.firstName}+${request.user.lastName}&background=3B82F6&color=fff`
                              }
                              alt=""
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.user.firstName} {request.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {getBusinessTypeLabel(request.businessType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(request.submittedAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openRequestDetails(request.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Voir les détails"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {request.status === "pending" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    handleAction("approve");
                                  }}
                                  className="text-green-600 hover:text-green-900 p-1 rounded"
                                  title="Approuver"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    handleAction("reject");
                                  }}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Rejeter"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de détails/actions */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType
                    ? actionType === "approve"
                      ? "Approuver la demande"
                      : "Rejeter la demande"
                    : "Détails de la demande"}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setActionType("");
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {!actionType ? (
                // Affichage des détails
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Demandeur
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedRequest.user.firstName}{" "}
                        {selectedRequest.user.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedRequest.user.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description de l'activité
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRequest.businessDescription}
                    </p>
                  </div>

                  {selectedRequest.businessName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom de l'entreprise
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedRequest.businessName}
                      </p>
                    </div>
                  )}

                  {selectedRequest.status === "pending" && (
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => handleAction("approve")}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleAction("reject")}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Formulaire d'action
                <div className="space-y-4">
                  {actionType === "reject" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raison du rejet *
                      </label>
                      <textarea
                        value={actionForm.rejectionReason}
                        onChange={(e) =>
                          setActionForm((prev) => ({
                            ...prev,
                            rejectionReason: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Expliquez pourquoi cette demande est rejetée..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes administratives (optionnel)
                    </label>
                    <textarea
                      value={actionForm.adminNotes}
                      onChange={(e) =>
                        setActionForm((prev) => ({
                          ...prev,
                          adminNotes: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Notes internes..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setActionType("")}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={submitAction}
                      disabled={
                        actionType === "reject" && !actionForm.rejectionReason
                      }
                      className={`flex-1 px-4 py-2 rounded-md transition-colors text-white ${
                        actionType === "approve"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {actionType === "approve"
                        ? "Confirmer l'approbation"
                        : "Confirmer le rejet"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerRequestsManagement;
