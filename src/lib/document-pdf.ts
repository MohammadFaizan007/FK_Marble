import { siteConfig } from "@/config/site";

export type PdfDocument = {
  kind: "Quotation" | "Invoice";
  number: string;
  status: string;
  customer: string;
  dateLabel: string;
  extra: string[];
  lines: { name: string; quantity: string; unit: string; rate: string; amount: string }[];
  total: string;
  notes: string | null;
  terms: string | null;
};

function pdfText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildDocumentPdf(document: PdfDocument): Uint8Array {
  const rows = [
    siteConfig.name,
    siteConfig.tagline,
    siteConfig.address.formatted,
    siteConfig.contact.phoneDisplay,
    "",
    document.kind.toUpperCase(),
    document.number,
    `Status: ${document.status}`,
    `Customer: ${document.customer}`,
    `Date: ${document.dateLabel}`,
    ...document.extra,
    "",
    "Product | Quantity | Unit | Rate | Amount",
    ...document.lines.map((line) => `${line.name} | ${line.quantity} | ${line.unit} | ${line.rate} | ${line.amount}`),
    "",
    `Total: INR ${document.total}`,
    "",
    document.notes ? `Notes: ${document.notes}` : "",
    document.terms ? `Terms: ${document.terms}` : "",
    "",
    document.kind === "Invoice"
      ? "This document records the agreed amounts. It is not a verified GST tax invoice."
      : "This quotation is not a tax invoice. Tax is not calculated on this document.",
  ].filter((line, index, all) => line !== "" || all[index - 1] !== "");

  const commands = ["BT", "/F1 11 Tf", "48 790 Td", "16 TL"];

  rows.slice(0, 46).forEach((line, index) => {
    const text = `(${pdfText(line.slice(0, 110))}) Tj`;
    commands.push(index === 0 ? text : `T* ${text}`);
  });

  commands.push("ET");
  const stream = commands.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
