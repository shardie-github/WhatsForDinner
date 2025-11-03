/**
 * Referral Invite Email Template
 */

import { Html, Head, Body, Container, Section, Text, Button, Img, Preview } from '@react-email/components';

interface ReferralInviteEmailProps {
  userName?: string;
  referralCode?: string;
  referralUrl?: string;
  baseUrl?: string;
}

export const ReferralInviteEmail = ({
  userName = 'there',
  referralCode = 'XXXXX',
  referralUrl,
  baseUrl = 'https://nomad.app',
}: ReferralInviteEmailProps) => {
  const url = referralUrl || `${baseUrl}/signup?ref=${referralCode}`;
  return (
    <Html>
      <Head />
      <Preview>Invite Friends and Get Rewards</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={heading}>Share Nomad with Friends, {userName}</Text>
            <Text style={paragraph}>Share your referral code and both of you get rewards!</Text>
            <Section style={codeBox}>
              <Text style={codeText}>{referralCode}</Text>
            </Section>
            <Section style={buttonContainer}>
              <Button style={button} href={url}>Share Now</Button>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ReferralInviteEmail;

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' };
const content = { padding: '0 24px' };
const heading = { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '24px 0' };
const paragraph = { fontSize: '16px', lineHeight: '1.6', color: '#4a4a4a', margin: '16px 0' };
const codeBox = { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '24px', textAlign: 'center' as const, margin: '24px 0' };
const codeText = { fontSize: '32px', fontWeight: '700', color: '#0070f3', letterSpacing: '4px' };
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
