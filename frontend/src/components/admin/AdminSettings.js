import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  CurrencyDollarIcon,
  ClockIcon,
  EnvelopeIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchSystemHealth();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Pour le développement, utilisons des données par défaut
      setSettings({
        general: {
          siteName: "BidHub",
          siteDescription: "Plateforme d'enchères en ligne au Togo",
          contactEmail: "contact@bidhub.tg",
          supportEmail: "support@bidhub.tg",
          maintenanceMode: false,
          registrationEnabled: true,
        },
        auction: {
          minBidIncrement: 100,
          maxAuctionDuration: 30, // jours
          commissionRate: 10, // pourcentage
          autoExtendTime: 300, // secondes
          maxImagesPerProduct: 5,
          bidderVerificationRequired: false,
        },
        payment: {
          floozEnabled: true,
          tmoneyEnabled: true,
          minPaymentAmount: 500,
          maxPaymentAmount: 5000000,
          paymentTimeout: 600, // secondes
          autoRefundEnabled: true,
        },
        notification: {
          emailNotificationsEnabled: true,
          smsNotificationsEnabled: false,
          auctionEndReminder: 3600, // secondes avant fin
          bidNotifications: true,
          systemNotifications: true,
        },
        security: {
          maxLoginAttempts: 5,
          accountLockoutDuration: 1800, // secondes
          passwordMinLength: 8,
          requireEmailVerification: true,
          twoFactorEnabled: false,
          sessionTimeout: 7200, // secondes
        },
      });
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/system-health"
      );
      setSystemHealth(response.data);
    } catch (error) {
      console.error("Erreur récupération état système:", error);
      // Données de fallback
      setSystemHealth({
        database: "online",
        server: "online",
        email: "online",
        storage: "online",
        lastCheck: new Date().toISOString(),
        uptime: 86400,
        memory: { used: 256000000, total: 1000000000 },
      });
    }
  };

  const saveSettings = async (category, data) => {
    try {
      setSaving(true);
      await axios.put(
        `http://localhost:5000/api/admin/settings/${category}`,
        data
      );
      setSettings((prev) => ({ ...prev, [category]: data }));
      alert("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Erreur sauvegarde paramètres:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const getHealthStatus = (status) => {
    switch (status) {
      case "online":
        return {
          icon: CheckCircleIcon,
          color: "text-green-600",
          bg: "bg-green-100",
        };
      case "offline":
        return { icon: XCircleIcon, color: "text-red-600", bg: "bg-red-100" };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
        };
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Paramètres administrateur
            </h1>
            <p className="text-gray-600">
              Configuration et gestion du système BidHub
            </p>
          </div>
          <button
            onClick={() => fetchSystemHealth()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: "general", label: "Général", icon: Cog6ToothIcon },
            { key: "auctions", label: "Enchères", icon: ShieldCheckIcon },
            { key: "payments", label: "Paiements", icon: CurrencyDollarIcon },
            { key: "notifications", label: "Notifications", icon: BellIcon },
            { key: "security", label: "Sécurité", icon: ShieldCheckIcon },
            { key: "system", label: "Système", icon: ServerIcon },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "general" && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Paramètres généraux
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={settings.general?.siteName || ""}
                  onChange={(e) =>
                    updateSetting("general", "siteName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={settings.general?.contactEmail || ""}
                  onChange={(e) =>
                    updateSetting("general", "contactEmail", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du site
                </label>
                <textarea
                  rows={3}
                  value={settings.general?.siteDescription || ""}
                  onChange={(e) =>
                    updateSetting("general", "siteDescription", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de support
                </label>
                <input
                  type="email"
                  value={settings.general?.supportEmail || ""}
                  onChange={(e) =>
                    updateSetting("general", "supportEmail", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.general?.maintenanceMode || false}
                  onChange={(e) =>
                    updateSetting(
                      "general",
                      "maintenanceMode",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Mode maintenance (désactive l'accès public)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.general?.registrationEnabled || false}
                  onChange={(e) =>
                    updateSetting(
                      "general",
                      "registrationEnabled",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Autoriser les nouvelles inscriptions
                </label>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => saveSettings("general", settings.general)}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "auctions" && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Configuration des enchères
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incrément minimum des offres (FCFA)
                </label>
                <input
                  type="number"
                  value={settings.auction?.minBidIncrement || 0}
                  onChange={(e) =>
                    updateSetting(
                      "auction",
                      "minBidIncrement",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée maximale d'enchère (jours)
                </label>
                <input
                  type="number"
                  value={settings.auction?.maxAuctionDuration || 0}
                  onChange={(e) =>
                    updateSetting(
                      "auction",
                      "maxAuctionDuration",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de commission (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.auction?.commissionRate || 0}
                  onChange={(e) =>
                    updateSetting(
                      "auction",
                      "commissionRate",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temps d'extension auto (secondes)
                </label>
                <input
                  type="number"
                  value={settings.auction?.autoExtendTime || 0}
                  onChange={(e) =>
                    updateSetting(
                      "auction",
                      "autoExtendTime",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre max d'images par produit
                </label>
                <input
                  type="number"
                  value={settings.auction?.maxImagesPerProduct || 0}
                  onChange={(e) =>
                    updateSetting(
                      "auction",
                      "maxImagesPerProduct",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    settings.auction?.bidderVerificationRequired || false
                  }
                  onChange={(e) =>
                    updateSetting(
                      "auction",
                      "bidderVerificationRequired",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Exiger la vérification pour enchérir
                </label>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => saveSettings("auction", settings.auction)}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Configuration des paiements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant minimum (FCFA)
                </label>
                <input
                  type="number"
                  value={settings.payment?.minPaymentAmount || 0}
                  onChange={(e) =>
                    updateSetting(
                      "payment",
                      "minPaymentAmount",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant maximum (FCFA)
                </label>
                <input
                  type="number"
                  value={settings.payment?.maxPaymentAmount || 0}
                  onChange={(e) =>
                    updateSetting(
                      "payment",
                      "maxPaymentAmount",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout paiement (secondes)
                </label>
                <input
                  type="number"
                  value={settings.payment?.paymentTimeout || 0}
                  onChange={(e) =>
                    updateSetting(
                      "payment",
                      "paymentTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.payment?.floozEnabled || false}
                  onChange={(e) =>
                    updateSetting("payment", "floozEnabled", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Activer les paiements Flooz
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.payment?.tmoneyEnabled || false}
                  onChange={(e) =>
                    updateSetting("payment", "tmoneyEnabled", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Activer les paiements T-Money
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.payment?.autoRefundEnabled || false}
                  onChange={(e) =>
                    updateSetting(
                      "payment",
                      "autoRefundEnabled",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Remboursement automatique activé
                </label>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => saveSettings("payment", settings.payment)}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Configuration des notifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rappel fin d'enchère (secondes avant)
                </label>
                <input
                  type="number"
                  value={settings.notification?.auctionEndReminder || 0}
                  onChange={(e) =>
                    updateSetting(
                      "notification",
                      "auctionEndReminder",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    settings.notification?.emailNotificationsEnabled || false
                  }
                  onChange={(e) =>
                    updateSetting(
                      "notification",
                      "emailNotificationsEnabled",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Notifications email activées
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    settings.notification?.smsNotificationsEnabled || false
                  }
                  onChange={(e) =>
                    updateSetting(
                      "notification",
                      "smsNotificationsEnabled",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Notifications SMS activées
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notification?.bidNotifications || false}
                  onChange={(e) =>
                    updateSetting(
                      "notification",
                      "bidNotifications",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Notifier les nouvelles offres
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notification?.systemNotifications || false}
                  onChange={(e) =>
                    updateSetting(
                      "notification",
                      "systemNotifications",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Notifications système activées
                </label>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() =>
                  saveSettings("notification", settings.notification)
                }
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Paramètres de sécurité
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tentatives de connexion max
                </label>
                <input
                  type="number"
                  value={settings.security?.maxLoginAttempts || 0}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "maxLoginAttempts",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée blocage compte (secondes)
                </label>
                <input
                  type="number"
                  value={settings.security?.accountLockoutDuration || 0}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "accountLockoutDuration",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longueur minimale mot de passe
                </label>
                <input
                  type="number"
                  value={settings.security?.passwordMinLength || 0}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "passwordMinLength",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout session (secondes)
                </label>
                <input
                  type="number"
                  value={settings.security?.sessionTimeout || 0}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "sessionTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security?.requireEmailVerification || false}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "requireEmailVerification",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Exiger la vérification email
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security?.twoFactorEnabled || false}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "twoFactorEnabled",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Authentification à deux facteurs (2FA)
                </label>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => saveSettings("security", settings.security)}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "system" && (
        <div className="space-y-8">
          {/* État du système */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              État du système
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {["database", "server", "email", "storage"].map((service) => {
                const health = getHealthStatus(systemHealth[service]);
                const Icon = health.icon;

                return (
                  <div
                    key={service}
                    className="flex items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${health.bg} mr-3`}>
                      <Icon className={`w-6 h-6 ${health.color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {service}
                      </div>
                      <div className={`text-sm ${health.color}`}>
                        {systemHealth[service] === "online"
                          ? "En ligne"
                          : "Hors ligne"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Informations système */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Informations système
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">
                  Temps de fonctionnement
                </div>
                <div className="text-lg font-medium text-gray-900">
                  {formatUptime(systemHealth.uptime || 0)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">
                  Dernière vérification
                </div>
                <div className="text-lg font-medium text-gray-900">
                  {systemHealth.lastCheck
                    ? new Date(systemHealth.lastCheck).toLocaleString("fr-FR")
                    : "Jamais"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Mémoire utilisée</div>
                <div className="text-lg font-medium text-gray-900">
                  {systemHealth.memory
                    ? `${formatBytes(systemHealth.memory.used)} / ${formatBytes(
                        systemHealth.memory.total
                      )}`
                    : "N/A"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Version Node.js</div>
                <div className="text-lg font-medium text-gray-900">
                  {process?.version || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Actions système */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Actions système
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ServerIcon className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Redémarrer serveur
                </span>
              </button>

              <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowPathIcon className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Vider le cache
                </span>
              </button>

              <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <EnvelopeIcon className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Test email
                </span>
              </button>

              <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ShieldCheckIcon className="w-8 h-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Sauvegarder DB
                </span>
              </button>

              <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ClockIcon className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Logs système
                </span>
              </button>

              <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ExclamationTriangleIcon className="w-8 h-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Mode maintenance
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
