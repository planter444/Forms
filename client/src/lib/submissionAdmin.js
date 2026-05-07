const escapeXml = (value) =>
  `${value ?? ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const splitSubmissionList = (value) =>
  `${value || ""}`
    .split(/\s+\|\s+|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);

export const formatSubmissionLicenses = (submission) => {
  const licenseNumbers = splitSubmissionList(submission?.license_number);
  const licenseBodies = splitSubmissionList(submission?.license_body);

  if (!licenseNumbers.length && !licenseBodies.length) {
    return "-";
  }

  const totalRows = Math.max(licenseNumbers.length, licenseBodies.length);

  return Array.from({ length: totalRows }, (_, index) => {
    const number = licenseNumbers[index] || `License ${index + 1}`;
    const body = licenseBodies[index] || "issuing authority not provided";
    return `${index + 1}. ${number} — ${body}`;
  }).join("\n");
};

export const formatSubmissionCoverage = (submission) => {
  if (!submission?.consent) {
    return "-";
  }

  if (submission.coverage_mode === "all_wards_in_county" && submission.county) {
    return `${submission.county} — All sub-counties and all wards`;
  }

  const coverageEntries = `${submission.coverage_details || ""}`
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!coverageEntries.length) {
    return "-";
  }

  return coverageEntries
    .map((entry) => {
      const [county, ...detailsParts] = entry.split(":");
      const details = detailsParts.join(":").trim();

      if (!details) {
        return county.trim();
      }

      const detailSummary = details
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const match = item.match(/^(.+?)\s*\((.+)\)$/);

          if (!match) {
            return item;
          }

          return `${match[1].trim()}: ${match[2].trim()}`;
        })
        .join("; ");

      return `${county.trim()} — ${detailSummary}`;
    })
    .join("\n");
};

export const formatSubmissionCounties = (submission) => {
  if (!submission?.consent) {
    return "-";
  }

  const coverageCounties = `${submission.coverage_details || ""}`
    .split("|")
    .map((item) => item.trim().split(":")[0]?.trim())
    .filter(Boolean);

  const counties = [...new Set(coverageCounties.length ? coverageCounties : [submission.county].filter(Boolean))];

  return counties.length ? counties.join("\n") : "-";
};

export const formatSubmissionRowText = (submission) => {
  const rows = [
    ["Email", submission.email || "-"],
    ["Consent", submission.consent ? "Yes" : "No"],
    ["Name", submission.full_name || "-"],
    ["Phone", submission.phone_number || "-"],
    ["Category", submission.category || "-"],
    ["License details", formatSubmissionLicenses(submission)],
    ["County", formatSubmissionCounties(submission)],
    ["Coverage", formatSubmissionCoverage(submission)],
    ["Submitted", submission.created_at ? new Date(submission.created_at).toLocaleString() : "-"]
  ];

  if (!submission.consent) {
    rows.splice(4, 4, ["Reason", submission.decline_reason || "-"]);
  }

  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
};

export const downloadSubmissionsExcel = (submissions) => {
  const headers = [
    "Email",
    "Consent",
    "Name",
    "Phone",
    "Category",
    "License Details",
    "County",
    "Coverage",
    "Decline Reason",
    "Submitted"
  ];

  const rows = submissions.map((submission) => [
    submission.email || "",
    submission.consent ? "Yes" : "No",
    submission.full_name || "",
    submission.phone_number || "",
    submission.category || "",
    formatSubmissionLicenses(submission),
    formatSubmissionCounties(submission),
    formatSubmissionCoverage(submission),
    submission.decline_reason || "",
    submission.created_at ? new Date(submission.created_at).toLocaleString() : ""
  ]);

  const tableRows = [headers, ...rows]
    .map(
      (cells) =>
        `<Row>${cells
          .map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`)
          .join("")}</Row>`
    )
    .join("");

  const workbook = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Submissions">
  <Table>
   ${tableRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kerea-submissions-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
