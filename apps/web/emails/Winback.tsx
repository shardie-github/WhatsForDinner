/**
 * Winback Email Template
 */

import { Html, Head, Body, Container, Section, Text, Button, Img, Preview } from '@react-email/components';

interface WinbackEmailProps {
  userName?: string;
  baseUrl?: string;
}

export const WinbackEmail = ({ userName = 'there', baseUrl = 'https://nomad.app' }: WinbackEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Restart Your Journey with New Recipes</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={heading}>We Miss You, {userName}!</Text>
            <Text style={paragraph}>Restart your meal planning journey with fresh recipes and new features.</Text>
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/app/meal-plan`}>Create a New Plan</Button>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WinbackEmail;

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' };
const content = { padding: '0 24px' };
const heading = { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '24px 0' };
const paragraph = { fontSize: '16px', lineHeight: '1.6', color: '#4a4a4a', margin: '16px 0' };
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' };
const button = {
  backgroundColor: '#0070f3',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '12px 24px',
};
