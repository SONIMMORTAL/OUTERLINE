import { Html, Head, Body, Container, Section, Text, Hr, Row, Column } from '@react-email/components';
import * as React from 'react';

interface VendorPurchaseOrderProps {
  orderNumber: string | number;
  items: any[];
  shippingAddress: any;
  customerName: string;
  orderDate: string;
}

export default function VendorPurchaseOrder({
  orderNumber,
  items,
  shippingAddress,
  customerName,
  orderDate,
}: VendorPurchaseOrderProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brandText}>OUTERLINE</Text>
            <Text style={poText}>PURCHASE ORDER</Text>
          </Section>
          
          <Section style={badgeSection}>
            <Text style={urgencyBadge}>FULFILL IMMEDIATELY</Text>
          </Section>

          <Section style={details}>
            <Row>
              <Column>
                <Text style={label}>Order #</Text>
                <Text style={value}>{orderNumber}</Text>
              </Column>
              <Column>
                <Text style={label}>Date</Text>
                <Text style={value}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={sectionTitle}>Line Items</Text>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={qtyCol}>
                  <Text style={qtyText}>{item.qty}x</Text>
                </Column>
                <Column>
                  <Text style={skuText}>{item.sku}</Text>
                  <Text style={descText}>{item.product} - {item.size} - {item.color}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={sectionTitle}>Ship To:</Text>
            <Text style={addressText}>
              <strong>{customerName}</strong><br />
              {shippingAddress?.line1} {shippingAddress?.line2}<br />
              {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postal_code}<br />
              {shippingAddress?.country}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#FFFFFF',
  fontFamily: 'Inter, sans-serif',
  color: '#F9F9F9',
};

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
  border: '1px solid #E5E5E5',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const brandText = {
  fontFamily: 'Playfair Display, serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  color: '#FFFFFF',
};

const poText = {
  fontSize: '16px',
  letterSpacing: '2px',
  color: '#0A192F',
  margin: '4px 0 0',
};

const badgeSection = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const urgencyBadge = {
  display: 'inline-block',
  backgroundColor: '#F59E0B',
  color: '#FFFFFF',
  padding: '4px 12px',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  borderRadius: '4px',
};

const details = {
  marginBottom: '20px',
};

const label = {
  fontSize: '12px',
  color: '#666666',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
};

const value = {
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const sectionTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '12px',
};

const itemRow = {
  borderBottom: '1px solid #E5E5E5',
  padding: '12px 0',
};

const qtyCol = {
  width: '40px',
};

const qtyText = {
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const skuText = {
  fontSize: '12px',
  color: '#0A192F',
  fontFamily: 'monospace',
  margin: '0 0 4px',
};

const descText = {
  fontSize: '14px',
  margin: '0',
};

const addressText = {
  fontSize: '14px',
  lineHeight: '22px',
};

const hr = {
  borderColor: '#E5E5E5',
  margin: '20px 0',
};
