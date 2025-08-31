# Mental Health App

This is an [Expo](https://expo.dev) project with Supabase authentication.

## Get started

1. Configure Supabase

   - Create an account at [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key from the API settings
   - Copy these values to the `.env` file:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Sound Clips Feature

This app includes a sound library feature that displays and plays sound/video clips from Supabase storage. To set up this feature:

1. Follow the instructions in [docs/SUPABASE_SOUND_CLIPS_SETUP.md](docs/SUPABASE_SOUND_CLIPS_SETUP.md) to configure your Supabase project
2. Upload your sound clips to the storage bucket
3. Add metadata for your clips to the database

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Authentication Implementation

This project uses Supabase for authentication. Here's an overview:

### Authentication Features

- User registration with email/password
- Email verification
- Login with email/password
- Password reset functionality
- Logout functionality
- Session persistence

### Implementation Details

- **Authentication Context**: We use React Context to manage authentication state across the app
- **Protected Routes**: Routes are protected based on authentication status
- **Session Management**: Supabase handles session tokens and refreshing

### File Structure

- `lib/supabase.ts`: Core authentication functions and Supabase client setup
- `context/AuthContext.tsx`: Authentication context provider and hooks
- `app/(tabs)/index.tsx`: Login screen
- `app/(tabs)/signup.tsx`: Registration screen
- `app/(tabs)/account.tsx`: User account management

### Important Notes

1. Make sure to set up the authentication settings in your Supabase dashboard
2. Configure email templates in Supabase for verification and password reset emails
3. For production, update the redirect URLs in authentication functions
