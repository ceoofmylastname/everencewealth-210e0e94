/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code for Everence Wealth</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandName}>Everence Wealth</Text>
        </Section>
        <Heading style={h1}>Confirm Your Identity</Heading>
        <Text style={text}>Use the code below to verify your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={textSmall}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
        <Section style={divider} />
        <Text style={footer}>
          © 2026 Everence Wealth. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#1A4D3E',
  textAlign: 'center' as const,
  letterSpacing: '4px',
  margin: '0 0 24px',
}
const divider = { borderTop: '1px solid #e2e8f0', margin: '32px 0 16px' }
const footer = { fontSize: '12px', color: '#a0aec0', margin: '0', textAlign: 'center' as const }
