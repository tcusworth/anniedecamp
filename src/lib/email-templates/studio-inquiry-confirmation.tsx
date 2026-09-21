import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
}

const Email = ({ name }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thank you for writing to the studio</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Annie Decamp Art</Heading>
        <Text style={text}>{name ? `Dear ${name},` : 'Hello,'}</Text>
        <Text style={text}>
          Thank you for writing to the studio. Your message has been received and will be answered
          in the order received.
        </Text>
        <Text style={text}>Warmly,<br />Annie Decamp</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Thank you for contacting Annie Decamp Art',
  displayName: 'Studio enquiry confirmation',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif', color: '#14120e' }
const container = { padding: '28px 26px', maxWidth: '560px' }
const h1 = { fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, margin: '0 0 20px' }
const text = { fontSize: '15px', lineHeight: '25px', margin: '0 0 16px' }
