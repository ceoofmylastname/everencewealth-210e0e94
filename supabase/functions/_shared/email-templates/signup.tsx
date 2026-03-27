/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for Everence Wealth</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandName}>Everence Wealth</Text>
        </Section>
        <Heading style={h1}>Confirm Your Email</Heading>
        <Text style={text}>
          Welcome to Everence Wealth! Please confirm your email address (<Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>) by clicking the button below.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Verify Email
          </Button>
        </Section>
        <Text style={textSmall}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
        <Section style={divider} />
        <Text style={footer}>
          © 2026 Everence Wealth. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Sora', 'Lato', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const header = { textAlign: 'center' as const, marginBottom: '30px' }
const brandName = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#1A4D3E',
  fontFamily: "'Playfair Display', Georgia, serif",
  margin: '0',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1e293b',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#4a5568',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const textSmall = {
  fontSize: '13px',
  color: '#718096',
  lineHeight: '1.5',
  margin: '24px 0 0',
}
const link = { color: '#1A4D3E', textDecoration: 'underline' }
const buttonContainer = { textAlign: 'center' as const, margin: '0 0 8px' }
const button = {
  backgroundColor: '#1A4D3E',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const divider = { borderTop: '1px solid #e2e8f0', margin: '32px 0 16px' }
const footer = { fontSize: '12px', color: '#a0aec0', margin: '0', textAlign: 'center' as const }
