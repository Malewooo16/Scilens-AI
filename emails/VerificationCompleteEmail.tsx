import { Html, Head, Body, Container, Text, Img, Section, Hr } from '@react-email/components';
import * as React from 'react';

interface VerificationCompleteEmailProps {
  name: string;
}

const VerificationCompleteEmail: React.FC<VerificationCompleteEmailProps> = ({ name }) => (
  <Html lang="en">
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img src="https://react-email-demo-xi-ten.vercel.app/static/koala-logo.png" width="49" height="21" alt="Koala" style={logo} />
          <Hr style={hr} />
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            Your email address has been successfully verified!
          </Text>
          <Text style={paragraph}>
            You can now log in and start using our application.
          </Text>
          <Text style={paragraph}>
            Best regards,
            <br />
            The Team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            123 Main St, Anytown, USA
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default VerificationCompleteEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const logo = {
  padding: '30px 20px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};
