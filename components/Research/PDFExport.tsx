// report_document.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResearchQuery } from '@prisma/client';

const styles = StyleSheet.create({
  page: {
    padding: 50,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 10,
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
  },
});

interface ReportDocumentProps {
  researchQuery: ResearchQuery;
}

const ReportDocument: React.FC<ReportDocumentProps> = ({ researchQuery }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Research Report</Text>
      {researchQuery.summary && (
        <View>
          <Text style={styles.subtitle}>Summary</Text>
          <Text style={styles.paragraph}>{researchQuery.summary}</Text>
        </View>
      )}
      {/* ... Add other sections here ... */}
    </Page>
  </Document>
);

export default ReportDocument;