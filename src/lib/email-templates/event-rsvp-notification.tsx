import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  event_name?: string
  name?: string
  email?: string
  phone?: string
  guests?: number
  preferred_day?: string
  message?: string
}

const Email = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New RSVP from ${p.name ?? 'a guest'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New RSVP</Heading>
        <Text style={row}><strong>Event:</strong> {p.event_name ?? '—'}</Text>
        <Text style={row}><strong>Name:</strong> {p.name ?? '—'}</Text>
        <Text style={row}><strong>Email:</strong> {p.email ?? '—'}</Text>
        <Text style={row}><strong>Telephone:</strong> {p.phone || '—'}</Text>
        <Text style={row}><strong>Guests:</strong> {p.guests ?? 1}</Text>
        <Text style={row}><strong>Day:</strong> {p.preferred_day || '—'}</Text>
        <Text style={row}><strong>Message:</strong></Text>
        <Text style={bodyText}>{p.message || '—'}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `RSVP: ${d['name'] ?? 'a guest'} — ${d['event_name'] ?? 'event'}`,
  displayName: 'Event RSVP (to studio)',
  previewData: {
    event_name: 'Holiday Art Salon',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-0100',
    guests: 2,
    preferred_day: 'Saturday, November 14 · noon – 9:00 pm',
    message: 'Looking forward to it!',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif', color: '#14120e' }
const container = { padding: '28px 26px', maxWidth: '560px' }
const h1 = { fontSize: '20px', letterSpacing: '0.04em', margin: '0 0 18px' }
const row = { fontSize: '15px', lineHeight: '24px', margin: '0 0 8px' }
const bodyText = { fontSize: '15px', lineHeight: '24px', whiteSpace: 'pre-wrap' as const, margin: '0' }
