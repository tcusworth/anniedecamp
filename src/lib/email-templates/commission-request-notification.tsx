import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  phone?: string
  subject_matter?: string
  preferred_size?: string
  preferred_medium?: string
  budget_range?: string
  deadline?: string
  details?: string
}

const Email = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New commission request from ${p.name ?? 'a visitor'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New commission request</Heading>
        <Text style={row}><strong>Name:</strong> {p.name ?? '—'}</Text>
        <Text style={row}><strong>Email:</strong> {p.email ?? '—'}</Text>
        <Text style={row}><strong>Telephone:</strong> {p.phone || '—'}</Text>
        <Text style={row}><strong>Subject:</strong> {p.subject_matter || '—'}</Text>
        <Text style={row}><strong>Preferred size:</strong> {p.preferred_size || '—'}</Text>
        <Text style={row}><strong>Preferred medium:</strong> {p.preferred_medium || '—'}</Text>
        <Text style={row}><strong>Budget:</strong> {p.budget_range || '—'}</Text>
        <Text style={row}><strong>Timing:</strong> {p.deadline || '—'}</Text>
        <Text style={row}><strong>Details:</strong></Text>
        <Text style={bodyText}>{p.details ?? '—'}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Commission request from ${d['name'] ?? 'a visitor'}`,
  displayName: 'Commission request (to studio)',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-0100',
    subject_matter: 'Family portrait',
    preferred_size: '30 × 24 in',
    preferred_medium: 'Oil on panel',
    budget_range: '$3,000–5,000',
    deadline: 'Before the holidays',
    details: 'A portrait of my grandmother from an old photograph.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif', color: '#14120e' }
const container = { padding: '28px 26px', maxWidth: '560px' }
const h1 = { fontSize: '20px', letterSpacing: '0.04em', margin: '0 0 18px' }
const row = { fontSize: '15px', lineHeight: '24px', margin: '0 0 8px' }
const bodyText = { fontSize: '15px', lineHeight: '24px', whiteSpace: 'pre-wrap' as const, margin: '0' }
