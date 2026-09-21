import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  event_name?: string
  event_when?: string
  event_where?: string
  preferred_day?: string
  guests?: number
}

const Email = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Your RSVP is confirmed — ${p.event_name ?? 'Annie Decamp Art'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Annie Decamp Art</Heading>
        <Text style={text}>{p.name ? `Dear ${p.name},` : 'Hello,'}</Text>
        <Text style={text}>
          Thank you — your RSVP for {p.event_name ?? 'the event'} is confirmed.
        </Text>
        {p.preferred_day ? <Text style={row}><strong>Day:</strong> {p.preferred_day}</Text> : null}
        {p.event_when ? <Text style={row}><strong>When:</strong> {p.event_when}</Text> : null}
        {p.event_where ? <Text style={row}><strong>Where:</strong> {p.event_where}</Text> : null}
        <Text style={row}><strong>Guests:</strong> {p.guests ?? 1}</Text>
        <Text style={text}>We look forward to seeing you.</Text>
        <Text style={text}>Warmly,<br />Annie Decamp</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Your RSVP is confirmed — ${d['event_name'] ?? 'Annie Decamp Art'}`,
  displayName: 'Event RSVP confirmation',
  previewData: {
    name: 'Jane',
    event_name: 'Holiday Art Salon',
    event_when: 'Nov 13–15',
    event_where: '100 N Gaylord Street, Denver CO 80206',
    preferred_day: 'Saturday, November 14 · noon – 9:00 pm',
    guests: 2,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif', color: '#14120e' }
const container = { padding: '28px 26px', maxWidth: '560px' }
const h1 = { fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, margin: '0 0 20px' }
const text = { fontSize: '15px', lineHeight: '25px', margin: '0 0 16px' }
const row = { fontSize: '15px', lineHeight: '24px', margin: '0 0 8px' }
