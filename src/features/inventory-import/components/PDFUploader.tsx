'use client';

import { useState } from "react";
import { importPipelineService } from "../services/import.service";
import { ImportPreviewWidget } from "../preview/ImportPreviewWidget";

/**
 * @deprecated This component is superseded by ImportPreviewWidget.
 * Kept temporarily to avoid breaking other imports.
 * All new code should use ImportPreviewWidget from ../preview/ImportPreviewWidget.
 */
export default function PDFUploader() {
  return <ImportPreviewWidget />;
}
