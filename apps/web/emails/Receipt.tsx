/**
 * Receipt/Invoice Email Template
 */

import { Html, Head, Body, Container, Section, Text, Img, Preview } from '@react-email/components';

interface ReceiptEmailProps {
  userName?: string;
  orderId?: string;
  amount?: string;
  plan?: string;
  baseUrl?: string;
}

export const ReceiptEmail = ({
  userName = 'there',
  orderId = 'XXXXX',
  amount = '$0.00',
  plan = 'Premium',
  baseUrl = 'https://nomad.app',
}: ReceiptEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Nomad Receipt</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={heading}>Thank You for Your Purchase, {userName}!</Text>
            <Text style={paragraph}>Order #{orderId}</Text>
            <Section style={receiptBox}>
              <Text style={receiptLabel}>Plan:</Text>
              <Text style={receiptValue}>{plan}</Text>
              <Text style={receiptLabel}>Amount:</Text>
              <Text style={receiptValue}>{amount}</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ReceiptEmail;

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' };
const content = { padding: '0 24px' };
const heading = { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '24px 0' };
const paragraph = { fontSize: '16px', lineHeight: '1.6', color: '#4a4a4a', margin: '16px 0' };
const receiptBox = { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '24px', margin: '24px 0' };
const receiptLabel = { fontSize: '14px', color: '#6b7280', margin: '8px 0' };
const receiptValue = { fontSize: '18px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 16px' };
