export const DEFAULT_EMAIL_TEMPLATES: Record<string, { subject: string; body: string }> = {
  new_lead: {
    subject: "New Lead — {{urgency}} — {{full_name}} in {{city}}",
    body: `
<h1 style="margin:0 0 4px;font-size:18px;font-weight:700;">New Lead Received</h1>
<p style="margin:0 0 16px;color:#666;font-size:13px;">Urgency: <strong>{{urgency}}</strong></p>

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Name</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{full_name}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Phone</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;"><a href="tel:{{phone}}" style="color:#2563eb;text-decoration:none;">{{phone}}</a></td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Email</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;"><a href="mailto:{{email}}" style="color:#2563eb;text-decoration:none;">{{email}}</a></td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">City</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{city}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">ZIP</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{zip_code}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Service</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{service_type}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Urgency</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{urgency}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Contact Pref</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{preferred_contact_method}}</td>
  </tr>
</table>

<h2 style="margin:20px 0 8px;font-size:15px;font-weight:700;color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;display:inline-block;">Description</h2>
<p style="margin:8px 0;font-size:14px;line-height:1.5;color:#333;">{{description}}</p>

<table cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
<tr><td style="background:#f97316;border-radius:8px;">
<a href="https://homequotelink.com/admin/leads/{{id}}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">View in CRM →</a>
</td></tr></table>
    `.trim(),
  },
  buyer_notification: {
    subject: "New {{vertical}} Lead — {{service_type}} in {{city}}",
    body: `
<h1 style="margin:0 0 4px;font-size:18px;font-weight:700;">New Lead for You</h1>
<p style="margin:0 0 16px;color:#666;font-size:14px;">Hi {{buyerContactName}}, you have a new {{vertical}} lead.</p>

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Customer</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{full_name}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Phone</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;"><a href="tel:{{phone}}" style="color:#2563eb;text-decoration:none;font-weight:600;">{{phone}}</a></td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Email</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;"><a href="mailto:{{email}}" style="color:#2563eb;text-decoration:none;">{{email}}</a></td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">City</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{city}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Service</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{service_type}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Urgency</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{urgency}}</td>
  </tr>
</table>

<h2 style="margin:20px 0 8px;font-size:15px;font-weight:700;color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;display:inline-block;">Customer's Description</h2>
<p style="margin:8px 0;font-size:14px;line-height:1.5;color:#333;background:#f9fafb;padding:12px 16px;border-radius:8px;border-left:3px solid #2563eb;">"{{description}}"</p>

<table cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
<tr><td style="background:#f97316;border-radius:8px;">
<a href="tel:{{phone}}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Call {{full_name}} →</a>
</td></tr></table>
<p style="margin:4px 0 0;font-size:12px;color:#999;">Please reach out as soon as possible.</p>
    `.trim(),
  },
  buyer_inquiry: {
    subject: "New {{vertical}} Application — {{business_name}} — {{cityCoverage}}",
    body: `
<h1 style="margin:0 0 16px;font-size:18px;font-weight:700;">New {{vertical}} Application</h1>

<h2 style="margin:20px 0 8px;font-size:15px;font-weight:700;color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;display:inline-block;">Business Info</h2>
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Business</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{business_name}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Contact</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{full_name}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Phone</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;"><a href="tel:{{phone}}" style="color:#2563eb;text-decoration:none;">{{phone}}</a></td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Email</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;"><a href="mailto:{{email}}" style="color:#2563eb;text-decoration:none;">{{email}}</a></td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Years in Business</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{years_in_business}}</td>
  </tr>
</table>

<h2 style="margin:20px 0 8px;font-size:15px;font-weight:700;color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;display:inline-block;">Service Coverage</h2>
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Areas</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{cityCoverage}}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Service Types</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{serviceTypes}}</td>
  </tr>
</table>

<h2 style="margin:20px 0 8px;font-size:15px;font-weight:700;color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;display:inline-block;">Message</h2>
<p style="margin:8px 0;font-size:14px;line-height:1.5;color:#333;">{{message}}</p>
    `.trim(),
  },
  feedback_submitted: {
    subject: "New Customer Feedback — {{rating}}/5 for {{hired_plumber}}",
    body: `
<h1 style="margin:0 0 16px;font-size:18px;font-weight:700;">Homeowner Feedback Received</h1>

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Rating</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:16px;font-weight:700;color:#f97316;">{{rating}} / 5</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#777;font-size:13px;width:140px;vertical-align:top;">Hired Plumber</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;">{{hired_plumber}}</td>
  </tr>
</table>

<h2 style="margin:20px 0 8px;font-size:15px;font-weight:700;color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:6px;display:inline-block;">Customer Review</h2>
<p style="margin:8px 0;font-size:14px;line-height:1.5;color:#333;background:#f9fafb;padding:12px 16px;border-radius:8px;border-left:3px solid #2563eb;">"{{review_text}}"</p>

<table cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
<tr><td style="background:#2563eb;border-radius:8px;">
<a href="https://homequotelink.com/admin/leads/{{lead_id}}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">View Lead Context →</a>
</td></tr></table>
    `.trim(),
  },
};

export const MOCK_TEMPLATE_DATA: Record<string, Record<string, string>> = {
  new_lead: {
    urgency: "flexible",
    full_name: "Jane Doe",
    city: "Santa Clarita",
    phone: "(555) 123-4567",
    email: "jane.doe@example.com",
    zip_code: "91350",
    service_type: "Water Heater Repair",
    preferred_contact_method: "Phone",
    description: "My water heater is making a strange noise and I'd like someone to take a look.",
    id: "test-uuid-1234",
  },
  buyer_notification: {
    buyerContactName: "Bob's Plumbing",
    vertical: "Plumbing",
    service_type: "Water Heater Repair",
    city: "Santa Clarita",
    urgency: "flexible",
    full_name: "Jane Doe",
    phone: "(555) 123-4567",
    email: "jane.doe@example.com",
    description: "My water heater is making a strange noise and I'd like someone to take a look.",
  },
  buyer_inquiry: {
    vertical: "Plumbing",
    business_name: "Pro Plumbers LLC",
    cityCoverage: "Santa Clarita, Valencia, Newhall",
    full_name: "Mike Smith",
    phone: "(555) 987-6543",
    email: "mike@proplumbersllc.com",
    years_in_business: "10",
    serviceTypes: "General Plumbing, Water Heaters, Repiping",
    message: "We've been serving the SCV for 10 years and are looking for more quality leads.",
  },
  feedback_submitted: {
    rating: "5",
    hired_plumber: "Pro Plumbers LLC",
    review_text: "They arrived on time and fixed the leak perfectly. Highly recommended!",
    lead_id: "test-uuid-9999",
  },
};
