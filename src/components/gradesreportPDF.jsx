import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF styles
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, lineHeight: 1.5 },
  section: { marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 5 },
  tableRow: { flexDirection: 'row', marginBottom: 3 },
  tableCell: { flex: 1 },
});

const GradesReportPDF = ({ subject, analysis, students }) => {
  const passedStudents = students.filter((s) => s.final >= 75);
  const failedStudents = students.filter((s) => s.final < 75);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{subject.name} - Grade Analysis</Text>
          <Text>{analysis}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold' }}>Students Grades:</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Name</Text>
            <Text style={styles.tableCell}>Prelim</Text>
            <Text style={styles.tableCell}>Midterm</Text>
            <Text style={styles.tableCell}>Semifinal</Text>
            <Text style={styles.tableCell}>Final</Text>
          </View>
          {students.map((student) => (
            <View style={styles.tableRow} key={student.id}>
              <Text style={styles.tableCell}>{student.name}</Text>
              <Text style={styles.tableCell}>{student.prelim}</Text>
              <Text style={styles.tableCell}>{student.midterm}</Text>
              <Text style={styles.tableCell}>{student.semifinal}</Text>
              <Text style={styles.tableCell}>{student.final}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold' }}>Summary:</Text>
          <Text>Total Students: {students.length}</Text>
          <Text>Passed: {passedStudents.length}</Text>
          <Text>Failed: {failedStudents.length}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold' }}>Passed Students:</Text>
          {passedStudents.map((s) => (
            <Text key={s.id}>{s.name}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold' }}>Failed Students:</Text>
          {failedStudents.map((s) => (
            <Text key={s.id}>{s.name}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default GradesReportPDF;
