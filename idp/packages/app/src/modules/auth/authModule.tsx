import {
  createFrontendModule,
  githubAuthApiRef,
} from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';

// Replaces the default guest sign-in page from the app plugin with GitHub-only sign-in
const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => {
      const { SignInPage } = await import('@backstage/core-components');
      return props => (
        <SignInPage
          {...props}
          providers={[
            {
              id: 'github-auth-provider',
              title: 'GitHub',
              message: 'Sign in using GitHub',
              apiRef: githubAuthApiRef,
            },
          ]}
        />
      );
    },
  },
});

export const authModule = createFrontendModule({
  pluginId: 'app',
  extensions: [signInPage],
});
