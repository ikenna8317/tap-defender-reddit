import { Devvit, useWebView } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a menu item to create a new post
Devvit.addMenuItem({
  label: 'Tap It Defender: New Post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    await reddit.submitPost({
      title: 'Tap It Defender - Defend Against the Invasion!',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large" weight="bold">🎮 Tap It Defender</text>
          <text size="medium">Click to play the game!</text>
        </vstack>
      ),
    });
    
    ui.showToast({ text: 'Game post created!' });
  },
});

// Add the main post component
Devvit.addCustomPostType({
  name: 'Tap It Defender',
  height: 'tall',
  render: (context) => {
    const { useState } = context;
    const [webviewVisible, setWebviewVisible] = useState(false);
    const { postId, postTitle } = context;

    const onShowWebview = () => {
      setWebviewVisible(true);
    };

    const onMessage = (msg: any) => {
      console.log('Received message from webview:', msg);
    };

    return (
      <vstack height="100%" width="100%" alignment="middle center">
        {!webviewVisible ? (
          <vstack alignment="center middle" gap="medium">
            <text size="xxlarge" weight="bold" color="white">
              🎮 TAP IT DEFENDER
            </text>
            <text size="large" color="white">
              Defend against the invasion!
            </text>
            <text size="medium" color="neutral-content-weak">
              • Tap enemies to eliminate them
            </text>
            <text size="medium" color="neutral-content-weak">
              • Avoid tapping innocents
            </text>
            <text size="medium" color="neutral-content-weak">
              • Don't let enemies escape
            </text>
            <button
              appearance="primary"
              size="large"
              onPress={onShowWebview}
            >
              🚀 Start Game
            </button>
          </vstack>
        ) : (
          <webview
            id="game-webview"
            url="index.html"
            onMessage={onMessage}
            height="100%"
            width="100%"
          />
        )}
      </vstack>
    );
  },
});

export default Devvit;