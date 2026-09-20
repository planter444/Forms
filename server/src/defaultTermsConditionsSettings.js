export const defaultTermsConditionsSettings = {
  enabled: true,
  
  header: {
    enabled: true,
    title: "Terms and Conditions",
    subtitle: "Please read our terms and conditions carefully",
    logoUrl: "",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    subtitleColor: "#475569",
    backgroundPattern: "none",
    animationEnabled: true,
    animationStyle: "fade-down",
    animationDelay: 100
  },

  content: {
    enabled: true,
    terms: `Welcome to our platform. By using our services, you agree to these terms and conditions.

1. Acceptance of Terms
By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only.

3. Disclaimer
The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability.

4. Limitations
In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.

5. Privacy Policy
Your privacy is important to us. Please review our Privacy Policy, which also governs the website and informs users of our data collection practices.

6. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of Kenya and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.`,
    backgroundColor: "#f8fafc",
    textColor: "#0f172a",
    fontSize: "base",
    lineHeight: "relaxed",
    padding: "comfortable",
    backgroundPattern: "none",
    animationEnabled: true,
    animationStyle: "fade-up",
    animationDelay: 200
  },

  footer: {
    enabled: true,
    title: "Need Help?",
    body: "If you have any questions about these terms and conditions, please contact us.",
    email: "info@kerea.org",
    phone: "+254 700 000 000",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Contact Us", href: "/contact" },
      { label: "Back to Home", href: "/" }
    ],
    copyright: "© 2026 KEREA. All rights reserved.",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    linkColor: "#93c5fd",
    backgroundPattern: "none",
    animationEnabled: true,
    animationStyle: "fade-up",
    animationDelay: 300
  },

  theme: {
    palette: "sky",
    primaryColor: "#2563eb",
    accentColor: "#dbeafe",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    borderColor: "#e2e8f0"
  },

  seo: {
    title: "Terms and Conditions | KEREA",
    description: "Read our terms and conditions to understand your rights and responsibilities when using our platform."
  }
};
