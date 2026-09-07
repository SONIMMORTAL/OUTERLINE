import { Html, Head, Body, Container, Section, Text, Hr, Button } from '@react-email/components';
import * as React from 'react';

interface CustomerWelcomeProps {
  email?: string;
  firstName?: string;
  discountCode?: string;
}

export default function CustomerWelcome({
  firstName,
  discountCode = 'THANK YOU',
}: CustomerWelcomeProps) {
  const greeting = firstName ? `Welcome to Outerline, ${firstName}.` : 'Welcome to Outerline.';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brandText}>OUTERLINE</Text>
            <Text style={sloganText}>DEFINED &amp; UNCONFINED</Text>
            <Text style={boroughBadge}>BROOKLYN • MANHATTAN • QUEENS • THE BRONX • STATEN ISLAND</Text>
          </Section>

          <Hr style={hr} />

          {/* Body Content */}
          <Section style={content}>
            <Text style={heading}>{greeting}</Text>
            <Text style={paragraph}>
              You&apos;re officially on the list. Outerline is founded by the Dynamic Duo, embodying the spirit, style, and pride of each of the five Boroughs in modern New York streetwear.
            </Text>
            <Text style={paragraph}>
              As a welcome to the collective, enjoy <strong>15% off</strong> your first order.
            </Text>

            {/* Discount Code Box */}
            <Section style={codeBox}>
              <Text style={codeLabel}>YOUR EXCLUSIVE 15% OFF PROMO CODE</Text>
              <Text style={codeText}>{discountCode}</Text>
              <Text style={codeSubtext}>Enter this code at checkout. Plus, get Free Shipping on all orders over $100.</Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                style={button}
                href="https://outerlineusa.com/collections/all"
              >
                SHOP THE DROPS &rarr;
              </Button>
            </Section>

            <Text style={supportText}>
              Need any assistance with sizing, orders, or styling? Our team is here to help at{' '}
              <a href="mailto:Support@outerlineusa.com" style={supportLink}>
                Support@outerlineusa.com
              </a>{' '}
              (24–48 hour response time).
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>OUTERLINE USA © 2026 • ALL RIGHTS RESERVED</Text>
            <Text style={footerSubtext}>Brooklyn, New York</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#F9F9F9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  color: '#0A192F',
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  padding: '32px',
  maxWidth: '560px',
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E5E5E5',
};

const header = {
  textAlign: 'center' as const,
  paddingBottom: '12px',
};

const brandText = {
  fontFamily: 'Georgia, serif',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '6px',
  margin: '0 0 6px 0',
  color: '#0A192F',
};

const sloganText = {
  fontSize: '11px',
  letterSpacing: '3px',
  textTransform: 'uppercase' as const,
  color: '#666666',
  margin: '0 0 8px 0',
};

const boroughBadge = {
  fontSize: '9px',
  letterSpacing: '1.5px',
  fontFamily: 'monospace',
  color: '#999999',
  margin: '0',
};

const content = {
  padding: '12px 0',
};

const heading = {
  fontFamily: 'Georgia, serif',
  fontSize: '22px',
  fontWeight: '600',
  color: '#0A192F',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#444444',
  margin: '0 0 14px 0',
};

const codeBox = {
  backgroundColor: '#0A192F',
  borderRadius: '8px',
  padding: '24px 16px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const codeLabel = {
  fontSize: '10px',
  fontFamily: 'monospace',
  letterSpacing: '2px',
  color: '#FFFFFF',
  opacity: 0.7,
  margin: '0 0 8px 0',
};

const codeText = {
  fontSize: '28px',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  letterSpacing: '4px',
  color: '#FBBF24',
  margin: '0 0 8px 0',
};

const codeSubtext = {
  fontSize: '11px',
  color: '#FFFFFF',
  opacity: 0.8,
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '28px 0',
};

const button = {
  backgroundColor: '#0A192F',
  color: '#FFFFFF',
  padding: '14px 28px',
  borderRadius: '6px',
  fontSize: '12px',
  fontFamily: 'Georgia, serif',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  textDecoration: 'none',
  fontWeight: '600',
};

const supportText = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#666666',
  margin: '20px 0 0 0',
};

const supportLink = {
  color: '#0A192F',
  textDecoration: 'underline',
  fontWeight: 'bold',
};

const hr = {
  borderColor: '#EEEEEE',
  margin: '24px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '10px',
  fontFamily: 'monospace',
  letterSpacing: '1px',
  color: '#888888',
  margin: '0 0 4px 0',
};

const footerSubtext = {
  fontSize: '10px',
  color: '#AAAAAA',
  margin: '0',
};
