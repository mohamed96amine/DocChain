import React, { useState, useEffect } from "react";
import { Box, Stack, Button, useTheme, Typography } from "@mui/material";
import { pdfjs, Document, Page } from "react-pdf";
import GlowingMuiButton from "./GlowingButton";
import LockIcon from "@mui/icons-material/Lock";
import axios from "axios";
import { tokens } from "../theme";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFPreviewCard = ({ pdfFile, isLocked }) => {
  const [pdfData, setPdfData] = useState(null);
  // const [isLocked, setIsLocked] = useState(true);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
    <Box sx={{ position: "relative" }}>
      {isLocked && (
        <Stack spacing={2} alignItems="center">
          <Typography>
            Un diagnostic est disponible, mais il nécessite l'autorisation du
            propriétaire.
          </Typography>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            Demander l'accès <LockIcon fontSize="large" />
          </Button>
        </Stack>
      )}
      {!isLocked && (
        <Stack spacing={2} alignItems="center">
          <GlowingMuiButton sx={{ mt: 1 }} />
          <Document file={pdfData}>
            <Page
              debug={true}
              pageNumber={1}
              width={250}
              renderAnnotationLayer={false}
            ></Page>
          </Document>
        </Stack>
      )}
    </Box>
  );
};

export default PDFPreviewCard;
