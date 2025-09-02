// frontend/src/components/common/ImageGallery.js
import React, { useState, useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

const ImageGallery = ({ images = [], alt = "Image" }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState({});

  const handleImageLoad = useCallback((index) => {
    setIsLoading((prev) => ({ ...prev, [index]: false }));
  }, []);

  const handleImageError = useCallback((index) => {
    setIsLoading((prev) => ({ ...prev, [index]: false }));
  }, []);

  const openModal = (index) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!showModal) return;

      switch (e.key) {
        case "ArrowRight":
          nextImage();
          break;
        case "ArrowLeft":
          prevImage();
          break;
        case "Escape":
          closeModal();
          break;
        default:
          break;
      }
    },
    [showModal]
  );

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  React.useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  if (!images || images.length === 0) {
    return (
      <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Aucune image disponible</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Image principale */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-w-16 aspect-h-9">
          <div className="relative w-full h-96">
            {isLoading[selectedImageIndex] !== false && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            )}
            <img
              src={images[selectedImageIndex]}
              alt={`${alt} ${selectedImageIndex + 1}`}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => openModal(selectedImageIndex)}
              onLoad={() => handleImageLoad(selectedImageIndex)}
              onError={() => handleImageError(selectedImageIndex)}
            />

            {/* Bouton zoom */}
            <button
              onClick={() => openModal(selectedImageIndex)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
            >
              <MagnifyingGlassPlusIcon className="w-5 h-5" />
            </button>

            {/* Navigation sur l'image principale */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Indicateur de position */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* Miniatures */}
        {images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === selectedImageIndex
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <img
                  src={image}
                  alt={`${alt} miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal plein écran */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-7xl max-h-full mx-4">
            {/* Bouton fermer */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            {/* Image en grand */}
            <div className="relative">
              <img
                src={images[selectedImageIndex]}
                alt={`${alt} ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
                onClick={closeModal}
              />

              {/* Navigation dans le modal */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                  >
                    <ChevronLeftIcon className="w-8 h-8" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                  >
                    <ChevronRightIcon className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Indicateur de position dans le modal */}
            {images.length > 1 && (
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-center">
                <div className="bg-black bg-opacity-50 px-4 py-2 rounded-full">
                  {selectedImageIndex + 1} / {images.length}
                </div>
                <div className="flex justify-center mt-4 space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === selectedImageIndex
                          ? "bg-white"
                          : "bg-white bg-opacity-50 hover:bg-opacity-75"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded-lg">
            <div>Utilisez les flèches ← → pour naviguer</div>
            <div>Appuyez sur Échap pour fermer</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
