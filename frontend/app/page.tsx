"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Upload,
  Shield,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Header } from "@/components/Header";
import { useFileContext } from "./context/fileContext";
import { useRouter } from "next/navigation";
import type React from "react";
import Slideshow from "@/components/Slideshow";
import { motion, AnimatePresence } from "framer-motion";
import { UploadFile } from "./context/fileContext";

function base64ToFile(base64, filename, mimeType) {
  const byteString = atob(base64.split(",")[1]); // Remove the data URI part
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new File([uint8Array], filename, { type: mimeType });
}

function Home() {
  const { file, setFile } = useFileContext();
  const hiddenInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileRead = async (
    file: File,
    callback: (fileData: UploadFile) => void
  ) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;

      // Compute SHA-256 hash
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Convert ArrayBuffer to Text (for text-based files)
      const textDecoder = new TextDecoder();
      const textContent = textDecoder.decode(arrayBuffer);

      callback({
        id: hashHex,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        hash: hashHex,
        content: textContent, // Use base64Content if handling binary data
      });
    };

    reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    onDrop: (acceptedFiles) => {
      const dataTransfer = new DataTransfer();

      if (acceptedFiles.length > 0) {
        handleFileRead(acceptedFiles[0], (fileData: UploadFile) => {
          setFile(fileData);
          localStorage.setItem("file", JSON.stringify(fileData));
        });
        dataTransfer.items.add(acceptedFiles[0]);
        hiddenInputRef.current.files = dataTransfer.files;
      }
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
  };

  const uploadFile = async (e: {
    currentTarget: HTMLFormElement | undefined;
    preventDefault: () => void;
  }) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currFile = formData.get("file");
    console.log(currFile);
    if (!currFile) return;

    setIsUploading(true);
    setUploadError(null);

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/pdf");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formData,
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/submit",
        requestOptions
      );

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const result: { id: string } = await response.json();
      console.log("Upload successful:", result);
      setFile((prev) => {
        return {
          ...prev,
          id: result.id,
        } as UploadFile;
      });

      // Navigate to the conversation page after successful upload
      router.push("/conversation");
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {!isUploading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-gradient-to-br from-casca-50 via-white to-casca-100"
        >
          <Header />
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center space-y-6 mb-12">
              <h1 className="text-5xl font-bold">
                Transform Your Bank Statements
                <br />
                into Actionable Insights
              </h1>
              <p className="text-xl max-w-3xl mx-auto">
                Upload your bank statements and let AI analyze your spending
                patterns, identify savings opportunities, and provide
                personalized financial recommendations.
              </p>
            </div>

            <Card className="p-8 shadow-xl bg-white/80 backdrop-blur">
              <form className="space-y-8" onSubmit={uploadFile}>
                {/* File Upload Area */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragActive
                      ? "border-casca-500 bg-casca-50"
                      : "border-casca-200"
                  }`}
                >
                  <input
                    type="file"
                    name="file"
                    style={{ opacity: 0 }}
                    ref={hiddenInputRef}
                  />
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-casca-500" />
                  <p className="text-lg font-medium">
                    Drag & drop your bank statements here
                  </p>
                  <p className="text-casca-600 mt-2">
                    Supports Bank Statements from the US, UK, India...
                  </p>
                  <Button
                    type="button"
                    className="mt-4 bg-casca-500 hover:bg-casca-600 text-white"
                  >
                    Browse Files
                  </Button>
                </div>

                {/* Uploaded File Section */}
                {file && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-casca-800">
                      Uploaded File
                    </h3>
                    <div className="space-y-2">
                      <div
                        key={file.name}
                        className="flex items-center justify-between p-3 bg-casca-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-casca-500" />
                          <span className="font-medium text-casca-700">
                            {file.name}
                          </span>
                          <span className="text-sm text-casca-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-casca-500 hover:text-casca-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex flex-col items-end">
                  <Button
                    className="bg-casca-500 hover:bg-casca-600 text-white text-lg px-6"
                    disabled={!file || isUploading}
                    type="submit"
                  >
                    {isUploading ? "Uploading..." : "Analyze Statement"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  {uploadError && (
                    <p className="text-red-500 mt-2">{uploadError}</p>
                  )}
                </div>
              </form>
            </Card>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8 mt-24">
              <FeatureCard
                icon={<Sparkles className="w-6 h-6 text-casca-500" />}
                title="AI-Powered Analysis"
                description="We use advanced OCR and text extraction to extract features from your bank statement and analyze it"
              />
              <FeatureCard
                icon={<FileText className="w-6 h-6 text-casca-500" />}
                title="Visual Insights"
                description="View Visual Insights of your bank statement like recurring payments, credit to debit ratio and many more"
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-casca-500" />}
                title="Ask Questions"
                description="Chat with your bank statement and get answers to features not present in our analysis"
              />
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-gradient-to-br from-casca-50 via-white to-casca-100 flex items-center justify-center"
        >
          <Slideshow />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur">
      <div className="w-12 h-12 rounded-lg bg-casca-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-casca-800">{title}</h3>
      <p className="">{description}</p>
    </Card>
  );
}

export default function App() {
  return <Home />;
}
