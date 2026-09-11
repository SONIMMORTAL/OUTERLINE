import { Html, Head, Body, Container, Section, Text, Hr, Row, Column, Button } from '@react-email/components';
import * as React from 'react';
import type { OrderRecord } from '@/lib/orders';
import { DELIVERY_ESTIMATE } from '@/lib/store-policies';

interface OrderConfirmationProps {
  order: OrderRecord;
  paymentUrl: string;
}

const money = (value: number) => `$${value.toFixed(2)}`;

export default function OrderConfirmation({ order, paymentUrl }: OrderConfirmationProps) {
  const address = order.shipping_address;

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
            <Text style={heading}>Thanks, {order.customer_name}. Your order is reserved.</Text>
            <Text style={paragraph}>
              Complete your PayPal payment of {money(order.total_amount)} to confirm order #{order.order_number}.
              It ships once payment is received, and standard delivery takes {DELIVERY_ESTIMATE}.
            </Text>

            <Section style={buttonSection}>
              <Button href={paymentUrl} style={button}>
                Pay {money(order.total_amount)} with PayPal
              </Button>
            </Section>

            <Section style={table}>
              {order.order_items.map((item) => (
                <Row key={item.id} style={itemRow}>
                  <Column>
                    <Text style={itemText}>{item.product_title} ({item.size}, {item.color}) ×{item.quantity}</Text>
                  </Column>
                  <Column align="right">
                    <Text style={itemText}>{money(item.unit_price * item.quantity)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr style={hr} />

            <Section>
              <Row>
                <Column><Text style={totalsText}>Subtotal</Text></Column>
                <Column align="right"><Text style={totalsText}>{money(order.subtotal)}</Text></Column>
              </Row>
              {order.discount_applied > 0 && (
                <Row>
                  <Column><Text style={totalsText}>Discount ({order.discount_code})</Text></Column>
                  <Column align="right"><Text style={totalsText}>-{money(order.discount_applied)}</Text></Column>
                </Row>
              )}
              <Row>
                <Column><Text style={totalsText}>Shipping</Text></Column>
                <Column align="right"><Text style={totalsText}>{order.shipping_amount === 0 ? 'FREE' : money(order.shipping_amount)}</Text></Column>
              </Row>
              <Row>
                <Column><Text style={totalsText}>Tax</Text></Column>
                <Column align="right"><Text style={totalsText}>{money(order.tax_amount)}</Text></Column>
              </Row>
              <Row>
                <Column><Text style={totalsTextBold}>Total</Text></Column>
                <Column align="right"><Text style={totalsTextBold}>{money(order.total_amount)}</Text></Column>
              </Row>
            </Section>

            <Hr style={hr} />

            <Section>
              <Text style={subheading}>Shipping to</Text>
              <Text style={paragraph}>
                {order.customer_name}<br />
                {address?.line1} {address?.line2}<br />
                {address?.city}, {address?.state} {address?.zip}
              </Text>
              <Text style={paragraph}>
                Check your order anytime at outerlineusa.com/orders with this email and order #{order.order_number}.
              </Text>
            </Section>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              All sales are final. Returns and exchanges only for defective or incorrectly shipped items.
            </Text>
            <Text style={footerText}>Questions? Support@outerlineusa.com · Outerline USA © 2026</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif', color: '#0A192F' };
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '580px' };
const header = { textAlign: 'center' as const, padding: '20px 0' };
const brandText = { fontFamily: 'Playfair Display, serif', fontSize: '32px', fontWeight: 'bold', letterSpacing: '4px', margin: '0', color: '#0A192F' };
const sloganText = { fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' as const, color: '#0A192F', margin: '8px 0 0' };
const content = { padding: '0 20px' };
const heading = { fontSize: '20px', fontWeight: '600', color: '#000000' };
const subheading = { fontSize: '14px', fontWeight: '600', color: '#0A192F', margin: '0' };
const paragraph = { fontSize: '14px', lineHeight: '24px', color: '#666666' };
const buttonSection = { textAlign: 'center' as const, margin: '24px 0' };
const button = { backgroundColor: '#0A192F', color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', padding: '14px 28px', borderRadius: '6px', textDecoration: 'none' };
const table = { width: '100%', marginTop: '20px', marginBottom: '20px' };
const itemRow = { borderBottom: '1px solid #E5E5E5', padding: '10px 0' };
const itemText = { fontSize: '14px', color: '#0A192F' };
const totalsText = { fontSize: '14px', color: '#666666', margin: '4px 0' };
const totalsTextBold = { fontSize: '16px', fontWeight: 'bold', color: '#0A192F', margin: '4px 0' };
const hr = { borderColor: '#E5E5E5', margin: '20px 0' };
const footer = { textAlign: 'center' as const };
const footerText = { fontSize: '12px', color: '#666666' };
