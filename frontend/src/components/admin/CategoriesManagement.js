// frontend/src/components/admin/CategoriesManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#3B82F6",
    parentId: "",
    isActive: true,
    sortOrder: 0,
  });

  const defaultIcons = [
    "DevicePhoneMobileIcon",
    "TruckIcon",
    "SparklesIcon",
    "HomeIcon",
    "PaintBrushIcon",
    "Trophy",
    "BookOpenIcon",
    "GemIcon",
    "MusicalNoteIcon",
    "EllipsisHorizontalIcon",
  ];

  const defaultColors = [
    "#3B82F6",
    "#DC2626",
    "#EC4899",
    "#10B981",
    "#7C2D12",
    "#F59E0B",
    "#6366F1",
    "#A855F7",
    "#059669",
    "#6B7280",
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/categories?includeInactive=true&withStats=true"
      );
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(
          `http://localhost:5000/api/categories/${editingCategory.id}`,
          formData
        );
      } else {
        await axios.post("http://localhost:5000/api/categories", formData);
      }

      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "",
        color: "#3B82F6",
        parentId: "",
        isActive: true,
        sortOrder: 0,
      });
      fetchCategories();
    } catch (error) {
      console.error("Erreur sauvegarde catégorie:", error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#3B82F6",
      parentId: category.parentId || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (category) => {
    try {
      await axios.put(
        `http://localhost:5000/api/categories/${category.id}/toggle-status`
      );
      fetchCategories();
    } catch (error) {
      console.error("Erreur changement statut:", error);
    }
  };

  const handleDelete = async (category) => {
    if (
      window.confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)
    ) {
      try {
        await axios.delete(
          `http://localhost:5000/api/categories/${category.id}`
        );
        fetchCategories();
      } catch (error) {
        console.error("Erreur suppression catégorie:", error);
        alert(error.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "#3B82F6",
      parentId: "",
      isActive: true,
      sortOrder: 0,
    });
    setShowModal(true);
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Catégories
          </h1>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle catégorie
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statistiques
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordre
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                            style={{ backgroundColor: category.color }}
                          >
                            <TagIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.stats && (
                          <div>
                            <div>{category.stats.productCount} produits</div>
                            <div>
                              {category.stats.activeAuctionsCount} enchères
                              actives
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.sortOrder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Modifier"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(category)}
                            className={`p-1 rounded ${
                              category.isActive
                                ? "text-orange-600 hover:text-orange-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            title={category.isActive ? "Désactiver" : "Activer"}
                          >
                            {category.isActive ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <form onSubmit={handleSubmit}>
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCategory
                    ? "Modifier la catégorie"
                    : "Nouvelle catégorie"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icône
                      </label>
                      <select
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            icon: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner une icône</option>
                        {defaultIcons.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                          className="w-12 h-10 border border-gray-300 rounded-md"
                        />
                        <div className="flex flex-wrap gap-1">
                          {defaultColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, color }))
                              }
                              className="w-6 h-6 rounded border-2 border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie parent
                      </label>
                      <select
                        value={formData.parentId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parentId: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Aucune (catégorie principale)</option>
                        {categories
                          .filter((cat) => cat.id !== editingCategory?.id)
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ordre d'affichage
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sortOrder: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Catégorie active
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingCategory ? "Mettre à jour" : "Créer"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesManagement;
