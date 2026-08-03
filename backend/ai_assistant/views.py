from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services import AIService
from accounts.models import Profile
from scholarships.models import Scholarship
from django.utils import timezone

def check_ai_limit(profile):
    """
    Checks if a user has exceeded their daily AI usage limit.
    Pro users: Unlimited
    Free users: 5 operations per day
    """
    if profile.is_currently_pro:
        return True, 0

    today = timezone.now().date()
    
    # Reset count if it's a new day
    if profile.last_ai_reset != today:
        profile.ai_usage_count = 0
        profile.last_ai_reset = today
        profile.save()

    limit = 5
    if profile.ai_usage_count >= limit:
        return False, limit
    
    # Increment usage
    profile.ai_usage_count += 1
    profile.save()
    return True, limit

class AIWriteSOPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response(
                {"error": f"Daily AI limit reached ({limit}/day). Upgrade to Pro for unlimited access."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        scholarship_id = request.data.get('scholarship_id')
        try:
            scholarship = Scholarship.objects.get(id=scholarship_id)
            scholarship_data = {
                'title': scholarship.title,
                'field': scholarship.field,
                'country': scholarship.country
            }
            result = AIService.write_sop(profile, scholarship_data)
            return Response({'sop': result, 'usage': profile.ai_usage_count, 'limit': limit})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIReviewSOPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)
        
        sop_text = request.data.get('sop_text')
        if not sop_text:
            return Response({'error': 'SOP text is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = AIService.review_sop(sop_text)
        return Response({'feedback': result, 'usage': profile.ai_usage_count})

class AIReviewCVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)

        cv_text = request.data.get('cv_text')
        if not cv_text:
            return Response({'error': 'CV text is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = AIService.review_cv(cv_text)
        return Response({'feedback': result, 'usage': profile.ai_usage_count})

class AICheckEligibilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)
            
        scholarship_id = request.data.get('scholarship_id')
        try:
            scholarship = Scholarship.objects.get(id=scholarship_id)
            scholarship_data = {
                'eligibility': scholarship.eligibility
            }
            result = AIService.check_eligibility(profile, scholarship_data)
            return Response({'analysis': result, 'usage': profile.ai_usage_count})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIImprovePostView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get('title', 'Community Discussion')
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = AIService.improve_post(content, title)
            return Response({'improved_content': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AILiveSupportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        history = request.data.get('history', [])
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = AIService.live_support(message, history)
            return Response({'response': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIGenerateBioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            result = AIService.generate_bio(profile)
            return Response({'bio': result, 'usage': profile.ai_usage_count})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It deletes or moves the /src and /scripts directories to /example based on user input and creates a new /src/app directory with an index.tsx and _layout.tsx file.
 * You can remove the `reset-project` script from package.json and safely delete this file after running it.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const oldDirs = ["src", "scripts"];
const exampleDir = "example";
const newAppDir = "src/app";
const exampleDirPath = path.join(root, exampleDir);

const indexContent = `import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") {
      // Create the app-example directory
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

    // Move old directories to new app-example directory or delete them
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Create new /src/app directory
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\n📁 New /src/app directory created.");

    // Create index.tsx
    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 src/app/index.tsx created.");

    // Create _layout.tsx
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 src/app/_layout.tsx created.");

    console.log("\n✅ Project reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit src/app/index.tsx to edit the main screen.\n3. Put all your application code in /src, only screens and layout files should be in /src/app.${
        userInput === "y"
          ? `\n4. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

rl.question(
  "Do you want to move existing files to /example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);
