import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/auth/reset-password-request",
        {
          email,
        }
      );
      setSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email envoyé !
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Vérifiez votre boîte de réception
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  Un email avec les instructions pour réinitialiser votre mot de
                  passe a été envoyé à <strong>{email}</strong>.
                </p>
              </div>

              <div className="text-sm text-gray-600">
                <p>Si vous ne recevez pas l'email dans les 5 minutes :</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                  <li>Vérifiez votre dossier spam/courrier indésirable</li>
                  <li>Assurez-vous d'avoir saisi la bonne adresse email</li>
                  <li>Contactez notre support si le problème persiste</li>
                </ul>
              </div>

              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Retour à la connexion
                </Link>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Renvoyer l'email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2V5a2 2 0 00-2-2m0 0H9.5a2.5 2.5 0 000 5H11"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Mot de passe oublié ?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Saisissez votre adresse email pour recevoir un lien de
            réinitialisation
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                <svg
                  className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Adresse email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Nous vous enverrons un lien sécurisé pour réinitialiser votre
                mot de passe
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Envoi en cours...
                  </div>
                ) : (
                  "Envoyer le lien de réinitialisation"
                )}
              </button>
            </div>

            <div className="text-center space-y-2">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
              >
                ← Retour à la connexion
              </Link>
              <div className="text-xs text-gray-500">
                Vous n'avez pas de compte ?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
