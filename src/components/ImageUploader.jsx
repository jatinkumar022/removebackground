// src/components/ImageUploader.js
import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./image.css"; // Import your CSS file

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      setOriginalImageUrl(URL.createObjectURL(uploadedFile));
      setImageUrl(null); // Clear previous processed image
      setIsProcessing(false); // Reset processing state
    },
  });

  const removeBackground = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_file", file);

    try {
      const response = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        formData,
        {
          headers: {
            // "Content-Type": "multipart/form-data",
             // Replace with your API key
          },
          responseType: "blob", // Expecting image blob response
        }
      );

      const imageBlob = new Blob([response.data], { type: "image/png" });
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
      setIsProcessing(true);
    } catch (err) {
      console.error("Error removing background:", err);
      setError("Error removing background. Please try again.");
      setIsProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-uploader">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop an image here, or click to select one</p>
      </div>

      {originalImageUrl && (
        <div className="image-comparison">
          <div className="image-original">
            <h3>Original Image</h3>
            <img
              src={originalImageUrl}
              alt="Original"
              className="image-preview"
            />
          </div>
          {isProcessing ? (
            <div className="image-processed">
              <h3>Processed Image</h3>
              {imageUrl ? (
                <img src={imageUrl} alt="Processed" className="image-preview" />
              ) : (
                <p>No processed image yet</p>
              )}
            </div>
          ) : (
            <p className="instructions">
              Click "Remove Background" to process the image
            </p>
          )}
        </div>
      )}

      {file && (
        <div className="buttons">
          <button onClick={removeBackground} disabled={loading}>
            {loading ? "Processing..." : "Remove Background"}
          </button>
          {imageUrl && (
            <a href={imageUrl} download="no-bg.png" className="download-button">
              Download
            </a>
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ImageUploader;
