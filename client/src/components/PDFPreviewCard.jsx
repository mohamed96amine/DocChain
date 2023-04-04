import React, { useState, useEffect } from "react";
import { Card, CardContent, CardActions, Box, Stack } from "@mui/material";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import GlowingMuiButton from "./GlowingButton";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFPreviewCard = ({ pdfFile }) => {
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await axios.get(pdfFile, {
          responseType: "arraybuffer",
        });
        const pdfBuffer = new Uint8Array(response.data);
        setPdfData({ data: pdfBuffer });
      } catch (error) {
        console.error("Failed to fetch PDF:", error);
      }
    };
    fetchPdf();
  }, [pdfFile]);

  return (
    <Box >
      <Stack spacing={2} alignItems="center">
        <GlowingMuiButton sx={{ mt: 1 }} />
        <Document file={pdfData}>
          <Page debug={true} pageNumber={1} width={250}  renderAnnotationLayer={false}/>
        </Document>
      </Stack>
    </Box>
  );
};

export default PDFPreviewCard;
