const { Resend } = require("resend")
const logger = require("./logger")

const appName = "IdeaForge"
const brand = {
  bg: "#0f1411",
  card: "#1b221d",
  text: "#f3f3f0",
  muted: "#b9c1b5",
  accent: "#d4a373"
}

const getAppUrl = () => process.env.APP_URL || process.env.FRONTEND_URL || ""

const getEmailFrom = () => process.env.EMAIL_FROM || ""
const getLogoUrl = () => process.env.EMAIL_LOGO_URL || ""

const isEmailEnabled = () => Boolean(process.env.RESEND_API_KEY && getEmailFrom())

const getResendClient = () => new Resend(process.env.RESEND_API_KEY)

const renderLayout = ({ title, body, cta }) => {
  const logoUrl = getLogoUrl()
  const logoMarkup = logoUrl
    ? `<img src="${logoUrl}" alt="${appName}" width="120" style="display:block;" />`
    : `<div style="font-weight:700; font-size:20px; letter-spacing:0.5px;">${appName}</div>`

  const ctaMarkup = cta
    ? `
      <div style="margin-top:20px;">
        <a href="${cta.href}" style="display:inline-block; padding:12px 18px; border-radius:999px; background:${brand.accent}; color:#1a1a18; font-weight:600; text-decoration:none;">${cta.label}</a>
      </div>
    `
    : ""

  return `
  <div style="background:${brand.bg}; padding:32px; font-family: 'Inter', Arial, sans-serif; color:${brand.text};">
    <div style="max-width:560px; margin:0 auto; background:${brand.card}; border-radius:20px; padding:28px;">
      <div style="margin-bottom:18px;">${logoMarkup}</div>
      <h2 style="margin:0 0 12px; font-size:22px;">${title}</h2>
      <div style="color:${brand.muted}; font-size:14px; line-height:1.6;">${body}</div>
      ${ctaMarkup}
    </div>
    <div style="max-width:560px; margin:16px auto 0; color:${brand.muted}; font-size:12px; text-align:center;">
      ${appName} • Built for focused teams and ambitious MVPs.
    </div>
  </div>
  `
}

const sendEmail = async ({ to, subject, html, text }) => {
  if (!isEmailEnabled()) {
    logger.warn("Email not sent: RESEND_API_KEY or EMAIL_FROM missing")
    return false
  }

  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: getEmailFrom(),
      to,
      subject,
      html,
      text
    })
    return true
  } catch (err) {
    logger.error({ err }, "Email send failed")
    return false
  }
}

const buildJoinRequestEmail = ({ ownerName, requesterName, role, ideaTitle, ideaUrl, profileUrl }) => {
  const title = "New join request received"
  const body = `
    <p>Hi ${ownerName || "there"},</p>
    <p><strong>${requesterName}</strong> wants to join your idea <strong>${ideaTitle}</strong> as <strong>${role}</strong>.</p>
    <p>Review the requester profile and decide whether to approve the request.</p>
  `
  const cta = {
    label: "Review request",
    href: ideaUrl || profileUrl || getAppUrl()
  }
  const html = renderLayout({ title, body, cta })
  const text = `${requesterName} requested to join ${ideaTitle} as ${role}. Review: ${ideaUrl || profileUrl || getAppUrl()}`

  return { subject: `${appName}: New join request`, html, text }
}

const buildDecisionEmail = ({ requesterName, ownerName, ideaTitle, decision, ideaUrl }) => {
  const title = `Join request ${decision}`
  const body = `
    <p>Hi ${requesterName || "there"},</p>
    <p>${ownerName || "The project owner"} has ${decision} your request to join <strong>${ideaTitle}</strong>.</p>
  `
  const cta = {
    label: "View idea",
    href: ideaUrl || getAppUrl()
  }
  const html = renderLayout({ title, body, cta })
  const text = `Your join request for ${ideaTitle} was ${decision}. View: ${ideaUrl || getAppUrl()}`

  return { subject: `${appName}: Join request ${decision}`, html, text }
}

module.exports = {
  sendEmail,
  buildJoinRequestEmail,
  buildDecisionEmail
}
