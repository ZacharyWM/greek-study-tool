"use client";

import React from "react";
import { Button } from "../components/ui/button";
import type { Section } from "../models/models";

const PdfExport: React.FC<{ sections: Section[] }> = ({ sections }) => {
  const handleExport = () => {
    // For now, we'll just log the sections to the console
    console.log("Exporting sections:", sections);
    // In the future, you can implement PDF generation and download here
    alert("PDF export functionality will be implemented in the future.");
  };

  return (
    <div>
      <Button onClick={handleExport}>Export PDF</Button>
    </div>
  );
};

export default PdfExport;
