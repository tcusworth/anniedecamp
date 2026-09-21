import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const Email = ({ name, email, subject, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New studio enquiry from ${name ?? 'a visitor'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New studio enquiry</Heading>
        <Text style={row}><strong>Name:</strong> {name ?? '—'}</Text>
        <Text style={row}><strong>Email:</strong> {email ?? '—'}</Text>
        <Text style={row}><strong>Subject:</strong> {subject || '—'}</Text>
        <Text style={row}><strong>Message:</strong></Text>
        <Text style={body}>{message ?? '—'}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Studio enquiry from ${d['name'] ?? 'a visitor'}`,
  displayName: 'Studio enquiry (to studio)',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Availability',
    message: 'I would love to know more about your available work.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif', color: '#14120e' }
const container = { padding: '28px 26px', maxWidth: '560px' }
const h1 = { fontSize: '20px', letterSpacing: '0.04em', margin: '0 0 18px' }
const row = { fontSize: '15px', lineHeight: '24px', margin: '0 0 8px' }
const body = { fontSize: '15px', lineHeight: '24px', whiteSpace: 'pre-wrap' as const, margin: '0' }
