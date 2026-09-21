import type { ComponentType } from 'react'

import { template as studioInquiryNotification } from './studio-inquiry-notification'
import { template as studioInquiryConfirmation } from './studio-inquiry-confirmation'
import { template as commissionRequestNotification } from './commission-request-notification'
import { template as commissionRequestConfirmation } from './commission-request-confirmation'
import { template as eventRsvpNotification } from './event-rsvp-notification'
import { template as eventRsvpConfirmation } from './event-rsvp-confirmation'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'studio-inquiry-notification': studioInquiryNotification,
  'studio-inquiry-confirmation': studioInquiryConfirmation,
  'commission-request-notification': commissionRequestNotification,
  'commission-request-confirmation': commissionRequestConfirmation,
  'event-rsvp-notification': eventRsvpNotification,
  'event-rsvp-confirmation': eventRsvpConfirmation,
}
