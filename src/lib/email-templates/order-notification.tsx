import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  customer_name?: string
  customer_email?: string
  items?: string
  total?: string
  environment?: string
}

const Email = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New sale: ${p.items ?? 'artwork'} — ${p.total ?? ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New sale</Heading>
        <Text style={row}><strong>Items:</strong> {p.items ?? '—'}</Text>
        <Text style={row}><strong>Total:</strong> {p.total ?? '—'}</Text>
        <Text style={row}><strong>Customer:</strong> {p.customer_name ?? '—'}</Text>
        <Text style={row}><strong>Email:</strong> {p.customer_email ?? '—'}</Text>
        <Text style={row}><strong>Environment:</strong> {p.environment ?? 'live'}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Sale: ${d['items'] ?? 'artwork'} — ${d['total'] ?? ''}`,
  displayName: 'Sale notification (to studio)',
  previewData: {
    items: 'Franchesca at Night (original)',
    total: '$2,900.00',
    customer_name: 'Jane Doe',
    customer_email: 'jane@example.com',
    environment: 'live',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif', color: '#14120e' }
const container = { padding: '28px 26px', maxWidth: '560px' }
const h1 = { fontSize: '20px', letterSpacing: '0.04em', margin: '0 0 18px' }
const row = { fontSize: '15px', lineHeight: '24px', margin: '0 0 8px' }
