import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
  },
  section: { marginBottom: 20 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    borderBottomStyle: "solid",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: { flexDirection: "row", paddingVertical: 2 },
  tableCell: { flex: 1, textAlign: "center" },
  nameCell: { flex: 2, paddingLeft: 4, textAlign: "left" },
  summaryText: { marginBottom: 2 },
  analysisBox: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#0f5132",
    backgroundColor: "#d1e7dd",
    borderRadius: 5,
  },
  passedText: { color: "#0f5132", fontWeight: "bold" },
  failedText: { color: "#842029", fontWeight: "bold" },
});

const GradesReportPDF = ({ subject, analysis, students }) => {
  // Compute total and pass/fail status per student
  const studentsWithTotal = students.map((s) => {
    const scores = [s.prelim, s.midterm, s.semifinal, s.final]
      .map(Number)
      .filter((n) => !isNaN(n));
    const avg =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const total = Math.round(Math.min(Math.max(avg, 1), 5) * 4) / 4; // snap to .25
    const status = total <= 3.0 ? "Passed" : "Failed";
    return { ...s, total: total.toFixed(2), status };
  });

  const passedStudents = studentsWithTotal.filter((s) => s.status === "Passed");
  const failedStudents = studentsWithTotal.filter((s) => s.status === "Failed");

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.title}>
            {(subject?.subject_name || subject?.name || "Subject")} - Grade Report
          </Text>

          {analysis && (
            <View style={styles.analysisBox}>
              <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                AI Analysis Summary:
              </Text>
              <Text>{analysis}</Text>
            </View>
          )}
        </View>

        {/* Students Table */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Students Grades</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.nameCell}>Name</Text>
            <Text style={styles.tableCell}>Prelim</Text>
            <Text style={styles.tableCell}>Midterm</Text>
            <Text style={styles.tableCell}>Semifinal</Text>
            <Text style={styles.tableCell}>Final</Text>
            <Text style={styles.tableCell}>Total</Text>
            <Text style={styles.tableCell}>Status</Text>
          </View>

          {/* Table Rows */}
          {studentsWithTotal.map((student) => (
            <View style={styles.tableRow} key={student.id} wrap={false}>
              <Text style={styles.nameCell}>{student.name}</Text>
              <Text style={styles.tableCell}>{student.prelim}</Text>
              <Text style={styles.tableCell}>{student.midterm}</Text>
              <Text style={styles.tableCell}>{student.semifinal}</Text>
              <Text style={styles.tableCell}>{student.final}</Text>
              <Text style={styles.tableCell}>{student.total}</Text>
              <Text
                style={[
                  styles.tableCell,
                  student.status === "Passed"
                    ? styles.passedText
                    : styles.failedText,
                ]}
              >
                {student.status}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Summary</Text>
          <Text style={styles.summaryText}>Total Students: {students.length}</Text>
          <Text style={styles.summaryText}>Passed: {passedStudents.length}</Text>
          <Text style={styles.summaryText}>Failed: {failedStudents.length}</Text>
        </View>

        {/* Passed Students */}
        {passedStudents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Passed Students</Text>
            {passedStudents.map((s) => (
              <Text key={s.id}>• {s.name}</Text>
            ))}
          </View>
        )}

        {/* Failed Students */}
        {failedStudents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Failed Students</Text>
            {failedStudents.map((s) => (
              <Text key={s.id}>• {s.name}</Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default GradesReportPDF;
