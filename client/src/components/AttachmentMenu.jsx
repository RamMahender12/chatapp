import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiImage, FiFilm, FiX, FiSend, FiLoader } from "react-icons/fi";
import axios from "axios";

const AttachmentMenu = ({ chatId, onSend, onClose }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState("");
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileSelect = (e, type) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setFileType(type);

    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const handleSend = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await onSend({
        chatId,
        content: caption,
        messageType: data.type,
        mediaUrl: data.url,
        fileName: data.fileName,
      });

      handleClose();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setCaption("");
    setFileType("");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative glass-strong rounded-3xl shadow-2xl w-[90%] max-w-md overflow-hidden glow-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <h3 className="text-dark-50 font-semibold">Send Media</h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-white/[0.05] text-dark-400"
          >
            <FiX className="w-5 h-5" />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Image upload */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => imageInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 hover:border-accent-primary/30 hover:bg-accent-primary/10 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary/20 transition-colors">
                    <FiImage className="w-7 h-7 text-accent-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-dark-100 text-sm font-semibold">Photo</p>
                    <p className="text-dark-500 text-xs mt-0.5">JPG, PNG, GIF, WebP</p>
                  </div>
                </motion.button>

                {/* Video upload */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => videoInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-accent-secondary/5 border border-accent-secondary/10 hover:border-accent-secondary/30 hover:bg-accent-secondary/10 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent-secondary/10 flex items-center justify-center group-hover:bg-accent-secondary/20 transition-colors">
                    <FiFilm className="w-7 h-7 text-accent-secondary" />
                  </div>
                  <div className="text-center">
                    <p className="text-dark-100 text-sm font-semibold">Video</p>
                    <p className="text-dark-500 text-xs mt-0.5">MP4, WebM, MOV</p>
                  </div>
                </motion.button>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => handleFileSelect(e, "image")}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => handleFileSelect(e, "video")}
                className="hidden"
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Preview */}
              <div className="relative bg-dark-900/50 flex items-center justify-center" style={{ maxHeight: "300px" }}>
                {fileType === "image" ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-[300px] w-full object-contain"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="max-h-[300px] w-full"
                  />
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    URL.revokeObjectURL(preview);
                    setPreview(null);
                    setFile(null);
                    setFileType("");
                  }}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Caption input */}
              <div className="p-4 flex items-center gap-3">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="flex-1 bg-dark-800/60 text-dark-50 rounded-xl py-3 px-4 outline-none text-sm border border-white/[0.04] focus:border-accent-primary/30 transition-all placeholder:text-dark-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={uploading}
                  className="p-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow-sm disabled:opacity-50"
                >
                  {uploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FiLoader className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <FiSend className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AttachmentMenu;
