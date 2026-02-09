# Africana Muslim Secondary School Hub

A modern web application for managing school admissions, staff portal, and administrative tasks.

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Supabase Integration

This project is connected to Supabase for backend services including:
- Authentication (Staff login/registration)
- Database (Applications, Staff Members, Notes)
- Storage (Application documents)

### Setup Instructions

1. **Environment Variables**: Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

2. **Get Supabase Credentials**:
   - Visit your [Supabase Dashboard](https://supabase.com/dashboard/project/tjlsziiovzcbekhstouc/settings/api)
   - Copy the Project URL and anon/public key
   - Update the `.env` file with these values

3. **Database Migrations**: The database schema is already set up with migrations in the `supabase/migrations` folder.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

## Features

- **Public Website**: School information, gallery, and admission details
- **Application System**: Online application form for new students
- **Staff Portal**: Authentication and role-based access
- **Admin Dashboard**: Manage applications, staff, and content
- **Supabase Backend**: Secure authentication and data management
