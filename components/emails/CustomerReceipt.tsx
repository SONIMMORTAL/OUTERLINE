import { Html, Head, Body, Container, Section, Text, Hr, Row, Column, Img } from '@react-email/components';
import * as React from 'react';

interface CustomerReceiptProps {
  orderNumber: string | number;
  customerName: string;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  shippingAddress: any;
}

export default function CustomerReceipt({
  orderNumber,
  customerName,
  items,
  subtotal,
  discount,
  total,
  shippingAddress,
}: CustomerReceiptProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brandText}>OUTERLINE</Text>
            <Text style={sloganText}>Defined & Unconfined</Text>
          </Section>
          <Hr style={hr} />
          <Section style={content}>
            <Text style={heading}>Thank you for your order, {customerName}.</Text>
            <Text style={paragraph}>Order #{orderNumber} is confirmed and will be shipped soon.</Text>
            
            <Section style={table}>
              {items.map((item, i) => (
                <Row key={i} style={itemRow}>
                  <Column>
                    <Text style={itemText}>{item.product} ({item.size}, {item.color}) x{item.qty}</Text>
                  </Column>
                  <Column align="right">
                    <Text style={itemText}>${(item.price / 100).toFixed(2)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr style={hr} />

            <Section style={totals}>
              <Row>
                <Column><Text style={totalsText}>Subtotal</Text></Column>
                <Column align="right"><Text style={totalsText}>${(subtotal / 100).toFixed(2)}</Text></Column>
              </Row>
              {discount > 0 && (
                <Row>
                  <Column><Text style={totalsText}>Discount</Text></Column>
                  <Column align="right"><Text style={totalsText}>-${(discount / 100).toFixed(2)}</Text></Column>
                </Row>
              )}
              <Row>
                <Column><Text style={totalsTextBold}>Total</Text></Column>
                <Column align="right"><Text style={totalsTextBold}>${(total / 100).toFixed(2)}</Text></Column>
              </Row>
            </Section>

            <Hr style={hr} />

            <Section>
              <Text style={heading}>Shipping to:</Text>
              <Text style={paragraph}>
                {shippingAddress?.line1} {shippingAddress?.line2}<br />
                {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postal_code}<br />
                {shippingAddress?.country}
              </Text>
            </Section>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>Outerline NYC © 2026</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#FFFFFF',
  fontFamily: 'Inter, sans-serif',
  color: '#0A192F',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const header = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const brandText = {
  fontFamily: 'Playfair Display, serif',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  margin: '0',
  color: '#0A192F',
};

const sloganText = {
  fontSize: '12px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: '#0A192F',
  margin: '8px 0 0',
};

const content = {
  padding: '0 20px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#000000',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#666666',
};

const table = {
  width: '100%',
  marginTop: '20px',
  marginBottom: '20px',
};

const itemRow = {
  borderBottom: '1px solid #E5E5E5',
  padding: '10px 0',
};

const itemText = {
  fontSize: '14px',
  color: '#0A192F',
};

const totals = {
  width: '100%',
};

const totalsText = {
  fontSize: '14px',
  color: '#666666',
};

const totalsTextBold = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0A192F',
};

const hr = {
  borderColor: '#E5E5E5',
  margin: '20px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#666666',
};
