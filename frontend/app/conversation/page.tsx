"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  BarChart2,
  Receipt,
  Sparkle,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import Chat from "@/components/Chat";
import { UploadFile, useFileContext } from "../context/fileContext";
import FinancialInsights from "@/components/financial-dashboard";
import LoadingDashboardComponent from "@/components/loading-financial-dashboard";

import { pdfjs, Document, Page } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DynamicDataTable } from "@/components/DynamicTable";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ConversationPage() {
  function base64ToFile(base64, filename, mimeType) {
    const byteString = atob(base64.split(",")[1]); // Remove the data URI part
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new File([uint8Array], filename, { type: mimeType });
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const [zoom, setZoom] = useState(120);
  let { file } = useFileContext();
  console.log(file);

  if (!file) {
    const localFileObj = localStorage.getItem("file");
    if (!localFileObj) {
      console.log("Local file not found");
      return;
    }
    const tmpFile = JSON.parse(localFileObj) as UploadFile;
    console.log(tmpFile);
    console.log(base64ToFile(tmpFile?.content, "default", "application/pdf"));
  }

  const [showPdf, setShowPdf] = useState(true);
  const [transactionTables, setTables] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsData, setInsightsData] = useState([]);

  async function getTransactionData() {
    try {
      const myHeaders = new Headers();
      myHeaders.append("accept", "application/json");
      myHeaders.append("Content-Type", "application/json");
      const response = await fetch("http://127.0.0.1:8000/api/v1/get_tables", {
        method: "POST",
        body: JSON.stringify({ id: file?.id }),
        headers: myHeaders,
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const tables = data["result"];
      let tableData = [];
      if (Array.isArray(tables)) {
        tableData = tables.map((table) => JSON.parse(table));
      } else {
        tableData = JSON.parse(tables);
      }
      setTables(tableData);
    } catch (error) {
      console.error("Error fetching transaction data: ", error);
    }
  }

  const fetchFinancialData = async () => {
    try {
      if (!file?.id) {
        alert("No Id present");
        return;
      }
      setInsightsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("accept", "application/json");
      myHeaders.append("Content-Type", "application/json");
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/get_insights",
        {
          method: "POST",
          body: JSON.stringify({ id: file?.id }),
          headers: myHeaders,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const responseData = await response.json();
      const result = responseData["result"]["result"];
      setInsightsData(result);
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    getTransactionData();
    fetchFinancialData();
  }, []);

  const toggleInsights = () => {
    setShowInsights(!showInsights);
    if (!showInsights) {
      setShowPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casca-50 via-white to-casca-100 flex flex-col">
      <Header />
      {/* Sub-header */}
      <div className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="px-4 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="w-4 h-2 mr-2" />
            Back to Document Selection
          </Link>
          <Button variant="outline" size="sm" className="text-casca-600">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ResizablePanel defaultSize={50} className="h-full flex flex-col">
          <div className="p-4 border-b bg-white/80 backdrop-blur flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setShowPdf(!showPdf);
                  setShowInsights(false);
                }}
              >
                {showPdf ? (
                  <BarChart2 className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                {showPdf ? "Show Transactions" : "Show PDF"}
              </Button>
              <Button onClick={toggleInsights}>
                <Sparkle className="mr-2" />
                {showInsights ? "Hide Insights" : "Get Insights"}
              </Button>
            </div>
            {showPdf && !showInsights && (
              <>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm ">Page {currentPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom((z) => Math.max(50, z - 10))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm ">{zoom}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom((z) => Math.min(200, z + 10))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* PDF Content or Transactions Summary or Financial Insights */}
          {showInsights ? (
            insightsLoading == true ? (
              <LoadingDashboardComponent />
            ) : (
              <FinancialInsights
                loading={insightsLoading}
                data={insightsData}
              />
            )
          ) : showPdf ? (
            <div className="flex-grow overflow-auto p-4 mx-auto bg-white/50 backdrop-blur">
              <Document
                file={file?.url}
                onLoadSuccess={({ numPages }) => {
                  setTotalPages(numPages);
                }}
                className="bg-white shadow-lg mx-auto transition-transform"
              >
                <Page pageNumber={currentPage} scale={zoom / 100} />
              </Document>
            </div>
          ) : (
            <div className="h-full w-full max-w-6xl mx-auto p-6 space-y-8">
              <div className="mt-4 mb-2 bg-inherit">
                <div className="flex items-center justify-center space-x-4">
                  <Receipt className="w-10 h-10 text-casca-500" />
                  <h2 className="text-3xl font-bold text-gray-800">
                    Transactions Viewer
                  </h2>
                </div>
                <div className="h-1 w-32 bg-casca-500 mx-auto rounded-full"></div>
              </div>
              <div className="flex-grow overflow-auto container mx-auto py-10 bg-white/50 backdrop-blur rounded-lg shadow-lg">
                {transactionTables &&
                  transactionTables.map((table, idx) => {
                    return <DynamicDataTable key={idx} data={table} />;
                  })}
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={50} className="flex flex-col p-6">
          <Chat id={file?.id} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
