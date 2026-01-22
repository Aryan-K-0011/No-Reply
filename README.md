
# NoReply - Pro Follow-up Engine 🚀

NoReply is a productivity-focused web application that helps users avoid missed opportunities by managing follow-ups. Users can track sent emails/messages, receive reminders, and generate AI-powered follow-up drafts.

## Core Features
- **Pipeline Tracking**: Manage outreach across Email, LinkedIn, and more.
- **AI Outreach Engine**: Powered by Gemini 3.0 to draft strategic follow-ups.
- **Automations**: Create rules for "Silence Thresholds".
- **Insights**: Track your conversion success rates.
- **Privacy First**: All data is stored locally via `localStorage` with export/import options.

## Tech Stack
- **Frontend**: React 19 (TSX)
- **Styling**: Tailwind CSS
- **Routing**: React Router 7
- **AI**: Google GenAI (Gemini 3.0 Flash)
- **Deployment**: Vercel

## Local Development

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your key:
   ```bash
   API_KEY=your_gemini_api_key_here
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

1. Push this code to a GitHub repository.
2. Link the repository to Vercel.
3. Add the `API_KEY` to the **Environment Variables** section in the Vercel Project Settings.
4. Deploy!
